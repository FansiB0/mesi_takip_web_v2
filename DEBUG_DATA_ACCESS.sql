-- 🔍 VERİ ERİŞİM SORUNUNU DEBUG ETMEK İÇİN

-- 1. Mevcut kullanıcıyı kontrol et
SELECT 'CURRENT USERS:' as info;
SELECT id, email, name, role FROM users ORDER BY created_at DESC LIMIT 5;

-- 2. RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'salary_records', 'overtime', 'leaves', 'user_settings');

-- 3. Salary records kontrolü
SELECT 'SALARY RECORDS COUNT:' as info;
SELECT user_id, COUNT(*) as record_count FROM salary_records GROUP BY user_id;

-- 4. Overtime records kontrolü  
SELECT 'OVERTIME RECORDS COUNT:' as info;
SELECT user_id, COUNT(*) as record_count FROM overtime GROUP BY user_id;

-- 5. Leave records kontrolü
SELECT 'LEAVE RECORDS COUNT:' as info;
SELECT user_id, COUNT(*) as record_count FROM leaves GROUP BY user_id;

-- 6. Belirli kullanıcı için test (sizin user ID'nizi buraya yazın)
SELECT 'USER SPECIFIC DATA:' as info;
SELECT 
  'salary_records' as table_name,
  COUNT(*) as count 
FROM salary_records 
WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb'
UNION ALL
SELECT 
  'overtime' as table_name,
  COUNT(*) as count 
FROM overtime 
WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb'
UNION ALL
SELECT 
  'leaves' as table_name,
  COUNT(*) as count 
FROM leaves 
WHERE user_id = '7ae2ff65-044d-49eb-9689-0267a5523adb';

-- 7. RLS policies kontrolü
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('salary_records', 'overtime', 'leaves', 'user_settings');
