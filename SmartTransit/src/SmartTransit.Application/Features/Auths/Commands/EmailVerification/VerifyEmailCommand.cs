using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Auths.Commands.EmailVerification;

public record VerifyEmailCommand(string Email, string Code) : IRequest<bool>;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public VerifyEmailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        if (user.IsEmailConfirmed)
            throw new Exception("E-posta adresi zaten doğrulanmış. Giriş yapabilirsiniz.");

        if (user.EmailConfirmationCode != request.Code)
            throw new Exception("Girdiğiniz doğrulama kodu hatalı.");

        if (user.CodeExpiry == null || user.CodeExpiry < DateTime.UtcNow)
            throw new Exception("Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.");

        user.IsEmailConfirmed = true;
        user.EmailConfirmationCode = null;
        user.CodeExpiry = null;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}