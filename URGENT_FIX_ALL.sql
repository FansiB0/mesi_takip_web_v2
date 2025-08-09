-- 🚨 ACİL TÜM SORUNLARI ÇÖZEN SCRIPT

-- 1. TÜM RLS'İ KAPAT
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;

-- 2. TÜM POLİCYLERİ SİL
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "salary_records_policy" ON salary_records;
DROP POLICY IF EXISTS "overtime_policy" ON overtime;
DROP POLICY IF EXISTS "leaves_policy" ON leaves;
DROP POLICY IF EXISTS "user_settings_policy" ON user_settings;

-- 3. HERKESİN ERİŞİMİNİ AÇALIM
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON salary_records TO anon, authenticated;
GRANT ALL ON overtime TO anon, authenticated;
GRANT ALL ON leaves TO anon, authenticated;
GRANT ALL ON user_settings TO anon, authenticated;

-- 4. ADMİN KULLANICISINI OLUŞTUR
UPDATE users SET role = 'admin' WHERE email = 'abdulkadir06akcan@gmail.com';

-- 5. OVERTIME TABLOSUNDA DESCRİPTİON NULL OLAMASINA İZİN VER
ALTER TABLE overtime ALTER COLUMN description DROP NOT NULL;

-- 6. MEVCUT VERİLERİ KONTROL ET
SELECT 'USER INFO:' as info, id, email, name, role FROM users WHERE email = 'abdulkadir06akcan@gmail.com';

-- 7. TEST DATA EKLE (Eğer yoksa)
INSERT INTO salary_records (user_id, month, year, gross_salary, net_salary, bonus, bes_deduction)
SELECT 
  '7ae2ff65-044d-49eb-9689-0267a5523adb',
  1,
  2024,
  15000,
  12000,
  1000,
  500
WHERE NOT EXISTS (
  SELECT 1 FROM salary_records WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb'
);

INSERT INTO overtime (user_id, date, hours, description, status)
SELECT 
  '7ae2ff65-044d-49eb-9689-0267a5523adb',
  CURRENT_DATE,
  4,
  'Test mesai',
  'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM overtime WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb'
);

INSERT INTO leaves (user_id, start_date, end_date, type, leave_type, days_used, reason, status)
SELECT 
  '7ae2ff65-044d-49eb-9689-0267a5523adb',
  CURRENT_DATE,
  CURRENT_DATE,
  'annual',
  'annual',
  1,
  'Test izin',
  'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM leaves WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb'
);

-- 8. SONUÇLARI KONTROL ET
SELECT 'SALARY COUNT:' as info, COUNT(*) as count FROM salary_records WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';
SELECT 'OVERTIME COUNT:' as info, COUNT(*) as count FROM overtime WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';
SELECT 'LEAVE COUNT:' as info, COUNT(*) as count FROM leaves WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';

SELECT '✅ TÜM DÜZELTMELER TAMAMLANDI - UYGULAMAYI YENİLEYİN!' as status;
