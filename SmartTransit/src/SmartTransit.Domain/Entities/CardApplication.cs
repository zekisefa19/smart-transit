namespace SmartTransit.Domain.Entities;

public class CardApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string CardType { get; set; } = string.Empty; // Öğrenci, Engelli, 65+ vb.
    public string? DocumentUrl { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? ApplicantName { get; set; }
    public string? IdentityNumber { get; set; }
    public string? Email { get; set; }
}