using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;

namespace SmartTransit.Application.Features.Cards.Commands;

public class RejectCardApplicationCommandHandler : IRequestHandler<RejectCardApplicationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RejectCardApplicationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RejectCardApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _context.CardApplications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken);

        // Başvuru bulunamazsa veya durumu "Beklemede" (Pending) değilse işlemi iptal et
        if (application == null || !string.Equals(application.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            return false;

        // 1. Red Nedenini Kontrol Et ve Başvuru Durumunu Güncelle
        var rejectionReason = string.IsNullOrWhiteSpace(request.Reason)
            ? "Gerekli başvuru şartları sağlanamadı."
            : request.Reason.Trim();

        application.Status = "Rejected";
        application.RejectionReason = rejectionReason;
        application.ProcessedAt = DateTime.UtcNow;

        // 2. Yolcu Ekranı (Passenger Dashboard) İçin Bildirim Oluştur
        var cardTypeName = !string.IsNullOrWhiteSpace(application.CardType)
            ? application.CardType
            : "Özel";

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = application.UserId,
            Title = "Kart Başvurunuz Onaylanmadı ⚠️",
            Message = $"{cardTypeName} kart başvurunuz reddedilmiştir. Nedeni: {rejectionReason}",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);

        // 3. Değişiklikleri Veritabanına Kaydet
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}