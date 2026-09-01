// Entities/DeviceLog.cs
namespace SmartTransit.Domain.Entities;

public class DeviceLog : BaseEntity
{
    public string DeviceId { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string RequestPayload { get; set; } = string.Empty;
    public int ResponseStatus { get; set; }
}