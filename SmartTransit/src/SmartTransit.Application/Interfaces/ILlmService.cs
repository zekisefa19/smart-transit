namespace SmartTransit.Application.Common.Interfaces;

/// <summary>
/// Yapay zeka (LLM) entegrasyonu ve analiz işlemlerini yöneten servis arayüzü.
/// </summary>
public interface ILlmService
{
    /// <summary>
    /// Sistem istatistiklerini analiz eder ve yöneticiye sunulacak Türkçe özet rapor üretir.
    /// </summary>
    /// <param name="stats">Günlük sistem geçiş ve bakiye verileri</param>
    /// <param name="cancellationToken">İptal jetonu</param>
    /// <returns>Profesyonel Türkçe yönetici özeti metni</returns>
    Task<string> GenerateExecutiveSummaryAsync(DailyStatsDto stats, CancellationToken cancellationToken = default);

    /// <summary>
    /// Turnike geçiş olayını risk kuralları ve LLM mantığı ile analiz ederek sınıflandırır.
    /// </summary>
    /// <param name="transaction">Şüpheli işlem detayları ve sistem gerekçesi</param>
    /// <param name="cancellationToken">İptal jetonu</param>
    /// <returns>Sınıflandırma kategorisi, Türkçe açıklama ve AI kaynağı bayrağı</returns>
    Task<SuspiciousAnalysisResultDto> AnalyzeSuspiciousTransactionAsync(
        SuspiciousTransactionDto transaction,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Günlük sistem istatistiklerini taşıyan veri modeli.
/// </summary>
public record DailyStatsDto(
    DateTime Date,
    decimal TotalTopUpAmount,
    int TotalTapCount,
    Dictionary<string, int> CardTypeBreakdown,
    List<RouteUsageDto> TopRoutes
);

/// <summary>
/// Hat bazlı kullanım istatistiği.
/// </summary>
public record RouteUsageDto(
    string RouteCode,
    string RouteName,
    int TapCount
);

/// <summary>
/// Şüpheli işlem analizi için LLM servisine iletilen işlem verisi.
/// </summary>
public record SuspiciousTransactionDto(
    Guid TransactionId,
    string CardNumber,
    string CardType,
    string RouteCode,
    decimal Amount,
    DateTime Timestamp,
    string SystemReason
);

/// <summary>
/// LLM analiz sonucu dönen kategorize edilmiş veri modeli.
/// </summary>
public record SuspiciousAnalysisResultDto(
    string Category, // "DeviceFault" | "Misuse" | "NormalDensity"
    string Reason,   // Türkçe açıklama
    bool IsAiGenerated = true
);