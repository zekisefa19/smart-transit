namespace SmartTransit.Application.Features.Auth.Dtos;

// 1. AUTH RESULT DTO
public record AuthResultDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    Guid UserId,
    string Email,
    string Role
);

// 2. REGISTER DTO (ConfirmPassword Dahil)
public record RegisterRequestDto(
    string Email,
    string Password,
    string ConfirmPassword,
    string FullName
);

// 3. E-POSTA DOĞRULAMA DTO
public record VerifyEmailRequestDto(
    string Email,
    string Code
);

// 4. KODU YENİDEN GÖNDER DTO
public record ResendCodeRequestDto(
    string Email
);

// 5. LOGIN DTO
public record LoginRequestDto(
    string Email,
    string Password
);

// 6. REFRESH TOKEN DTO
public record RefreshTokenRequestDto(
    string RefreshToken
);

// 7. LOGOUT DTO
public record LogoutRequestDto(
    string RefreshToken
);