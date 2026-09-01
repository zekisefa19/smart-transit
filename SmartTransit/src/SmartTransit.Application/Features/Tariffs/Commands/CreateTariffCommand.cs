using MediatR;
using Microsoft.Extensions.Caching.Memory;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Tariffs.Queries;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Tariffs.Commands;

public record CreateTariffCommand(
    CardType CardType,
    string Title,
    string Subtitle,
    string Description,
    decimal BasePrice,
    decimal ServiceFee,
    decimal SinglePassFee,
    decimal PrintingFee,
    decimal TransferDiscountPercent = 50.00m,
    decimal Transfer2DiscountPercent = 75.00m,
    bool IsFree = false
) : IRequest<Guid>;

public class CreateTariffCommandHandler : IRequestHandler<CreateTariffCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public CreateTariffCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Guid> Handle(CreateTariffCommand request, CancellationToken cancellationToken)
    {
        var tariff = new Tariff
        {
            Id = Guid.NewGuid(),
            CardType = request.CardType,
            Title = request.Title,
            Subtitle = request.Subtitle,
            Description = request.Description,
            BasePrice = request.BasePrice,
            ServiceFee = request.ServiceFee,
            SinglePassFee = request.SinglePassFee,
            PrintingFee = request.PrintingFee,
            TransferDiscountPercent = request.TransferDiscountPercent,
            Transfer2DiscountPercent = request.Transfer2DiscountPercent,
            IsFree = request.IsFree,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tariffs.Add(tariff);
        await _context.SaveChangesAsync(cancellationToken);

        // CACHE INVALIDATION: Yeni tarife tanımlandığında önbelleği temizle
        _cache.Remove(GetTariffsQueryHandler.TariffsCacheKey);

        return tariff.Id;
    }
}