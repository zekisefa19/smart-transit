using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartTransit.Application.Features.Reports.Commands;
using SmartTransit.Application.Features.Reports.Dtos;
using SmartTransit.Application.Features.Reports.Queries;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Operator,Admin")] // 🔐 Operatör ve Admin yetkilendirmesi aktif edildi
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Günlük operasyonel özet raporunu veritabanından hesaplayarak getirir.
    /// GET /api/reports/daily
    /// </summary>
    [HttpGet("daily")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetDailyReportQuery(date), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Sistem tarafından tespit edilen şüpheli biniş ve yükleme hareketlerini sayfalamalı olarak listeler.
    /// GET /api/reports/suspicious
    /// </summary>
    [HttpGet("suspicious")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSuspiciousTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetSuspiciousTransactionsQuery(page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Günlük rapor verilerini Yapay Zeka (Ollama qwen2.5:3b) ile analiz edip metinsel özet oluşturur (Redis Cache destekli).
    /// POST /api/reports/daily/ai-summary
    /// </summary>
    [HttpPost("daily/ai-summary")]
    [EnableRateLimiting("ai-llm")] // 🛡️ Yapay Zeka servisi için eşzamanlı istek sınırlaması
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> GenerateDailyAiSummary(
        [FromBody] DailyAiSummaryRequestDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GenerateDailyAiSummaryCommand(dto.Date), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Şüpheli bir hareketi Yapay Zeka (Ollama qwen2.5:3b) ile analiz edip risk sınıflandırması yapar (Structured Output JSON).
    /// POST /api/reports/suspicious/ai-analyze
    /// </summary>
    [HttpPost("suspicious/ai-analyze")]
    [EnableRateLimiting("ai-llm")] // 🛡️ Yapay Zeka servisi için eşzamanlı istek sınırlaması
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> AnalyzeSuspiciousActivity(
        [FromBody] SuspiciousAnalyzeRequestDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AnalyzeSuspiciousActivityCommand(dto.TransactionId, dto.Details), cancellationToken);
        return Ok(result);
    }
}