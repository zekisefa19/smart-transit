using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using SmartTransit.Application.Common.Interfaces;
using StackExchange.Redis;

namespace SmartTransit.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IConnectionMultiplexer _redis;

    public RedisCacheService(IDistributedCache distributedCache, IConnectionMultiplexer redis)
    {
        _distributedCache = distributedCache;
        _redis = redis;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var cachedData = await _distributedCache.GetStringAsync(key, cancellationToken);
        if (string.IsNullOrEmpty(cachedData))
            return default;

        return JsonSerializer.Deserialize<T>(cachedData);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(30) // Varsayılan 30 dk
        };

        var serializedData = JsonSerializer.Serialize(value);
        await _distributedCache.SetStringAsync(key, serializedData, options, cancellationToken);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _distributedCache.RemoveAsync(key, cancellationToken);
    }

    public async Task RemoveByPrefixAsync(string prefixKey, CancellationToken cancellationToken = default)
    {
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        var keys = server.Keys(pattern: $"{prefixKey}*").ToArray();

        foreach (var key in keys)
        {
            await _distributedCache.RemoveAsync(key!, cancellationToken);
        }
    }
}