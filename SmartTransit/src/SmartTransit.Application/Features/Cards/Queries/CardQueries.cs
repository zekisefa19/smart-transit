using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Cards.Queries;

// Sayfalanmış Yanıt Modeli (Pagination Response)
public record PagedResult<T>(List<T> Items, int TotalCount, int PageNumber, int PageSize);

// 1. Yolcunun Kartlarını Listeleme
public record GetUserCardsQuery(Guid OwnerId) : IRequest<List<CardDetailsDto>>;

public class GetUserCardsQueryHandler : IRequestHandler<GetUserCardsQuery, List<CardDetailsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserCardsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<CardDetailsDto>> Handle(GetUserCardsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Cards
            .AsNoTracking()
            .Where(c => c.OwnerId == request.OwnerId)
            .Select(c => new CardDetailsDto(
                c.Id,
                c.CardNumber,
                c.Type.ToString(),
                c.Status.ToString(),
                c.Balance,
                new List<TransactionDto>()
            ))
            .ToListAsync(cancellationToken);
    }
}

// 2. Kart İşlem Geçmişi (Sayfalamalı / Paged)
public record GetCardTransactionsQuery(Guid CardId, int PageNumber = 1, int PageSize = 10) : IRequest<PagedResult<TransactionDto>>;

public class GetCardTransactionsQueryHandler : IRequestHandler<GetCardTransactionsQuery, PagedResult<TransactionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCardTransactionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PagedResult<TransactionDto>> Handle(GetCardTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Transactions
            .AsNoTracking()
            .Where(t => t.CardId == request.CardId)
            .OrderByDescending(t => t.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new TransactionDto(
                t.Id,
                t.Amount,
                t.BalanceAfter,
                t.Type.ToString(),
                t.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<TransactionDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}