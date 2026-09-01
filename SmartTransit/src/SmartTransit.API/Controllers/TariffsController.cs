using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Tariffs.Commands;
using SmartTransit.Application.Features.Tariffs.Dtos;
using SmartTransit.Application.Features.Tariffs.Queries;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api")]
public class TariffsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TariffsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Güncel tarifeleri ve aktarma indirimlerini listeler (Giriş yapmış tüm kullanıcılar - Cached).
    /// </summary>
    [HttpGet("tariffs")]
    [Authorize]
    public async Task<ActionResult<List<TariffDto>>> GetTariffs()
    {
        var result = await _mediator.Send(new GetTariffsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Kart türüne özel yeni tarife tanımlar (Sadece Admin yetkisi gerektirir ve önbelleği temizler).
    /// </summary>
    [HttpPost("admin/tariffs")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> CreateTariff([FromBody] CreateTariffCommand command)
    {
        var tariffId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTariffs), new { id = tariffId }, tariffId);
    }

    /// <summary>
    /// Var olan bir kart tarifesini günceller (Sadece Admin yetkisi gerektirir ve önbelleği temizler).
    /// </summary>
    [HttpPut("admin/tariffs")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTariff([FromBody] UpdateTariffDto dto)
    {
        var success = await _mediator.Send(new UpdateTariffCommand(dto));
        if (!success) return NotFound("Güncellenmek istenen tarife bulunamadı.");
        return Ok(new { message = "Tarife başarıyla güncellendi." });
    }

    /// <summary>
    /// Tüm aktif ve muaf olmayan tarifelere toplu yüzde zam uygular (Sadece Admin yetkisi gerektirir).
    /// </summary>
    [HttpPost("admin/tariffs/bulk-hike")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApplyBulkHike([FromBody] BulkHikeDto dto)
    {
        var success = await _mediator.Send(new ApplyBulkHikeCommand(dto.Percentage));
        if (!success) return BadRequest("Geçersiz zam oranı veya güncellenecek tarife bulunamadı.");
        return Ok(new { message = $"Tüm tarifelere %{dto.Percentage} zam başarıyla uygulandı." });
    }
}