using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Operator.Queries;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // İsteğe göre yetkilendirme [Authorize(Roles = "Operator,Admin")] yapılabilir
public class OperatorController : ControllerBase
{
    private readonly IMediator _mediator;

    public OperatorController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardData()
    {
        var result = await _mediator.Send(new GetOperatorDashboardQuery());
        return Ok(result);
    }
}