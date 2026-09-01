namespace SmartTransit.Application.Features.Operator.DTOs;

public class AdminOperatorDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "OPERATOR";
    public string? AssignedTask { get; set; }
    public bool IsActive { get; set; } = true;
}