using MediatR;
using SmartTransit.Application.Features.Users.DTOs;

namespace SmartTransit.Application.Features.Users.Queries;

public class GetUserProfileQuery : IRequest<UserProfileDto>
{
    public Guid UserId { get; set; }

    public GetUserProfileQuery(Guid userId)
    {
        UserId = userId;
    }

    public GetUserProfileQuery()
    {
    }
}