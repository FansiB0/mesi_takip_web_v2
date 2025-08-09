-- SALARY_RECORDS Tablosunu Tamamen Yeniden Oluştur
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut tabloyu kontrol edelim
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Mevcut tabloyu sil (eğer varsa)
DROP TABLE IF EXISTS salary_records CASCADE;

-- 3. Tabloyu doğru şekilde yeniden oluştur
CREATE TABLE salary_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2050),
    gross_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    bes_deduction DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Her kullanıcı için ay/yıl kombinasyonu benzersiz olmalı
    UNIQUE(user_id, month, year)
);

-- 4. İndeks oluştur
CREATE INDEX idx_salary_records_user_id ON salary_records(user_id);
CREATE INDEX idx_salary_records_date ON salary_records(year, month);

-- 5. Updated_at trigger'ı ekle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salary_records_updated_at 
    BEFORE UPDATE ON salary_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS'yi geçici olarak kapat
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;

-- 7. Tablonun doğru oluşturulduğunu kontrol et
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Test verisi ekle (isteğe bağlı)
-- INSERT INTO salary_records (user_id, month, year, gross_salary, net_salary, bonus, bes_deduction)
-- VALUES ('7ae2ff65-044d-49eb-9689-0267a5523adb', 1, 2025, 50000, 40000, 5000, 1000);

-- 9. Beklenen sütun yapısı:
-- id, user_id, month, year, gross_salary, net_salary, bonus, bes_deduction, created_at, updated_at
