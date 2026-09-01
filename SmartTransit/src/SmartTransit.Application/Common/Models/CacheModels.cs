using SmartTransit.Domain.Enums;

namespace SmartTransit.Application.Common.Models;

public record CardCacheDto(
    Guid Id,
    CardType Type,
    bool IsBlocked,
    decimal Balance,
    bool HasActiveSubscription,
    int SubscriptionRemainingUses,
    DateTime? SubscriptionExpiryDate
);

public record RouteCacheDto(
    Guid Id,
    string Code,
    string Name,
    decimal StandardFare,
    int SubscriptionDeduction,
    bool IsActive
);