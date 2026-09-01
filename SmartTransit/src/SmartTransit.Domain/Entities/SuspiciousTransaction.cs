namespace SmartTransit.Domain.Entities;

public class SuspiciousTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CardId { get; set; }
    public Guid? RouteId { get; set; }
    public string AnomalyType { get; set; } = string.Empty; // Klonlama Şüphesi, Peş Peşe Biniş vb.
    public string Description { get; set; } = string.Empty;
    public double RiskScore { get; set; }
    public bool IsResolved { get; set; } = false;
    public string? ResolutionNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}