-- SUPABASE GÜVENLİK POLİTİKALARI
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Önce admin yetkisi ver
UPDATE users SET role = 'admin' WHERE email = 'abdulkadir06akcan@gmail.com';

-- 2. RLS'yi etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 3. USERS tablosu politikaları
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 4. USER_PROFILES politikaları
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 5. SALARY_RECORDS politikaları
DROP POLICY IF EXISTS "Users can manage own salary" ON salary_records;
DROP POLICY IF EXISTS "Admins can manage all salaries" ON salary_records;

CREATE POLICY "Users can manage own salary" ON salary_records
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all salaries" ON salary_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 6. OVERTIME politikaları
DROP POLICY IF EXISTS "Users can manage own overtime" ON overtime;
DROP POLICY IF EXISTS "Admins can manage all overtime" ON overtime;

CREATE POLICY "Users can manage own overtime" ON overtime
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all overtime" ON overtime
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 7. LEAVES politikaları
DROP POLICY IF EXISTS "Users can manage own leaves" ON leaves;
DROP POLICY IF EXISTS "Admins can manage all leaves" ON leaves;

CREATE POLICY "Users can manage own leaves" ON leaves
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all leaves" ON leaves
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 8. USER_SETTINGS politikaları
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can manage all settings" ON user_settings;

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all settings" ON user_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- 9. Kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_profiles', 'salary_records', 'overtime', 'leaves', 'user_settings');

-- 10. Admin kullanıcıyı kontrol et
SELECT email, name, role FROM users WHERE role = 'admin';
