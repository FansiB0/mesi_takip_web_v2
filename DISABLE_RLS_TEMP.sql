-- 🚨 GEÇİCİ ÇÖZÜM: TÜM RLS'İ KAPAT (SADECE TEST İÇİN)

-- Tüm tabloların RLS'ini kapat
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri sil
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "salary_records_policy" ON salary_records;
DROP POLICY IF EXISTS "overtime_policy" ON overtime;
DROP POLICY IF EXISTS "leaves_policy" ON leaves;
DROP POLICY IF EXISTS "user_settings_policy" ON user_settings;

-- Tablolara herkesin erişebilmesini sağla (GEÇİCİ!)
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON salary_records TO anon, authenticated;
GRANT ALL ON overtime TO anon, authenticated;
GRANT ALL ON leaves TO anon, authenticated;
GRANT ALL ON user_settings TO anon, authenticated;

SELECT 'RLS disabled temporarily - VERİLER ARTIK ERİŞİLEBİLİR OLMALI!' as status;
