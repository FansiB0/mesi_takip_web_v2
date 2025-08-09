-- Overtime tablosuna eksik sütunları ekle
-- Bu scripti Supabase SQL Editor'da çalıştır

-- 1. hourly_rate sütunu ekle
ALTER TABLE overtime 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;

-- 2. overtime_type sütunu ekle  
ALTER TABLE overtime 
ADD COLUMN IF NOT EXISTS overtime_type VARCHAR(50) DEFAULT 'normal';

-- 3. total_payment sütunu ekle
ALTER TABLE overtime 
ADD COLUMN IF NOT EXISTS total_payment DECIMAL(10,2) DEFAULT 0;

-- 4. overtime_type için CHECK constraint ekle
ALTER TABLE overtime 
DROP CONSTRAINT IF EXISTS overtime_type_check;

ALTER TABLE overtime 
ADD CONSTRAINT overtime_type_check 
CHECK (overtime_type IN ('normal', 'weekend', 'holiday'));

-- 5. Mevcut verileri güncelle (varsa)
UPDATE overtime 
SET hourly_rate = 150.00 
WHERE hourly_rate IS NULL OR hourly_rate = 0;

UPDATE overtime 
SET overtime_type = 'normal' 
WHERE overtime_type IS NULL OR overtime_type = '';

UPDATE overtime 
SET total_payment = COALESCE(hours * hourly_rate * 1.5, 0)
WHERE total_payment IS NULL OR total_payment = 0;

-- 6. Sonuçları kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'overtime' 
ORDER BY ordinal_position;
