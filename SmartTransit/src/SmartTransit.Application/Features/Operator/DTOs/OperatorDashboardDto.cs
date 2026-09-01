namespace SmartTransit.Application.Features.Operator.DTOs;

public class OperatorDashboardDto
{
    public decimal TodayTotalTopUp { get; set; }
    public decimal TodayTotalRevenue { get; set; }
    public double TopUpChangeRate { get; set; }
    public int TodayPassCount { get; set; }
    public double PassCountChangeRate { get; set; }
    public string ActiveCardCount { get; set; } = string.Empty;
    public int ActiveVehicleCount { get; set; }
    public int TotalVehicleCount { get; set; }

    public int SuspiciousTransactionCount { get; set; }

    public List<HourlyActivityDto> HourlyActivities { get; set; } = new();
    public List<TopLineDto> TopLines { get; set; } = new();
    public string? AiInsightMessage { get; set; }
    public List<RecentOperatorTransactionDto> RecentTransactions { get; set; } = new();
}

public class HourlyActivityDto
{
    public string Hour { get; set; } = string.Empty;
    public int PassengerCount { get; set; }
}

public class TopLineDto
{
    public string LineCode { get; set; } = string.Empty;
    public string PassengerCountText { get; set; } = string.Empty;
    public int Percentage { get; set; }
}

public class RecentOperatorTransactionDto
{
    public string Time { get; set; } = string.Empty;
    public string MaskedCardNumber { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string LineCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}