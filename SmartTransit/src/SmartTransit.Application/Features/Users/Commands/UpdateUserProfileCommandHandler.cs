using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Application.Features.Users.DTOs;

namespace SmartTransit.Application.Features.Users.Commands;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserProfileDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    public UpdateUserProfileCommandHandler(IApplicationDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<UserProfileDto> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. Veritabanından Kullanıcıyı Çekiyoruz
        // DİKKAT: Burada AsNoTracking() KULLANILMAMALIDIR. EF Core'un değişiklikleri algılaması için Tracking aktif olmalı.
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException($"ID'si {request.UserId} olan kullanıcı bulunamadı.");
        }

        // 2. Gelen Yeni Verileri Entity'e İşliyoruz
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.IdentityNumber = request.IdentityNumber;
        user.Address = request.Address;

        // PostgreSQL timestamptz alanları için UTC dönüşümü (Zaman dilimi kaymasını önler)
        if (request.BirthDate.HasValue)
        {
            user.BirthDate = DateTime.SpecifyKind(request.BirthDate.Value, DateTimeKind.Utc);
        }
        else
        {
            user.BirthDate = null;
        }

        // 3. Veritabanına Fiziksel Olarak Kaydediyoruz
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Eski Cache Verilerini Temizliyoruz (Frontend F5 attığında eski veri gelmesini kesin engeller)
        try
        {
            await _cacheService.RemoveAsync($"user_profile_{request.UserId}");
            await _cacheService.RemoveAsync($"user_{request.UserId}");
        }
        catch (Exception ex)
        {
            // Redis'e (veya In-Memory Cache'e) ulaşılamazsa işlemin iptal olmaması için catch bloğuna alıyoruz
            Console.WriteLine($"[CACHE WARNING] Önbellek temizlenirken hata oluştu: {ex.Message}");
        }

        // 5. Güncellenmiş Yeni Veriyi Frontend'e Geri Döndürüyoruz (Ekranda anında güncellenmesi için)
        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            IdentityNumber = user.IdentityNumber,
            BirthDate = user.BirthDate,
            Address = user.Address,
            Role = user.Role.ToString(),
            IsEmailConfirmed = user.IsEmailConfirmed
        };
    }
}