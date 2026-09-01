using MediatR;

namespace SmartTransit.Application.Reports.Queries.GetExecutiveSummary;

/// <summary>
/// Belirtilen tarih için Yönetici Rapor Özeti getirme sorgusu.
/// </summary>
public record GetExecutiveSummaryQuery(DateTime? TargetDate = null) : IRequest<ExecutiveSummaryResponseDto>;

public record ExecutiveSummaryResponseDto(
    DateTime Date,
    string SummaryText,
    decimal TotalTopUpAmount,
    int TotalTapCount,
    bool IsAiGenerated
);