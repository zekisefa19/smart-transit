using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTransit.Application.Features.Operator.DTOs;
using SmartTransit.Application.Features.Operator.Queries;
using SmartTransit.Application.Features.Operator.Commands;
using System;
using System.Threading.Tasks;

// Not: Namespace yapısını kendi projenize göre düzenleyebilirsiniz.
namespace SmartTransit.API.Controllers;

[ApiController]
[Route("api/admin/operators")]
[Authorize(Roles = "Admin")]
public class AdminOperatorsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminOperatorsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tüm operatörleri listeler.
    /// GET: api/admin/operators
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetOperators()
    {
        // MediatR Query çağrınız (Query ismini projenizdeki CQRS yapısına göre güncelleyin)
        var result = await _mediator.Send(new GetOperatorsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Yeni operatör ekler.
    /// POST: api/admin/operators
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOperator([FromBody] CreateOperatorCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Operatör bilgilerini günceller.
    /// PUT: api/admin/operators/{id}
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateOperator([FromRoute] Guid id, [FromBody] UpdateOperatorCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Operatörü siler veya yetkisini kaldırır.
    /// DELETE: api/admin/operators/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOperator([FromRoute] Guid id)
    {
        var success = await _mediator.Send(new DeleteOperatorCommand(id));
        if (!success)
            return NotFound(new { Message = "Operatör bulunamadı." });

        return NoContent();
    }
}