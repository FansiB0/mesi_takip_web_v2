import { supabase } from '../config/supabase';

// Kullanıcı ayarları veri tipi
export interface UserSettings {
  id?: string;
  uid: string;
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  fontSize?: 'small' | 'medium' | 'large';
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange';
  compactMode?: boolean;
  showAnimations?: boolean;
  sidebarCollapsed?: boolean;
  dashboardLayout?: 'grid' | 'list' | 'compact';
  notifications: {
    email: boolean;
    push: boolean;
    overtime: boolean;
    leave: boolean;
    salary: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
    performanceReports: boolean;
    weeklySummary: boolean;
    monthlyReport: boolean;
    birthdayReminders: boolean;
    workAnniversary: boolean;
  };
  workingHours: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  overtimeRate: {
    normal: number;
    weekend: number;
    holiday: number;
  };
  salary: {
    defaultNetSalary: string;
    defaultHourlyRate: string;
    currency: string;
    workingDaysPerWeek: string;
    annualLeaveEntitlement: string;
    besContribution: string;
  };
  profile: {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    startDate: string;
    employeeId: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Varsayılan ayarlar
export const defaultSettings: Omit<UserSettings, 'id' | 'uid' | 'created_at' | 'updated_at'> = {
  theme: 'light',
  language: 'tr',
  notifications: {
    email: true,
    push: true,
    overtime: true,
    leave: true,
    salary: true,
    systemUpdates: true,
    securityAlerts: true,
    performanceReports: true,
    weeklySummary: true,
    monthlyReport: true,
    birthdayReminders: true,
    workAnniversary: true
  },
  workingHours: {
    daily: 8,
    weekly: 40,
    monthly: 160
  },
  overtimeRate: {
    normal: 1.5,
    weekend: 2.0,
    holiday: 2.5
  },
  salary: {
    defaultNetSalary: '',
    defaultHourlyRate: '',
    currency: 'TRY',
    workingDaysPerWeek: '5',
    annualLeaveEntitlement: '14',
    besContribution: ''
  },
  profile: {
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    employeeId: ''
  }
};

// Settings service
export const settingsService = {
  // Ayarları oluştur
  async createSettings(uid: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          uid,
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating settings:', error);
      return false;
    }
  },

  // Ayarları getir
  async getSettings(uid: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Kayıt bulunamadı
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  // Ayarları güncelle
  async updateSettings(uid: string, updates: Partial<UserSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('uid', uid);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  },

  // Ayarları sil
  async deleteSettings(uid: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('uid', uid);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting settings:', error);
      return false;
    }
  },

  // Tüm ayarları getir (admin için)
  async getAllSettings(): Promise<UserSettings[]> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all settings:', error);
      return [];
    }
  }
}; 