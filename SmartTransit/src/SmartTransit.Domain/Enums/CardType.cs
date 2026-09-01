namespace SmartTransit.Domain.Enums;

public enum CardType
{
    Standard = 1,   // Tam
    Student = 2,    // Öğrenci
    Senior = 3,     // 65+ Yaş Üstü (Ücretsiz)
    Discounted = 4, // İndirimli (Öğretmen / 60+ Yaş)
    Disabled = 5,   // Engelli (Ücretsiz)
    MotherCard = 6  // Anne Kart (Aylık Kotalı Ücretsiz)
}