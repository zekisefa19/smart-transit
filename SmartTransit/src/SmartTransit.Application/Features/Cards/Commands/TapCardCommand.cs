using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Cards.Commands;

public record TapCardCommand(Guid CardId, Guid RouteId) : IRequest<string>;

public class TapCardCommandHandler : IRequestHandler<TapCardCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public TapCardCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<string> Handle(TapCardCommand request, CancellationToken cancellationToken)
    {
        string cardCacheKey = $"card:{request.CardId}";
        string routeCacheKey = $"route:{request.RouteId}";

        // ⚡ 1. HIZLI KART BİLGİSİ KONTROLÜ (REDIS CACHE-FIRST)
        var cachedCard = await _cacheService.GetAsync<CardCacheDto>(cardCacheKey, cancellationToken);
        if (cachedCard != null && cachedCard.Status == CardStatus.Blocked)
        {
            throw new Exception("Kartınız bloke durumdadır. Geçiş yapılamaz!");
        }

        // ⚡ 2. TARİFE / HAT BİLGİSİ (REDIS CACHE)
        var route = await _cacheService.GetAsync<RouteCacheDto>(routeCacheKey, cancellationToken);
        if (route == null)
        {
            var dbRoute = await _context.Routes
                .FirstOrDefaultAsync(r => r.Id == request.RouteId && r.IsActive, cancellationToken);

            if (dbRoute == null) throw new Exception("Geçersiz veya Pasif Hat!");

            route = new RouteCacheDto(
                dbRoute.Id,
                dbRoute.Code,
                dbRoute.Name,
                dbRoute.StandardFare,
                dbRoute.SubscriptionDeduction,
                dbRoute.IsActive
            );

            await _cacheService.SetAsync(routeCacheKey, route, TimeSpan.FromHours(24), cancellationToken);
        }

        // 🐢 3. VERİTABANI KONTROLÜ VE DÖNÜŞÜM
        var card = await _context.Cards
            .FirstOrDefaultAsync(c => c.Id == request.CardId && !c.IsDeleted, cancellationToken);

        if (card == null) throw new Exception("Geçersiz Kart!");

        if (card.Status == CardStatus.Blocked)
        {
            await _cacheService.SetAsync(cardCacheKey, MapToCacheDto(card), TimeSpan.FromMinutes(30), cancellationToken);
            throw new Exception("Kartınız bloke durumdadır. Geçiş yapılamaz!");
        }

        string resultMessage;

        // 🟢 4. ABONMAN KONTROLÜ
        bool isSubscriptionValid = card.HasActiveSubscription
            && card.SubscriptionExpiryDate.HasValue
            && card.SubscriptionExpiryDate.Value > DateTime.UtcNow
            && card.SubscriptionRemainingUses >= route.SubscriptionDeduction;

        if (isSubscriptionValid)
        {
            card.SubscriptionRemainingUses -= route.SubscriptionDeduction;

            if (card.SubscriptionRemainingUses <= 0)
            {
                card.HasActiveSubscription = false;
            }

            // 📝 ABONMAN GEÇİŞ TRANSACTION KAYDI
            var subTransaction = new Transaction
            {
                CardId = card.Id,
                RouteId = route.Id,
                Amount = 0m,
                BalanceAfter = card.Balance,
                SubscriptionDeduction = route.SubscriptionDeduction,
                Type = TransactionType.Boarding,
                Status = TransactionStatus.Success,
                Description = $"{route.Code} ({route.Name}) hattında abonman kullanıldı (-{route.SubscriptionDeduction} Basım)."
            };

            _context.Transactions.Add(subTransaction);
            resultMessage = $"Abonman Kullanıldı (-{route.SubscriptionDeduction} Basım). Kalan Basım: {card.SubscriptionRemainingUses}";
        }
        // 🔴 5. NORMAL BAKİYE KONTROLÜ
        else
        {
            if (card.Balance < route.StandardFare)
            {
                throw new Exception($"Yetersiz Bakiye! Hat Ücreti: {route.StandardFare} TL, Mevcut Bakiye: {card.Balance} TL");
            }

            card.Balance -= route.StandardFare;

            // 📝 BAKİYE GEÇİŞ TRANSACTION KAYDI
            var fareTransaction = new Transaction
            {
                CardId = card.Id,
                RouteId = route.Id,
                Amount = route.StandardFare,
                BalanceAfter = card.Balance,
                SubscriptionDeduction = 0,
                Type = TransactionType.Boarding,
                Status = TransactionStatus.Success,
                Description = $"{route.Code} ({route.Name}) hattında bakiyeden harcama yapıldı (-{route.StandardFare} TL)."
            };

            _context.Transactions.Add(fareTransaction);
            resultMessage = $"Geçiş Başarılı. Çekilen Tutar: {route.StandardFare} TL. Kalan Bakiye: {card.Balance} TL";
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 🔄 6. REDIS CACHE GÜNCELLEME
        await _cacheService.SetAsync(cardCacheKey, MapToCacheDto(card), TimeSpan.FromMinutes(30), cancellationToken);

        return resultMessage;
    }

    private static CardCacheDto MapToCacheDto(Card card) => new(
        card.Id,
        card.Type,
        card.Status,
        card.Balance,
        card.HasActiveSubscription,
        card.SubscriptionRemainingUses,
        card.SubscriptionExpiryDate
    );
}

public record CardCacheDto(
    Guid Id,
    CardType Type,
    CardStatus Status,
    decimal Balance,
    bool HasActiveSubscription,
    int SubscriptionRemainingUses,
    DateTime? SubscriptionExpiryDate
);

public record RouteCacheDto(
    Guid Id,
    string Code,
    string Name,
    decimal StandardFare,
    int SubscriptionDeduction,
    bool IsActive
);