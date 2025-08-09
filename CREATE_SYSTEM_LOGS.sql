-- 📊 SYSTEM_LOGS TABLOSUNU OLUŞTUR

-- system_logs tablosunu oluştur
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('error', 'warn', 'info', 'debug')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS kapat
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- İzinleri ver
GRANT ALL ON system_logs TO anon, authenticated;

-- Test verisi ekle
INSERT INTO system_logs (level, message, context, user_id) VALUES
('info', 'Kullanıcı giriş yaptı', '{"ip": "192.168.1.1", "userAgent": "Chrome"}', '7ae2ff65-044d-49eb-9689-0267a5523adb'),
('info', 'Maaş kaydı eklendi', '{"amount": 20000, "month": 1, "year": 2024}', '7ae2ff65-044d-49eb-9689-0267a5523adb'),
('info', 'Mesai kaydı eklendi', '{"hours": 4, "date": "2024-01-15"}', '7ae2ff65-044d-49eb-9689-0267a5523adb'),
('warn', 'Yetki kontrolü', '{"action": "admin_panel_access"}', '7ae2ff65-044d-49eb-9689-0267a5523adb'),
('info', 'Ayarlar güncellendi', '{"section": "salary", "updated_fields": ["defaultNetSalary"]}', '7ae2ff65-044d-49eb-9689-0267a5523adb');

SELECT 'SYSTEM_LOGS TABLOSU OLUŞTURULDU ✅' as durum;
SELECT COUNT(*) || ' adet log kaydı eklendi' as test_veri FROM system_logs;
