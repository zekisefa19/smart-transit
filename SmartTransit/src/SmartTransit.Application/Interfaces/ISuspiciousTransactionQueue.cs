using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Common.Interfaces;

public interface ISuspiciousTransactionQueue
{
    /// <summary>
    /// Şüpheli işlemi arka planda işlenmek üzere kuyruğa ekler (Non-blocking).
    /// </summary>
    ValueTask QueueTransactionAsync(SuspiciousTransactionDto transaction);

    /// <summary>
    /// Background Worker için kuyruktan sıradaki işlemi okur.
    /// </summary>
    ValueTask<SuspiciousTransactionDto> DequeueTransactionAsync(CancellationToken cancellationToken);
}