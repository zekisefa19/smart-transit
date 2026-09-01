using System.Security.Cryptography;
using System.Text; // 👈 System.Text eklendi
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Domain.Entities;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Auths.Commands;

public record RegisterCommand(string Email, string Password, string ConfirmPassword, string FullName) : IRequest<bool>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(IApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<bool> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
            throw new Exception("Girilen şifreler birbiriyle eşleşmiyor.");

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (existingUser != null && existingUser.IsEmailConfirmed)
            throw new Exception("Bu e-posta adresi zaten kayıtlı ve doğrulanmış.");

        string verificationCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        // 🔑 LoginCommand ile tam uyumlu SHA256 Hash yapısı:
        string passwordHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(request.Password)));

        if (existingUser == null)
        {
            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                Role = UserRole.Passenger,
                IsEmailConfirmed = false,
                EmailConfirmationCode = verificationCode,
                CodeExpiry = DateTime.UtcNow.AddMinutes(10)
            };

            await _context.Users.AddAsync(newUser, cancellationToken);
        }
        else
        {
            existingUser.FullName = request.FullName;
            existingUser.PasswordHash = passwordHash;
            existingUser.EmailConfirmationCode = verificationCode;
            existingUser.CodeExpiry = DateTime.UtcNow.AddMinutes(10);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await _emailService.SendVerificationCodeAsync(request.Email.ToLower().Trim(), verificationCode);

        return true;
    }
}