import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { 
  salaryService, 
  overtimeService, 
  leaveService 
} from '../services/dataService';
import { 
  Salary, 
  Overtime, 
  Leave, 
  Holiday, 
  ApiResponse, 
  LoadingState 
} from '../types';
import { 
  retryOperation, 
  logError, 
  classifyError, 
  createApiResponse 
} from '../utils/errorHandler';
import { logService } from '../services/logService';
import { 
  formValidators, 
  sanitizeInput 
} from '../utils/validation';
import { turkeyHolidays } from '../utils/turkeyHolidays';
import { 
  connectionMonitor, 
  isOfflineMode, 
  toggleOfflineMode,
  testSupabaseConnection 
} from '../utils/networkUtils';

// Data context tipi
interface DataContextType {
  // Loading states
  loadingStates: {
    salaries: LoadingState;
    overtimes: LoadingState;
    leaves: LoadingState;
    holidays: LoadingState;
  };
  
  // Salary data
  salaries: Salary[];
  addSalary: (salary: Omit<Salary, 'id' | 'created_at'>) => Promise<ApiResponse<Salary>>;
  updateSalary: (id: string, salary: Partial<Salary>) => Promise<ApiResponse<boolean>>;
  deleteSalary: (id: string) => Promise<ApiResponse<boolean>>;
  
  // Overtime data
  overtimes: Overtime[];
  addOvertime: (overtime: Omit<Overtime, 'id'>) => Promise<ApiResponse<Overtime>>;
  updateOvertime: (id: string, overtime: Partial<Overtime>) => Promise<ApiResponse<boolean>>;
  deleteOvertime: (id: string) => Promise<ApiResponse<boolean>>;
  
  // Leave data
  leaves: Leave[];
  addLeave: (leave: Omit<Leave, 'id'>) => Promise<ApiResponse<Leave>>;
  updateLeave: (id: string, leave: Partial<Leave>) => Promise<ApiResponse<boolean>>;
  deleteLeave: (id: string) => Promise<ApiResponse<boolean>>;
  
  // Holiday data
  holidays: Holiday[];
  addHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<ApiResponse<Holiday>>;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => Promise<ApiResponse<boolean>>;
  deleteHoliday: (id: string) => Promise<ApiResponse<boolean>>;
  
  // Utility functions
  refreshData: () => Promise<void>;
  clearErrors: () => void;
  
  // Network status
  isOffline: boolean;
  networkQuality: 'good' | 'poor' | 'offline';
  toggleOfflineMode: (enabled: boolean) => void;
}

// Context oluştur
const DataContext = createContext<DataContextType | undefined>(undefined);

// Hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useAuth'u try-catch ile sarmalayalım
  let user = null;
  let toast = null;
  let isLoading = false;
  try {
    const authContext = useAuth();
    user = authContext.user;
    isLoading = authContext.isLoading;
  } catch (error) {
    console.warn('Auth context not available:', error);
  }

  try {
    const toastContext = useToast();
    toast = toastContext;
  } catch (error) {
    console.warn('Toast context not available:', error);
  }

  // State'ler
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(turkeyHolidays);

  // Loading states
  const [loadingStates, setLoadingStates] = useState<DataContextType['loadingStates']>({
    salaries: { isLoading: false, error: undefined },
    overtimes: { isLoading: false, error: undefined },
    leaves: { isLoading: false, error: undefined },
    holidays: { isLoading: false, error: undefined }
  });

  // Network status
  const [isOffline, setIsOffline] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'offline'>('good');

  // Loading state güncelleme fonksiyonu
  const updateLoadingState = useCallback((key: keyof DataContextType['loadingStates'], state: LoadingState) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: state
    }));
  }, []);

  // Hata loglama fonksiyonu
  const logError = useCallback(async (error: any, context: string) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN',
        details: error?.details || null
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('🚨 Application Error:', errorInfo);

    // Log service'e gönder
    if (user?.id) {
      try {
        await logService.logError(errorInfo, user.id, user.email);
      } catch (logError) {
        console.error('Error logging to service:', logError);
      }
    }
  }, [user]);

  // Veri yükleme fonksiyonları
  const loadSalaries = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      const data = await retryOperation(() => salaryService.getAll(user.id));
      
      setSalaries(data);
      updateLoadingState('salaries', { isLoading: false });
    } catch (error: any) {
      logError(error, 'loadSalaries');
      updateLoadingState('salaries', { isLoading: false, error: error.message });
    }
  }, [user?.id, updateLoadingState, logError]);

  const loadOvertimes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      const data = await retryOperation(() => overtimeService.getAll(user.id));
      
      setOvertimes(data);
      updateLoadingState('overtimes', { isLoading: false });
    } catch (error: any) {
      logError(error, 'loadOvertimes');
      updateLoadingState('overtimes', { isLoading: false, error: error.message });
    }
  }, [user?.id, updateLoadingState, logError]);

  const loadLeaves = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      const data = await retryOperation(() => leaveService.getAll(user.id));
      
      setLeaves(data);
      updateLoadingState('leaves', { isLoading: false });
    } catch (error: any) {
      logError(error, 'loadLeaves');
      updateLoadingState('leaves', { isLoading: false, error: error.message });
    }
  }, [user?.id, updateLoadingState, logError]);

  // Tüm verileri yenile
  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    
    await Promise.all([
      loadSalaries(),
      loadOvertimes(),
      loadLeaves()
    ]);
  }, [user?.id, loadSalaries, loadOvertimes, loadLeaves]);

  // Hataları temizle
  const clearErrors = useCallback(() => {
    setLoadingStates({
      salaries: { isLoading: false, error: undefined },
      overtimes: { isLoading: false, error: undefined },
      leaves: { isLoading: false, error: undefined },
      holidays: { isLoading: false, error: undefined }
    });
  }, []);

  // Salary functions
  const addSalary = async (salary: Omit<Salary, 'id' | 'created_at'>): Promise<ApiResponse<Salary>> => {
    if (isLoading) {
      return { success: false, error: 'Kullanıcı bilgileri yükleniyor, lütfen bekleyin' };
    }
    if (!user?.id) {
      return { success: false, error: 'Kullanıcı girişi gerekli. Lütfen tekrar giriş yapın.' };
    }
    
    try {
      // Input sanitization
      const sanitizedSalary = {
        ...salary,
        month: sanitizeInput(salary.month)
      };
      
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      
      const newSalaryData = {
        ...sanitizedSalary,
        userId: user.id
      };
      
      const id = await retryOperation(() => salaryService.add(newSalaryData));
      if (id) {
        const newSalary: Salary = {
          ...sanitizedSalary,
          id,
          created_at: new Date().toISOString()
        };
        setSalaries(prev => [...prev, newSalary]);
        updateLoadingState('salaries', { isLoading: false });
        
        // Log başarılı maaş ekleme
        if (user) {
          await logService.logDataOperation('salary', 'create', 'salary', user.id, user.email, true);
        }
        
        return { success: true, data: newSalary };
      } else {
        throw new Error('Maaş eklenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'addSalary');
      const errorMessage = error?.message || 'Maaş eklenirken hata oluştu';
      updateLoadingState('salaries', { isLoading: false, error: errorMessage });
      
      // Log başarısız maaş ekleme
      if (user) {
        await logService.logDataOperation('salary', 'create', 'salary', user.id, user.email, false, undefined, undefined, errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const updateSalary = async (id: string, salary: Partial<Salary>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => salaryService.update(id, salary));
      if (success) {
        setSalaries(prev => prev.map(s => s.id === id ? { ...s, ...salary } : s));
        updateLoadingState('salaries', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('Maaş güncellenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'updateSalary');
      const errorMessage = error?.message || 'Maaş güncellenirken hata oluştu';
      updateLoadingState('salaries', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteSalary = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => salaryService.delete(id));
      if (success) {
        setSalaries(prev => prev.filter(s => s.id !== id));
        updateLoadingState('salaries', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('Maaş silinirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'deleteSalary');
      const errorMessage = error?.message || 'Maaş silinirken hata oluştu';
      updateLoadingState('salaries', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Overtime functions
  const addOvertime = async (overtime: Omit<Overtime, 'id'>): Promise<ApiResponse<Overtime>> => {
    if (isLoading) {
      return { success: false, error: 'Kullanıcı bilgileri yükleniyor, lütfen bekleyin' };
    }
    if (!user?.id) {
      return { success: false, error: 'Kullanıcı girişi gerekli. Lütfen tekrar giriş yapın.' };
    }
    
    try {
      // Validasyon
      const validation = formValidators.overtimeForm({
        date: overtime.date,
        hours: overtime.hours,
        overtimeType: overtime.description || '',
        hourlyRate: 0 // Bu değer daha sonra hesaplanacak
      });
      if (!validation.isValid) {
        return { success: false, error: validation.errors.map(e => e.message).join(', ') };
      }

      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      const newOvertimeData = {
        ...overtime,
        userId: user.id
      };
      
      const id = await retryOperation(() => overtimeService.add(newOvertimeData));
      if (id) {
        const newOvertime: Overtime = {
          ...overtime,
          id,
          userId: user.id
        };
        setOvertimes(prev => [...prev, newOvertime]);
        updateLoadingState('overtimes', { isLoading: false });
        
        // Log başarılı mesai ekleme
        if (user) {
          await logService.logDataOperation('overtime', 'create', 'overtime', user.id, user.email, true);
        }
        
        return { success: true, data: newOvertime };
      } else {
        throw new Error('Mesai eklenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'addOvertime');
      const errorMessage = error?.message || 'Mesai eklenirken hata oluştu';
      updateLoadingState('overtimes', { isLoading: false, error: errorMessage });
      
      // Log başarısız mesai ekleme
      if (user) {
        await logService.logDataOperation('overtime', 'create', 'overtime', user.id, user.email, false, undefined, undefined, errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const updateOvertime = async (id: string, overtime: Partial<Overtime>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => overtimeService.update(id, overtime));
      if (success) {
        setOvertimes(prev => prev.map(o => o.id === id ? { ...o, ...overtime } : o));
        updateLoadingState('overtimes', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('Mesai güncellenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'updateOvertime');
      const errorMessage = error?.message || 'Mesai güncellenirken hata oluştu';
      updateLoadingState('overtimes', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteOvertime = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => overtimeService.delete(id));
      if (success) {
        setOvertimes(prev => prev.filter(o => o.id !== id));
        updateLoadingState('overtimes', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('Mesai silinirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'deleteOvertime');
      const errorMessage = error?.message || 'Mesai silinirken hata oluştu';
      updateLoadingState('overtimes', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Leave functions
  const addLeave = async (leave: Omit<Leave, 'id'>): Promise<ApiResponse<Leave>> => {
    if (isLoading) {
      return { success: false, error: 'Kullanıcı bilgileri yükleniyor, lütfen bekleyin' };
    }
    if (!user?.id) {
      return { success: false, error: 'Kullanıcı girişi gerekli. Lütfen tekrar giriş yapın.' };
    }
    
    try {
      // Validasyon
      const validation = formValidators.leaveForm({
        startDate: leave.startDate,
        endDate: leave.endDate,
        daysUsed: 0, // Bu değer daha sonra hesaplanacak
        reason: leave.reason || '',
        leaveType: leave.type
      });
      if (!validation.isValid) {
        return { success: false, error: validation.errors.map(e => e.message).join(', ') };
      }

      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      const newLeaveData = {
        ...leave,
        userId: user.id
      };
      
      const id = await retryOperation(() => leaveService.add(newLeaveData));
      if (id) {
        const newLeave: Leave = {
          ...leave,
          id,
          userId: user.id
        };
        setLeaves(prev => [...prev, newLeave]);
        updateLoadingState('leaves', { isLoading: false });
        
        // Log başarılı izin ekleme
        if (user) {
          await logService.logDataOperation('leave', 'create', 'leave', user.id, user.email, true);
        }
        
        return { success: true, data: newLeave };
      } else {
        throw new Error('İzin eklenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'addLeave');
      const errorMessage = error?.message || 'İzin eklenirken hata oluştu';
      updateLoadingState('leaves', { isLoading: false, error: errorMessage });
      
      // Log başarısız izin ekleme
      if (user) {
        await logService.logDataOperation('leave', 'create', 'leave', user.id, user.email, false, undefined, undefined, errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const updateLeave = async (id: string, leave: Partial<Leave>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => leaveService.update(id, leave));
      if (success) {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...leave } : l));
        updateLoadingState('leaves', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('İzin güncellenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'updateLeave');
      const errorMessage = error?.message || 'İzin güncellenirken hata oluştu';
      updateLoadingState('leaves', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteLeave = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => leaveService.delete(id));
      if (success) {
        setLeaves(prev => prev.filter(l => l.id !== id));
        updateLoadingState('leaves', { isLoading: false });
        return { success: true, data: true };
      } else {
        throw new Error('İzin silinirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'deleteLeave');
      const errorMessage = error?.message || 'İzin silinirken hata oluştu';
      updateLoadingState('leaves', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Holiday functions (local only)
  const addHoliday = async (holiday: Omit<Holiday, 'id'>): Promise<ApiResponse<Holiday>> => {
    try {
      const newHoliday: Holiday = {
        ...holiday,
        id: Date.now().toString()
      };
      setHolidays(prev => [...prev, newHoliday]);
      return { success: true, data: newHoliday };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateHoliday = async (id: string, holiday: Partial<Holiday>): Promise<ApiResponse<boolean>> => {
    try {
      setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...holiday } : h));
      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteHoliday = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      setHolidays(prev => prev.filter(h => h.id !== id));
      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Network monitoring
  useEffect(() => {
    // Connection monitor'u başlat
    connectionMonitor.start();
    
    // Status change listener'ı ekle
    const unsubscribe = connectionMonitor.onStatusChange((status) => {
      setIsOffline(status === 'offline');
      setNetworkQuality(status === 'online' ? 'good' : status);
    });

    // Cleanup function
    return () => {
      connectionMonitor.stop();
      unsubscribe();
    };
  }, []);

  // Offline mode toggle
  const handleToggleOfflineMode = useCallback((enabled: boolean) => {
    toggleOfflineMode(enabled);
    setIsOffline(enabled);
  }, []);

  // Veri yükleme effect'i
  useEffect(() => {
    if (user?.id && !isLoading) {
      refreshData();
    }
  }, [user?.id, isLoading, refreshData]);

  // Context value
  const contextValue = useMemo<DataContextType>(() => ({
    loadingStates,
    salaries,
    addSalary,
    updateSalary,
    deleteSalary,
    overtimes,
    addOvertime,
    updateOvertime,
    deleteOvertime,
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    refreshData,
    clearErrors,
    isOffline,
    networkQuality,
    toggleOfflineMode: handleToggleOfflineMode
  }), [
    loadingStates,
    salaries,
    overtimes,
    leaves,
    holidays,
    isOffline,
    networkQuality,
    handleToggleOfflineMode
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}; 