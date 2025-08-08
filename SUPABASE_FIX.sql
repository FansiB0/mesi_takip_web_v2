-- Geçici RLS Bypass (Test için)
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi geçici olarak devre dışı bırak
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;

-- 2. user_settings tablosunu yeniden oluştur (eğer varsa sil)
DROP TABLE IF EXISTS user_settings CASCADE;

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Index oluştur
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 4. Trigger oluştur
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Test verisi ekle (opsiyonel)
-- INSERT INTO user_settings (user_id, settings) VALUES 
-- ('7ae2ff65-044d-49eb-9689-0267a5523adb', '{"theme": "light", "language": "tr", "salary": {"defaultNetSalary": "30000"}}');

-- 6. Tabloları kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_settings', 'salary_records', 'overtime', 'leaves');

-- 7. Kullanıcıyı kontrol et
SELECT * FROM auth.users WHERE email LIKE '%@%';

-- 8. Test sorgusu
SELECT * FROM user_settings LIMIT 5;
