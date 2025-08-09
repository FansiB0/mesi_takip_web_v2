import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from './AuthContext';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    startDate: string;
    employeeId: string;
  };
  notifications: {
    salaryReminder: boolean;
    overtimeApproval: boolean;
    leaveStatus: boolean;
    holidayReminder: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
    performanceReports: boolean;
    weeklySummary: boolean;
    monthlyReport: boolean;
    birthdayReminders: boolean;
    workAnniversary: boolean;
  };
  salary: {
    defaultNetSalary: string;
    defaultHourlyRate: string;
    currency: string;
    workingHoursPerDay: string;
    workingDaysPerWeek: string;
    annualLeaveEntitlement: string;
    besContribution: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'tr' | 'en';
    dateFormat: string;
    numberFormat: string;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    compactMode: boolean;
    showAnimations: boolean;
    sidebarCollapsed: boolean;
    dashboardLayout: 'grid' | 'list' | 'compact';
  };
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (section: keyof UserSettings, data: Partial<UserSettings[keyof UserSettings]>) => Promise<void>;
  updateAppearance: (appearance: Partial<UserSettings['appearance']>) => void;
  applyTheme: () => void;
  isNewUser: boolean;
  showSalarySetupPrompt: boolean;
  dismissSalarySetupPrompt: () => void;
}

const defaultSettings: UserSettings = {
  profile: {
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    employeeId: ''
  },
  notifications: {
    salaryReminder: false,
    overtimeApproval: false,
    leaveStatus: false,
    holidayReminder: false,
    emailNotifications: false,
    pushNotifications: false,
    systemUpdates: false,
    securityAlerts: false,
    performanceReports: false,
    weeklySummary: false,
    monthlyReport: false,
    birthdayReminders: false,
    workAnniversary: false
  },
  salary: {
    defaultNetSalary: '',
    defaultHourlyRate: '',
    currency: 'TRY',
    workingHoursPerDay: '',
    workingDaysPerWeek: '',
    annualLeaveEntitlement: '',
    besContribution: ''
  },
  appearance: {
    theme: 'light',
    language: 'tr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'tr-TR',
    fontSize: 'medium',
    colorScheme: 'blue',
    compactMode: false,
    showAnimations: true,
    sidebarCollapsed: false,
    dashboardLayout: 'grid'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showSalarySetupPrompt, setShowSalarySetupPrompt] = useState(false);
  
  // useAuth'u güvenli şekilde kullan
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.log('⚠️ Auth context not available yet, using null user');
  }

      // Supabase'den ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id) {
        try {
                  console.log('🔄 Loading settings from Supabase for user:', user.id);
        // Settings service'i aktif et
        const supabaseSettings = await settingsService.getSettings(user.id);
        
                if (supabaseSettings) {
          console.log('✅ Settings loaded from Supabase:', supabaseSettings);
          // Supabase formatından SettingsContext formatına çevir
          const convertedSettings: UserSettings = {
            profile: {
              ...defaultSettings.profile,
              ...(supabaseSettings.profile || {}),
              name: user?.name || supabaseSettings.profile?.name || defaultSettings.profile.name,
              email: user?.email || supabaseSettings.profile?.email || defaultSettings.profile.email,
              startDate: user?.startDate || supabaseSettings.profile?.startDate || defaultSettings.profile.startDate
            },
            notifications: {
              ...defaultSettings.notifications,
              salaryReminder: supabaseSettings.notifications?.salary ?? defaultSettings.notifications.salaryReminder,
              overtimeApproval: supabaseSettings.notifications?.overtime ?? defaultSettings.notifications.overtimeApproval,
              leaveStatus: supabaseSettings.notifications?.leave ?? defaultSettings.notifications.leaveStatus,
              emailNotifications: supabaseSettings.notifications?.email ?? defaultSettings.notifications.emailNotifications,
              pushNotifications: supabaseSettings.notifications?.push ?? defaultSettings.notifications.pushNotifications,
              systemUpdates: supabaseSettings.notifications?.systemUpdates ?? defaultSettings.notifications.systemUpdates,
              securityAlerts: supabaseSettings.notifications?.securityAlerts ?? defaultSettings.notifications.securityAlerts,
              performanceReports: supabaseSettings.notifications?.performanceReports ?? defaultSettings.notifications.performanceReports,
              weeklySummary: supabaseSettings.notifications?.weeklySummary ?? defaultSettings.notifications.weeklySummary,
              monthlyReport: supabaseSettings.notifications?.monthlyReport ?? defaultSettings.notifications.monthlyReport,
              birthdayReminders: supabaseSettings.notifications?.birthdayReminders ?? defaultSettings.notifications.birthdayReminders,
              workAnniversary: supabaseSettings.notifications?.workAnniversary ?? defaultSettings.notifications.workAnniversary,
              holidayReminder: defaultSettings.notifications.holidayReminder
            },
            salary: {
              ...defaultSettings.salary,
              ...(supabaseSettings.salary || {}),
              workingHoursPerDay: (supabaseSettings.workingHours?.daily || 8).toString(),
              workingDaysPerWeek: Math.round((supabaseSettings.workingHours?.weekly || 40) / 8).toString()
            },
            appearance: {
              ...defaultSettings.appearance,
              theme: (supabaseSettings.theme === 'system' ? 'auto' : supabaseSettings.theme) || defaultSettings.appearance.theme,
              language: supabaseSettings.language || defaultSettings.appearance.language,
              fontSize: supabaseSettings.fontSize || defaultSettings.appearance.fontSize,
              colorScheme: supabaseSettings.colorScheme || defaultSettings.appearance.colorScheme,
              compactMode: supabaseSettings.compactMode ?? defaultSettings.appearance.compactMode,
              showAnimations: supabaseSettings.showAnimations ?? defaultSettings.appearance.showAnimations,
              sidebarCollapsed: supabaseSettings.sidebarCollapsed ?? defaultSettings.appearance.sidebarCollapsed,
              dashboardLayout: supabaseSettings.dashboardLayout || defaultSettings.appearance.dashboardLayout,
              dateFormat: defaultSettings.appearance.dateFormat,
              numberFormat: defaultSettings.appearance.numberFormat
            }
          };
          setSettings(convertedSettings);
        } else {
          console.log('⚠️ No Supabase settings found, using defaults');
          // Kullanıcı bilgilerini kullanarak varsayılan ayarları oluştur
          const userBasedSettings: UserSettings = {
            ...defaultSettings,
            profile: {
              ...defaultSettings.profile,
              name: user?.name || defaultSettings.profile.name,
              email: user?.email || defaultSettings.profile.email,
              startDate: user?.startDate || defaultSettings.profile.startDate
            }
          };
          setSettings(userBasedSettings);
        }
        } catch (error) {
          console.error('❌ Error loading settings from Supabase:', error);
          // Supabase hatası durumunda localStorage'dan yükle
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            try {
              const parsedSettings = JSON.parse(savedSettings);
              setSettings({ ...defaultSettings, ...parsedSettings });
            } catch (localError) {
              console.error('❌ Error loading settings from localStorage:', localError);
              setSettings(defaultSettings);
            }
          } else {
            setSettings(defaultSettings);
          }
        }
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'dan yükle
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings({ ...defaultSettings, ...parsedSettings });
          } catch (error) {
            console.error('Ayarlar yüklenirken hata oluştu:', error);
            setSettings(defaultSettings);
          }
        }
      }
    };

    loadSettings();
  }, [user?.id]);

  // Ayarları localStorage'a kaydet
  const saveToLocalStorage = (newSettings: UserSettings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
    }
  };

  // Tema uygula
  const applyTheme = () => {
    const { theme } = settings.appearance;
    const root = document.documentElement;
    
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  // Tema değişikliklerini dinle
  useEffect(() => {
    applyTheme();
    
    if (settings.appearance.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.appearance.theme]);

  const updateSettings = async (section: keyof UserSettings, data: Partial<UserSettings[keyof UserSettings]>) => {
    const newSettings = {
      ...settings,
      [section]: { ...settings[section], ...data }
    };
    setSettings(newSettings);
    saveToLocalStorage(newSettings);

    // Supabase'e kaydet - BASIT VE DİREKT
    if (user?.id) {
      try {
        console.log('🔄 Saving settings to Supabase for user:', user.id);
        console.log('📝 Section:', section);
        console.log('📝 Data:', data);
        
        // SettingsContext formatından Supabase formatına çevir
        const supabaseSettings = {
          profile: newSettings.profile,
          notifications: {
            salary: newSettings.notifications.salaryReminder,
            overtime: newSettings.notifications.overtimeApproval, 
            leave: newSettings.notifications.leaveStatus,
            email: newSettings.notifications.emailNotifications,
            push: newSettings.notifications.pushNotifications,
            systemUpdates: newSettings.notifications.systemUpdates,
            securityAlerts: newSettings.notifications.securityAlerts,
            performanceReports: newSettings.notifications.performanceReports,
            weeklySummary: newSettings.notifications.weeklySummary,
            monthlyReport: newSettings.notifications.monthlyReport,
            birthdayReminders: newSettings.notifications.birthdayReminders,
            workAnniversary: newSettings.notifications.workAnniversary
          },
          salary: newSettings.salary,
          theme: newSettings.appearance.theme === 'auto' ? 'system' : newSettings.appearance.theme,
          language: newSettings.appearance.language,
          fontSize: newSettings.appearance.fontSize,
          colorScheme: newSettings.appearance.colorScheme,
          compactMode: newSettings.appearance.compactMode,
          showAnimations: newSettings.appearance.showAnimations,
          sidebarCollapsed: newSettings.appearance.sidebarCollapsed,
          dashboardLayout: newSettings.appearance.dashboardLayout,
          workingHours: {
            daily: parseInt(newSettings.salary.workingHoursPerDay) || 8,
            weekly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 || 40,
            monthly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 * 4 || 160
          },
          overtimeRate: {
            normal: 1.5,
            weekend: 2.0, 
            holiday: 2.5
          }
        };
        
        console.log('📦 Mapped settings for Supabase:', supabaseSettings);
        const success = await settingsService.updateSettings(user.id, supabaseSettings);
        
        if (success) {
          console.log('✅ Settings saved to Supabase successfully');
        } else {
          console.log('❌ Failed to save settings to Supabase');
        }
      } catch (error) {
        console.error('❌ Error saving settings to Supabase:', error);
      }
    }
  };

  const updateAppearance = (appearance: Partial<UserSettings['appearance']>) => {
    updateSettings('appearance', appearance);
  };

  // Yeni kullanıcı kontrolü ve maaş ayarları kontrolü
  useEffect(() => {
    if (user?.id) {
      // Maaş bilgileri kontrolü
      const defaultNetSalary = settings.salary.defaultNetSalary?.toString() || '';
      const hasSalaryInfo = defaultNetSalary && 
                           defaultNetSalary.trim() !== '' &&
                           parseFloat(defaultNetSalary) > 0;
      
      console.log('💰 Salary info check:', {
        defaultNetSalary: settings.salary.defaultNetSalary,
        hasSalaryInfo,
        showSalarySetupPrompt
      });
      
      if (!hasSalaryInfo) {
        setIsNewUser(true);
        setShowSalarySetupPrompt(true);
      } else {
        setIsNewUser(false);
        setShowSalarySetupPrompt(false);
      }
    }
  }, [settings.salary.defaultNetSalary, user?.id, showSalarySetupPrompt]);

  // Maaş ayarları prompt'unu kapat
  const dismissSalarySetupPrompt = () => {
    setShowSalarySetupPrompt(false);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      updateAppearance, 
      applyTheme,
      isNewUser,
      showSalarySetupPrompt,
      dismissSalarySetupPrompt
    }}>
      {children}
    </SettingsContext.Provider>
  );
}; 