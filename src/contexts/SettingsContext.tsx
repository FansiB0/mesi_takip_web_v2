import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const defaultSettings: UserSettings = {
  profile: {
    name: '',
    email: '',
    phone: '',
    department: 'Yazılım Geliştirme',
    position: 'Senior Developer',
    startDate: '',
    employeeId: 'EMP001'
  },
  notifications: {
    salaryReminder: true,
    overtimeApproval: true,
    leaveStatus: true,
    holidayReminder: true,
    emailNotifications: true,
    pushNotifications: false
  },
  salary: {
    defaultNetSalary: '5000.00',
    defaultHourlyRate: '150.00',
    currency: 'TRY',
    workingHoursPerDay: '8',
    workingDaysPerWeek: '5',
    annualLeaveEntitlement: '14',
    besContribution: '0'
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

  // LocalStorage'dan ayarları yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
      }
    }
  }, []);

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

  const updateSettings = (section: keyof UserSettings, data: Partial<UserSettings[keyof UserSettings]>) => {
    const newSettings = {
      ...settings,
      [section]: { ...settings[section], ...data }
    };
    setSettings(newSettings);
    saveToLocalStorage(newSettings);
  };

  const updateAppearance = (appearance: Partial<UserSettings['appearance']>) => {
    updateSettings('appearance', appearance);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      updateAppearance, 
      applyTheme 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}; 