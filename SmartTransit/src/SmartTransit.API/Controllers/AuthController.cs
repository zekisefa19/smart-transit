using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Auths.Commands;
using SmartTransit.Application.Features.Auth.Dtos; // 👈 Tüm Auth DTO'ları burada
using SmartTransit.Application.Features.Auths.Commands.EmailVerification;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Yolcu Kaydı (1. Aşama: Şifre Tekrarı + E-Posta Kod Gönderimi)
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        try
        {
            var result = await _mediator.Send(new RegisterCommand(dto.Email, dto.Password, dto.ConfirmPassword, dto.FullName));
            return Ok(new
            {
                Message = "Kayıt işlemi başarılı! Lütfen e-posta adresinize gönderilen 6 haneli doğrulama kodunu girin.",
                Email = dto.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// E-Posta Doğrulama Kodu Onayı (2. Aşama)
    /// </summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestDto dto)
    {
        try
        {
            await _mediator.Send(new VerifyEmailCommand(dto.Email, dto.Code));
            return Ok(new { Message = "E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Yeniden Doğrulama Kodu Gönder (Kod gelmediyse veya süresi dolduysa)
    /// </summary>
    [HttpPost("resend-code")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequestDto dto)
    {
        try
        {
            await _mediator.Send(new ResendCodeCommand(dto.Email));
            return Ok(new { Message = "Yeni doğrulama kodu e-posta adresinize gönderildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Giriş Yapma ve JWT Token Alma (Doğrulanmamış hesaplar giremez)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResultDto>> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            var result = await _mediator.Send(new LoginCommand(dto.Email, dto.Password));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Refresh Token ile Yeni Access Token Alma (Public)
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResultDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        try
        {
            var result = await _mediator.Send(new RefreshTokenCommand(dto.RefreshToken));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Refresh Token İptali / Oturumu Kapatma (Authenticated)
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto dto)
    {
        try
        {
            var result = await _mediator.Send(new LogoutCommand(dto.RefreshToken));
            if (!result) return BadRequest(new { Message = "Token bulunamadı veya geçersiz." });

            return Ok(new { Message = "Oturum başarıyla kapatıldı ve Refresh Token iptal edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}