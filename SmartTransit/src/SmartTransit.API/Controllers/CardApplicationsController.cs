using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Cards.Commands;
using SmartTransit.Application.Features.Cards.Queries;
using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartTransit.API.Controllers;

// ========================================================
// 1. YOLCU (PASSENGER) BAŞVURU ENDPOINT'LERİ
// ========================================================
[ApiController]
[Route("api/passenger/card-applications")]
[Authorize(Roles = "Passenger,Operator,Admin")]
public class PassengerCardApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;

    public PassengerCardApplicationsController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    /// <summary>
    /// Yolcu yeni kart başvurusu oluşturur (FormData & Dosya Yükleme Destekli).
    /// POST: api/passenger/card-applications
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> ApplyForCard([FromForm] ApplyCardRequestDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        Guid.TryParse(userIdStr, out var userId);

        string? documentUrl = null;

        // Dosya yüklendiyse disk ortamına (wwwroot/uploads) kaydet
        if (dto.Document != null && dto.Document.Length > 0)
        {
            var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(rootPath, "uploads");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Benzersiz dosya adı oluşturma
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(dto.Document.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Document.CopyToAsync(stream);
            }

            // Veritabanına kaydedilecek bağıl adres
            documentUrl = $"/uploads/{uniqueFileName}";
        }

        // Form verileri ve dosya yolu Mediator Command'ine aktarılır
        var command = new ApplyForCardCommand(
            userId,
            dto.CardType,
            documentUrl,
            dto.IdentityNumber,
            dto.ApplicantName,
            dto.Email
        );

        var result = await _mediator.Send(command);
        return Ok(new { applicationId = result, message = "Başvurunuz başarıyla alınmıştır." });
    }
}

// DTO Yapısı: Ekrandaki Form Alanları & Dosya (IFormFile)
public record ApplyCardRequestDto(
    string CardType,
    IFormFile? Document,
    string? IdentityNumber,
    string? ApplicantName,
    string? Email
);

// ========================================================
// 2. OPERATÖR (OPERATOR/ADMIN) BAŞVURU ENDPOINT'LERİ
// ========================================================
[ApiController]
[Route("api/operator/card-applications")]
[Authorize(Roles = "Operator,Admin")]
public class CardApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CardApplicationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Bekleyen veya işlenen tüm kart başvurularını listeler.
    /// GET: api/operator/card-applications
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetApplications([FromQuery] string? status)
    {
        var query = new GetCardApplicationsQuery(status);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Operatör kart başvurusunu onaylar.
    /// POST: api/operator/card-applications/{id}/approve
    /// </summary>
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> ApproveApplication([FromRoute] Guid id, [FromBody] ApproveCardRequestDto dto)
    {
        var command = new ApproveCardApplicationCommand(id, dto.CardNumber);
        var result = await _mediator.Send(command);
        return Ok(new { success = result, message = "Başvuru başarıyla onaylandı." });
    }

    /// <summary>
    /// Operatör kart başvurusunu reddeder.
    /// POST: api/operator/card-applications/{id}/reject
    /// </summary>
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> RejectApplication([FromRoute] Guid id, [FromBody] RejectCardRequestDto dto)
    {
        var command = new RejectCardApplicationCommand(id, dto.Reason);
        var result = await _mediator.Send(command);
        return Ok(new { success = result, message = "Başvuru reddedildi." });
    }
}

public record ApproveCardRequestDto(string? CardNumber);
public record RejectCardRequestDto(string Reason);