using Microsoft.EntityFrameworkCore;
using SmartTransit.Domain.Entities;

namespace SmartTransit.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Card> Cards { get; }
    DbSet<CardApplication> CardApplications { get; } // 🔴 Kart Başvuruları için eklendi
    DbSet<Notification> Notifications { get; } // 🔴 Yolcu Bildirimleri için eklendi
    DbSet<SuspiciousTransaction> SuspiciousTransactions { get; } // 🔴 AI Şüpheli Geçişler için eklendi
    DbSet<Tariff> Tariffs { get; }
    DbSet<Route> Routes { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Transaction> Transactions { get; }
    DbSet<DeviceLog> DeviceLogs { get; }
    DbSet<AiSummary> AiSummaries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}