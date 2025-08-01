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
  };
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (section: keyof UserSettings, data: Partial<UserSettings[keyof UserSettings]>) => void;
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
    pushNotifications: false
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
    numberFormat: 'tr-TR'
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
                name: user?.name || defaultSettings.profile.name,
                email: user?.email || defaultSettings.profile.email,
                phone: defaultSettings.profile.phone,
                department: defaultSettings.profile.department,
                position: defaultSettings.profile.position,
                startDate: user?.startDate || defaultSettings.profile.startDate,
                employeeId: defaultSettings.profile.employeeId
              },
              notifications: {
                salaryReminder: firebaseSettings.notifications?.salary || defaultSettings.notifications.salaryReminder,
                overtimeApproval: firebaseSettings.notifications?.overtime || defaultSettings.notifications.overtimeApproval,
                leaveStatus: firebaseSettings.notifications?.leave || defaultSettings.notifications.leaveStatus,
                holidayReminder: firebaseSettings.notifications?.salary || defaultSettings.notifications.holidayReminder,
                emailNotifications: firebaseSettings.notifications?.email || defaultSettings.notifications.emailNotifications,
                pushNotifications: firebaseSettings.notifications?.push || defaultSettings.notifications.pushNotifications
              },
              salary: {
                defaultNetSalary: defaultSettings.salary.defaultNetSalary,
                defaultHourlyRate: defaultSettings.salary.defaultHourlyRate,
                currency: defaultSettings.salary.currency,
                workingHoursPerDay: firebaseSettings.workingHours?.daily?.toString() || defaultSettings.salary.workingHoursPerDay,
                workingDaysPerWeek: defaultSettings.salary.workingDaysPerWeek,
                annualLeaveEntitlement: defaultSettings.salary.annualLeaveEntitlement,
                besContribution: defaultSettings.salary.besContribution
              },
              appearance: {
                theme: (firebaseSettings.theme === 'system' ? 'auto' : firebaseSettings.theme) || defaultSettings.appearance.theme,
                language: firebaseSettings.language || defaultSettings.appearance.language,
                dateFormat: defaultSettings.appearance.dateFormat,
                numberFormat: defaultSettings.appearance.numberFormat
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
          firebaseUpdates.name = newSettings.profile.name;
          firebaseUpdates.email = newSettings.profile.email;
          firebaseUpdates.phone = newSettings.profile.phone;
          firebaseUpdates.department = newSettings.profile.department;
          firebaseUpdates.position = newSettings.profile.position;
          firebaseUpdates.startDate = newSettings.profile.startDate;
          firebaseUpdates.employeeId = newSettings.profile.employeeId;
        }
        
        if (section === 'notifications') {
          firebaseUpdates.notifications = {
            salary: newSettings.notifications.salaryReminder,
            overtime: newSettings.notifications.overtimeApproval,
            leave: newSettings.notifications.leaveStatus,
            email: newSettings.notifications.emailNotifications,
            push: newSettings.notifications.pushNotifications
          };
        }
        
        if (section === 'salary') {
          firebaseUpdates.workingHours = {
            daily: parseInt(newSettings.salary.workingHoursPerDay) || 8,
            weekly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 || 40,
            monthly: parseInt(newSettings.salary.workingDaysPerWeek) * 8 * 4 || 160
          };
        }
        
        if (section === 'appearance') {
          firebaseUpdates.theme = newSettings.appearance.theme === 'auto' ? 'system' : newSettings.appearance.theme;
          firebaseUpdates.language = newSettings.appearance.language;
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

  // Yeni kullanıcı kontrolü
  useEffect(() => {
    if (settings.salary.defaultNetSalary === '' && user?.id) {
      setIsNewUser(true);
      setShowSalarySetupPrompt(true);
    }
  }, [settings.salary.defaultNetSalary, user?.id]);

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