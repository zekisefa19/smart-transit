using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartTransit.Application.Features.Cards.Commands;
using SmartTransit.Application.Features.Cards.Queries;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Yolcunun kendi kartlarını getirir.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Passenger,Operator,Admin")]
    public async Task<IActionResult> GetUserCards([FromQuery] Guid? ownerId)
    {
        var currentUserId = ownerId ?? Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetUserCardsQuery(currentUserId));
        return Ok(result);
    }

    /// <summary>
    /// Yeni bir ulaşım kartı tanımlar (Doğrudan kart oluşturma - Admin).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> CreateCard([FromBody] CreateCardCommand command)
    {
        var cardId = await _mediator.Send(command);
        return Ok(cardId);
    }

    /// <summary>
    /// Kartı bloke eder.
    /// </summary>
    [HttpPut("{id:guid}/block")]
    [Authorize(Roles = "Passenger,Operator,Admin")]
    public async Task<IActionResult> BlockCard(Guid id, [FromBody] BlockCardRequestDto request)
    {
        var command = new BlockCardCommand(id, request.Reason, request.AnomalyId);
        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { Message = "Kart bulunamadı." });

        return Ok(new { Message = "Kart başarıyla bloke edildi." });
    }

    /// <summary>
    /// Kart blokesini kaldırır.
    /// </summary>
    [HttpPut("{id:guid}/unblock")]
    [Authorize(Roles = "Operator,Admin")]
    public async Task<IActionResult> UnblockCard(Guid id)
    {
        var success = await _mediator.Send(new UnblockCardCommand(id));
        if (!success) return NotFound(new { Message = "Kart tekrar aktif hale getirildi." });
        return Ok(new { Message = "Kart aktif edildi." });
    }

    /// <summary>
    /// Karta bakiye yükler.
    /// </summary>
    [HttpPost("{id:guid}/topup")]
    [Authorize(Roles = "Passenger,Admin")]
    [EnableRateLimiting("topup")]
    public async Task<IActionResult> TopUpBalance(
        Guid id,
        [FromHeader(Name = "Idempotency-Key")] string idempotencyKey,
        [FromBody] TopUpRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey))
            return BadRequest(new { Message = "'Idempotency-Key' header değeri zorunludur." });

        var command = new TopUpBalanceCommand(id, request.Amount, idempotencyKey);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Karta abonman paketi yükler.
    /// </summary>
    [HttpPost("{id:guid}/subscription")]
    [Authorize(Roles = "Passenger,Admin")]
    public async Task<IActionResult> PurchaseSubscription(Guid id)
    {
        var result = await _mediator.Send(new PurchaseSubscriptionCommand(id));
        return Ok(new { Message = "Abonman yüklemesi başarıyla gerçekleşti.", Success = result });
    }

    /// <summary>
    /// Turnike/Araç geçiş işlemi.
    /// </summary>
    [HttpPost("{id:guid}/tap")]
    [Authorize(Roles = "Passenger,Operator,Admin")]
    [EnableRateLimiting("turnstile")]
    public async Task<IActionResult> TapCard(Guid id, [FromBody] TapCardRequest request)
    {
        var message = await _mediator.Send(new TapCardCommand(id, request.RouteId));
        return Ok(new { Message = message });
    }

    /// <summary>
    /// Kart işlem geçmişini getirir.
    /// </summary>
    [HttpGet("{id:guid}/transactions")]
    [Authorize(Roles = "Passenger,Operator,Admin")]
    public async Task<IActionResult> GetCardTransactions(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetCardTransactionsQuery(id, pageNumber, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}

public record TapCardRequest(Guid RouteId);
public record TopUpRequestDto(decimal Amount);
public record BlockCardRequestDto(string Reason, Guid? AnomalyId);