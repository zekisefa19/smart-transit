using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Tariffs.Queries;

namespace SmartTransit.Application.Features.Tariffs.Commands;

public record ApplyBulkHikeCommand(decimal Percentage) : IRequest<bool>;

public class ApplyBulkHikeCommandHandler : IRequestHandler<ApplyBulkHikeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;

    public ApplyBulkHikeCommandHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<bool> Handle(ApplyBulkHikeCommand request, CancellationToken cancellationToken)
    {
        if (request.Percentage <= 0) return false;

        // Ücretsiz / Muaf (IsFree = true) kartlar hariç aktif tüm tarifeleri getir
        var tariffs = await _context.Tariffs
            .Where(t => t.IsActive && !t.IsFree)
            .ToListAsync(cancellationToken);

        if (!tariffs.Any()) return false;

        decimal multiplier = 1 + (request.Percentage / 100m);

        foreach (var tariff in tariffs)
        {
            tariff.BasePrice = Math.Round(tariff.BasePrice * multiplier, 2);
            tariff.SinglePassFee = Math.Round(tariff.SinglePassFee * multiplier, 2);
            tariff.PrintingFee = Math.Round(tariff.PrintingFee * multiplier, 2);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // CACHE INVALIDATION: Toplu zam uygulandığında önbelleği temizle
        _cache.Remove(GetTariffsQueryHandler.TariffsCacheKey);

        return true;
    }
}