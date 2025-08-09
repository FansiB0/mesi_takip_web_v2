-- UUID DÜZELTMESİ - TEST VERİSİ OLMADAN
-- Bu script'i Supabase SQL Editor'de çalıştırın

-- 1. Mevcut tablo yapılarını kontrol et
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE column_name IN ('user_id', 'id') 
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 2. USERS tablosu - ID'yi UUID yap
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;

-- 3. SALARY_RECORDS tablosu düzelt
ALTER TABLE salary_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Eksik kolonları ekle
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_records' AND column_name = 'gross_salary') THEN
        ALTER TABLE salary_records ADD COLUMN gross_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'gross_salary column added to salary_records';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_records' AND column_name = 'net_salary') THEN
        ALTER TABLE salary_records ADD COLUMN net_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'net_salary column added to salary_records';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_records' AND column_name = 'bonus') THEN
        ALTER TABLE salary_records ADD COLUMN bonus DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'bonus column added to salary_records';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_records' AND column_name = 'bes_deduction') THEN
        ALTER TABLE salary_records ADD COLUMN bes_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'bes_deduction column added to salary_records';
    END IF;
END $$;

-- Month/Year integer yap
ALTER TABLE salary_records ALTER COLUMN month TYPE INTEGER USING month::INTEGER;
ALTER TABLE salary_records ALTER COLUMN year TYPE INTEGER USING year::INTEGER;

-- 4. OVERTIME tablosu düzelt
ALTER TABLE overtime ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Eksik kolonları ekle
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'overtime' AND column_name = 'hourly_rate') THEN
        ALTER TABLE overtime ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'hourly_rate column added to overtime';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'overtime' AND column_name = 'overtime_type') THEN
        ALTER TABLE overtime ADD COLUMN overtime_type VARCHAR(50) DEFAULT 'normal';
        RAISE NOTICE 'overtime_type column added to overtime';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'overtime' AND column_name = 'total_payment') THEN
        ALTER TABLE overtime ADD COLUMN total_payment DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'total_payment column added to overtime';
    END IF;
END $$;

-- 5. LEAVES tablosu düzelt
ALTER TABLE leaves ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Eksik kolonları ekle
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leaves' AND column_name = 'leave_type') THEN
        ALTER TABLE leaves ADD COLUMN leave_type VARCHAR(50) DEFAULT 'annual';
        RAISE NOTICE 'leave_type column added to leaves';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leaves' AND column_name = 'days_used') THEN
        ALTER TABLE leaves ADD COLUMN days_used INTEGER DEFAULT 1;
        RAISE NOTICE 'days_used column added to leaves';
    END IF;
END $$;

-- 6. USER_SETTINGS tablosu düzelt
ALTER TABLE user_settings ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 7. TÜM RLS POLİTİKALARINI GÜNCELLEMe

-- SALARY_RECORDS
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can insert own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can update own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can delete own salaries" ON salary_records;

ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own salaries" ON salary_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own salaries" ON salary_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own salaries" ON salary_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own salaries" ON salary_records FOR DELETE USING (auth.uid() = user_id);

-- OVERTIME
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own overtime" ON overtime;
DROP POLICY IF EXISTS "Users can insert own overtime" ON overtime;
DROP POLICY IF EXISTS "Users can update own overtime" ON overtime;
DROP POLICY IF EXISTS "Users can delete own overtime" ON overtime;

ALTER TABLE overtime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own overtime" ON overtime FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own overtime" ON overtime FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own overtime" ON overtime FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own overtime" ON overtime FOR DELETE USING (auth.uid() = user_id);

-- LEAVES
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own leaves" ON leaves;
DROP POLICY IF EXISTS "Users can insert own leaves" ON leaves;
DROP POLICY IF EXISTS "Users can update own leaves" ON leaves;
DROP POLICY IF EXISTS "Users can delete own leaves" ON leaves;

ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own leaves" ON leaves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leaves" ON leaves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leaves" ON leaves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leaves" ON leaves FOR DELETE USING (auth.uid() = user_id);

-- USER_SETTINGS
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- 8. Güncellenmiş yapıları kontrol et
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE column_name IN ('user_id', 'id') 
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 9. Test için mevcut kayıtları kontrol et
SELECT COUNT(*) as salary_count FROM salary_records;
SELECT COUNT(*) as overtime_count FROM overtime;
SELECT COUNT(*) as leaves_count FROM leaves;
SELECT COUNT(*) as users_count FROM users;

SELECT 'UUID FIX COMPLETED - NO TEST DATA INSERTED!' as result;
