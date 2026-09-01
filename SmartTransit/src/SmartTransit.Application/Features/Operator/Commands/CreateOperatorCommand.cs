using MediatR;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace SmartTransit.Application.Features.Operator.Commands;

public record CreateOperatorCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role
) : IRequest<Guid>;

public class CreateOperatorCommandHandler : IRequestHandler<CreateOperatorCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateOperatorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateOperatorCommand request, CancellationToken cancellationToken)
    {
        Enum.TryParse<UserRole>(request.Role, true, out var parsedRole);

        // LoginCommandHandler ile birebir aynı SHA256 şifrelemesi
        var passwordHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(request.Password)));

        var operatorUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = $"{request.FirstName} {request.LastName}".Trim(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = passwordHash,
            Role = parsedRole,
            IsEmailConfirmed = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(operatorUser);
        await _context.SaveChangesAsync(cancellationToken);

        return operatorUser.Id;
    }
}