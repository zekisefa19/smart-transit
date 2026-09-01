using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SmartTransit.API.Models;

public static class HealthCheckResponseWriter
{
    public static Task WriteResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            totalDuration = $"{report.TotalDuration.TotalMilliseconds:N2} ms",
            entries = report.Entries.Select(e => new
            {
                component = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description ?? e.Value.Exception?.Message,
                duration = $"{e.Value.Duration.TotalMilliseconds:N2} ms"
            })
        };

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true })
        );
    }
}