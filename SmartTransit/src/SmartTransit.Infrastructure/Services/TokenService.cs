using Microsoft.Extensions.Configuration;

using Microsoft.IdentityModel.Tokens;

using SmartTransit.Application.Common.Interfaces;

using SmartTransit.Domain.Entities;

using System.IdentityModel.Tokens.Jwt;

using System.Security.Claims;

using System.Security.Cryptography;

using System.Text;



namespace SmartTransit.Infrastructure.Services;



public class TokenService : ITokenService

{

    private readonly IConfiguration _configuration;



    public TokenService(IConfiguration configuration)

    {

        _configuration = configuration;

    }



    public string GenerateAccessToken(User user)

    {

        var jwtSettings = _configuration.GetSection("JwtSettings");

        var secretKey = jwtSettings["Secret"] ?? "SmartTransitSuperSecretKey2026SecurityKeyMinimum32Chars!";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));



        var claims = new List<Claim>

{

new(ClaimTypes.NameIdentifier, user.Id.ToString()),

new(ClaimTypes.Email, user.Email),

new(ClaimTypes.Role, user.Role.ToString())

};



        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(

        issuer: jwtSettings["Issuer"] ?? "SmartTransitAPI",

        audience: jwtSettings["Audience"] ?? "SmartTransitApp",

        claims: claims,

        expires: DateTime.UtcNow.AddHours(1),

        signingCredentials: creds

        );



        return new JwtSecurityTokenHandler().WriteToken(token);

    }



    public string GenerateRefreshToken()

    {

        var randomNumber = new byte[64];

        using var rng = RandomNumberGenerator.Create();

        rng.GetBytes(randomNumber);

        return Convert.ToBase64String(randomNumber);

    }

}