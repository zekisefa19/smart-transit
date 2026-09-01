namespace SmartTransit.Application.Features.Reports.Dtos;

public class DailyReportResponseDto
{
    public DateTime Date { get; set; }
    public int TotalBoardings { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalTopUps { get; set; }
    public int ActiveCardsCount { get; set; }
    public string PeakHour { get; set; } = string.Empty;
}

public class SuspiciousTransactionReportDto
{
    public Guid Id { get; set; }
    public Guid CardId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string RiskScore { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class PaginatedSuspiciousReportResponseDto
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public List<SuspiciousTransactionReportDto> Data { get; set; } = new();
}

public class DailyAiSummaryRequestDto
{
    public DateTime? Date { get; set; }
}

public class DailyAiSummaryResponseDto
{
    public DateTime Date { get; set; }
    public string Summary { get; set; } = string.Empty;
    public bool IsCached { get; set; }
}

public class SuspiciousAnalyzeRequestDto
{
    public Guid TransactionId { get; set; }
    public string? Details { get; set; }
}

public class SuspiciousAnalyzeResponseDto
{
    public Guid TransactionId { get; set; }
    public string RiskCategory { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
    public string RecommendedAction { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}