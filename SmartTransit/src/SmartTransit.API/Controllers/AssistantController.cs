using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Assistant.Commands;
using SmartTransit.Application.Features.Assistant.DTOs;
using SmartTransit.Application.Features.Assistant.Queries;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/assistant")]
[Authorize(Roles = "Operator,Admin")]
public class AssistantController : ControllerBase
{
    private readonly IMediator _mediator;

    public AssistantController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Akıllı Asistan özet metriklerini ve canlı anomali bildirimlerini getirir.
    /// GET /api/assistant/dashboard
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<AssistantDashboardDto>> GetDashboardData()
    {
        var result = await _mediator.Send(new GetAssistantDashboardQuery());
        return Ok(result);
    }

    /// <summary>
    /// Filo, hat ve sistem durumu hakkında soruları yanıtlayan AI Chatbot Endpoint'i.
    /// POST /api/assistant/chat
    /// </summary>
    [HttpPost("chat")]
    public async Task<ActionResult<AskAssistantResponseDto>> AskAssistant([FromBody] AskAssistantRequestDto dto)
    {
        var result = await _mediator.Send(new AskAssistantCommand(dto.Prompt));
        return Ok(result);
    }
}