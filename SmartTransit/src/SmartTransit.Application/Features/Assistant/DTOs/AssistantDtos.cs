namespace SmartTransit.Application.Features.Assistant.DTOs;

public class AssistantDashboardDto
{
    public double NetworkHealthScore { get; set; }
    public int ActiveAnomalyCount { get; set; }
    public int CriticalAnomalyCount { get; set; }
    public int RecommendationCount { get; set; }
    public List<LiveAnomalyDto> LiveAnomalies { get; set; } = new();
}

public class LiveAnomalyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium"; // Critical, Medium, Low
    public string Location { get; set; } = string.Empty;
    public DateTime TimeStamp { get; set; }
}

public record AskAssistantRequestDto(string Prompt);

public class AskAssistantResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}