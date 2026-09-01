namespace SmartTransit.Application.Features.Users.DTOs;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsEmailConfirmed { get; set; }
}