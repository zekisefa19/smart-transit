using MediatR;

namespace SmartTransit.Application.Features.Cards.Queries;

public record CardApplicationDto(
    Guid Id,
    Guid UserId,
    string CardType,
    string? DocumentUrl,
    string Status,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime? ProcessedAt,
    string? ApplicantName = null,
    string? IdentityNumber = null,
    string? Email = null
);

public record GetCardApplicationsQuery(string? Status = null) : IRequest<List<CardApplicationDto>>;