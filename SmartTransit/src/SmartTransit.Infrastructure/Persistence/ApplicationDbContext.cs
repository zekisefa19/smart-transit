using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<CardApplication> CardApplications => Set<CardApplication>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SuspiciousTransaction> SuspiciousTransactions => Set<SuspiciousTransaction>();
    public DbSet<Tariff> Tariffs => Set<Tariff>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<DeviceLog> DeviceLogs => Set<DeviceLog>();
    public DbSet<AiSummary> AiSummaries => Set<AiSummary>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- USER CONFIGURATION ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique(); // Email benzersiz olmalı
        });

        // --- CARD CONFIGURATION ---
        modelBuilder.Entity<Card>(entity =>
        {
            entity.HasIndex(c => c.CardNumber).IsUnique(); // Kart numarası benzersiz olmalı
            entity.Property(c => c.Balance).HasPrecision(10, 2); // Para alanı decimal(10,2)

            // KRİTİK DÜZELTME: PostgreSQL NULL hatasını çözen nihai ayar
            entity.Property(c => c.RowVersion)
                  .IsConcurrencyToken()
                  .ValueGeneratedNever();
        });

        // --- TARIFF CONFIGURATION ---
        modelBuilder.Entity<Tariff>(entity =>
        {
            entity.Property(t => t.BasePrice).HasPrecision(10, 2);
            entity.Property(t => t.TransferDiscountPercent).HasPrecision(5, 2);
        });

        // --- TRANSACTION CONFIGURATION ---
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(t => t.Amount).HasPrecision(10, 2);
        });

        // --- SEED DATA (Başlangıç Verileri) ---
        SeedInitialData(modelBuilder);
    }

    private static void SeedInitialData(ModelBuilder modelBuilder)
    {
        // Örnek Admin Kullanıcısı (Sabit GUID)
        var adminUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminUserId,
                Email = "admin@smarttransit.com",
                PasswordHash = "hashedpassword",
                Role = UserRole.Admin,
                IsEmailConfirmed = true,
                IsDeleted = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Örnek Bir Hat (500T)
        var sampleRouteId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        modelBuilder.Entity<Route>().HasData(
            new Route { Id = sampleRouteId, Code = "500T", Name = "Tuzla - Cevizlibağ", IsActive = true }
        );

        // Örnek Bir Araç
        modelBuilder.Entity<Vehicle>().HasData(
            new Vehicle { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), PlateNumber = "34 ABC 123", RouteId = sampleRouteId, IsActive = true }
        );

        // Varsayılan Tarifeler (Güncel Ücretler)
        modelBuilder.Entity<Tariff>().HasData(
            new Tariff { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), CardType = CardType.Standard, BasePrice = 46.20m, TransferDiscountPercent = 50.00m, IsActive = true },
            new Tariff { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), CardType = CardType.Student, BasePrice = 22.55m, TransferDiscountPercent = 50.00m, IsActive = true },
            new Tariff { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), CardType = CardType.Senior, BasePrice = 0.00m, TransferDiscountPercent = 0.00m, IsActive = true },
            new Tariff { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), CardType = CardType.Discounted, BasePrice = 33.00m, TransferDiscountPercent = 50.00m, IsActive = true },
            new Tariff { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), CardType = CardType.Disabled, BasePrice = 0.00m, TransferDiscountPercent = 0.00m, IsActive = true },
            new Tariff { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), CardType = CardType.MotherCard, BasePrice = 0.00m, TransferDiscountPercent = 0.00m, IsActive = true }
        );
    }
}