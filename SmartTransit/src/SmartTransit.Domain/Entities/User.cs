using SmartTransit.Domain.Enums;

namespace SmartTransit.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // 🆕 Eklenen Profil Alanları
    public string? PhoneNumber { get; set; }       // Telefon Numarası
    public string? IdentityNumber { get; set; }    // TCKN (11 haneli sayısal string)
    public DateTime? BirthDate { get; set; }       // Doğum Tarihi
    public string? Address { get; set; }           // Adres

    public UserRole Role { get; set; } = UserRole.Passenger;
    public bool IsEmailConfirmed { get; set; } = false;
    public bool IsDeleted { get; set; } = false;

    // E-Posta Doğrulama Kod Alanları
    public string? EmailConfirmationCode { get; set; }
    public DateTime? CodeExpiry { get; set; }

    // Navigation Properties
    public ICollection<Card> Cards { get; set; } = new List<Card>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}