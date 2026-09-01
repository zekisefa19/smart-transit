using System.Threading.Channels;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Infrastructure.Services;

public class SuspiciousTransactionQueue : ISuspiciousTransactionQueue
{
    // Bounded channel: Kuyrukta en fazla 10.000 işlem birikebilir (Aşırı bellek kullanımını önler)
    private readonly Channel<SuspiciousTransactionDto> _queue = Channel.CreateBounded<SuspiciousTransactionDto>(new BoundedChannelOptions(10000)
    {
        FullMode = BoundedChannelFullMode.Wait,
        SingleReader = true // Tek bir Background Worker tüketecek
    });

    public async ValueTask QueueTransactionAsync(SuspiciousTransactionDto transaction)
    {
        ArgumentNullException.ThrowIfNull(transaction);
        await _queue.Writer.WriteAsync(transaction);
    }

    public async ValueTask<SuspiciousTransactionDto> DequeueTransactionAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}