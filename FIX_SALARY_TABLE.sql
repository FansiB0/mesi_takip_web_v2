-- 🔍 ÖNCE MEVCUT TABLO YAPISINI KONTROL ET
SELECT 'SALARY_RECORDS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
ORDER BY ordinal_position;

-- EĞER KOLONLAR YOKSA EKLE
DO $$
BEGIN
    -- gross_salary kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salary_records' AND column_name = 'gross_salary') THEN
        ALTER TABLE salary_records ADD COLUMN gross_salary DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- net_salary kolonu ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salary_records' AND column_name = 'net_salary') THEN
        ALTER TABLE salary_records ADD COLUMN net_salary DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- bonus kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salary_records' AND column_name = 'bonus') THEN
        ALTER TABLE salary_records ADD COLUMN bonus DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- bes_deduction kolonu ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'salary_records' AND column_name = 'bes_deduction') THEN
        ALTER TABLE salary_records ADD COLUMN bes_deduction DECIMAL(12,2) DEFAULT 0;
    END IF;
END
$$;

-- TÜM RLS'İ KAPAT
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings DISABLE ROW LEVEL SECURITY;

-- POLICY'LERİ SİL
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "salary_records_policy" ON salary_records;
DROP POLICY IF EXISTS "overtime_policy" ON overtime;  
DROP POLICY IF EXISTS "leaves_policy" ON leaves;
DROP POLICY IF EXISTS "user_settings_policy" ON user_settings;

-- ERİŞİM İZİNLERİ
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON salary_records TO anon, authenticated;
GRANT ALL ON overtime TO anon, authenticated;
GRANT ALL ON leaves TO anon, authenticated;
GRANT ALL ON user_settings TO anon, authenticated;

-- ADMİN KULLANICISI
UPDATE users SET role = 'admin' WHERE email = 'abdulkadir06akcan@gmail.com';

-- OVERTIME DESCRİPTİON NULL OLABİLSİN
ALTER TABLE overtime ALTER COLUMN description DROP NOT NULL;

-- TEST DATA EKLE (ARTIK DOĞRU KOLONLARLA)
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

-- SONUÇLARI KONTROL ET
SELECT 'UPDATED TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
ORDER BY ordinal_position;

SELECT 'DATA CHECK:' as info;
SELECT COUNT(*) as salary_count FROM salary_records WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';

SELECT '✅ TABLO YAPISI DÜZELTİLDİ!' as status;
