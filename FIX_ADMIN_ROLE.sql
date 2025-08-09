-- Admin rolünü düzgün şekilde ayarla
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut kullanıcıyı kontrol et
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'abdulkadir06akcan@gmail.com';

-- 2. Admin rolü ver
UPDATE users 
SET role = 'admin' 
WHERE email = 'abdulkadir06akcan@gmail.com';

-- 3. Sonucu kontrol et
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'abdulkadir06akcan@gmail.com';

-- 4. Tüm admin kullanıcıları listele
SELECT email, name, role 
FROM users 
WHERE role = 'admin';
