# 💼 Mesai Takip Web V2

Modern, güvenli ve kullanıcı dostu bir maaş ve çalışma takip uygulaması. React, TypeScript, Tailwind CSS ve Supabase kullanılarak geliştirilmiştir.

## 🌐 Proje Bilgileri
- **📁 Workspace:** mesi_takip_web_V1-master
- **🛠️ Geliştirme Ortamı:** React + TypeScript + Vite
- **🗄️ Veritabanı:** Supabase (PostgreSQL)
- **🎨 Stil:** Tailwind CSS

## 🆕 Mevcut Özellikler
- ✅ **Admin Paneli**: Kullanıcı yönetimi, rol kontrolü ve sistem logları
- ✅ **Supabase Backend**: PostgreSQL veritabanı ve gerçek zamanlı güncellemeler
- ✅ **Gelişmiş Raporlama**: Aylık gelir trendi ve detaylı analizler
- ✅ **Dark Mode**: Kapsamlı karanlık tema desteği
- ✅ **Bildirim Sistemi**: Gerçek zamanlı bildirimler ve sayaç
- ✅ **Görünüm Ayarları**: Font boyutu, renk şeması, kompakt mod
- ✅ **Tazminat Hesaplayıcıları**: Kıdem tazminatı ve işsizlik maaşı hesaplama
- ✅ **İzin Analizi**: Detaylı izin istatistikleri ve kullanım grafiği

## 🚀 Özellikler

### 📊 Ana Özellikler
- **Dashboard**: Maaş ve çalışma durumunun anlık özeti
- **Maaş Yönetimi**: Brüt/Net maaş hesaplamaları ve takibi
- **Fazla Mesai Takibi**: Mesai saatleri ve ücret hesaplamaları
- **İzin Yönetimi**: Yıllık izin, hastalık izni ve diğer izin türleri
- **Tatil Takvimi**: Resmi tatiller ve özel tatil günleri
- **Raporlama**: Detaylı analiz ve raporlar
- **Hesaplayıcılar**: Tazminat ve maaş hesaplayıcıları

### 🔒 Güvenlik Özellikleri
- **Gelişmiş Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı dostu mesajlar
- **Form Validasyonu**: Kapsamlı input doğrulama ve sanitization
- **XSS Koruması**: Input sanitization ve güvenli veri işleme
- **Rate Limiting**: API isteklerinde hız sınırlama
- **Session Yönetimi**: Güvenli oturum kontrolü
- **Password Strength**: Güçlü şifre kontrolü

### ⚡ Performans Özellikleri
- **Retry Mekanizması**: Otomatik yeniden deneme sistemi
- **Memoization**: React.useMemo ve useCallback optimizasyonları
- **Lazy Loading**: Komponent bazlı kod bölme
- **Debounce/Throttle**: Kullanıcı etkileşimlerinde performans optimizasyonu
- **Offline Support**: Temel offline işlevsellik

### 🎨 UX/UI İyileştirmeleri
- **Loading States**: Kapsamlı yükleme durumları
- **Error Boundaries**: Hata sınırları ve kurtarma mekanizmaları
- **Empty States**: Boş durumlar için kullanıcı dostu arayüzler
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Dark Mode**: Karanlık tema desteği
- **Toast Notifications**: Kullanıcı bildirimleri

## 🛠️ Teknolojiler

### Frontend
- **React 18.3.1**: Modern React özellikleri ve hooks
- **TypeScript 5.5+**: Tip güvenliği ve geliştirici deneyimi
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **Lucide React**: Modern SVG ikon seti
- **React Icons**: Geniş ikon kütüphanesi
- **React Router DOM**: Client-side routing
- **Vite 5.4+**: Hızlı build tool ve dev server

### Backend & Veritabanı
- **Supabase 2.53+**: Backend as a Service
- **PostgreSQL**: İlişkisel veritabanı
- **Supabase Auth**: Kimlik doğrulama sistemi
- **Row Level Security (RLS)**: Veri güvenliği
- **Real-time Subscriptions**: Gerçek zamanlı güncellemeler

### Geliştirme Araçları
- **ESLint 9.9+**: Kod kalitesi ve linting
- **TypeScript ESLint**: TypeScript için ESLint kuralları
- **PostCSS**: CSS işleme
- **Autoprefixer**: CSS vendor prefix'leri
- **Netlify**: Deployment yapılandırması

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/FansiB0/mesi_takip_web_v2.git
cd mesi_takip_web_v2
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
# env.example dosyasını .env olarak kopyalayın
cp env.example .env

# .env dosyasında Supabase bilgilerinizi güncelleyin
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Production build**
```bash
npm run build
```

## 🔧 Yapılandırma

### Supabase Kurulumu
1. [Supabase Console](https://app.supabase.com/)'da yeni proje oluşturun
2. Database'de gerekli tabloları oluşturun (SQL script'ler repo'da mevcut)
3. Authentication'ı etkinleştirin (Email/Password)
4. Row Level Security (RLS) politikalarını ayarlayın
5. API Keys'i alın ve environment variables'a ekleyin

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
Repo'da bulunan SQL script'lerini Supabase SQL Editor'de sırasıyla çalıştırın:

1. **Temel Schema Kurulumu:**
```sql
-- Ana schema ve tabloları oluştur
COMPLETE_SCHEMA_FIX.sql

-- UUID düzeltmeleri
COMPLETE_UUID_FIX_ALL_TABLES.sql

-- Maaş tablosu düzeltmeleri
FINAL_SALARY_FIX.sql
```

2. **Admin ve Güvenlik:**
```sql
-- Admin kullanıcı oluştur
CREATE_ADMIN_USER.sql

-- Güvenlik ayarları
ENABLE_SECURITY.sql

-- Sistem logları
CREATE_SYSTEM_LOGS.sql
```

3. **İsteğe Bağlı (Test/Debug):**
```sql
-- Tabloları sıfırlamak için (dikkatli kullanın!)
VERIFIED_RESET_TABLES.sql
```

## 📁 Proje Yapısı

```
src/
├── components/          # React komponentleri
│   ├── Auth/           # Kimlik doğrulama komponentleri
│   ├── Dashboard/      # Dashboard komponentleri
│   ├── Layout/         # Layout komponentleri
│   ├── Salary/         # Maaş yönetimi komponentleri
│   ├── Overtime/       # Fazla mesai komponentleri
│   ├── Leaves/         # İzin yönetimi komponentleri
│   ├── Reports/        # Raporlama komponentleri
│   ├── Settings/       # Ayarlar komponentleri
│   └── Calculators/    # Hesaplayıcı komponentleri
├── contexts/           # React Context'leri
├── services/           # API servisleri
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
│   ├── calculations.ts # Hesaplama fonksiyonları
│   ├── validation.ts   # Form validasyonu
│   ├── errorHandler.ts # Hata yönetimi
│   └── security.ts     # Güvenlik fonksiyonları
└── config/             # Yapılandırma dosyaları
```

## 🔄 Teknik Özellikler

### Hata Yönetimi
- ✅ Kapsamlı hata yakalama sistemi
- ✅ Retry mekanizması
- ✅ Kullanıcı dostu hata mesajları
- ✅ Error boundaries

### Form Validasyonu
- ✅ Real-time form validasyonu
- ✅ Input sanitization
- ✅ Kapsamlı doğrulama kuralları
- ✅ Hata mesajları

### Performans
- ✅ React.memo optimizasyonları
- ✅ useMemo ve useCallback kullanımı
- ✅ Lazy loading
- ✅ Debounce/throttle

### UX/UI
- ✅ Loading states
- ✅ Empty states
- ✅ Error displays
- ✅ Responsive design
- ✅ Dark mode

### Güvenlik
- ✅ XSS koruması
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Password strength validation

## 🚀 Deployment

Bu proje hem **GitHub Pages** hem de **Vercel** platformlarında aynı anda yayınlanabilir.

### 🔄 Otomatik Deployment

**GitHub Pages** (Otomatik):
- `main` branch'e her push'ta otomatik deploy
- GitHub Actions workflow ile yapılır
- URL: `https://fansib0.github.io/mesi_takip_web_v2/`

**Vercel** (Manuel veya Otomatik):
- Vercel hesabınıza GitHub repo'yu bağlayın
- Otomatik deploy için Vercel dashboard'dan ayarlayın

### 📝 Manuel Deployment Komutları

```bash
# Sadece GitHub Pages
npm run deploy:github

# Sadece Vercel
npm run deploy:vercel

# Her ikisi birden
npm run deploy:all

# Platform özel build'ler
npm run build:github    # GitHub Pages için
npm run build:vercel    # Vercel için
```

### 🛠️ Platform Özel Ayarlar

**GitHub Pages:**
- Base path: `/mesi_takip_web_v2/`
- Environment: `DEPLOYMENT_TARGET=github`

**Vercel:**
- Base path: `/`
- Environment: `DEPLOYMENT_TARGET=vercel`
- Otomatik HTTPS ve CDN

### 📋 Deployment Checklist

1. ✅ Environment variables'ları platform'da ayarlayın
2. ✅ Supabase URL ve API key'leri ekleyin
3. ✅ Domain ayarlarını yapın (opsiyonel)
4. ✅ CORS ayarlarını Supabase'de güncelleyin

### Netlify
```bash
npm run build
# netlify.toml dosyası mevcut - drag & drop ile deploy edilebilir
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:
1. Hata loglarını kontrol edin
2. Veritabanı bağlantısını doğrulayın
3. Environment variables'ları kontrol edin
4. Geliştirici ile iletişime geçin

## 🔮 Gelecek Planları

### Kısa Vadeli (v1.1)
- [ ] Offline çalışma desteği (PWA)
- [ ] Excel export/import özelliği
- [ ] Gelişmiş filtreleme ve arama
- [ ] Email bildirimleri
- [ ] Vardiya sistemi desteği

### Orta Vadeli (v1.2-1.3)
- [ ] Mobile responsive iyileştirmeleri
- [ ] Raporlama dashboard'u
- [ ] Çoklu dil desteği (EN/TR)
- [ ] API entegrasyonları
- [ ] Kullanıcı rol yönetimi genişletmesi

### Uzun Vadeli (v2.0+)
- [ ] Mobile app (React Native)
- [ ] AI destekli analitik
- [ ] Third-party integrations (Slack, Teams)
- [ ] Multi-tenant architecture

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir.
