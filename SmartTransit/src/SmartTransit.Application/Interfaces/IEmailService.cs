using System.Threading.Tasks;

namespace SmartTransit.Application.Common.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Belirtilen e-posta adresine 6 haneli doğrulama kodunu gönderir.
    /// </summary>
    /// <param name="toEmail">Alıcının e-posta adresi</param>
    /// <param name="code">Gönderilecek 6 haneli kod</param>
    Task SendVerificationCodeAsync(string toEmail, string code);
}