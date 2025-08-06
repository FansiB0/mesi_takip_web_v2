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
  const { user } = useAuth();

  // Firebase'den ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.id) {
        try {
          console.log('🔄 Loading settings from Firebase for user:', user.id);
          const firebaseSettings = await settingsService.getSettings(user.id);
          
          if (firebaseSettings) {
            console.log('✅ Settings loaded from Firebase:', firebaseSettings);
            // Firebase'den gelen ayarları bizim formatımıza dönüştür
            const convertedSettings: UserSettings = {
              profile: {
                name: firebaseSettings.profile?.name || user?.name || defaultSettings.profile.name,
                email: firebaseSettings.profile?.email || user?.email || defaultSettings.profile.email,
                phone: firebaseSettings.profile?.phone || defaultSettings.profile.phone,
                department: firebaseSettings.profile?.department || defaultSettings.profile.department,
                position: firebaseSettings.profile?.position || defaultSettings.profile.position,
                startDate: firebaseSettings.profile?.startDate || user?.startDate || defaultSettings.profile.startDate,
                employeeId: firebaseSettings.profile?.employeeId || defaultSettings.profile.employeeId
              },
              notifications: {
                salaryReminder: firebaseSettings.notifications?.salary || defaultSettings.notifications.salaryReminder,
                overtimeApproval: firebaseSettings.notifications?.overtime || defaultSettings.notifications.overtimeApproval,
                leaveStatus: firebaseSettings.notifications?.leave || defaultSettings.notifications.leaveStatus,
                holidayReminder: firebaseSettings.notifications?.salary || defaultSettings.notifications.holidayReminder,
                emailNotifications: firebaseSettings.notifications?.email || defaultSettings.notifications.emailNotifications,
                pushNotifications: firebaseSettings.notifications?.push || defaultSettings.notifications.pushNotifications,
                systemUpdates: firebaseSettings.notifications?.systemUpdates || defaultSettings.notifications.systemUpdates,
                securityAlerts: firebaseSettings.notifications?.securityAlerts || defaultSettings.notifications.securityAlerts,
                performanceReports: firebaseSettings.notifications?.performanceReports || defaultSettings.notifications.performanceReports,
                weeklySummary: firebaseSettings.notifications?.weeklySummary || defaultSettings.notifications.weeklySummary,
                monthlyReport: firebaseSettings.notifications?.monthlyReport || defaultSettings.notifications.monthlyReport,
                birthdayReminders: firebaseSettings.notifications?.birthdayReminders || defaultSettings.notifications.birthdayReminders,
                workAnniversary: firebaseSettings.notifications?.workAnniversary || defaultSettings.notifications.workAnniversary
              },
              salary: {
                defaultNetSalary: firebaseSettings.salary?.defaultNetSalary || defaultSettings.salary.defaultNetSalary,
                defaultHourlyRate: firebaseSettings.salary?.defaultHourlyRate || defaultSettings.salary.defaultHourlyRate,
                currency: firebaseSettings.salary?.currency || defaultSettings.salary.currency,
                workingHoursPerDay: firebaseSettings.workingHours?.daily?.toString() || defaultSettings.salary.workingHoursPerDay,
                workingDaysPerWeek: firebaseSettings.salary?.workingDaysPerWeek || defaultSettings.salary.workingDaysPerWeek,
                annualLeaveEntitlement: firebaseSettings.salary?.annualLeaveEntitlement || defaultSettings.salary.annualLeaveEntitlement,
                besContribution: firebaseSettings.salary?.besContribution || defaultSettings.salary.besContribution
              },
              appearance: {
                theme: (firebaseSettings.theme === 'system' ? 'auto' : firebaseSettings.theme) || defaultSettings.appearance.theme,
                language: firebaseSettings.language || defaultSettings.appearance.language,
                dateFormat: defaultSettings.appearance.dateFormat,
                numberFormat: defaultSettings.appearance.numberFormat,
                fontSize: firebaseSettings.fontSize || defaultSettings.appearance.fontSize,
                colorScheme: firebaseSettings.colorScheme || defaultSettings.appearance.colorScheme,
                compactMode: firebaseSettings.compactMode || defaultSettings.appearance.compactMode,
                showAnimations: firebaseSettings.showAnimations || defaultSettings.appearance.showAnimations,
                sidebarCollapsed: firebaseSettings.sidebarCollapsed || defaultSettings.appearance.sidebarCollapsed,
                dashboardLayout: firebaseSettings.dashboardLayout || defaultSettings.appearance.dashboardLayout
              }
            };
            setSettings(convertedSettings);
                  } else {
          console.log('⚠️ No Firebase settings found, using defaults');
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
          console.error('❌ Error loading settings from Firebase:', error);
          // Firebase hatası durumunda localStorage'dan yükle
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

    // Firebase'e kaydet
    if (user?.id) {
      try {
        console.log('🔄 Saving settings to Firebase for user:', user.id);
        console.log('📝 Section:', section);
        console.log('📝 Data:', data);
        
        // Firebase formatına dönüştür
        const firebaseUpdates: any = {};
        
        if (section === 'profile') {
          firebaseUpdates.profile = {
            name: newSettings.profile.name,
            email: newSettings.profile.email,
            phone: newSettings.profile.phone,
            department: newSettings.profile.department,
            position: newSettings.profile.position,
            startDate: newSettings.profile.startDate,
            employeeId: newSettings.profile.employeeId
          };
        }
        
        if (section === 'notifications') {
          firebaseUpdates.notifications = {
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
          };
        }
        
        if (section === 'salary') {
          firebaseUpdates.salary = {
            defaultNetSalary: newSettings.salary.defaultNetSalary,
            defaultHourlyRate: newSettings.salary.defaultHourlyRate,
            currency: newSettings.salary.currency,
            workingDaysPerWeek: newSettings.salary.workingDaysPerWeek,
            annualLeaveEntitlement: newSettings.salary.annualLeaveEntitlement,
            besContribution: newSettings.salary.besContribution
          };
          firebaseUpdates.workingHours = {
            daily: parseInt(newSettings.salary.workingHoursPerDay) || 8,
            weekly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 || 40,
            monthly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 * 4 || 160
          };
        }
        
        if (section === 'appearance') {
          firebaseUpdates.theme = newSettings.appearance.theme === 'auto' ? 'system' : newSettings.appearance.theme;
          firebaseUpdates.language = newSettings.appearance.language;
          firebaseUpdates.fontSize = newSettings.appearance.fontSize;
          firebaseUpdates.colorScheme = newSettings.appearance.colorScheme;
          firebaseUpdates.compactMode = newSettings.appearance.compactMode;
          firebaseUpdates.showAnimations = newSettings.appearance.showAnimations;
          firebaseUpdates.sidebarCollapsed = newSettings.appearance.sidebarCollapsed;
          firebaseUpdates.dashboardLayout = newSettings.appearance.dashboardLayout;
        }
        
        if (Object.keys(firebaseUpdates).length > 0) {
          const success = await settingsService.updateSettings(user.id, firebaseUpdates);
          if (success) {
            console.log('✅ Settings saved to Firebase successfully');
          } else {
            console.error('❌ Failed to save settings to Firebase');
          }
        }
      } catch (error) {
        console.error('❌ Error saving settings to Firebase:', error);
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
      const hasSalaryInfo = settings.salary.defaultNetSalary && 
                           settings.salary.defaultNetSalary.trim() !== '' &&
                           parseFloat(settings.salary.defaultNetSalary) > 0;
      
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