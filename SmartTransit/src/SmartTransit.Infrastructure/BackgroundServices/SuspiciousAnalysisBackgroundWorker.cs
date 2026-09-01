using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Infrastructure.BackgroundServices;

public class SuspiciousAnalysisBackgroundWorker : BackgroundService
{
    private readonly ISuspiciousTransactionQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SuspiciousAnalysisBackgroundWorker> _logger;

    public SuspiciousAnalysisBackgroundWorker(
        ISuspiciousTransactionQueue queue,
        IServiceProvider serviceProvider,
        ILogger<SuspiciousAnalysisBackgroundWorker> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 Şüpheli İşlem Arka Plan Analiz Servisi (Background Worker) başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Kuyruktan sıradaki işlemi bekle ve çek
                var transaction = await _queue.DequeueTransactionAsync(stoppingToken);

                _logger.LogInformation("📥 Kuyruktan işlem çekildi. ID: {TransactionId}, Tutar: {Amount} TL",
                    transaction.TransactionId, transaction.Amount);

                // Scoped servis olan ILlmService'i çözümle (BackgroundService Singleton'dır)
                using var scope = _serviceProvider.CreateScope();
                var llmService = scope.ServiceProvider.GetRequiredService<ILlmService>();

                // LLM Analizini Çalıştır
                var result = await llmService.AnalyzeSuspiciousTransactionAsync(transaction, stoppingToken);

                // Sonucu Logla (İleride DB / Notification servisi buraya bağlanacak)
                _logger.LogInformation("✅ [AI Analiz Tamamlandı] ID: {TransactionId} | Kategori: {Category} | Nedeni: {Reason}",
                    transaction.TransactionId, result.Category, result.Reason);

                if (result.Category == "Misuse")
                {
                    _logger.LogWarning("🚨 YÜKSEK RİSK: Kart engelleme uyarısı fırlatıldı! Kart No: {CardNumber}", transaction.CardNumber);
                }
            }
            catch (OperationCanceledException)
            {
                // Uygulama kapatılırken fırlatılan normal iptal istisnası
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Kuyruktaki işlem analiz edilirken beklenmeyen bir hata oluştu.");
            }
        }

        _logger.LogInformation("🛑 Şüpheli İşlem Arka Plan Analiz Servisi durduruldu.");
    }
}