using MediatR;

namespace SmartTransit.Application.Features.Reports.Commands;

public record ResolveSuspiciousActivityCommand(
    Guid Id,
    string? Note
) : IRequest<bool>;

public record DismissSuspiciousActivityCommand(
    Guid Id
) : IRequest<bool>;