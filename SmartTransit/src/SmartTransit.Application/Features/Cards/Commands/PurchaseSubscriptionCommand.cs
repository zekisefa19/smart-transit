using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Cards.Commands;

public record PurchaseSubscriptionCommand(Guid CardId) : IRequest<bool>;

public class PurchaseSubscriptionCommandHandler : IRequestHandler<PurchaseSubscriptionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public PurchaseSubscriptionCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(PurchaseSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var card = await _context.Cards
            .FirstOrDefaultAsync(c => c.Id == request.CardId && !c.IsDeleted, cancellationToken);

        if (card == null)
            throw new Exception("Kart bulunamadı.");

        // 🛑 SEÇENEK A: Aktif ve Süresi Dolmamış Abonman Kontrolü
        if (card.HasActiveSubscription &&
            card.SubscriptionExpiryDate.HasValue &&
            card.SubscriptionExpiryDate.Value > DateTime.UtcNow &&
            card.SubscriptionRemainingUses > 0)
        {
            throw new Exception($"Mevcut aktif bir abonmanınız bulunmaktadır! (Kalan Basım: {card.SubscriptionRemainingUses}, Bitiş: {card.SubscriptionExpiryDate.Value:dd.MM.yyyy HH:mm})");
        }

        // 🛑 Engelli ve 65+ Yaş Kontrolü
        if (card.Type is CardType.Disabled or CardType.Senior)
        {
            throw new Exception($"{card.Type} türündeki ücretsiz kartlara abonman yüklemesi yapılamaz.");
        }

        int usageQuota = 200;
        decimal price = 0m;
        string transactionDescription = "";

        // 🌸 Anne Kart Özel Mantığı (Aylık 150 Ücretsiz Basım)
        if (card.Type == CardType.MotherCard)
        {
            usageQuota = 150;
            price = 0m; // Ücretsiz
            transactionDescription = "Anne Kart Aylık 150 Ücretsiz Kullanım Kotası Yüklendi.";
        }
        else
        {
            // Normal Abonman Fiyatlandırması (+8 TL Hizmet Bedeli)
            price = card.Type switch
            {
                CardType.Student => 653m + 8m,    // 661 TL
                CardType.Standard => 3628m + 8m,  // 3636 TL
                CardType.Discounted => 1739m + 8m,// 1747 TL
                _ => throw new Exception("Bu kart tipi için abonman seçeneği bulunmamaktadır.")
            };
            transactionDescription = $"{card.Type} Abonman Yükleme Yapıldı ({price} TL).";
        }

        // 🔄 Abonman Bilgilerini Güncelle
        card.HasActiveSubscription = true;
        card.SubscriptionRemainingUses = usageQuota;
        card.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1);

        // 📝 TRANSACTION KAYDI OLUŞTUR
        var transaction = new Transaction
        {
            CardId = card.Id,
            Amount = price,
            BalanceAfter = card.Balance,
            SubscriptionDeduction = usageQuota,
            Type = TransactionType.SubscriptionPurchase,
            Status = TransactionStatus.Success,
            Description = transactionDescription
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        // 🗑️ REDIS CACHE INVALIDATION: Güncellenen kart bilgilerini önbellekten temizle
        await _cacheService.RemoveAsync($"card:{request.CardId}", cancellationToken);

        return true;
    }
}