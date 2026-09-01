using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Cards.Commands;

public class ApproveCardApplicationCommandHandler : IRequestHandler<ApproveCardApplicationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveCardApplicationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveCardApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _context.CardApplications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken);

        if (application == null || application.Status != "Pending")
            return false;

        // 1. Başvuru durumu güncellenir
        application.Status = "Approved";
        application.ProcessedAt = DateTime.UtcNow;

        // 2. Kart Tipi Enum Dönüşümü (String -> Enum Güvenli Dönüştürme)
        if (!Enum.TryParse<CardType>(application.CardType, true, out var parsedCardType))
        {
            // Eğer string tam eşleşmezse alternatif kontrol yapabilirsiniz (Varsayılan: Standard / Ogrenci)
            parsedCardType = application.CardType?.ToLower() switch
            {
                "ogrenci" => CardType.Student,
                "engelli" => CardType.Disabled,
                "65ustu" => CardType.Senior,
                _ => CardType.Standard
            };
        }

        // 3. Kart Numarası Oluşturma
        var cardNumber = string.IsNullOrWhiteSpace(request.CardNumber)
            ? $"34ST{Random.Shared.Next(10000000, 99999999)}"
            : request.CardNumber;

        // 4. Kullanıcıya (OwnerId) Yeni Kart Tanımlama
        var newCard = new Card
        {
            Id = Guid.NewGuid(),
            OwnerId = application.UserId,
            CardNumber = cardNumber,
            Type = parsedCardType,
            Status = CardStatus.Active,
            Balance = 0.00m,
            RowVersion = Guid.NewGuid().ToByteArray()
        };

        _context.Cards.Add(newCard);

        // 5. Kullanıcı Paneli (Passenger Dashboard) İçin Bildirim Oluşturma
        var last4Digits = cardNumber.Length >= 4 ? cardNumber[^4..] : cardNumber;

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = application.UserId,
            Title = "Kart Başvurunuz Onaylandı 🎉",
            Message = $"{application.CardType} kart başvurunuz onaylanmıştır. Kart Numaranız: **** **** {last4Digits}",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);

        // 6. Değişiklikleri Veritabanına Kaydet
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}