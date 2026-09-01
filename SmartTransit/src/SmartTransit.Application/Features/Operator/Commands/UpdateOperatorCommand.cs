using MediatR;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace SmartTransit.Application.Features.Operator.Commands;

public class UpdateOperatorCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string Role { get; set; } = "OPERATOR";
}

public class UpdateOperatorCommandHandler : IRequestHandler<UpdateOperatorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateOperatorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateOperatorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);
        if (user == null) return false;

        Enum.TryParse<UserRole>(request.Role, true, out var parsedRole);

        user.FullName = $"{request.FirstName} {request.LastName}".Trim();
        user.Email = request.Email.ToLower().Trim();
        user.Role = parsedRole;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(request.Password)));
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}