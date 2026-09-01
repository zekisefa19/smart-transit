using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Cards.Commands;

// Command (İstek)
public record CreateCardCommand(
    string CardNumber,
    CardType CardType,
    Guid OwnerId
) : IRequest<Guid>;

// Handler (İşleyici)
public class CreateCardCommandHandler : IRequestHandler<CreateCardCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCardCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCardCommand request, CancellationToken cancellationToken)
    {
        // 1. Aynı kart numarası var mı kontrol et
        var exists = await _context.Cards
            .AnyAsync(c => c.CardNumber == request.CardNumber, cancellationToken);

        if (exists)
            throw new Exception("Bu kart numarası zaten sistemde kayıtlı.");

        // 2. Yeni kart nesnesi oluştur (RowVersion alanını dolduruyoruz)
        var card = new Card
        {
            Id = Guid.NewGuid(),
            CardNumber = request.CardNumber,
            Type = request.CardType,
            Status = CardStatus.Active,
            OwnerId = request.OwnerId,
            Balance = 0.00m,
            RowVersion = Guid.NewGuid().ToByteArray(), // EF Core artık bunu SQL INSERT sorgusuna dahil edecek!
            CreatedAt = DateTime.UtcNow
        };

        // 3. Veritabanına kaydet
        _context.Cards.Add(card);
        await _context.SaveChangesAsync(cancellationToken);

        return card.Id;
    }
}