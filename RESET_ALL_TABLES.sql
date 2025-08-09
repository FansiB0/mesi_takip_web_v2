-- 🗑️ TÜM TABLOLARI SİL VE SIFIRDAN OLUŞTUR

-- 1. ÖNCE TÜM TABLOLARI SİL (cascade ile bağımlılıkları da sil)
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS overtime CASCADE;
DROP TABLE IF EXISTS salary_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. USERS TABLOSU (ANA TABLO)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    employee_type VARCHAR(20) DEFAULT 'normal' CHECK (employee_type IN ('normal', 'manager', 'admin')),
    start_date DATE,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SALARY_RECORDS TABLOSU (TEMİZ VE AÇIK)
CREATE TABLE salary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
    gross_salary DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    bonus DECIMAL(12,2) DEFAULT 0,
    bes_deduction DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- 4. OVERTIME TABLOSU (TEMİZ)
CREATE TABLE overtime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT,
    overtime_type VARCHAR(50) DEFAULT 'normal',
    hourly_rate DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEAVES TABLOSU (TEMİZ)
CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(50) DEFAULT 'annual' CHECK (type IN ('annual', 'sick', 'personal', 'other')),
    leave_type VARCHAR(50) DEFAULT 'annual' CHECK (leave_type IN ('annual', 'unpaid', 'sick', 'maternity', 'bereavement', 'administrative', 'personal', 'other')),
    days_used INTEGER NOT NULL CHECK (days_used > 0),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- 6. USER_SETTINGS TABLOSU (JSONB İLE TEMİZ)
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TRİGGER FONKSİYONU (updated_at otomatik güncelleme)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. TRİGGERLARI EKLE
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salary_records_updated_at BEFORE UPDATE ON salary_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_overtime_updated_at BEFORE UPDATE ON overtime FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS'İ KAPAT (Test için)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 10. İZİNLERİ VER
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON salary_records TO anon, authenticated;
GRANT ALL ON overtime TO anon, authenticated;
GRANT ALL ON leaves TO anon, authenticated;
GRANT ALL ON user_settings TO anon, authenticated;

-- 11. SİZİN KULLANICI KAYDINIZI OLUŞTUR (Eğer yoksa)
INSERT INTO users (id, email, name, role, employee_type, start_date) 
VALUES (
    '7ae2ff65-044d-49eb-9689-0267a5523adb',
    'abdulkadir06akcan@gmail.com',
    'Abdulkadir Akcan',
    'admin',
    'admin',
    '2024-01-01'
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    employee_type = 'admin';

-- 12. TEST VERİLERİ EKLE
INSERT INTO salary_records (user_id, month, year, gross_salary, net_salary, bonus, bes_deduction) VALUES
('7ae2ff65-044d-49eb-9689-0267a5523adb', 1, 2024, 20000, 16000, 2000, 1000),
('7ae2ff65-044d-49eb-9689-0267a5523adb', 2, 2024, 22000, 17500, 1500, 800);

INSERT INTO overtime (user_id, date, hours, description, status) VALUES
('7ae2ff65-044d-49eb-9689-0267a5523adb', '2024-01-15', 4, 'Proje teslimi', 'approved'),
('7ae2ff65-044d-49eb-9689-0267a5523adb', '2024-01-20', 2, 'Acil toplantı', 'approved');

INSERT INTO leaves (user_id, start_date, end_date, type, leave_type, days_used, reason, status) VALUES
('7ae2ff65-044d-49eb-9689-0267a5523adb', '2024-01-25', '2024-01-25', 'annual', 'annual', 1, 'Kişisel işler', 'approved'),
('7ae2ff65-044d-49eb-9689-0267a5523adb', '2024-02-10', '2024-02-12', 'sick', 'sick', 3, 'Hastalık', 'approved');

INSERT INTO user_settings (user_id, settings) VALUES
('7ae2ff65-044d-49eb-9689-0267a5523adb', '{
    "theme": "dark",
    "language": "tr",
    "salary": {
        "defaultNetSalary": "18000",
        "defaultHourlyRate": "150",
        "currency": "TRY"
    },
    "notifications": {
        "emailNotifications": true,
        "salaryReminder": true
    }
}');

-- 13. SONUÇLARI KONTROL ET
SELECT 'USERS:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'SALARY_RECORDS:', COUNT(*) FROM salary_records
UNION ALL
SELECT 'OVERTIME:', COUNT(*) FROM overtime
UNION ALL
SELECT 'LEAVES:', COUNT(*) FROM leaves
UNION ALL
SELECT 'USER_SETTINGS:', COUNT(*) FROM user_settings;

SELECT '🎉 TÜM TABLOLAR TEMİZ BİR ŞEKİLDE OLUŞTURULDU!' as status;
SELECT '✅ Test verileri eklendi!' as data_status;
SELECT '🔑 Admin yetkisi: abdulkadir06akcan@gmail.com' as admin_info;
