using Microsoft.Extensions.Diagnostics.HealthChecks;
using SmartTransit.Infrastructure.Persistence;

namespace SmartTransit.Infrastructure.HealthChecks;

public class PostgresHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;

    public PostgresHealthCheck(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Veritabanı bağlantısını sınar
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);

            return canConnect
                ? HealthCheckResult.Healthy("PostgreSQL veritabanı bağlantısı sağlıklı.")
                : HealthCheckResult.Unhealthy("PostgreSQL veritabanına bağlanılamadı.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("PostgreSQL veritabanı bağlantı hatası oluştu.", ex);
        }
    }
}