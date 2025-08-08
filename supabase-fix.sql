-- user_settings tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS'yi etkinleştir
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies ekle
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all settings" ON user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger ekle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
