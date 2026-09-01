using MediatR;

namespace SmartTransit.Application.Features.Cards.Commands;

/*public record ApplyForCardCommand(
    Guid UserId,
    string CardType,
    string? DocumentUrl
) : IRequest<Guid>;*/

public record ApproveCardApplicationCommand(
    Guid ApplicationId,
    string? CardNumber
) : IRequest<bool>;

public record RejectCardApplicationCommand(
    Guid ApplicationId,
    string Reason
) : IRequest<bool>;