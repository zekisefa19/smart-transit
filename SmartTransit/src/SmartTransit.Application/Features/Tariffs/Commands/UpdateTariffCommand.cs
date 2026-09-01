using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Tariffs.Dtos;
using SmartTransit.Application.Features.Tariffs.Queries;

namespace SmartTransit.Application.Features.Tariffs.Commands;

public record UpdateTariffCommand(UpdateTariffDto Tariff) : IRequest<bool>;

public class UpdateTariffCommandHandler : IRequestHandler<UpdateTariffCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public UpdateTariffCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<bool> Handle(UpdateTariffCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Tariff;
        var tariff = await _context.Tariffs
            .FirstOrDefaultAsync(t => t.CardType == dto.CardType, cancellationToken);

        if (tariff == null) return false;

        tariff.BasePrice = dto.BasePrice;
        tariff.ServiceFee = dto.ServiceFee;
        tariff.SinglePassFee = dto.SinglePassFee;
        tariff.PrintingFee = dto.PrintingFee;
        tariff.TransferDiscountPercent = dto.TransferDiscountPercent;
        tariff.Transfer2DiscountPercent = dto.Transfer2DiscountPercent;
        tariff.IsFree = dto.IsFree;

        await _context.SaveChangesAsync(cancellationToken);

        // CACHE INVALIDATION: Güncelleme yapılınca önbelleği temizle
        _cache.Remove(GetTariffsQueryHandler.TariffsCacheKey);

        return true;
    }
}