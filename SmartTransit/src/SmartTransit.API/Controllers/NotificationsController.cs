using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Domain.Entities;
using System.Security.Claims;
using SmartTransit.Infrastructure.Persistence;

namespace SmartTransit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Sadece giriş yapan kullanıcılar erişebilir
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Kendi DbContext adınıza göre güncelleyin

    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/notifications
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        // Token'dan kullanıcının ID'sini alıyoruz
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized("Kullanıcı kimliği bulunamadı.");

        // Kullanıcıya ait bildirimleri en yeniden eskiye doğru getir
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notifications);
    }

    // PUT: api/notifications/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);

        if (notification == null)
            return NotFound("Bildirim bulunamadı.");

        // Bildirim zaten okunduysa işlem yapma
        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return NoContent(); // 204 Başarılı ama içerik dönmüyor
    }
}