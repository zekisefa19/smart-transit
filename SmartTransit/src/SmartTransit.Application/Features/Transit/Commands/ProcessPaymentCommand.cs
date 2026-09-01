using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Transit.Commands;

// 1. Dışarıya Dönülecek Yanıt Modeli
public record PaymentResultDto(
    bool IsSuccess,
    string Message,
    decimal AmountDeducted,
    decimal RemainingBalance,
    bool IsTransfer,
    int TransferNumber
);

// 2. İstek (Command) Modeli
public record ProcessPaymentCommand(
    Guid CardId,
    Guid RouteId,
    Guid VehicleId
) : IRequest<PaymentResultDto>;

// 3. İşleyici (Handler) Mantığı
public class ProcessPaymentCommandHandler : IRequestHandler<ProcessPaymentCommand, PaymentResultDto>
{
    private readonly IApplicationDbContext _context;
    private const int TransferWindowInMinutes = 120; // 120 dakikalık aktarma penceresi
    private const int MotherCardMonthlyLimit = 150;  // Anne Kart aylık ücretsiz biniş kotası

    public ProcessPaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentResultDto> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kartı getir
        var card = await _context.Cards
            .FirstOrDefaultAsync(c => c.Id == request.CardId && c.Status == CardStatus.Active, cancellationToken);

        if (card == null)
            return new PaymentResultDto(false, "Geçersiz veya pasif kart.", 0, 0, false, 0);

        // 2. Kart tipine uygun aktif tarifeyi al
        var tariff = await _context.Tariffs
            .FirstOrDefaultAsync(t => t.CardType == card.Type && t.IsActive, cancellationToken);

        if (tariff == null)
            return new PaymentResultDto(false, "Bu kart tipi için aktif tarife bulunamadı.", 0, card.Balance, false, 0);

        // -------------------------------------------------------------
        // KURAL 1: ÜCRETSİZ GEÇİŞ KARTLARI (65+ Yaş, Engelli)
        // -------------------------------------------------------------
        if (card.Type == CardType.Senior || card.Type == CardType.Disabled)
        {
            await RecordTransaction(card.Id, 0, card.Balance, cancellationToken);
            string typeName = card.Type == CardType.Senior ? "65+ Yaş" : "Engelli";
            return new PaymentResultDto(true, $"Ücretsiz Geçiş Yapıldı ({typeName} Kartı)", 0, card.Balance, false, 0);
        }

        // -------------------------------------------------------------
        // KURAL 2: ANNE KART (Aylık 150 Biniş Kotası Kontrolü)
        // -------------------------------------------------------------
        if (card.Type == CardType.MotherCard)
        {
            var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            int currentMonthUsage = await _context.Transactions
                .Where(t => t.CardId == card.Id && t.Type == TransactionType.Boarding && t.CreatedAt >= firstDayOfMonth)
                .CountAsync(cancellationToken);

            if (currentMonthUsage >= MotherCardMonthlyLimit)
            {
                return new PaymentResultDto(false, $"Aylık Anne Kart kotanız ({MotherCardMonthlyLimit} biniş) dolmıştır. Yetersiz Bakiye.", 0, card.Balance, false, 0);
            }

            await RecordTransaction(card.Id, 0, card.Balance, cancellationToken);
            int remainingQuota = MotherCardMonthlyLimit - (currentMonthUsage + 1);
            return new PaymentResultDto(true, $"Anne Kart Ücretsiz Geçiş (Kalan Aylık Hak: {remainingQuota})", 0, card.Balance, false, 0);
        }

        // -------------------------------------------------------------
        // KURAL 2.5: AKTİF ABONMAN KONTROLÜ (Öğrenci, Tam vb.) 🚀 [YENİ EKLENDİ]
        // -------------------------------------------------------------
        if (card.HasActiveSubscription &&
            card.SubscriptionRemainingUses > 0 &&
            card.SubscriptionExpiryDate.HasValue &&
            card.SubscriptionExpiryDate.Value > DateTime.UtcNow)
        {
            // Abonman kullanım hakkını 1 düşür
            card.SubscriptionRemainingUses--;
            card.RowVersion = Guid.NewGuid().ToByteArray();

            // Transaction Kaydı (0 TL Kesinti, 1 Abonman Hak Düşümü)
            var subTx = new Transaction
            {
                Id = Guid.NewGuid(),
                CardId = card.Id,
                Amount = 0,
                BalanceAfter = card.Balance,
                SubscriptionDeduction = 1,
                Type = TransactionType.Boarding,
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(subTx);
            await _context.SaveChangesAsync(cancellationToken);

            return new PaymentResultDto(
                IsSuccess: true,
                Message: $"Abonman Geçişi Başarılı. (Kalan Hak: {card.SubscriptionRemainingUses})",
                AmountDeducted: 0,
                RemainingBalance: card.Balance,
                IsTransfer: false,
                TransferNumber: 0
            );
        }

        // -------------------------------------------------------------
        // KURAL 3: NAKİT BAKİYELİ ÜCRETLİ GEÇİŞLER (Tam, Öğrenci, İndirimli)
        // + KADEMELİ AKTARMA HESABI (%67.7, %52.0, %17.0)
        // -------------------------------------------------------------
        var recentBoardings = await _context.Transactions
            .AsNoTracking()
            .Where(t => t.CardId == request.CardId && t.Type == TransactionType.Boarding)
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        int chainCount = 0;
        DateTime previousTime = DateTime.UtcNow;

        foreach (var tx in recentBoardings)
        {
            if ((previousTime - tx.CreatedAt).TotalMinutes <= TransferWindowInMinutes)
            {
                chainCount++;
                previousTime = tx.CreatedAt;
            }
            else break;
        }

        int transferNumber = chainCount;

        // Kademeli Aktarma Katsayıları
        decimal percentage = transferNumber switch
        {
            0 => 1.000m,   // İlk Biniş (%100)
            1 => 0.677m,   // 1. Aktarma (%67.7)
            2 => 0.520m,   // 2. Aktarma (%52.0)
            _ => 0.170m    // 3. ve Sonraki Tüm Aktarmalar (%17.0)
        };

        // Ücret Hesaplama (Virgülden sonra 2 haneye yuvarlanır)
        decimal amountToDeduct = Math.Round(tariff.BasePrice * percentage, 2);
        bool isTransfer = transferNumber > 0;

        // Bakiye Kontrolü
        if (card.Balance < amountToDeduct)
        {
            string failureMsg = isTransfer
                ? $"Yetersiz Bakiye. ({transferNumber}. Aktarma Ücreti: ₺{amountToDeduct:N2})"
                : $"Yetersiz Bakiye. (Biniş Ücreti: ₺{amountToDeduct:N2})";

            return new PaymentResultDto(false, failureMsg, 0, card.Balance, isTransfer, transferNumber);
        }

        // Bakiyeden düş ve RowVersion güncelle
        card.Balance -= amountToDeduct;
        card.RowVersion = Guid.NewGuid().ToByteArray();

        await RecordTransaction(card.Id, -amountToDeduct, card.Balance, cancellationToken);

        string successMsg = transferNumber switch
        {
            0 => $"İlk Biniş Geçişi Başarılı ({card.Type} Tarife)",
            1 => $"1. Aktarma Geçişi Başarılı (%67.7 Ücret - {card.Type})",
            2 => $"2. Aktarma Geçişi Başarılı (%52 Ücret - {card.Type})",
            _ => $"{transferNumber}. Aktarma Geçişi Başarılı (%17 Ücret - {card.Type})"
        };

        return new PaymentResultDto(true, successMsg, amountToDeduct, card.Balance, isTransfer, transferNumber);
    }

    private async Task RecordTransaction(Guid cardId, decimal amount, decimal balanceAfter, CancellationToken cancellationToken)
    {
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            CardId = cardId,
            Amount = amount,
            BalanceAfter = balanceAfter,
            Type = TransactionType.Boarding,
            CreatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);
    }
}