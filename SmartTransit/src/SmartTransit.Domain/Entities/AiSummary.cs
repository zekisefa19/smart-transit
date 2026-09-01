// Entities/AiSummary.cs
namespace SmartTransit.Domain.Entities;

public class AiSummary : BaseEntity
{
    public DateTime ReportDate { get; set; }
    public string SummaryText { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
}