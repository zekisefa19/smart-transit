using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Tariffs.Dtos;

namespace SmartTransit.Application.Features.Tariffs.Queries;

public record GetTariffsQuery : IRequest<List<TariffDto>>;

public class GetTariffsQueryHandler : IRequestHandler<GetTariffsQuery, List<TariffDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    // Command Handler'lardan cache'i silmek için public yapıyoruz
    public const string TariffsCacheKey = "Tariffs_List_CacheKey";

    public GetTariffsQueryHandler(IApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<List<TariffDto>> Handle(GetTariffsQuery request, CancellationToken cancellationToken)
    {
        // 1. Önbellekte var mı kontrol et
        if (_cache.TryGetValue(TariffsCacheKey, out List<TariffDto>? cachedTariffs) && cachedTariffs != null)
        {
            return cachedTariffs;
        }

        // 2. Önbellekte yoksa veritabanından çek ve DTO'ya dönüştür
        var tariffs = await _context.Tariffs
            .Where(t => t.IsActive)
            .Select(t => new TariffDto(
                t.Id,
                t.CardType,
                t.CardType.ToString(),
                t.Title,
                t.Subtitle,
                t.Description,
                t.BasePrice,
                t.ServiceFee,
                t.SubscriptionFee,
                t.SinglePassFee,
                t.PrintingFee,
                t.TransferDiscountPercent,
                t.Transfer2DiscountPercent,
                t.IsFree,
                t.IsActive
            ))
            .ToListAsync(cancellationToken);

        // 3. Önbelleğe kaydet (30 dakika süreli)
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));

        _cache.Set(TariffsCacheKey, tariffs, cacheOptions);

        return tariffs;
    }
}