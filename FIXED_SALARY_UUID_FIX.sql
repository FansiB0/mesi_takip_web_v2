-- UUID vs TEXT HATASI DÜZELTMESİ
-- Bu script'i Supabase SQL Editor'de çalıştırın

-- 1. Mevcut tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. User_id kolonunu UUID tipine çevir
ALTER TABLE salary_records ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- 3. Eksik kolonları ekle (eğer yoksa)
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

-- 4. Month ve Year kolonlarını integer yap
ALTER TABLE salary_records ALTER COLUMN month TYPE INTEGER USING month::INTEGER;
ALTER TABLE salary_records ALTER COLUMN year TYPE INTEGER USING year::INTEGER;

-- 5. RLS politikalarını sil ve yeniden oluştur (UUID ile uyumlu)
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can insert own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can update own salaries" ON salary_records;
DROP POLICY IF EXISTS "Users can delete own salaries" ON salary_records;

-- 6. RLS'yi tekrar aktif et
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;

-- 7. Yeni UUID uyumlu RLS politikaları
CREATE POLICY "Users can view own salaries" ON salary_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own salaries" ON salary_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own salaries" ON salary_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own salaries" ON salary_records
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Güncellenmiş tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Test verisi ekle
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
    auth.uid(),  -- Şu anki kullanıcının UUID'si
    8,  -- Ağustos
    2025,
    35000.00,
    30000.00,
    2000.00,
    500.00,
    NOW(),
    NOW()
) ON CONFLICT (user_id, month, year) DO NOTHING;

SELECT 'UUID FIX COMPLETED SUCCESSFULLY!' as result;
