using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Reports.Queries.GetExecutiveSummary;

public class GetExecutiveSummaryQueryHandler : IRequestHandler<GetExecutiveSummaryQuery, ExecutiveSummaryResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILlmService _llmService;
    private readonly ILogger<GetExecutiveSummaryQueryHandler> _logger;

    public GetExecutiveSummaryQueryHandler(
        IApplicationDbContext context,
        ILlmService llmService,
        ILogger<GetExecutiveSummaryQueryHandler> logger)
    {
        _context = context;
        _llmService = llmService;
        _logger = logger;
    }

    public async Task<ExecutiveSummaryResponseDto> Handle(GetExecutiveSummaryQuery request, CancellationToken cancellationToken)
    {
        var targetDate = (request.TargetDate ?? DateTime.UtcNow).Date;

        _logger.LogInformation("📊 {Date} tarihi için Yönetici Özeti raporu hazırlanıyor...", targetDate.ToString("dd.MM.yyyy"));

        // 1. Veritabanından İstatistik Verilerini Toplama (Mock/DB Aggregation)
        // Gerçek senaryoda _context.Transactions ve _context.TopUps tablosundan sorgulanır:
        var totalTapCount = 45230; // Örn: Günlük toplam kart okutma
        var totalTopUp = 875400.50m; // Örn: Günlük toplam yükleme tutarı

        var cardBreakdown = new Dictionary<string, int>
        {
            { "Tam Kart", 28500 },
            { "Öğrenci", 12400 },
            { "65+ Yaş / İndirimli", 4330 }
        };

        var topRoutes = new List<RouteUsageDto>
        {
            new("M2", "Yenikapı - Hacıosman Metro", 14200),
            new("500T", "Tuzla - Topkapı Otobüs", 9800),
            new("T1", "Kabataş - Bağcılar Tramvay", 7400)
        };

        var dailyStats = new DailyStatsDto(
            Date: targetDate,
            TotalTopUpAmount: totalTopUp,
            TotalTapCount: totalTapCount,
            CardTypeBreakdown: cardBreakdown,
            TopRoutes: topRoutes
        );

        // 2. Ollama LLM Servisi ile Türkçe Özet Üretme
        var summaryText = await _llmService.GenerateExecutiveSummaryAsync(dailyStats, cancellationToken);

        // Sistemik fallback durumu kontrolü
        bool isAiGenerated = !summaryText.Contains("(Sistemik Özet)");

        _logger.LogInformation("✅ {Date} için Yönetici Özeti başarıyla üretildi. AI Kaynaklı: {IsAiGenerated}",
            targetDate.ToString("dd.MM.yyyy"), isAiGenerated);

        return new ExecutiveSummaryResponseDto(
            Date: targetDate,
            SummaryText: summaryText,
            TotalTopUpAmount: totalTopUp,
            TotalTapCount: totalTapCount,
            IsAiGenerated: isAiGenerated
        );
    }
}