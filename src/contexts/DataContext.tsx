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
  addSalary: (salary: Omit<Salary, 'id' | 'createdAt'>) => Promise<ApiResponse<Salary>>;
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
    console.log('Auth context not available yet');
  }
  
  try {
    const toastContext = useToast();
    toast = toastContext;
  } catch (error) {
    console.log('Toast context not available yet');
  }

  // State'ler
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    salaries: { isLoading: false, error: undefined, retryCount: 0 },
    overtimes: { isLoading: false, error: undefined, retryCount: 0 },
    leaves: { isLoading: false, error: undefined, retryCount: 0 },
    holidays: { isLoading: false, error: undefined, retryCount: 0 }
  });
  
  // Network status
  const [isOffline, setIsOffline] = useState(isOfflineMode());
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'offline'>('good');

  // Loading state güncelleme fonksiyonu
  const updateLoadingState = useCallback((key: keyof typeof loadingStates, updates: Partial<LoadingState>) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  }, []);

  // Hata temizleme
  const clearErrors = useCallback(() => {
    setLoadingStates(prev => ({
      salaries: { ...prev.salaries, error: undefined },
      overtimes: { ...prev.overtimes, error: undefined },
      leaves: { ...prev.leaves, error: undefined },
      holidays: { ...prev.holidays, error: undefined }
    }));
  }, []);

  // Network monitoring setup
  useEffect(() => {
    console.log('🌐 Setting up network monitoring...');
    
    // Connection monitor'ı başlat
    connectionMonitor.start();
    
    // Network status listener
    const unsubscribe = connectionMonitor.onStatusChange((status) => {
      console.log('🌐 Network status changed:', status);
      setNetworkQuality(status === 'online' ? 'good' : status);
      setIsOffline(status === 'offline');
      
      if (status === 'online' && isOfflineMode()) {
        // Online olduğunda offline mode'u kapat
        toggleOfflineMode(false);
      }
    });
    
    return () => {
      connectionMonitor.stop();
      unsubscribe();
    };
  }, []);

  // Veri yükleme fonksiyonu
  const loadData = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No user ID available for data loading');
      return;
    }
    
    console.log('🔄 Starting data load for user:', user.id);
    
    // Offline mode kontrolü
    if (isOfflineMode()) {
      console.log('🔌 Offline mode active, loading from local storage...');
      loadFromLocalStorage();
      return;
    }
    
    // Supabase bağlantı testi
    console.log('🌐 Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();
    console.log('🌐 Supabase connection result:', isConnected);
    
    if (!isConnected) {
      console.warn('⚠️ Supabase connection failed, switching to offline mode');
      toggleOfflineMode(true);
      loadFromLocalStorage();
      return;
    }
    
    try {
      console.log('🔄 Loading data for user:', user.id);
      
      // Mesai verilerini yükle
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      const overtimeData = await retryOperation(() => overtimeService.getAll(user.id));
      console.log('✅ Overtime data loaded:', overtimeData.length, 'records');
      
      const convertedOvertimes = overtimeData.map(o => ({
        id: o.id || '',
        userId: o.userId,
        employeeId: o.employeeId,
        date: o.date,
        hours: o.hours,
        overtimeType: 'normal' as const,
        hourlyRate: 150,
        totalPayment: o.hours * 150,
        description: o.description,
        status: o.status || 'approved',
        createdAt: o.created_at || new Date().toISOString(),
        updatedAt: o.updated_at || new Date().toISOString()
      }));
      setOvertimes(convertedOvertimes);
      updateLoadingState('overtimes', { isLoading: false });
      
      // İzin verilerini yükle
      console.log('📅 Loading leave data...');
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      const leaveData = await retryOperation(() => leaveService.getAll(user.id));
      console.log('✅ Leave data loaded:', leaveData.length, 'records');
      console.log('📅 Raw leave data:', leaveData);
      
      const convertedLeaves = leaveData.map(l => ({
        id: l.id || '',
        userId: l.userId,
        employeeId: l.employeeId,
        startDate: l.startDate,
        endDate: l.endDate,
        daysUsed: l.daysUsed || 1,
        status: l.status,
        reason: l.reason,
        leaveType: (() => {
          switch (l.type) {
            case 'annual': return 'annual' as const;
            case 'sick': return 'maternity' as const;
            case 'personal': return 'administrative' as const;
            case 'other': return 'unpaid' as const;
            default: return 'annual' as const;
          }
        })(),
        type: l.type,
        createdAt: l.created_at || new Date().toISOString(),
        updatedAt: l.updated_at || new Date().toISOString()
      }));
      console.log('✅ Converted leaves:', convertedLeaves);
      setLeaves(convertedLeaves);
      updateLoadingState('leaves', { isLoading: false });
      
      // Maaş verilerini yükle
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      const salaryData = await retryOperation(() => salaryService.getAll(user.id));
      console.log('✅ Salary data loaded:', salaryData.length, 'records');
      
      const convertedSalaries = salaryData.map(s => ({
        id: s.id || '',
        userId: s.userId,
        month: s.month,
        year: s.year,
        grossSalary: s.grossSalary,
        netSalary: s.netSalary,
        bonus: s.bonus,
        besDeduction: s.besDeduction,
        createdAt: s.created_at || new Date().toISOString(),
        updatedAt: s.updated_at || new Date().toISOString()
      }));
      setSalaries(convertedSalaries);
      updateLoadingState('salaries', { isLoading: false });
      
      // Tatil verilerini yükle
      const defaultHolidays = turkeyHolidays.map(h => ({ 
        ...h, 
        id: Date.now().toString() + Math.random().toString(36).slice(2) 
      }));
      setHolidays(defaultHolidays);
      updateLoadingState('holidays', { isLoading: false });
      
      console.log('✅ All data loaded successfully');
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      logError(error, 'loadData');
      updateLoadingState('salaries', { isLoading: false, error: error.message });
      updateLoadingState('overtimes', { isLoading: false, error: error.message });
      updateLoadingState('leaves', { isLoading: false, error: error.message });
      updateLoadingState('holidays', { isLoading: false, error: error.message });
    }
  }, [user?.id]);

  // Local storage'dan veri yükleme
  const loadFromLocalStorage = useCallback(() => {
    console.log('💾 Loading data from local storage...');
    
    try {
      // Salaries
      const storedSalaries = localStorage.getItem(`salaries_${user?.id}`);
      if (storedSalaries) {
        setSalaries(JSON.parse(storedSalaries));
        console.log('✅ Salaries loaded from local storage');
      }
      
      // Overtimes
      const storedOvertimes = localStorage.getItem(`overtimes_${user?.id}`);
      if (storedOvertimes) {
        setOvertimes(JSON.parse(storedOvertimes));
        console.log('✅ Overtimes loaded from local storage');
      }
      
      // Leaves
      const storedLeaves = localStorage.getItem(`leaves_${user?.id}`);
      if (storedLeaves) {
        setLeaves(JSON.parse(storedLeaves));
        console.log('✅ Leaves loaded from local storage');
      }
      
      // Holidays
      const storedHolidays = localStorage.getItem('holidays');
      if (storedHolidays) {
        setHolidays(JSON.parse(storedHolidays));
        console.log('✅ Holidays loaded from local storage');
      }
    } catch (error) {
      console.error('❌ Error loading from local storage:', error);
    }
  }, [user?.id]);

      // Load data from Supabase when user changes
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      // Kullanıcı yoksa verileri temizle
      setSalaries([]);
      setOvertimes([]);
      setLeaves([]);
      clearErrors();
    }
  }, [user?.id, loadData, clearErrors]);

  // Save data to local storage whenever data changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`salaries_${user.id}`, JSON.stringify(salaries));
      localStorage.setItem(`overtimes_${user.id}`, JSON.stringify(overtimes));
      localStorage.setItem(`leaves_${user.id}`, JSON.stringify(leaves));
    }
  }, [salaries, overtimes, leaves, user?.id]);

  // Save holidays to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('holidays', JSON.stringify(holidays));
  }, [holidays]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Offline mode toggle function
  const handleToggleOfflineMode = useCallback((enabled: boolean) => {
    toggleOfflineMode(enabled);
    setIsOffline(enabled);
    
    if (enabled) {
      loadFromLocalStorage();
    } else {
      loadData();
    }
  }, [loadFromLocalStorage, loadData]);

  // Salary functions
  const addSalary = async (salary: Omit<Salary, 'id' | 'createdAt'>): Promise<ApiResponse<Salary>> => {
    console.log('🔍 addSalary called - User:', user, 'Loading:', isLoading);
    console.log('🔍 User ID check:', user?.id ? `ID: ${user.id}` : 'No ID');
    
    if (isLoading) {
      return { success: false, error: 'Kullanıcı bilgileri yükleniyor, lütfen bekleyin' };
    }
    if (!user?.id) {
      console.error('❌ No user ID available for salary operation');
      return { success: false, error: 'Kullanıcı girişi gerekli. Lütfen tekrar giriş yapın.' };
    }
    
    try {
      // Validasyon
      const validation = formValidators.salaryForm(salary);
      if (!validation.isValid) {
        return { success: false, error: validation.errors[0]?.message, errors: validation.errors };
      }
      
      // Input sanitization
      const sanitizedSalary = {
        ...salary,
        month: sanitizeInput(salary.month)
      };
      
      updateLoadingState('salaries', { isLoading: true, error: undefined });
      
      const newSalaryData = {
        ...sanitizedSalary,
        userId: user.id,
        updatedAt: undefined // Supabase service expects string, not Timestamp
      };
      
      const id = await retryOperation(() => salaryService.add(newSalaryData));
      if (id) {
        const newSalary: Salary = {
          ...sanitizedSalary,
          id,
          createdAt: new Date().toISOString()
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
      
      // Timestamp dönüşümü için salary'yi temizle
      const { createdAt, updatedAt, ...salaryWithoutTimestamps } = salary;
      const success = await retryOperation(() => salaryService.update(id, salaryWithoutTimestamps));
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
      const validation = formValidators.overtimeForm(overtime);
      if (!validation.isValid) {
        return { success: false, error: validation.errors[0]?.message, errors: validation.errors };
      }
      
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      console.log('🔄 Adding overtime for user:', user.id);
      console.log('📝 Overtime data:', overtime);
      
      // Supabase için uyumlu veri oluştur
      const supabaseOvertime = {
        employeeId: user.id,
        date: overtime.date,
        hours: overtime.hours,
        description: overtime.description || 'Mesai',
        status: 'approved' as const,
        userId: user.id
      };
      
      const id = await retryOperation(() => overtimeService.add(supabaseOvertime));
      if (id) {
        const newOvertime: Overtime = {
          ...overtime,
          id,
          userId: user.id,
          employeeId: user.id
        };
        console.log('✅ Overtime added successfully:', newOvertime);
        setOvertimes(prev => [...prev, newOvertime]);
        updateLoadingState('overtimes', { isLoading: false });
        return { success: true, data: newOvertime };
      } else {
        throw new Error('Mesai eklenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'addOvertime');
      const errorMessage = error?.message || 'Mesai eklenirken hata oluştu';
      updateLoadingState('overtimes', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateOvertime = async (id: string, overtime: Partial<Overtime>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      // Timestamp dönüşümü için overtime'yi temizle
      const { createdAt, updatedAt, ...overtimeWithoutTimestamps } = overtime;
      const success = await retryOperation(() => overtimeService.update(id, overtimeWithoutTimestamps));
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
      console.log('🔄 Deleting overtime:', id);
      updateLoadingState('overtimes', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => overtimeService.delete(id));
      if (success) {
        setOvertimes(prev => prev.filter(o => o.id !== id));
        console.log('✅ Overtime deleted successfully');
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
      // Validasyon - tip uyumluluğu için gerekli alanları kontrol et
      const validationData = {
        startDate: leave.startDate,
        endDate: leave.endDate,
        daysUsed: leave.daysUsed,
        reason: leave.reason || '',
        leaveType: leave.leaveType
      };
      const validation = formValidators.leaveForm(validationData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors[0]?.message, errors: validation.errors };
      }
      
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      // Supabase service için uyumlu veri oluştur
      const newLeaveData = {
        employeeId: user.id,
        startDate: leave.startDate,
        endDate: leave.endDate,
        daysUsed: leave.daysUsed,
        type: (() => {
          switch (leave.leaveType) {
            case 'annual': return 'annual' as const;
            case 'maternity': return 'sick' as const;
            case 'bereavement': return 'sick' as const;
            case 'administrative': return 'personal' as const;
            case 'paid': return 'personal' as const;
            case 'unpaid': return 'personal' as const;
            default: return 'personal' as const;
          }
        })(),
        reason: leave.reason || '',
        status: 'approved' as const, // Onay beklemesin
        userId: user.id
      };
      
      console.log('🔄 Adding leave with data:', newLeaveData);
      
      const id = await retryOperation(() => leaveService.add(newLeaveData));
      if (id) {
        const newLeave: Leave = {
          ...leave,
          id,
          userId: user.id,
          employeeId: user.id
        };
        console.log('✅ Leave added successfully:', newLeave);
        setLeaves(prev => [...prev, newLeave]);
        updateLoadingState('leaves', { isLoading: false });
        if (toast) {
          toast.showSuccess('İzin talebi başarıyla oluşturuldu!');
        }
        return { success: true, data: newLeave };
      } else {
        throw new Error('İzin eklenirken hata oluştu');
      }
    } catch (error: any) {
      logError(error, 'addLeave');
      const errorMessage = error?.message || 'İzin eklenirken hata oluştu';
      updateLoadingState('leaves', { isLoading: false, error: errorMessage });
      if (toast) {
        toast.showError(errorMessage);
      }
      return { success: false, error: errorMessage };
    }
  };

  const updateLeave = async (id: string, leave: Partial<Leave>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      // Timestamp dönüşümü için leave'yi temizle
      const { createdAt, updatedAt, ...leaveWithoutTimestamps } = leave;
      const success = await retryOperation(() => leaveService.update(id, leaveWithoutTimestamps));
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
      console.log('🔄 Deleting leave:', id);
      updateLoadingState('leaves', { isLoading: true, error: undefined });
      
      const success = await retryOperation(() => leaveService.delete(id));
      if (success) {
        setLeaves(prev => prev.filter(l => l.id !== id));
        console.log('✅ Leave deleted successfully');
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

  // Holiday functions
  const addHoliday = async (holiday: Omit<Holiday, 'id'>): Promise<ApiResponse<Holiday>> => {
    try {
      updateLoadingState('holidays', { isLoading: true, error: undefined });
      
      const newHoliday: Holiday = {
        ...holiday,
        id: Date.now().toString()
      };
      setHolidays(prev => [...prev, newHoliday]);
      updateLoadingState('holidays', { isLoading: false });
      return { success: true, data: newHoliday };
    } catch (error: any) {
      logError(error, 'addHoliday');
      const errorMessage = error?.message || 'Tatil eklenirken hata oluştu';
      updateLoadingState('holidays', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateHoliday = async (id: string, holiday: Partial<Holiday>): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('holidays', { isLoading: true, error: undefined });
      
      setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...holiday } : h));
      updateLoadingState('holidays', { isLoading: false });
      return { success: true, data: true };
    } catch (error: any) {
      logError(error, 'updateHoliday');
      const errorMessage = error?.message || 'Tatil güncellenirken hata oluştu';
      updateLoadingState('holidays', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteHoliday = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      updateLoadingState('holidays', { isLoading: true, error: undefined });
      
      setHolidays(prev => prev.filter(h => h.id !== id));
      updateLoadingState('holidays', { isLoading: false });
      return { success: true, data: true };
    } catch (error: any) {
      logError(error, 'deleteHoliday');
      const errorMessage = error?.message || 'Tatil silinirken hata oluştu';
      updateLoadingState('holidays', { isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const contextValue = useMemo(() => ({
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
    refreshData,
    clearErrors,
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