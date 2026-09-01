using System.Net;
using System.Text.Json;
using SmartTransit.API.Models;
using SmartTransit.Application.Common.Exceptions;

namespace SmartTransit.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorDetails();

        switch (exception)
        {
            // 🛑 404 Not Found
            case NotFoundException notFoundEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.StatusCode = context.Response.StatusCode;
                response.Message = notFoundEx.Message;
                _logger.LogWarning("Kaynak bulunamadı: {Message}", notFoundEx.Message);
                break;

            // 🛑 400 Bad Request (İş Kuralları İhlali)
            case BusinessException businessEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.StatusCode = context.Response.StatusCode;
                response.Message = businessEx.Message;
                _logger.LogWarning("İş kuralı ihlali: {Message}", businessEx.Message);
                break;

            // 🛑 400 Bad Request (Genel Exception'lar)
            case Exception ex when ex.Message.Contains("bulunamadı") || ex.Message.Contains("bulunmamaktadır"):
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.StatusCode = context.Response.StatusCode;
                response.Message = ex.Message;
                _logger.LogWarning("İşlem hatası: {Message}", ex.Message);
                break;

            // 💥 500 Internal Server Error (Beklenmeyen Sistem Hataları)
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.StatusCode = context.Response.StatusCode;
                response.Message = "Sunucuda beklenmeyen bir hata oluştu. Lütfen sistem yöneticisi ile iletişime geçin.";

                // Geliştirme ortamında stack trace detayını ekle
                if (_env.IsDevelopment())
                {
                    response.Details = exception.ToString();
                }

                _logger.LogError(exception, "Beklenmeyen sistem hatası gerçekleşti: {Message}", exception.Message);
                break;
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(response, jsonOptions);
        return context.Response.WriteAsync(json);
    }
}