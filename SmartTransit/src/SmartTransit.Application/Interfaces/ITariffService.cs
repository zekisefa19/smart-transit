using SmartTransit.Application.Features.Tariffs.Dtos;
using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Services;

public interface ITariffService
{
    Task<List<TariffDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TariffDto?> GetByCardTypeAsync(CardType cardType, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(UpdateTariffDto dto, CancellationToken cancellationToken = default);
    Task<bool> ApplyBulkHikeAsync(decimal percentage, CancellationToken cancellationToken = default);
}