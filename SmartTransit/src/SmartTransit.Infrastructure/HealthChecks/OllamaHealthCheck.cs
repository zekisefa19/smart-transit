using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SmartTransit.Infrastructure.HealthChecks;

public class OllamaHealthCheck : IHealthCheck
{
    private readonly HttpClient _httpClient;
    private readonly string _ollamaEndpoint;

    public OllamaHealthCheck(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _ollamaEndpoint = configuration["LlmSettings:OllamaEndpoint"] ?? "http://localhost:11434";
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Ollama'nın /api/tags endpoint'i yüklü modelleri listeler ve hızlı yanıt verir
            var response = await _httpClient.GetAsync($"{_ollamaEndpoint}/api/tags", cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return HealthCheckResult.Healthy("Ollama servisi aktif ve yanıt veriyor.");
            }

            return HealthCheckResult.Degraded($"Ollama servisi beklenmeyen bir durum kodu döndürdü: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Ollama servisine erişilemiyor.", ex);
        }
    }
}