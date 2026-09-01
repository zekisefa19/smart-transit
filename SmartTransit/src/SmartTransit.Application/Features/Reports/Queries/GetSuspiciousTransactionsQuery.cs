using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Reports.Queries;

// 🔴 3 Parametreli (PageNumber, PageSize, OnlyUnresolved) Query Record
public record GetSuspiciousTransactionsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    bool? OnlyUnresolved = true
) : IRequest<PaginatedSuspiciousResponseDto>;

public record PaginatedSuspiciousResponseDto(
    List<AnalyzedSuspiciousItemDto> Items,
    int TotalCount,
    int PageNumber,
    int PageSize
);

public record AnalyzedSuspiciousItemDto(
    Guid TransactionId,
    string CardNumber,
    string CardType,
    string RouteName,
    decimal Amount,
    DateTime Timestamp,
    string SystemReason,
    SuspiciousAnalysisResultDto AiAnalysis
);

public class GetSuspiciousTransactionsQueryHandler
    : IRequestHandler<GetSuspiciousTransactionsQuery, PaginatedSuspiciousResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILlmService _llmService;

    public GetSuspiciousTransactionsQueryHandler(IApplicationDbContext context, ILlmService llmService)
    {
        _context = context;
        _llmService = llmService;
    }

    public async Task<PaginatedSuspiciousResponseDto> Handle(GetSuspiciousTransactionsQuery request, CancellationToken cancellationToken)
    {
        // 1. [SUSPICIOUS] etiketli, başarısız veya yüksek tutarlı tüm işlemleri getir
        var query = _context.Transactions
            .AsNoTracking()
            .Include(t => t.Card)
            .Include(t => t.Route)
            .Where(t => t.Status == TransactionStatus.Failed
                     || t.Amount > 100m
                     || (t.Description != null && t.Description.Contains("[SUSPICIOUS]")));

        // 🔴 2. Çözülmüş / İncelenmiş şüpheli kayıtları filtrelere göre süz (OnlyUnresolved)
        if (request.OnlyUnresolved == true)
        {
            query = query.Where(t => t.Description == null || !t.Description.Contains("[RESOLVED]"));
        }

        query = query.OrderByDescending(t => t.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        // 3. Sayfalama (Pagination)
        var transactions = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // 4. Eşzamanlı (Paralel) LLM İşleme
        var analysisTasks = transactions.Select(async t =>
        {
            var suspDto = new SuspiciousTransactionDto(
                TransactionId: t.Id,
                CardNumber: t.Card?.CardNumber ?? "Bilinmiyor",
                CardType: t.Card?.Type.ToString() ?? "Standard",
                RouteCode: t.Route?.Code ?? "N/A",
                Amount: t.Amount,
                Timestamp: t.CreatedAt,
                SystemReason: t.Description ?? "Şüpheli İşlem Tespiti"
            );

            var aiResult = await _llmService.AnalyzeSuspiciousTransactionAsync(suspDto, cancellationToken);

            return new AnalyzedSuspiciousItemDto(
                TransactionId: t.Id,
                CardNumber: suspDto.CardNumber,
                CardType: suspDto.CardType,
                RouteName: t.Route?.Name ?? "Bilinmeyen Hat",
                Amount: t.Amount,
                Timestamp: t.CreatedAt,
                SystemReason: suspDto.SystemReason,
                AiAnalysis: aiResult
            );
        });

        var analyzedItems = (await Task.WhenAll(analysisTasks)).ToList();

        return new PaginatedSuspiciousResponseDto(analyzedItems, totalCount, request.PageNumber, request.PageSize);
    }
}