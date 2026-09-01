using SmartTransit.Domain.Enums;

namespace SmartTransit.Domain.Entities;

public class Tariff : BaseEntity
{
    public CardType CardType { get; set; }

    // Passenger Arayüzü Başlık ve Açıklama Bilgileri
    public string Title { get; set; } = string.Empty;       // Örn: "Tam İstanbulkart", "Öğrenci Kartı"
    public string Subtitle { get; set; } = string.Empty;    // Örn: "Standart Kullanıcı", "İlkokul, Lise, Üniversite"
    public string Description { get; set; } = string.Empty; // Örn: "AYLIK ABONMAN (200 BASIM)", "AYLIK 150 ÜCRETSİZ KOTA"

    // Ücret Kalemleri
    public decimal BasePrice { get; set; }                  // Paket Fiyatı (Örn: 3628.00m)
    public decimal ServiceFee { get; set; }                 // Hizmet Bedeli (Örn: 8.00m)
    public decimal SinglePassFee { get; set; }              // Turnike Tek Geçiş Ücreti
    public decimal PrintingFee { get; set; }                // Kart Basım / Çıkartma Ücreti

    // Aktarma ve Muafiyet Oranları
    public decimal TransferDiscountPercent { get; set; } = 50.00m; // 1. Aktarma İndirimi (%)
    public decimal Transfer2DiscountPercent { get; set; } = 75.00m; // 2. Aktarma İndirimi (%)
    public bool IsFree { get; set; } = false;                      // Ücretsiz / Muafiyetli Kart mı? (Engelli, Anne, +65)
    public bool IsActive { get; set; } = true;

    // Hesaplanan Toplam Abonman Ücreti (BasePrice + ServiceFee)
    public decimal SubscriptionFee => IsFree ? 0m : (BasePrice + ServiceFee);
}