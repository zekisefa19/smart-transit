using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Reports.Dtos;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Reports.Queries;

public record GetDailyReportQuery(DateTime? Date) : IRequest<DailyReportResponseDto>;

public class GetDailyReportQueryHandler : IRequestHandler<GetDailyReportQuery, DailyReportResponseDto>
{
    private readonly IApplicationDbContext _context;

    public GetDailyReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DailyReportResponseDto> Handle(GetDailyReportQuery request, CancellationToken cancellationToken)
    {
        var targetDate = (request.Date ?? DateTime.UtcNow).Date;
        var startOfDay = targetDate;
        var endOfDay = targetDate.AddDays(1).AddTicks(-1);

        var dayTransactions = await _context.Transactions
            .Where(t => t.CreatedAt >= startOfDay && t.CreatedAt <= endOfDay)
            .ToListAsync(cancellationToken);

        var totalBoardings = dayTransactions.Count(t => t.Type == TransactionType.Boarding && t.Status == TransactionStatus.Success);
        var totalRevenue = dayTransactions.Where(t => t.Type == TransactionType.Boarding && t.Status == TransactionStatus.Success).Sum(t => t.Amount);
        var totalTopUps = dayTransactions.Where(t => (t.Type == TransactionType.TopUp || t.Type == TransactionType.SubscriptionPurchase) && t.Status == TransactionStatus.Success).Sum(t => t.Amount);

        var activeCardsCount = dayTransactions.Select(t => t.CardId).Distinct().Count();

        var peakHourGroup = dayTransactions
            .Where(t => t.Type == TransactionType.Boarding)
            .GroupBy(t => t.CreatedAt.Hour)
            .OrderByDescending(g => g.Count())
            .FirstOrDefault();

        string peakHourStr = peakHourGroup != null
            ? $"{peakHourGroup.Key:D2}:00 - {(peakHourGroup.Key + 1):D2}:00"
            : "08:00 - 09:00";

        return new DailyReportResponseDto
        {
            Date = targetDate,
            TotalBoardings = totalBoardings,
            TotalRevenue = totalRevenue,
            TotalTopUps = totalTopUps,
            ActiveCardsCount = activeCardsCount,
            PeakHour = peakHourStr
        };
    }
}