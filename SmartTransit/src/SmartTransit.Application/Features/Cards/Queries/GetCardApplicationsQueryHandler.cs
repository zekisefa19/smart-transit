using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Cards.Queries;

public class GetCardApplicationsQueryHandler : IRequestHandler<GetCardApplicationsQuery, List<CardApplicationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCardApplicationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CardApplicationDto>> Handle(GetCardApplicationsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CardApplications
            .AsNoTracking()
            .AsQueryable();

        // 1. Status filtresini harf büyüklüğüne duyarsız yapalım ("Pending", "pending", "PENDING" hepsi eşleşir)
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var statusLower = request.Status.ToLower();
            query = query.Where(a => a.Status.ToLower() == statusLower);
        }

        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        // 2. DTO Dönüşümü
        return list.Select(a => new CardApplicationDto(
            a.Id,
            a.UserId,
            a.CardType,
            a.DocumentUrl,
            a.Status,
            a.RejectionReason,
            a.CreatedAt,
            a.ProcessedAt,
            a.ApplicantName,
            a.IdentityNumber,
            a.Email
        )).ToList();
    }
}