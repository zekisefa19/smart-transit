using System.Text.Json.Serialization;
using MediatR;
using SmartTransit.Application.Features.Users.DTOs;

namespace SmartTransit.Application.Features.Users.Commands;

public class UpdateUserProfileCommand : IRequest<UserProfileDto>
{
    [JsonIgnore] // JSON body'den gelmesini engeller, controller JWT'den doldurur
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
}