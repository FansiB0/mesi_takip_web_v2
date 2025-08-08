# Supabase Bağlantı Testi

## Sorun: Veriler Kaydedilmiyor

Uygulamaya girdiğiniz verilerin kaydedilmemesi sorunu için aşağıdaki adımları takip edin:

## 1. Environment Variables Kontrolü

`.env` dosyanızda aşağıdaki değerlerin doğru olduğundan emin olun:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Supabase Projesi Kurulumu

### 2.1 Yeni Supabase Projesi Oluşturun
1. https://supabase.com adresine gidin
2. Yeni proje oluşturun
3. Proje URL'sini ve anon key'i kopyalayın

### 2.2 Database Schema Uygulayın
1. Supabase Dashboard'da SQL Editor'ü açın
2. `supabase-schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'de çalıştırın

## 3. Test Adımları

### 3.1 Console'da Hata Kontrolü
1. Browser'da F12 tuşuna basın
2. Console sekmesine gidin
3. Aşağıdaki hataları kontrol edin:
   - "Supabase environment variables not found!"
   - "RLS error"
   - "column does not exist"

### 3.2 Network Sekmesinde API Çağrıları
1. Network sekmesine gidin
2. Bir veri eklemeye çalışın
3. Supabase API çağrılarını kontrol edin:
   - 401 Unauthorized
   - 403 Forbidden
   - 406 Not Acceptable
   - 400 Bad Request

## 4. Yaygın Sorunlar ve Çözümleri

### 4.1 RLS (Row Level Security) Sorunları
```sql
-- Geçici olarak RLS'yi devre dışı bırakın (sadece test için)
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
```

### 4.2 Tablo Eksikliği
```sql
-- Tabloların var olduğunu kontrol edin
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'salary_records', 'overtime', 'leaves');
```

### 4.3 Kullanıcı Kimlik Doğrulama
```sql
-- Kullanıcının auth.users tablosunda olduğunu kontrol edin
SELECT * FROM auth.users WHERE email = 'your-email@example.com';
```

## 5. Debug Komutları

### 5.1 Supabase Bağlantı Testi
```javascript
// Browser console'da çalıştırın
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Test bağlantısı
supabase.from('users').select('*').limit(1)
  .then(({ data, error }) => {
    console.log('Data:', data)
    console.log('Error:', error)
  })
```

### 5.2 Tablo Yapısı Kontrolü
```sql
-- Tablo yapısını kontrol edin
\d salary_records
\d overtime
\d leaves
```

## 6. Çözüm Adımları

1. **Environment Variables**: `.env` dosyasını doğru değerlerle güncelleyin
2. **Database Schema**: `supabase-schema.sql` dosyasını Supabase'de çalıştırın
3. **RLS Policies**: RLS politikalarının doğru çalıştığından emin olun
4. **Authentication**: Kullanıcının doğru şekilde giriş yaptığından emin olun
5. **Table Structure**: Tablo yapısının kod ile uyumlu olduğundan emin olun

## 7. Test Sonrası

Başarılı bir test sonrasında:
1. RLS'yi tekrar etkinleştirin
2. Production ortamında güvenlik ayarlarını kontrol edin
3. Error handling'i test edin

## 8. Yardım

Eğer sorun devam ederse:
1. Console hatalarını paylaşın
2. Network sekmesindeki API çağrılarını paylaşın
3. Supabase Dashboard'daki log'ları kontrol edin
