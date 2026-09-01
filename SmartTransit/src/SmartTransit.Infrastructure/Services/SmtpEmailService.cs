using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using SmartTransit.Application.Common.Interfaces;

namespace SmartTransit.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendVerificationCodeAsync(string toEmail, string code)
    {
        // appsettings.json içerisindeki "EmailSettings" bölümünü okuyoruz
        var emailSettings = _configuration.GetSection("EmailSettings");

        string host = emailSettings["SmtpServer"] ?? "smtp.gmail.com";
        int port = int.TryParse(emailSettings["Port"], out var p) ? p : 587;
        string senderEmail = emailSettings["SenderEmail"] ?? throw new Exception("SenderEmail boş olamaz.");
        string senderName = emailSettings["SenderName"] ?? "SmartTransit Ulaşım";
        string password = emailSettings["Password"] ?? throw new Exception("SMTP Password boş olamaz.");

        var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(senderEmail, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = "SmartTransit - E-Posta Doğrulama Kodu",
            Body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #2b2b2b;'>SmartTransit Hesabınızı Doğrulayın</h2>
                    <p>SmartTransit sistemine hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz:</p>
                    <div style='background-color: #f4f4f4; padding: 15px; width: fit-content; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #007bff;'>
                        {code}
                    </div>
                    <p style='margin-top: 20px; color: #777; font-size: 12px;'>Bu kod 10 dakika boyunca geçerlidir. Eğer kayıt işlemini siz yapmadıysanız bu e-postayı dikkate almayın.</p>
                </div>",
            IsBodyHtml = true
        };

        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}