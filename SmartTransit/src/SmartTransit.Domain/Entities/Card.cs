using SmartTransit.Domain.Enums;

namespace SmartTransit.Domain.Entities;

public class Card : BaseEntity
{
    public string CardNumber { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public CardType Type { get; set; } = CardType.Standard;
    public CardStatus Status { get; set; } = CardStatus.Active;
    public decimal Balance { get; set; } = 0.00m;

    // ➕ EKLENECEK ABONMAN ALANLARI
    public bool HasActiveSubscription { get; set; } = false;
    public int SubscriptionRemainingUses { get; set; } = 0; // Kalan Basım (Max 200)
    public DateTime? SubscriptionExpiryDate { get; set; }  // Son Kullanma Tarihi (+1 Ay)

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public bool IsDeleted { get; set; } = false;

    // Navigation Properties
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}