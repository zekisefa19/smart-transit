using SmartTransit.Domain.Entities;

namespace SmartTransit.Application.Common.Interfaces;

public interface ITokenService
{
    /// <summary>
    /// Kullanıcı bilgileri ve Rolü (Passenger, Operator, Admin) üzerinden JWT Access Token üretir.
    /// </summary>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Güvenli, rastgele (Cryptographic) bir Refresh Token metni üretir.
    /// </summary>
    string GenerateRefreshToken();
}