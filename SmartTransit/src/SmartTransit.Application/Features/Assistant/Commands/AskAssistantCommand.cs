using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Features.Assistant.DTOs;
using SmartTransit.Application.Common.Interfaces;
using System.Text;

namespace SmartTransit.Application.Features.Assistant.Commands;

public record AskAssistantCommand(string Prompt) : IRequest<AskAssistantResponseDto>;

public class AskAssistantCommandHandler : IRequestHandler<AskAssistantCommand, AskAssistantResponseDto>
{
    private readonly IApplicationDbContext _context;

    public AskAssistantCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AskAssistantResponseDto> Handle(AskAssistantCommand request, CancellationToken cancellationToken)
    {
        var userPrompt = request.Prompt.ToLower().Trim();
        var replyBuilder = new StringBuilder();

        // Tüm hatları ve araçları çekelim
        var routes = await _context.Routes
            .Include(r => r.Vehicles)
            .ToListAsync(cancellationToken);

        // 1. ÖNCE ROTA / HAT EŞLEŞMESİ KONTROL EDİLİR (Örn: "399C", "M2", "399C hattı")
        var matchedRoute = routes.FirstOrDefault(r =>
            (!string.IsNullOrWhiteSpace(r.Code) && userPrompt.Contains(r.Code.ToLower().Trim())) ||
            (!string.IsNullOrWhiteSpace(r.Name) && userPrompt.Contains(r.Name.ToLower().Trim()))
        );

        if (matchedRoute != null)
        {
            var totalVehicles = matchedRoute.Vehicles?.Count ?? 0;
            var activeVehicles = matchedRoute.Vehicles?.Count(v => v.IsActive) ?? 0;
            var passiveVehicles = totalVehicles - activeVehicles;

            replyBuilder.AppendLine($"📍 **{matchedRoute.Code} ({matchedRoute.Name}) Hat Analizi:**");
            replyBuilder.AppendLine($"• **Toplam Araç Sayısı:** {totalVehicles}");
            replyBuilder.AppendLine($"• **Aktif / Seferdeki Araç:** {activeVehicles}");
            replyBuilder.AppendLine($"• **Pasif / Bakımdaki Araç:** {passiveVehicles}");
        }

        // 2. TEKİL ARAÇ SORGUSU (Plaka veya ID eşleşmesi)
        if (replyBuilder.Length == 0)
        {
            var vehicles = await _context.Vehicles
                .Include(v => v.Route)
                .ToListAsync(cancellationToken);

            var matchedVehicle = vehicles.FirstOrDefault(v =>
                (!string.IsNullOrWhiteSpace(v.PlateNumber) && userPrompt.Contains(v.PlateNumber.ToLower().Replace(" ", "").Replace("-", ""))) ||
                (v.Id != Guid.Empty && userPrompt.Contains(v.Id.ToString().Substring(0, 4).ToLower()))
            );

            if (matchedVehicle != null)
            {
                var routeName = matchedVehicle.Route != null ? $"{matchedVehicle.Route.Code} - {matchedVehicle.Route.Name}" : "Atanmış hat yok";
                var statusStr = matchedVehicle.IsActive ? "Aktif / Seferde" : "Pasif / Bakımda";

                replyBuilder.AppendLine($"🚌 **Araç Bilgisi ({matchedVehicle.PlateNumber}):**");
                replyBuilder.AppendLine($"• **ID:** {matchedVehicle.Id}");
                replyBuilder.AppendLine($"• **Plaka:** {matchedVehicle.PlateNumber}");
                replyBuilder.AppendLine($"• **Çalıştığı Hat:** {routeName}");
                replyBuilder.AppendLine($"• **Durum:** {statusStr}");
            }
        }

        // 3. GENEL BAKIM / FİLO / SİSTEM DURUMU SORGUSU
        if (replyBuilder.Length == 0 && (userPrompt.Contains("bakım") || userPrompt.Contains("filo") || userPrompt.Contains("performans") || userPrompt.Contains("durum") || userPrompt.Contains("genel")))
        {
            var totalVehicles = await _context.Vehicles.CountAsync(cancellationToken);
            var activeVehicles = await _context.Vehicles.CountAsync(v => v.IsActive, cancellationToken);
            var inMaintenance = totalVehicles - activeVehicles;

            replyBuilder.AppendLine($"📊 **Filo ve Sistem Genel Durumu:**");
            replyBuilder.AppendLine($"• **Toplam Filo:** {totalVehicles} araç");
            replyBuilder.AppendLine($"• **Aktif / Seferde:** {activeVehicles} araç");
            replyBuilder.AppendLine($"• **Bakım / Pasif:** {inMaintenance} araç");
        }

        // 4. EŞLEŞME BULUNAMADIĞINDA VERİTABANINDAKİ MEVCUT HATLAR LİSTELENİR
        if (replyBuilder.Length == 0)
        {
            var availableRoutes = routes.Where(r => !string.IsNullOrWhiteSpace(r.Code)).Select(r => r.Code).ToList();
            var routeListStr = availableRoutes.Any() ? string.Join(", ", availableRoutes) : "Sistemde henüz kayıtlı bir hat bulunmuyor.";

            replyBuilder.AppendLine("Sistem verilerinde belirttiğiniz hat veya araç bulunamadı.");
            replyBuilder.AppendLine($"\n💡 **Sistemde Kayıtlı Aktif Hatlar:** {routeListStr}");
            replyBuilder.AppendLine("Lütfen sorgunuzda yukarıdaki hat kodlarından birini kullanınız.");
        }

        return new AskAssistantResponseDto
        {
            Reply = replyBuilder.ToString(),
            Timestamp = DateTime.UtcNow
        };
    }
}