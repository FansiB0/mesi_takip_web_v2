-- İlk Admin Kullanıcısını Oluştur
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut kullanıcıları kontrol et
SELECT email, name, role FROM users;

-- 2. Specific email'i admin yap
UPDATE users 
SET role = 'admin' 
WHERE email = 'abdulkadir06akcan@gmail.com';

-- 3. Eğer kullanıcı yoksa manuel oluştur
INSERT INTO users (id, email, name, role, start_date)
VALUES (
    '7ae2ff65-044d-49eb-9689-0267a5523adb',
    'abdulkadir06akcan@gmail.com',
    'Abdulkadir Akcan',
    'admin',
    CURRENT_DATE
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    name = EXCLUDED.name;

-- 4. Sonucu kontrol et
SELECT email, name, role, created_at FROM users 
WHERE email = 'abdulkadir06akcan@gmail.com';

-- 5. Tüm admin kullanıcıları listele
SELECT email, name, role FROM users WHERE role = 'admin';
