using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Cards.Queries;

// 1. Dışarıya Dönülecek Veri Modelleri (DTOs)
public record TransactionDto(
    Guid Id,
    decimal Amount,
    decimal BalanceAfter,
    string Type,
    DateTime CreatedAt
);

public record CardDetailsDto(
    Guid Id,
    string CardNumber,
    string Type,
    string Status,
    decimal Balance,
    List<TransactionDto> RecentTransactions
);

// 2. İstek (Query) Modeli
public record GetCardDetailsQuery(Guid Id) : IRequest<CardDetailsDto?>;

// 3. İşleyici (Handler) Mantığı
public class GetCardDetailsQueryHandler : IRequestHandler<GetCardDetailsQuery, CardDetailsDto?>
{
    private readonly IApplicationDbContext _context;

    public GetCardDetailsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CardDetailsDto?> Handle(GetCardDetailsQuery request, CancellationToken cancellationToken)
    {
        // 1. Kart bilgisini al
        var card = await _context.Cards
            .AsNoTracking() // Sadece okuma yapacağımız için performansı artırır
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (card == null)
            return null; // Kart bulunamadıysa null döneriz

        // 2. Bu karta ait son 10 işlemi (bakiye yükleme, geçiş vb.) tarihe göre tersten al
        var transactions = await _context.Transactions
            .AsNoTracking()
            .Where(t => t.CardId == request.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => new TransactionDto(
                t.Id,
                t.Amount,
                t.BalanceAfter,
                t.Type.ToString(),
                t.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        // 3. DTO'yu oluştur ve dön
        return new CardDetailsDto(
            card.Id,
            card.CardNumber,
            card.Type.ToString(),
            card.Status.ToString(),
            card.Balance,
            transactions
        );
    }
}