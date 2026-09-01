using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Features.Tariffs.Dtos;

public record TariffDto(
    Guid Id,
    CardType CardType,
    string CardTypeName,
    string Title,
    string Subtitle,
    string Description,
    decimal BasePrice,
    decimal ServiceFee,
    decimal SubscriptionFee,
    decimal SinglePassFee,
    decimal PrintingFee,
    decimal TransferDiscountPercent,
    decimal Transfer2DiscountPercent,
    bool IsFree,
    bool IsActive
);



public record UpdateTariffDto(
    CardType CardType,
    decimal BasePrice,
    decimal ServiceFee,
    decimal SinglePassFee,
    decimal PrintingFee,
    decimal TransferDiscountPercent,
    decimal Transfer2DiscountPercent,
    bool IsFree
);

public record BulkHikeDto(
    decimal Percentage
);