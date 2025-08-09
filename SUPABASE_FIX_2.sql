-- Users tablosu ve foreign key sorununu çöz
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. Önce mevcut user_settings tablosunu sil
DROP TABLE IF EXISTS user_settings CASCADE;

-- 2. users tablosunu kontrol et ve gerekirse oluştur
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. auth.users'dan public.users'a kullanıcıları kopyala
INSERT INTO users (id, email, name, role, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', email) as name,
    COALESCE(raw_user_meta_data->>'role', 'user') as role,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- 4. user_settings tablosunu yeniden oluştur
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Index oluştur
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 6. Trigger oluştur (fonksiyon zaten mevcut olmalı)
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS'yi devre dışı bırak (test için)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;

-- 8. Test verisi ekle
INSERT INTO user_settings (user_id, settings) VALUES 
('7ae2ff65-044d-49eb-9689-0267a5523adb', '{"theme": "light", "language": "tr", "salary": {"defaultNetSalary": "30000"}}')
ON CONFLICT (user_id) DO UPDATE SET 
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- 9. Kontrol sorguları
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'User settings count:' as info, COUNT(*) as count FROM user_settings;
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;

-- 10. Belirli kullanıcıyı kontrol et
SELECT * FROM users WHERE id = '7ae2ff65-044d-49eb-9689-0267a5523adb';
SELECT * FROM user_settings WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';
