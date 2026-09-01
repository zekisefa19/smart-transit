using MediatR;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Application.Features.Operator.Commands;

public record DeleteOperatorCommand(Guid Id) : IRequest<bool>;

public class DeleteOperatorCommandHandler : IRequestHandler<DeleteOperatorCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteOperatorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteOperatorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.Id }, cancellationToken);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}