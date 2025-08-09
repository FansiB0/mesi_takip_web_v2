-- FINAL SALARY TABLE FIX
-- Bu script'i Supabase SQL Editor'de çalıştırın

-- 1. Mevcut salary_records tablosunu kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Eksik kolonları ekle (eğer yoksa)
DO $$ 
BEGIN
    -- gross_salary kolonu ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_records' AND column_name = 'gross_salary'
    ) THEN
        ALTER TABLE salary_records ADD COLUMN gross_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'gross_salary column added';
    END IF;

    -- net_salary kolonu ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_records' AND column_name = 'net_salary'
    ) THEN
        ALTER TABLE salary_records ADD COLUMN net_salary DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'net_salary column added';
    END IF;

    -- bonus kolonu ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_records' AND column_name = 'bonus'
    ) THEN
        ALTER TABLE salary_records ADD COLUMN bonus DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'bonus column added';
    END IF;

    -- bes_deduction kolonu ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_records' AND column_name = 'bes_deduction'
    ) THEN
        ALTER TABLE salary_records ADD COLUMN bes_deduction DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'bes_deduction column added';
    END IF;
END $$;

-- 3. Month kolonu integer olarak ayarla
ALTER TABLE salary_records ALTER COLUMN month TYPE INTEGER USING month::INTEGER;

-- 4. Year kolonu integer olarak ayarla  
ALTER TABLE salary_records ALTER COLUMN year TYPE INTEGER USING year::INTEGER;

-- 5. Tablo yapısını tekrar kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. RLS politikalarını güncelle (gerekirse)
DROP POLICY IF EXISTS "Users can view own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can insert own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can update own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can delete own salaries" ON salary_records;

-- Yeni RLS politikaları
CREATE POLICY "Users can view own salaries" ON salary_records
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own salaries" ON salary_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own salaries" ON salary_records
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own salaries" ON salary_records
    FOR DELETE USING (auth.uid()::text = user_id);

-- 7. Test verisi ekle
INSERT INTO salary_records (
    user_id, 
    month, 
    year, 
    gross_salary, 
    net_salary, 
    bonus, 
    bes_deduction,
    created_at,
    updated_at
) VALUES (
    '7ae2ff65-044d-49eb-9689-0267a5523adb',  -- Kullanıcı ID'nizi buraya yazın
    8,  -- Ağustos
    2025,
    35000.00,
    30000.00,
    2000.00,
    500.00,
    NOW(),
    NOW()
) ON CONFLICT (user_id, month, year) DO NOTHING;

SELECT 'SALARY TABLE FIX COMPLETED!' as result;
