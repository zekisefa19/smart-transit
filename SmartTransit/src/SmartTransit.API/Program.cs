using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Polly;
using Polly.Timeout;
using Serilog;
using SmartTransit.API.Middlewares;
using SmartTransit.API.Models;
using SmartTransit.Application.Common.Interfaces;
using SmartTransit.Infrastructure.BackgroundServices;
using SmartTransit.Infrastructure.HealthChecks;
using SmartTransit.Infrastructure.Persistence;
using SmartTransit.Infrastructure.Services;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;


// 🔴 EKSİK 1: PostgreSQL DateTime/Timestamp Dönüşüm Hatasını Engeller
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// 🔴 EKSİK 2: .NET'in JWT Token içerisindeki 'sub' ve 'NameIdentifier' claim'lerini ezmesini engeller
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 0. SERILOG YAPILANDIRMASI
// ==========================================
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();


// ==========================================
// 1. DATABASE & VERİTABANI SERVİSLERİ
// ==========================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());


// ==========================================
// 2. REDIS & CACHE YAPILANDIRMASI
// ==========================================
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(redisConnectionString));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnectionString;
    options.InstanceName = "SmartTransit_";
});

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICacheService, RedisCacheService>();


// ==========================================
// 3. UYGULAMA SERVİSLERİ & MEDIATR
// ==========================================
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(IApplicationDbContext).Assembly));


// ==========================================
// 4. AI (OLLAMA) & POLLY RESILIENCY PIPELINE
// ==========================================
builder.Services.AddHttpClient<ILlmService, OllamaLlmService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(60);
})
.AddResilienceHandler("ollama-pipeline", resilienceBuilder =>
{
    resilienceBuilder.AddTimeout(TimeSpan.FromSeconds(30));

    resilienceBuilder.AddRetry(new Polly.Retry.RetryStrategyOptions<HttpResponseMessage>
    {
        MaxRetryAttempts = 1,
        Delay = TimeSpan.FromSeconds(2),
        BackoffType = DelayBackoffType.Constant
    });

    resilienceBuilder.AddCircuitBreaker(new Polly.CircuitBreaker.CircuitBreakerStrategyOptions<HttpResponseMessage>
    {
        FailureRatio = 0.5,
        SamplingDuration = TimeSpan.FromSeconds(60),
        MinimumThroughput = 3,
        BreakDuration = TimeSpan.FromSeconds(30)
    });
});


// ==========================================
// 5. ASENKRON İŞLEME & ARKA PLAN SERVİSİ
// ==========================================
builder.Services.AddSingleton<ISuspiciousTransactionQueue, SuspiciousTransactionQueue>();
builder.Services.AddHostedService<SuspiciousAnalysisBackgroundWorker>();


// ==========================================
// 6. JWT AUTHENTICATION & AUTHORIZATION
// ==========================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "SmartTransitSuperSecretKey2026SecurityKeyMinimum32Chars!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "SmartTransitAPI",
        ValidAudience = jwtSettings["Audience"] ?? "SmartTransitApp",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();


// ==========================================
// 7. CONTROLLERS & SWAGGER (JSON AYARI EKLENDİ)
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // React'ten gelen camelCase alan adlarının C# PascalCase alanları ile sorunsuz eşleşmesini sağlar
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartTransit API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Örnek kullanım: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// ==========================================
// 8. HEALTH CHECKS YAPILANDIRMASI
// ==========================================
builder.Services.AddHttpClient<OllamaHealthCheck>();

builder.Services.AddHealthChecks()
    .AddCheck<PostgresHealthCheck>(
        name: "PostgreSQL",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "db", "sql" })
    .AddRedis(
        redisConnectionString,
        name: "Redis",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "cache", "redis" })
    .AddCheck<OllamaHealthCheck>(
        name: "Ollama_LLM",
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "ai", "llm" });


// ==========================================
// 9. RATE LIMITING
// ==========================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var response = new
        {
            status = 429,
            title = "Çok Fazla İstek (Too Many Requests)",
            detail = "Sistem güvenliği nedeniyle istek limitini aştınız. Lütfen bir süre bekleyip tekrar deneyin."
        };
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
    };

    options.AddPolicy("turnstile", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "global_turnstile",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromSeconds(10),
                QueueLimit = 0
            }));

    options.AddPolicy("topup", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "global_topup",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 3,
                QueueLimit = 0
            }));

    options.AddPolicy("ai-llm", httpContext =>
        RateLimitPartition.GetConcurrencyLimiter(
            partitionKey: "global_ai_limiter",
            factory: _ => new ConcurrencyLimiterOptions
            {
                PermitLimit = 2,
                QueueLimit = 1
            }));
});


// ==========================================
// 10. CORS YAPILANDIRMASI
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:4200"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


// ==========================================
// 11. MIDDLEWARE PIPELINE & APP RUN
// ==========================================
var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔴 EKSİK 3: Localhost geliştirmesinde Axios istek yönlendirmesinde Token kaybını önlemek için geçici olarak kapatıldı.
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

app.UseRateLimiter();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

app.MapControllers();

try
{
    Log.Information("🚀 SmartTransit API ve AI Servisleri Başlatılıyor...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "💥 Uygulama beklenmeyen bir hata nedeniyle çöktü!");
}
finally
{
    Log.CloseAndFlush();
}
