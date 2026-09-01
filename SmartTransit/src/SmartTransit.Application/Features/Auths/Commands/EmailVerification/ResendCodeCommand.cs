using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Auths.Commands.EmailVerification;

public record ResendCodeCommand(string Email) : IRequest<bool>;

public class ResendCodeCommandHandler : IRequestHandler<ResendCodeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public ResendCodeCommandHandler(IApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<bool> Handle(ResendCodeCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        if (user.IsEmailConfirmed)
            throw new Exception("E-posta adresiniz zaten onaylı.");

        string newCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        user.EmailConfirmationCode = newCode;
        user.CodeExpiry = DateTime.UtcNow.AddMinutes(10);

        await _context.SaveChangesAsync(cancellationToken);
        await _emailService.SendVerificationCodeAsync(user.Email, newCode);

        return true;
    }
}