# 🚀 Supabase Kurulum Rehberi

Bu rehber, Mesi Takip uygulamasını Supabase ile entegre etmek için adım adım talimatları içerir.

## 📋 Gereksinimler

- Supabase hesabı (ücretsiz)
- Node.js ve npm
- Git

## 🔧 Adım 1: Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: `mesi-takip-app`
4. Database şifresi oluşturun (güvenli bir şifre seçin)
5. Region seçin (en yakın bölgeyi seçin)
6. "Create new project" butonuna tıklayın

## 🗄️ Adım 2: Database Schema Kurulumu

1. Supabase Dashboard'da projenizi açın
2. Sol menüden "SQL Editor" seçin
3. "New query" butonuna tıklayın
4. `supabase-schema.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'a yapıştırın ve "Run" butonuna tıklayın

## 🔐 Adım 3: Environment Variables

1. Supabase Dashboard'da "Settings" > "API" bölümüne gidin
2. "Project URL" ve "anon public" key'i kopyalayın
3. Proje klasörünüzde `.env` dosyası oluşturun:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Firebase Configuration (mevcut)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## 🔧 Adım 4: Auth Ayarları

1. Supabase Dashboard'da "Authentication" > "Settings" bölümüne gidin
2. "Site URL" alanına uygulamanızın URL'sini ekleyin:
   - Development: `http://localhost:5173`
   - Production: `https://your-app.netlify.app`
3. "Redirect URLs" bölümüne aynı URL'leri ekleyin
4. "Save" butonuna tıklayın

## 🚀 Adım 5: Uygulamayı Test Etme

1. Terminal'de proje klasörüne gidin
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcıda `http://localhost:5173` adresine gidin
5. Yeni bir kullanıcı hesabı oluşturun

## 📊 Adım 6: Database Kontrolü

1. Supabase Dashboard'da "Table Editor" bölümüne gidin
2. Aşağıdaki tabloların oluşturulduğunu kontrol edin:
   - `users`
   - `user_profiles`
   - `leaves`
   - `overtime`
   - `salary_records`

## 🔒 Adım 7: Row Level Security (RLS)

RLS politikaları otomatik olarak oluşturulmuştur. Bu politikalar:
- Kullanıcılar sadece kendi verilerini görebilir
- Adminler tüm verileri görebilir ve yönetebilir
- Kullanıcılar sadece kendi verilerini ekleyebilir

## 🚀 Adım 8: Production Deploy

1. Netlify'da environment variables ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Uygulamayı deploy edin:
   ```bash
   npm run deploy:netlify
   ```

## 🔍 Sorun Giderme

### "Invalid API key" hatası
- Environment variables'ların doğru ayarlandığından emin olun
- Supabase Dashboard'dan API key'leri tekrar kontrol edin

### "RLS policy violation" hatası
- Kullanıcının giriş yapmış olduğundan emin olun
- Admin yetkilerini kontrol edin

### "Table does not exist" hatası
- SQL schema'nın başarıyla çalıştırıldığından emin olun
- Table Editor'da tabloların mevcut olduğunu kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Supabase [Discord](https://discord.supabase.com/) kanalına katılın
2. [Supabase Documentation](https://supabase.com/docs)'ı inceleyin
3. GitHub Issues'da sorun bildirin

## 🎉 Tebrikler!

Supabase entegrasyonu tamamlandı! Artık uygulamanız:
- ✅ Güvenli PostgreSQL database kullanıyor
- ✅ Real-time özellikler destekliyor
- ✅ Row Level Security ile korunuyor
- ✅ Ücretsiz tier ile çalışıyor
- ✅ Firebase'den bağımsız çalışıyor
