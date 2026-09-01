using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Users.Commands;
using SmartTransit.Application.Features.Users.Queries;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Giriş yapmış olan kullanıcının profil bilgilerini getirir.
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserIdFromToken();
        var query = new GetUserProfileQuery(userId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Giriş yapmış olan kullanıcının profil bilgilerini günceller.
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        // Güvenlik: Kullanıcının başkasının ID'sini göndererek profili değiştirmesini engellemek için
        // UserId değeri doğrudan JWT Token'dan okunarak komuta atanır.
        command.UserId = GetUserIdFromToken();

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// JWT Access Token içerisindeki NameIdentifier (Sub) claim'inden kullanıcı ID'sini okur.
    /// </summary>
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Geçersiz veya bulunamayan kullanıcı kimliği.");
        }

        return userId;
    }
}