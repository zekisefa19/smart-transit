using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Exceptions;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Cards.Commands;

// 1. Command'e IdempotencyKey eklendi
public record TopUpBalanceCommand(
    Guid CardId,
    decimal Amount,
    string IdempotencyKey
) : IRequest<TopUpBalanceResponseDto>;

public record TopUpBalanceResponseDto(
    decimal NewBalance,
    Guid TransactionId,
    bool IsDuplicateRequest
);

public class TopUpBalanceCommandHandler : IRequestHandler<TopUpBalanceCommand, TopUpBalanceResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public TopUpBalanceCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<TopUpBalanceResponseDto> Handle(TopUpBalanceCommand request, CancellationToken cancellationToken)
    {
        // 🛑 KURAL 1: Tutar Doğrulaması
        if (request.Amount <= 0)
            throw new BusinessException("Yüklenecek tutar 0'dan büyük olmalıdır.");

        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            throw new BusinessException("İşlem için geçerli bir IdempotencyKey sunulmalıdır.");

        // 🛑 KURAL 2: Idempotency Kontrolü (Redis Check)
        var cacheKey = $"idempotency:topup:{request.IdempotencyKey}";
        var existingResponse = await _cacheService.GetAsync<TopUpBalanceResponseDto>(cacheKey);

        if (existingResponse != null)
        {
            // Bu işlem daha önce tamamlanmış! Para tekrar düşülmeden önceki yanıt aynen dönülüyor.
            return existingResponse with { IsDuplicateRequest = true };
        }

        // 🛑 KURAL 3: Kartın Varlık ve Durum Kontrolü
        var card = await _context.Cards
            .FirstOrDefaultAsync(c => c.Id == request.CardId, cancellationToken);

        if (card == null)
            throw new NotFoundException("Kart", request.CardId);

        if (card.Status != CardStatus.Active)
            throw new BusinessException("Pasif veya engellenmiş bir karta bakiye yüklenemez.");

        // 🛑 KURAL 4: Bakiye Güncelleme & Transaction Kaydı
        card.Balance += request.Amount;
        card.RowVersion = Guid.NewGuid().ToByteArray(); // Concurrency Lock

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            CardId = card.Id,
            Amount = request.Amount,
            BalanceAfter = card.Balance,
            Type = TransactionType.TopUp,
            CreatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new TopUpBalanceResponseDto(
            NewBalance: card.Balance,
            TransactionId: transaction.Id,
            IsDuplicateRequest: false
        );

        // 🛑 KURAL 5: Redis Cache Invalidation & Idempotency Key Kaydı
        // A) Kartın önbellekteki eski bakiyesini temizle ki turnikeler güncel bakiyeyi okusun
        await _cacheService.RemoveAsync($"card:{card.Id}");

        // B) Bu IdempotencyKey'i 24 saatliğine Redis'e kaydet
        await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromHours(24));

        return response;
    }
}