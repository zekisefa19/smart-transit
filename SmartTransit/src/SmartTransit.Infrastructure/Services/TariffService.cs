using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces; // ApplicationDbContext arabiriminiz
using SmartTransit.Application.Features.Tariffs.Dtos;
using SmartTransit.Application.Services;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Infrastructure.Services;

public class TariffService : ITariffService
{
    private readonly IApplicationDbContext _context;

    public TariffService(IApplicationDbContext context)
    {
        _context = context;
    }

    // Hem Passenger hem Admin için tüm aktif tarifeleri çeker
    public async Task<List<TariffDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Tariffs
            .AsNoTracking()
            .Where(t => t.IsActive)
            .Select(t => new TariffDto(
                t.Id,
                t.CardType,
                t.CardType.ToString(),
                t.Title,
                t.Subtitle,
                t.Description,
                t.BasePrice,
                t.ServiceFee,
                t.SubscriptionFee,
                t.SinglePassFee,
                t.PrintingFee,
                t.TransferDiscountPercent,
                t.Transfer2DiscountPercent,
                t.IsFree,
                t.IsActive
            ))
            .ToListAsync(cancellationToken);
    }

    // Kart tipine göre tekil tarife çeker (Turnike geçiş kontrolü vb. için)
    public async Task<TariffDto?> GetByCardTypeAsync(CardType cardType, CancellationToken cancellationToken = default)
    {
        var tariff = await _context.Tariffs
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.CardType == cardType && t.IsActive, cancellationToken);

        if (tariff == null) return null;

        return new TariffDto(
            tariff.Id,
            tariff.CardType,
            tariff.CardType.ToString(),
            tariff.Title,
            tariff.Subtitle,
            tariff.Description,
            tariff.BasePrice,
            tariff.ServiceFee,
            tariff.SubscriptionFee,
            tariff.SinglePassFee,
            tariff.PrintingFee,
            tariff.TransferDiscountPercent,
            tariff.Transfer2DiscountPercent,
            tariff.IsFree,
            tariff.IsActive
        );
    }

    // Admin panelinden tek bir kartın tarifesini günceller
    public async Task<bool> UpdateAsync(UpdateTariffDto dto, CancellationToken cancellationToken = default)
    {
        var tariff = await _context.Tariffs
            .FirstOrDefaultAsync(t => t.CardType == dto.CardType, cancellationToken);

        if (tariff == null) return false;

        tariff.BasePrice = dto.BasePrice;
        tariff.ServiceFee = dto.ServiceFee;
        tariff.SinglePassFee = dto.SinglePassFee;
        tariff.PrintingFee = dto.PrintingFee;
        tariff.TransferDiscountPercent = dto.TransferDiscountPercent;
        tariff.Transfer2DiscountPercent = dto.Transfer2DiscountPercent;
        tariff.IsFree = dto.IsFree;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    // Admin panelinden tüm kartlara toplu zam uygular (Muaf kartlar hariç)
    public async Task<bool> ApplyBulkHikeAsync(decimal percentage, CancellationToken cancellationToken = default)
    {
        if (percentage <= 0) return false;

        var tariffs = await _context.Tariffs
            .Where(t => t.IsActive && !t.IsFree)
            .ToListAsync(cancellationToken);

        decimal multiplier = 1 + (percentage / 100m);

        foreach (var tariff in tariffs)
        {
            tariff.BasePrice = Math.Round(tariff.BasePrice * multiplier, 2);
            tariff.SinglePassFee = Math.Round(tariff.SinglePassFee * multiplier, 2);
            tariff.PrintingFee = Math.Round(tariff.PrintingFee * multiplier, 2);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}