-- COMPLETE SCHEMA FIX - Tüm Veri Türlerini Destekle
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. SALARY_RECORDS tablosunu düzelt (month veri tipi)
ALTER TABLE salary_records 
DROP COLUMN IF EXISTS month CASCADE;

ALTER TABLE salary_records 
ADD COLUMN month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12);

-- 2. USER_PROFILES tablosuna eksik sütunları ekle
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;

-- 3. OVERTIME tablosuna eksik sütunları ekle
ALTER TABLE overtime 
ADD COLUMN IF NOT EXISTS overtime_type VARCHAR(20) DEFAULT 'normal' CHECK (overtime_type IN ('normal', 'weekend', 'holiday')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);

-- 4. LEAVES tablosunu genişlet
-- Önce mevcut type constraint'ini kaldır
ALTER TABLE leaves DROP CONSTRAINT IF EXISTS leaves_type_check;

-- Yeni type seçenekleri ekle
ALTER TABLE leaves 
ADD CONSTRAINT leaves_type_check 
CHECK (type IN ('annual', 'unpaid', 'sick', 'maternity', 'bereavement', 'administrative', 'personal', 'other'));

-- Gün sayısını hesaplayan fonksiyon
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS days_used INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
    THEN (end_date - start_date + 1)
    ELSE 0 
  END
) STORED;

-- 5. Tüm tabloların güncel yapısını kontrol et

-- Users tablosu
SELECT 'USERS TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- User_profiles tablosu
SELECT 'USER_PROFILES TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Salary_records tablosu
SELECT 'SALARY_RECORDS TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'salary_records' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Overtime tablosu
SELECT 'OVERTIME TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'overtime' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Leaves tablosu
SELECT 'LEAVES TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'leaves' AND table_schema = 'public'
ORDER BY ordinal_position;

-- User_settings tablosu
SELECT 'USER_SETTINGS TABLE' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. RLS'yi geçici olarak kapat
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
