using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Reports.Dtos;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Reports.Commands;

public record GenerateDailyAiSummaryCommand(DateTime? Date) : IRequest<DailyAiSummaryResponseDto>;

public class GenerateDailyAiSummaryCommandHandler : IRequestHandler<GenerateDailyAiSummaryCommand, DailyAiSummaryResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;
    private readonly ILlmService _llmService;

    public GenerateDailyAiSummaryCommandHandler(
        IApplicationDbContext context,
        ICacheService cacheService,
        ILlmService llmService)
    {
        _context = context;
        _cacheService = cacheService;
        _llmService = llmService;
    }

    public async Task<DailyAiSummaryResponseDto> Handle(GenerateDailyAiSummaryCommand request, CancellationToken cancellationToken)
    {
        var targetDate = (request.Date ?? DateTime.UtcNow).Date;
        string cacheKey = $"daily_ai_summary_{targetDate:yyyyMMdd}";

        // 1. REDIS CACHE KONTROLÜ
        var cachedSummary = await _cacheService.GetAsync<string>(cacheKey, cancellationToken);
        if (!string.IsNullOrEmpty(cachedSummary))
        {
            return new DailyAiSummaryResponseDto
            {
                Date = targetDate,
                Summary = cachedSummary,
                IsCached = true
            };
        }

        // 2. VERİTABANINDAN GERÇEK İSTATİSTİKLERİN ÇEKİLMESİ
        var startOfDay = targetDate;
        var endOfDay = targetDate.AddDays(1).AddTicks(-1);

        var dayTransactions = await _context.Transactions
            .Include(t => t.Card)
            .Include(t => t.Route)
            .Where(t => t.CreatedAt >= startOfDay && t.CreatedAt <= endOfDay)
            .ToListAsync(cancellationToken);

        var totalTopUps = dayTransactions
            .Where(t => t.Type == TransactionType.TopUp || t.Type == TransactionType.SubscriptionPurchase)
            .Sum(t => t.Amount);

        var totalTapCount = dayTransactions.Count(t => t.Type == TransactionType.Boarding);

        var cardTypeBreakdown = dayTransactions
            .Where(t => t.Type == TransactionType.Boarding && t.Card != null)
            .GroupBy(t => t.Card!.Type.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var topRoutes = dayTransactions
            .Where(t => t.Type == TransactionType.Boarding && t.Route != null)
            .GroupBy(t => new { t.Route!.Code, t.Route.Name })
            .Select(g => new RouteUsageDto(g.Key.Code, g.Key.Name, g.Count()))
            .OrderByDescending(r => r.TapCount)
            .Take(5)
            .ToList();

        var statsDto = new DailyStatsDto(
            Date: targetDate,
            TotalTopUpAmount: totalTopUps,
            TotalTapCount: totalTapCount,
            CardTypeBreakdown: cardTypeBreakdown,
            TopRoutes: topRoutes
        );

        // 3. OLLAMA QWEN 2.5 MODELİ İLE METİNSEL ÖZET ÜRETİMİ
        var generatedSummary = await _llmService.GenerateExecutiveSummaryAsync(statsDto, cancellationToken);

        // 4. REDIS CACHE'E KAYIT (1 Saat)
        await _cacheService.SetAsync(cacheKey, generatedSummary, TimeSpan.FromHours(1), cancellationToken);

        return new DailyAiSummaryResponseDto
        {
            Date = targetDate,
            Summary = generatedSummary,
            IsCached = false
        };
    }
}