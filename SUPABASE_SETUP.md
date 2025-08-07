# Supabase Kurulum Rehberi

Bu rehber, Mesai Takip Web uygulamasını Firebase'den Supabase'e geçirmek için adım adım talimatları içerir.

## 🎯 Amaç

Firebase'den Supabase'e geçiş yaparak daha güvenilir ve performanslı bir backend çözümü elde etmek.

## 📋 Gereksinimler

- Supabase hesabı
- Node.js 18+
- npm veya yarn

## 🚀 Adım Adım Kurulum

### 1. Supabase Projesi Oluşturma

1. [Supabase Console](https://supabase.com/)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: `mesai-takip-web-v2`
4. Database password belirleyin
5. Region seçin (en yakın bölgeyi seçin)
6. "Create new project" butonuna tıklayın

### 2. Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Supabase Dashboard > SQL Editor'de aşağıdaki SQL komutlarını çalıştırın:

```sql
-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'employee',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles tablosu
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  start_date DATE,
  employee_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaves tablosu
CREATE TABLE IF NOT EXISTS leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Overtime tablosu
CREATE TABLE IF NOT EXISTS overtime (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  overtime_type TEXT NOT NULL,
  hourly_rate DECIMAL(10,2),
  total_payment DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary records tablosu
CREATE TABLE IF NOT EXISTS salary_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings tablosu
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  profile JSONB,
  notifications JSONB,
  salary JSONB,
  working_hours JSONB,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'tr',
  fontSize TEXT DEFAULT 'medium',
  colorScheme TEXT DEFAULT 'blue',
  compactMode BOOLEAN DEFAULT false,
  showAnimations BOOLEAN DEFAULT true,
  sidebarCollapsed BOOLEAN DEFAULT false,
  dashboardLayout TEXT DEFAULT 'grid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs tablosu
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_employee_id ON overtime(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Users tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User profiles tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Leaves tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own leaves" ON leaves;
CREATE POLICY "Users can view own leaves" ON leaves
  FOR SELECT USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Users can insert own leaves" ON leaves;
CREATE POLICY "Users can insert own leaves" ON leaves
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Users can update own leaves" ON leaves;
CREATE POLICY "Users can update own leaves" ON leaves
  FOR UPDATE USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Admins can view all leaves" ON leaves;
CREATE POLICY "Admins can view all leaves" ON leaves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Overtime tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own overtime" ON overtime;
CREATE POLICY "Users can view own overtime" ON overtime
  FOR SELECT USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Users can insert own overtime" ON overtime;
CREATE POLICY "Users can insert own overtime" ON overtime
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Users can update own overtime" ON overtime;
CREATE POLICY "Users can update own overtime" ON overtime
  FOR UPDATE USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Admins can view all overtime" ON overtime;
CREATE POLICY "Admins can view all overtime" ON overtime
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Salary records tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own salary" ON salary_records;
CREATE POLICY "Users can view own salary" ON salary_records
  FOR SELECT USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Admins can manage all salary records" ON salary_records;
CREATE POLICY "Admins can manage all salary records" ON salary_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User settings tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- System logs tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view own logs" ON system_logs;
CREATE POLICY "Users can view own logs" ON system_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all logs" ON system_logs;
CREATE POLICY "Admins can view all logs" ON system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert logs" ON system_logs;
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);
```

### 4. Authentication Ayarları

1. Supabase Dashboard > Authentication > Settings
2. Site URL'yi ayarlayın: `https://your-domain.com`
3. Redirect URLs'e ekleyin:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5174/auth/callback`

### 5. API Anahtarları

Supabase Dashboard > Settings > API'den şu bilgileri alın:
- Project URL
- anon public key

Bu bilgileri `.env` dosyasına ekleyin.

## ✅ Doğrulama

Kurulum tamamlandıktan sonra:

1. Uygulamayı başlatın: `npm run dev`
2. Yeni kullanıcı kaydı yapın
3. Giriş yapın
4. Verilerin Supabase'de göründüğünü kontrol edin

## 🔧 Sorun Giderme

### RLS Hatası
Eğer "new row violates row-level security policy" hatası alırsanız:
1. Supabase Dashboard > Authentication > Policies
2. İlgili tablonun politikalarını kontrol edin
3. Gerekirse politikaları güncelleyin

### Bağlantı Hatası
Eğer Supabase bağlantı hatası alırsanız:
1. Environment variables'ları kontrol edin
2. Supabase projesinin aktif olduğundan emin olun
3. Network bağlantınızı kontrol edin

## 🎉 Başarı!

Artık uygulamanız:
- ✅ Supabase'den bağımsız çalışıyor
- ✅ PostgreSQL veritabanı kullanıyor
- ✅ Row Level Security ile korunuyor
- ✅ Modern authentication sistemi var
