-- SALARY_RECORDS Tablosu için Eksik Sütunları Ekle
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce mevcut salary_records tablosunu kontrol edelim
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- TÜM eksik sütunları ekle
ALTER TABLE salary_records 
ADD COLUMN IF NOT EXISTS bonus DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bes_deduction DECIMAL(10,2) DEFAULT 0;

-- Eski sütunları kaldır (eğer varsa)
ALTER TABLE salary_records 
DROP COLUMN IF EXISTS base_salary CASCADE,
DROP COLUMN IF EXISTS overtime_pay CASCADE,
DROP COLUMN IF EXISTS deductions CASCADE;

-- Güncellenmiş tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'salary_records' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test için örnek veri ekle (isteğe bağlı)
-- INSERT INTO salary_records (user_id, month, year, gross_salary, net_salary, bonus, bes_deduction)
-- VALUES ('7ae2ff65-044d-49eb-9689-0267a5523adb', 1, 2025, 50000, 40000, 5000, 1000);

-- Expected final columns:
-- id, user_id, month, year, gross_salary, net_salary, bonus, bes_deduction, created_at, updated_at
