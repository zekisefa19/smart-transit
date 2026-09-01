using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Transit.Commands;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardingController : ControllerBase
{
    private readonly IMediator _mediator;
    private const string ExpectedApiKey = "VALIDATOR-SECRET-KEY-12345"; // Gerçek senaryoda appsettings.json'dan okunur

    public BoardingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Validatör simülatörü üzerinden kart okutarak geçiş yapar.
    /// Header'da 'X-Device-Api-Key' gerektirir.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentResultDto>> ProcessBoarding(
        [FromHeader(Name = "X-Device-Api-Key")] string apiKey,
        [FromBody] ProcessPaymentCommand command)
    {
        // Device API Key Kontrolü (PDF Yetki Gereksinimi)
        if (string.IsNullOrEmpty(apiKey) || apiKey != ExpectedApiKey)
        {
            return StatusCode(403, new { Message = "Geçersiz veya eksik Device API Key." });
        }

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}