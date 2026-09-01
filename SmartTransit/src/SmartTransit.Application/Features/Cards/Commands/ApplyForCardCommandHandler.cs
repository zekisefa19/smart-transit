using MediatR;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartTransit.Application.Features.Cards.Commands;

// 1. KOMUT TANIMI (Controller'dan gelen 6 parametreyi sırasıyla karşılar)
public record ApplyForCardCommand(
    Guid UserId,
    string CardType,
    string? DocumentUrl = null,
    string? IdentityNumber = null,
    string? ApplicantName = null,
    string? Email = null
) : IRequest<Guid>;

// 2. HANDLER TANIMI
public class ApplyForCardCommandHandler : IRequestHandler<ApplyForCardCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public ApplyForCardCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(ApplyForCardCommand request, CancellationToken cancellationToken)
    {
        var application = new CardApplication
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            CardType = request.CardType,
            DocumentUrl = request.DocumentUrl,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,



            ApplicantName = request.ApplicantName,
            IdentityNumber = request.IdentityNumber,
            Email = request.Email
        };

        _context.CardApplications.Add(application);
        await _context.SaveChangesAsync(cancellationToken);

        return application.Id;
    }
}