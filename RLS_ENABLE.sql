-- Güvenli RLS Politikalarını Etkinleştir
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. RLS'yi etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- 2. Users tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 3. User_settings tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Salary_records tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view their own salary records" ON salary_records;
CREATE POLICY "Users can view their own salary records" ON salary_records
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own salary records" ON salary_records;
CREATE POLICY "Users can insert their own salary records" ON salary_records
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own salary records" ON salary_records;
CREATE POLICY "Users can update their own salary records" ON salary_records
    FOR UPDATE USING (user_id = auth.uid());

-- 5. Overtime tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view their own overtime" ON overtime;
CREATE POLICY "Users can view their own overtime" ON overtime
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own overtime" ON overtime;
CREATE POLICY "Users can insert their own overtime" ON overtime
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own overtime" ON overtime;
CREATE POLICY "Users can update their own overtime" ON overtime
    FOR UPDATE USING (user_id = auth.uid());

-- 6. Leaves tablosu için RLS politikaları
DROP POLICY IF EXISTS "Users can view their own leaves" ON leaves;
CREATE POLICY "Users can view their own leaves" ON leaves
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own leaves" ON leaves;
CREATE POLICY "Users can insert their own leaves" ON leaves
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own leaves" ON leaves;
CREATE POLICY "Users can update their own leaves" ON leaves
    FOR UPDATE USING (user_id = auth.uid());

-- 7. Kontrol sorguları
SELECT 'RLS Status:' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users') THEN 'Enabled' ELSE 'Disabled' END as status;

SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
