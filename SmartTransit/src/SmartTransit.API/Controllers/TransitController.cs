using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Transit.Commands;

namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransitController : ControllerBase
{
    private readonly IMediator _mediator;

    public TransitController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Validatör (cihaz) üzerinden kart okutulduğunda ödeme alır.
    /// </summary>
    [HttpPost("tap-and-pay")]
    public async Task<ActionResult<PaymentResultDto>> TapAndPay([FromBody] ProcessPaymentCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(result); // Yetersiz bakiye veya hatalı kart durumunda HTTP 400 döner

        return Ok(result); // Geçiş başarılıysa HTTP 200 döner
    }
}