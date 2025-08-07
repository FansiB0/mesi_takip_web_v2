import { supabase } from '../config/supabase';

// Güvenlik ayarları veri tipi
export interface SecuritySettings {
  id?: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'sms' | 'app';
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  passwordChangeRequired: boolean;
  lastPasswordChange: string;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockoutUntil: string | null;
  sessionTimeout: number; // dakika
  maxConcurrentSessions: number;
  ipWhitelist: string[];
  created_at?: string;
  updated_at?: string;
}

// Varsayılan güvenlik ayarları
export const defaultSecuritySettings: Omit<SecuritySettings, 'id' | 'userId' | 'created_at' | 'updated_at'> = {
  twoFactorEnabled: false,
  twoFactorMethod: 'email',
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  passwordChangeRequired: false,
  lastPasswordChange: new Date().toISOString(),
  failedLoginAttempts: 0,
  accountLocked: false,
  lockoutUntil: null,
  sessionTimeout: 30,
  maxConcurrentSessions: 3,
  ipWhitelist: []
};

// Güvenlik servisi
export const securityService = {
  // Güvenlik ayarlarını oluştur
  async createSecuritySettings(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_settings')
        .insert({
          userId,
          ...defaultSecuritySettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating security settings:', error);
      return false;
    }
  },

  // Güvenlik ayarlarını getir
  async getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Kayıt bulunamadı
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting security settings:', error);
      return null;
    }
  },

  // Güvenlik ayarlarını güncelle
  async updateSecuritySettings(userId: string, updates: Partial<SecuritySettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('userId', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating security settings:', error);
      return false;
    }
  },

  // 2FA durumunu kontrol et
  async checkTwoFactorStatus(userId: string): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings(userId);
      return settings?.twoFactorEnabled || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  },

  // 2FA'yı etkinleştir
  async enableTwoFactor(userId: string, method: 'email' | 'sms' | 'app'): Promise<boolean> {
    try {
      const success = await this.updateSecuritySettings(userId, {
        twoFactorEnabled: true,
        twoFactorMethod: method
      });

      if (success) {
        console.log(`✅ 2FA enabled with method: ${method}`);
      }

      return success;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  },

  // 2FA'yı devre dışı bırak
  async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      const success = await this.updateSecuritySettings(userId, {
        twoFactorEnabled: false
      });

      if (success) {
        console.log('✅ 2FA disabled');
      }

      return success;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  },

  // Başarısız giriş denemesini kaydet
  async recordFailedLogin(userId: string): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings(userId);
      if (!settings) {
        await this.createSecuritySettings(userId);
      }

      const currentAttempts = settings?.failedLoginAttempts || 0;
      const newAttempts = currentAttempts + 1;
      const maxAttempts = 5;
      const lockoutDuration = 15; // dakika

      let updates: Partial<SecuritySettings> = {
        failedLoginAttempts: newAttempts
      };

      // Hesabı kilitle
      if (newAttempts >= maxAttempts) {
        const lockoutUntil = new Date();
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + lockoutDuration);
        
        updates = {
          ...updates,
          accountLocked: true,
          lockoutUntil: lockoutUntil.toISOString()
        };
      }

      const success = await this.updateSecuritySettings(userId, updates);
      return success;
    } catch (error) {
      console.error('Error recording failed login:', error);
      return false;
    }
  },

  // Başarılı girişi kaydet
  async recordSuccessfulLogin(userId: string): Promise<boolean> {
    try {
      const success = await this.updateSecuritySettings(userId, {
        failedLoginAttempts: 0,
        accountLocked: false,
        lockoutUntil: null
      });

      if (success) {
        console.log('✅ Successful login recorded');
      }

      return success;
    } catch (error) {
      console.error('Error recording successful login:', error);
      return false;
    }
  },

  // Hesap kilitli mi kontrol et
  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings(userId);
      if (!settings) return false;

      if (!settings.accountLocked) return false;

      // Kilit süresi dolmuş mu kontrol et
      if (settings.lockoutUntil) {
        const lockoutTime = new Date(settings.lockoutUntil);
        const now = new Date();
        
        if (now > lockoutTime) {
          // Kilit süresi dolmuş, kilidi kaldır
          await this.updateSecuritySettings(userId, {
            accountLocked: false,
            lockoutUntil: null,
            failedLoginAttempts: 0
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  },

  // Şifre değişikliğini kaydet
  async recordPasswordChange(userId: string): Promise<boolean> {
    try {
      const success = await this.updateSecuritySettings(userId, {
        lastPasswordChange: new Date().toISOString(),
        passwordChangeRequired: false
      });

      if (success) {
        console.log('✅ Password change recorded');
      }

      return success;
    } catch (error) {
      console.error('Error recording password change:', error);
      return false;
    }
  },

  // Şifre değişikliği gerekli mi kontrol et
  async isPasswordChangeRequired(userId: string): Promise<boolean> {
    try {
      const settings = await this.getSecuritySettings(userId);
      return settings?.passwordChangeRequired || false;
    } catch (error) {
      console.error('Error checking password change requirement:', error);
      return false;
    }
  },

  // Şifre değişikliği gerekli olarak işaretle
  async requirePasswordChange(userId: string): Promise<boolean> {
    try {
      const success = await this.updateSecuritySettings(userId, {
        passwordChangeRequired: true
      });

      if (success) {
        console.log('✅ Password change required');
      }

      return success;
    } catch (error) {
      console.error('Error requiring password change:', error);
      return false;
    }
  }
}; 