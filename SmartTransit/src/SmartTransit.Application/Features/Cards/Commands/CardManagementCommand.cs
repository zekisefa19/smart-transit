using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;


namespace SmartTransit.Application.Features.Cards.Commands;

// 1. Kart Bloke Etme Komutu (Sebep ve Anomali ID Eklendi)
public record BlockCardCommand(
    Guid CardId,
    string? Reason = null,
    Guid? AnomalyId = null
) : IRequest<bool>;

public class BlockCardCommandHandler : IRequestHandler<BlockCardCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public BlockCardCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(BlockCardCommand request, CancellationToken cancellationToken)
    {
        // 1. Kartı Veritabanında Bul
        var card = await _context.Cards.FirstOrDefaultAsync(c => c.Id == request.CardId, cancellationToken);
        if (card == null) return false;

        // 2. Kartı Bloke Et
        card.Status = CardStatus.Blocked;
        card.RowVersion = Guid.NewGuid().ToByteArray();

        // 3. Şüpheli Geçiş Kaydı Varsa Çözüldü İşaretle (AI Alarm Listesinden Düşer)
        if (request.AnomalyId.HasValue)
        {
            var anomaly = await _context.SuspiciousTransactions
                .FirstOrDefaultAsync(a => a.Id == request.AnomalyId.Value, cancellationToken);

            if (anomaly != null)
            {
                anomaly.IsResolved = true;
            }
        }

        // 4. Passenger Dashboard İçin Bildirim Oluştur
        var blockReason = string.IsNullOrWhiteSpace(request.Reason)
            ? "Şüpheli hareket tespiti veya güvenlik gerekçesi."
            : request.Reason;

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = card.OwnerId,
            Title = "Kartınız Kullanıma Kapatıldı",
            Message = $"{MaskCardNumber(card.CardNumber)} nolu kartınız erişilemez hale getirilmiştir. Nedeni: {blockReason}",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync(cancellationToken);

        // 5. REDIS CACHE INVALIDATION
        await _cacheService.RemoveAsync($"card:{request.CardId}", cancellationToken);

        return true;
    }

    private static string MaskCardNumber(string cardNumber)
    {
        if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 4) return "****";
        return $"**** **** **** {cardNumber[^4..]}";
    }
}

// 2. Kart Blokeyi Kaldırma Komutu
public record UnblockCardCommand(Guid CardId) : IRequest<bool>;

public class UnblockCardCommandHandler : IRequestHandler<UnblockCardCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public UnblockCardCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(UnblockCardCommand request, CancellationToken cancellationToken)
    {
        var card = await _context.Cards.FirstOrDefaultAsync(c => c.Id == request.CardId, cancellationToken);
        if (card == null) return false;

        card.Status = CardStatus.Active;
        card.RowVersion = Guid.NewGuid().ToByteArray();

        // Bildirim Kutusu (Aktivasyon Bilgilendirmesi)
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = card.OwnerId,
            Title = "Kartınız Tekrar Aktif",
            Message = $"{card.CardNumber} numaralı ulaşım kartınızın blokesi kaldırılmış ve kullanıma açılmıştır.",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync(cancellationToken);

        // 🗑️ REDIS CACHE INVALIDATION
        await _cacheService.RemoveAsync($"card:{request.CardId}", cancellationToken);

        return true;
    }
}