// Entities/Vehicle.cs
namespace SmartTransit.Domain.Entities;

public class Vehicle : BaseEntity
{
    public string PlateNumber { get; set; } = string.Empty;
    public Guid RouteId { get; set; }
    public Route Route { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}