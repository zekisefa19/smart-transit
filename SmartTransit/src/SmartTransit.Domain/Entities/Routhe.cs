namespace SmartTransit.Domain.Entities;

public class Route : BaseEntity
{
    public string Code { get; set; } = string.Empty; // Örn: "500T"
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // ➕ EKLENECEK ÜCRET VE ABONMAN DÜŞÜŞ ALANLARI
    public decimal StandardFare { get; set; } = 20.00m;    // TL Bakiye Düşüş Ücreti
    public int SubscriptionDeduction { get; set; } = 1;   // Abonman Basım Düşüş Sayısı (Örn: 500T -> 1, 34BZ -> 2)

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}