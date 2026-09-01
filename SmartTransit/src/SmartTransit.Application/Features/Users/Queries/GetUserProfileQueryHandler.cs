using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Users.DTOs;

namespace SmartTransit.Application.Features.Users.Queries;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserProfileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException($"ID'si {request.UserId} olan kullanıcı bulunamadı.");
        }

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            IdentityNumber = user.IdentityNumber,
            BirthDate = user.BirthDate,
            Address = user.Address,
            Role = user.Role.ToString(),
            IsEmailConfirmed = user.IsEmailConfirmed
        };
    }
}