using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Features.Assistant.DTOs;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Assistant.Queries;

public record GetAssistantDashboardQuery() : IRequest<AssistantDashboardDto>;

public class GetAssistantDashboardQueryHandler : IRequestHandler<GetAssistantDashboardQuery, AssistantDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetAssistantDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AssistantDashboardDto> Handle(GetAssistantDashboardQuery request, CancellationToken cancellationToken)
    {
        var activeAnomalies = await _context.SuspiciousTransactions
            .Where(x => !x.IsResolved)
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        // RiskScore >= 70 olanları Kritik olarak değerlendiriyoruz
        var criticalCount = activeAnomalies.Count(x => x.RiskScore >= 70.0);

        double healthScore = Math.Max(70.0, 100.0 - (criticalCount * 5.0) - ((activeAnomalies.Count - criticalCount) * 2.0));

        return new AssistantDashboardDto
        {
            NetworkHealthScore = Math.Round(healthScore, 1),
            ActiveAnomalyCount = activeAnomalies.Count,
            CriticalAnomalyCount = criticalCount,
            RecommendationCount = criticalCount > 0 ? criticalCount + 1 : 1,
            LiveAnomalies = activeAnomalies.Select(a => new LiveAnomalyDto
            {
                Id = a.Id,
                Title = string.IsNullOrWhiteSpace(a.AnomalyType) ? "Şüpheli İşlem" : a.AnomalyType,
                Description = string.IsNullOrWhiteSpace(a.Description) ? "Tanımlanmamış ağ aktivitesi saptandı." : a.Description,
                Severity = a.RiskScore >= 80.0 ? "Critical" : a.RiskScore >= 50.0 ? "Medium" : "Low",
                Location = "Sistem Geneli",
                TimeStamp = a.CreatedAt
            }).ToList()
        };
    }
}