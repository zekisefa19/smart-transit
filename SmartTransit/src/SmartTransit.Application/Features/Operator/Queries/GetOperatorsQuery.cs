using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Features.Operator.DTOs;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Operator.Queries;

public record GetOperatorsQuery() : IRequest<List<AdminOperatorDto>>;

public class GetOperatorsQueryHandler : IRequestHandler<GetOperatorsQuery, List<AdminOperatorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOperatorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminOperatorDto>> Handle(GetOperatorsQuery request, CancellationToken cancellationToken)
    {
        // Sadece OPERATOR rolündeki kullanıcılar çekilir (Admin'ler listede gözükmez)
        return await _context.Users
            .Where(u => u.Role == UserRole.Operator) // 👈 Admin şartı kaldırıldı
            .Select(u => new AdminOperatorDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = true
            })
            .ToListAsync(cancellationToken);
    }
}