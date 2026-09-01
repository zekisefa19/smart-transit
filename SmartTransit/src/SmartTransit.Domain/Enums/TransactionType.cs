namespace SmartTransit.Domain.Enums;

public enum TransactionType
{
    TopUp = 1,                // Bakiye yükleme
    Boarding = 2,             // Kart basma / Geçiş (Nakit veya Abonman)
    Refund = 3,               // İade
    SubscriptionPurchase = 4  // Abonman satın alma / Yükleme
}