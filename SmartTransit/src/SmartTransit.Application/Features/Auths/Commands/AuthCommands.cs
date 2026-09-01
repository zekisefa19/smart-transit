using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Auth.Dtos;
using SmartTransit.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace SmartTransit.Application.Features.Auths.Commands;

// 1. LOGIN COMMAND
public record LoginCommand(string Email, string Password) : IRequest<AuthResultDto>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (user == null)
            throw new Exception("E-posta veya şifre hatalı.");

        var inputHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(request.Password)));
        if (user.PasswordHash != inputHash)
            throw new Exception("E-posta veya şifre hatalı.");

        // 🛑 E-Posta Onay Kontrolü
        if (!user.IsEmailConfirmed)
            throw new Exception("Lütfen önce e-posta adresinize gönderilen doğrulama kodu ile hesabınızı onaylayın.");

        var refreshTokenString = _tokenService.GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(user);

        return new AuthResultDto(
            accessToken,
            refreshTokenString,
            DateTime.UtcNow.AddHours(1),
            user.Id,
            user.Email,
            user.Role.ToString()
        );
    }
}

// 2. REFRESH TOKEN COMMAND
public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResultDto>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResultDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow, cancellationToken);

        if (tokenEntity == null || tokenEntity.User == null)
            throw new Exception("Geçersiz veya süresi dolmuş Refresh Token.");

        tokenEntity.IsRevoked = true;

        var newRefreshTokenString = _tokenService.GenerateRefreshToken();
        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = tokenEntity.UserId,
            Token = newRefreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(tokenEntity.User);

        return new AuthResultDto(
            accessToken,
            newRefreshTokenString,
            DateTime.UtcNow.AddHours(1),
            tokenEntity.User.Id,
            tokenEntity.User.Email,
            tokenEntity.User.Role.ToString()
        );
    }
}

// 3. LOGOUT COMMAND
public record LogoutCommand(string RefreshToken) : IRequest<bool>;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public LogoutCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && !rt.IsRevoked, cancellationToken);

        if (tokenEntity == null) return false;

        tokenEntity.IsRevoked = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}