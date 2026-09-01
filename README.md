# 🚌 Smart Transit - Kent İçi Akıllı Ulaşım Yönetim Platformu

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis)
![Ollama](https://img.shields.io/badge/AI-Ollama%20%2F%20Qwen-FF6F61?style=for-the-badge)

**Smart Transit**, kent içi toplu taşıma süreçlerini uçtan uca dijitalleştiren; yolcu, operatör ve yönetici katmanlarına özel paneller sunan, yapay zeka destekli ve mikroservis standartlarında kurgulanmış full-stack bir ulaşım yönetim sistemidir.

---

## 🌟 Öne Çıkan Modüller ve Paneller

### 👤 1. Yolcu Portalı (Passenger Dashboard)
- **Profil & Bakiye Yönetimi:** Sanal POS simülatörü üzerinden anlık bakiye yükleme ve abonman tanımlama.
- **Kart Başvuru Süreci:** Dijital indirimli/ücretsiz kart başvuruları ve canlı durum takibi.
- **Geçiş Geçmişi & Anlık Bildirimler:** Validatör biniş kayıtları ve başvuru sonuçlarına dair anlık arayüz bildirimleri.

### 🛡️ 2. Operatör Kontrol Merkezi (Operator Dashboard)
- **Başvuru Onay Mekanizması:** Evrak doğrulama, kart basım onay ve gerekçeli reddetme iş akışları.
- **Rota & Hat Yönetimi:** Güzergâh tanımlama, durak dizilimleri ve hatta araç/filo atama.
- **AI Fraud & İhlal Takibi:** Yapay zeka tarafından tespit edilen yüksek riskli ve şüpheli biniş hareketlerinin canlı denetimi.

### 👑 3. Yönetici Paneli (Admin Dashboard)
- **Dinamik Tarife Yönetimi:** Toplu zam/indirim uygulama ve Redis önbellek entegrasyonu ile fiyatların validatörlere anında yansıması.
- **Operatör & Rol Yönetimi:** Kullanıcılara operatör yetkisi atama/geri alma ve görev tanımlama.
- **Canlı Filo Takibi:** Sahadaki araçların anlık durum ve yolcu yoğunluk analizi.
- **AI Akıllı Asistan (Sohbet Modülü):** Ollama/Qwen yapay zeka modeli ile doğal dille sohbet ederek günlük gelir, aktif araç ve yolcu istatistiklerini sorgulama.

---

## 🏗️ Mimari ve Teknik Özellikler

### Backend (.NET 8 Web API)
- **Mimari:** CQRS (Command Query Responsibility Segregation) Tasarım Kalıbı.
- **Veri Erişimi:** Entity Framework Core, Generic Repository & Unit of Work pattern.
- **Çift Harcama Koruması:** EF Core **Optimistic Locking** ile eşzamanlı geçişlerde veri tutarlılığı.
- **Güvenlik:** JWT (JSON Web Token) tabanlı kimlik doğrulama ve Rol Tabanlı Erişim Kontrolü (RBAC).
- **Loglama & İzleme:** Serilog (Konsol ve Günlük Dosya Kaydı) ve HealthCheck endpoint'i.
- **Hata Yönetimi:** Global Exception Handling (RFC 7807 Problem Details standartlarında).

### Frontend (React 18 + Vite + TypeScript)
- **Arayüz & Stil:** Tailwind CSS ile oluşturulmuş, responsive ve dinamik gösterge panelleri.
- **HTTP İletişimi:** Axios Interceptors ile otomatik token yenileme ve merkezi hata yönetimi.
- **Navigasyon:** React Router v6 yönlendirme muhafızları (Route Guards).

### Yapay Zeka & Veritabanı
- **AI Entegrasyonu:** Ollama altyapısında çalışan **Qwen 2.5/3.5** modeli ile ihlal skorlaması ve asistan yanıtları.
- **Önbellekleme:** Redis caching ile yüksek frekanslı tarife ve oturum verisi optimizasyonu.
- **Veritabanı:** PostgreSQL ilişkisel veritabanı mimarisi.

---

## 🛠️ Kurulum ve Çalıştırma Rehberi

### Ön Gereksinimler
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+)](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Ollama](https://ollama.com/) (`qwen2.5:3b` veya üzeri model)

### 1. Backend Kurulumu
```bash
# Backend klasörüne geçin
cd SmartTransit

# Yapılandırma dosyasını kopyalayın
cp appsettings.Example.json appsettings.json

# appsettings.json içerisindeki veritabanı ve SMTP şifrelerinizi düzenleyin.

# Veritabanı migrasyonlarını uygulayın ve projeyi başlatın
dotnet ef database update
dotnet run