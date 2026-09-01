using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Operator.DTOs;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Operator.Queries;

public record GetOperatorDashboardQuery : IRequest<OperatorDashboardDto>;

public class GetOperatorDashboardQueryHandler : IRequestHandler<GetOperatorDashboardQuery, OperatorDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetOperatorDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OperatorDashboardDto> Handle(GetOperatorDashboardQuery request, CancellationToken cancellationToken)
    {
        // Türkiye saati (UTC+3) baz alınarak bugünün 00:00 UTC karşılığı
        var nowUtc = DateTime.UtcNow;
        var todayTurkeyDate = nowUtc.AddHours(3).Date;

        var todayStart = DateTime.SpecifyKind(todayTurkeyDate.AddHours(-3), DateTimeKind.Utc);
        var yesterdayStart = DateTime.SpecifyKind(todayStart.AddDays(-1), DateTimeKind.Utc);

        // 1. BUGÜNKÜ TOPLAM YÜKLEME (Bakiye Yüklemeleri)
        var todayTopUpSum = await _context.Transactions
            .Where(t => t.CreatedAt >= todayStart &&
                       (t.Type == TransactionType.TopUp || t.Type == TransactionType.SubscriptionPurchase) &&
                       t.Status == TransactionStatus.Success)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        var yesterdayTopUpSum = await _context.Transactions
            .Where(t => t.CreatedAt >= yesterdayStart && t.CreatedAt < todayStart &&
                       (t.Type == TransactionType.TopUp || t.Type == TransactionType.SubscriptionPurchase) &&
                       t.Status == TransactionStatus.Success)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        double topUpChangeRate = yesterdayTopUpSum > 0
            ? (double)((todayTopUpSum - yesterdayTopUpSum) / yesterdayTopUpSum * 100)
            : 0;

        // 2. BUGÜNKÜ GERÇEK BİNİŞ GELİRİ (Negatif biniş tutarlarını Math.Abs ile pozitife çeviriyoruz)
        var rawRevenueSum = await _context.Transactions
            .Where(t => t.CreatedAt >= todayStart &&
                       t.Type == TransactionType.Boarding &&
                       t.Status == TransactionStatus.Success)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        var todayRevenueSum = Math.Abs(rawRevenueSum);

        // 3. BUGÜNKÜ GEÇİŞ SAYISI
        var todayPassCount = await _context.Transactions
            .CountAsync(t => t.CreatedAt >= todayStart && t.Type == TransactionType.Boarding && t.Status == TransactionStatus.Success, cancellationToken);

        var yesterdayPassCount = await _context.Transactions
            .CountAsync(t => t.CreatedAt >= yesterdayStart && t.CreatedAt < todayStart && t.Type == TransactionType.Boarding && t.Status == TransactionStatus.Success, cancellationToken);

        double passChangeRate = yesterdayPassCount > 0
            ? (double)((todayPassCount - yesterdayPassCount) / (double)yesterdayPassCount * 100)
            : 0;

        // 4. AKTİF KART VE ARAÇ SAYILARI
        var activeCardCount = await _context.Cards
            .CountAsync(c => c.Status == CardStatus.Active && !c.IsDeleted, cancellationToken);

        var totalVehicleCount = await _context.Vehicles
            .CountAsync(cancellationToken);

        var activeVehicleCount = await _context.Vehicles
            .CountAsync(v => v.IsActive, cancellationToken);

        // 5. ŞÜPHELİ / BAŞARISIZ İŞLEM SAYISI
        var suspiciousCount = await _context.Transactions
            .CountAsync(t => t.CreatedAt >= todayStart && t.Status != TransactionStatus.Success, cancellationToken);

        // 6. SAATLİK AKTİVİTE GRAFİĞİ
        var todayValidationsRaw = await _context.Transactions
            .Where(t => t.CreatedAt >= todayStart && t.Type == TransactionType.Boarding)
            .Select(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var todayValidationsHours = todayValidationsRaw
            .Select(ts => DateTime.SpecifyKind(ts, DateTimeKind.Utc).AddHours(3).Hour)
            .ToList();

        var hourlyActivities = new List<HourlyActivityDto>();
        for (int hour = 0; hour < 24; hour += 4)
        {
            int nextHour = hour + 4;
            int count = todayValidationsHours.Count(h => h >= hour && h < nextHour);
            hourlyActivities.Add(new HourlyActivityDto
            {
                Hour = $"{hour:D2}:00",
                PassengerCount = count
            });
        }

        // 7. EN ÇOK KULLANILAN HATLAR
        var topLinesRaw = await _context.Transactions
            .Include(t => t.Route)
            .Where(t => t.CreatedAt >= todayStart && t.Type == TransactionType.Boarding && t.RouteId != null)
            .GroupBy(t => t.Route!.Code)
            .Select(g => new { LineCode = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        int maxLinePass = topLinesRaw.FirstOrDefault()?.Count ?? 1;

        var topLines = topLinesRaw.Select(l => new TopLineDto
        {
            LineCode = l.LineCode ?? "Bilinmeyen Hat",
            PassengerCountText = l.Count >= 1000 ? $"{l.Count / 1000.0:F1}K" : l.Count.ToString(),
            Percentage = (int)((double)l.Count / maxLinePass * 100)
        }).ToList();

        // 8. SON İŞLEMLER
        var recentTransactionsRaw = await _context.Transactions
            .Include(t => t.Card)
            .Include(t => t.Route)
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => new
            {
                t.CreatedAt,
                CardNumber = t.Card != null ? t.Card.CardNumber : null,
                RouteCode = t.Route != null ? t.Route.Code : null,
                t.Type,
                t.Amount,
                t.Status
            })
            .ToListAsync(cancellationToken);

        var recentTransactions = recentTransactionsRaw
            .Select(t => new RecentOperatorTransactionDto
            {
                Time = DateTime.SpecifyKind(t.CreatedAt, DateTimeKind.Utc).AddHours(3).ToString("HH:mm:ss"),
                MaskedCardNumber = MaskCardNumber(t.CardNumber),
                TransactionType = GetTransactionTypeTitle(t.Type),
                LineCode = t.RouteCode ?? "-",
                Amount = Math.Abs(t.Amount),
                Status = t.Status == TransactionStatus.Success ? "BASARILI" : "REDDEDILDI"
            })
            .ToList();

        return new OperatorDashboardDto
        {
            TodayTotalTopUp = todayTopUpSum,
            TodayTotalRevenue = todayRevenueSum,
            TopUpChangeRate = Math.Round(topUpChangeRate, 1),
            TodayPassCount = todayPassCount,
            PassCountChangeRate = Math.Round(passChangeRate, 1),
            ActiveCardCount = activeCardCount.ToString("N0"),
            ActiveVehicleCount = activeVehicleCount,
            TotalVehicleCount = totalVehicleCount,
            SuspiciousTransactionCount = suspiciousCount,
            HourlyActivities = hourlyActivities,
            TopLines = topLines,
            RecentTransactions = recentTransactions
        };
    }

    private static string GetTransactionTypeTitle(TransactionType type) => type switch
    {
        TransactionType.Boarding => "Validasyon",
        TransactionType.TopUp => "Bakiye Yükleme",
        TransactionType.SubscriptionPurchase => "Abonman Yükleme",
        TransactionType.Refund => "İade",
        _ => type.ToString()
    };

    private static string MaskCardNumber(string? cardNumber)
    {
        if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 4) return "****";
        return $"**** {cardNumber.Substring(cardNumber.Length - 4)}";
    }
}