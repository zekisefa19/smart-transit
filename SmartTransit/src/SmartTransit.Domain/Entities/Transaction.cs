using SmartTransit.Domain.Enums;

namespace SmartTransit.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid CardId { get; set; }
    public Card Card { get; set; } = null!;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }

    // ➕ ABONMAN VE DETAY TAKİBİ İÇİN EKLENEN ALANLAR
    public int SubscriptionDeduction { get; set; } = 0;     // Düşen / Yüklenen Abonman Adedi
    public string Description { get; set; } = string.Empty; // İşlem Açıklaması

    public Guid? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public Guid? RouteId { get; set; }
    public Route? Route { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Success;
    public string? IdempotencyKey { get; set; } // Mükerrer işlem kontrolü için
}