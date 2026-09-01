using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Infrastructure.Services;

public class OllamaLlmService : ILlmService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaLlmService> _logger;
    private readonly string _modelName;

    public OllamaLlmService(HttpClient httpClient, IConfiguration configuration, ILogger<OllamaLlmService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _modelName = configuration["LlmSettings:Model"] ?? "qwen2.5:3b";

        var endpoint = configuration["LlmSettings:OllamaEndpoint"] ?? "http://localhost:11434";
        _httpClient.BaseAddress = new Uri(endpoint);
    }

    /// <summary>
    /// 1. GÜNLÜK YÖNETİCİ ÖZETİ
    /// </summary>
    public async Task<string> GenerateExecutiveSummaryAsync(DailyStatsDto stats, CancellationToken cancellationToken = default)
    {
        try
        {
            var prompt = $@"
Sen bir Akıllı Ulaşım Sistemleri Veri Analistisin. 
Aşağıdaki günlük sistem istatistiklerini inceleyerek üst yönetime sunulmak üzere, genel durumu değerlendiren profesyonel ve akıcı bir Türkçe özet hazırla.

[Sistem Verileri - Tarih: {stats.Date:dd.MM.yyyy}]
- Toplam Yükleme Hacmi: {stats.TotalTopUpAmount:N2} TL
- Toplam Turnike Geçişi: {stats.TotalTapCount}
- Kullanıcı Profili (Kart Tipleri): {string.Join(", ", stats.CardTypeBreakdown.Select(x => $"{x.Key}: {x.Value}"))}
- En Yoğun Hatlar: {string.Join(", ", stats.TopRoutes.Select(r => $"{r.RouteCode} ({r.RouteName})"))}

ÖNEMLİ KURALLAR:
1. Verileri alt alta madde imleriyle LİSTELEME. Verileri kullanarak tek bir bütüncül paragraf oluştur.
2. Genel ve yorumlayıcı ifadeler kullan.
3. Kesinlikle sana verilmeyen bir bilgiyi veya sayıyı uydurma (Halüsinasyon yapma).
4. Yanıtın 3 ila 5 cümle uzunluğunda, net ve profesyonel bir dille yazılmış olsun.";

            var requestBody = new
            {
                model = _modelName,
                prompt = prompt,
                stream = false,
                options = new { temperature = 0.3 }
            };

            var response = await SendOllamaRequestAsync(requestBody, cancellationToken);
            if (!string.IsNullOrWhiteSpace(response))
            {
                return response.Trim();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ollama LLM Yönetici Özeti oluştururken hata oluştu.");
        }

        return $"Sistemimiz {stats.Date:dd.MM.yyyy} tarihinde toplam {stats.TotalTapCount} geçiş ile aktif bir kullanım sergilemiş olup, ağırlıklı binişler {stats.TopRoutes.FirstOrDefault()?.RouteName ?? "merkezi"} hatlarında gerçekleşmiştir. Toplam finansal hacim {stats.TotalTopUpAmount:N2} TL olarak kaydedilmiştir.";
    }

    /// <summary>
    /// 2. ŞÜPHELİ İŞLEM MANTIK VE SINIFLANDIRMA ANALİZİ (İyileştirilmiş Prompt)
    /// </summary>
    public async Task<SuspiciousAnalysisResultDto> AnalyzeSuspiciousTransactionAsync(
        SuspiciousTransactionDto transaction,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // PROMPT GÜNCELLEMESİ: Yükleme (Top-Up/Abonman) vs Geçiş (Tap) ayrımı eklendi.
            var systemMessage = @"
Sen bir Akıllı Ulaşım Sistemleri Risk ve Güvenlik Uzmanısın.
Görevin, iletilen işlem detayını inceleyerek YALNIZCA aşağıdaki üç kategoriden birine atamaktır:

KATEGORİLER:
1. 'NormalDensity': 
   - Olağan turnike geçişleri, normal aktarma süreleri.
   - Bakiye Yükleme (Top-up) ve Abonman Yükleme işlemleri. (DİKKAT: Bakiye veya Abonman yüklemeleri finansal işlemlerdir, fiziksel turnike geçişi değildir. Açık bir ödeme sahteciliği uyarısı yoksa yükleme işlemleri her zaman 'NormalDensity' kabul edilmelidir.)

2. 'Misuse': 
   - Kötüye kullanım. Sadece turnike/araç biniş geçişlerinde geçerlidir.
   - Aynı kartın çok kısa sürede (örn. 1-3 dakika) fiziksel olarak imkansız uzak mesafelerdeki iki farklı turnikede/durakta okutulması veya aynı turnikede peş peşe başkalarına okutulması.

3. 'DeviceFault': 
   - Cihaz veya yazılım arızası. Aynı saniye/milisaniye içinde peş peşe gerçekleşen hatalı mükerrer okumalar veya donanımsal iletişim hataları.

KRİTİK KURALLAR:
- Bakiye veya abonman yükleme işlemlerine asla 'fiziksel olarak imkansız mesafe' veya 'farklı kişilerce kullanım' yorumu yapma! Yüklemeler geçiş değildir.
- Yanıtını SADECE aşağıdaki JSON formatında vermelisin. JSON dışında hiçbir giriş, selamlama veya açıklama yazma.

{
  ""Category"": ""Kategori Adı"",
  ""Reason"": ""İşlemin neden bu kategoriye girdiğini açıklayan, net ve profesyonel 1 veya 2 cümlelik Türkçe analiz.""
}";

            var userPrompt = $@"
İncelenecek İşlem Kaydı:
- Tutar: {transaction.Amount:N2} TL
- İnceleme/Sistem Notu: ""{transaction.SystemReason}""

Bu işlemi analiz et ve geçerli JSON olarak yanıtla.";

            var requestBody = new
            {
                model = _modelName,
                system = systemMessage,
                prompt = userPrompt,
                stream = false,
                format = "json",
                options = new { temperature = 0.0 }
            };

            var jsonResponse = await SendOllamaRequestAsync(requestBody, cancellationToken);

            if (!string.IsNullOrWhiteSpace(jsonResponse))
            {
                var result = JsonSerializer.Deserialize<OllamaJsonResponse>(jsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (result != null && !string.IsNullOrEmpty(result.Category))
                {
                    return new SuspiciousAnalysisResultDto(result.Category, result.Reason ?? "Otomatik analiz tamamlandı.", IsAiGenerated: true);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ollama LLM Şüpheli İşlem Analizi hatası.");
        }

        return new SuspiciousAnalysisResultDto(
            Category: "NormalDensity",
            Reason: "Yapay zeka analiz servisine ulaşılamadığından işlem varsayılan olarak olağan kabul edilmiştir.",
            IsAiGenerated: false
        );
    }

    private async Task<string?> SendOllamaRequestAsync(object requestBody, CancellationToken cancellationToken)
    {
        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("/api/generate", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseString);

        if (doc.RootElement.TryGetProperty("response", out var responseProp))
        {
            return responseProp.GetString();
        }

        return null;
    }

    private class OllamaJsonResponse
    {
        public string Category { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}