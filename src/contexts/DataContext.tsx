import React, { createContext, useContext, useState, useEffect } from 'react';
import { Salary, Overtime, Leave, Holiday } from '../types';
import { turkeyHolidays } from '../utils/turkeyHolidays';
import { overtimeService, leaveService, salaryService } from '../services/dataService';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Salary data
  salaries: Salary[];
  addSalary: (salary: Omit<Salary, 'id' | 'createdAt'>) => void;
  updateSalary: (id: string, salary: Partial<Salary>) => void;
  deleteSalary: (id: string) => void;
  
  // Overtime data
  overtimes: Overtime[];
  addOvertime: (overtime: Omit<Overtime, 'id'>) => void;
  updateOvertime: (id: string, overtime: Partial<Overtime>) => void;
  deleteOvertime: (id: string) => void;
  
  // Leave data
  leaves: Leave[];
  addLeave: (leave: Omit<Leave, 'id'>) => void;
  updateLeave: (id: string, leave: Partial<Leave>) => void;
  deleteLeave: (id: string) => void;
  
  // Holiday data
  holidays: Holiday[];
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => void;
  deleteHoliday: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  
  // useAuth'u try-catch ile sarmalayalım
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.log('Auth context not available yet');
  }

  // Load data from Firebase when user changes
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      // Kullanıcı yoksa verileri temizle
      setSalaries([]);
      setOvertimes([]);
      setLeaves([]);
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Loading data for user:', user.id);
      
      // Firebase'den mesai verilerini yükle ve dönüştür
      const overtimeData = await overtimeService.getAll(user.id);
      console.log('✅ Overtime data loaded:', overtimeData.length, 'records');
      const convertedOvertimes = overtimeData.map(o => ({
        id: o.id || '',
        userId: o.userId,
        date: o.date,
        hours: o.hours,
        overtimeType: 'normal' as const, // Varsayılan değer
        hourlyRate: 150, // Varsayılan değer
        totalPayment: o.hours * 150 // Hesaplanan değer
      }));
      setOvertimes(convertedOvertimes);
      
      // Firebase'den izin verilerini yükle ve dönüştür
      const leaveData = await leaveService.getAll(user.id);
      console.log('✅ Leave data loaded:', leaveData.length, 'records');
      const convertedLeaves = leaveData.map(l => ({
        id: l.id || '',
        userId: l.userId,
        startDate: l.startDate,
        endDate: l.endDate,
        daysUsed: 1, // Varsayılan değer
        status: l.status,
        reason: l.reason,
        leaveType: 'annual' as const // Varsayılan değer
      }));
      setLeaves(convertedLeaves);
      
      // Firebase'den maaş verilerini yükle ve dönüştür
      const salaryData = await salaryService.getAll(user.id);
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
        createdAt: s.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      setSalaries(convertedSalaries);
      
      // Tatil verilerini localStorage'dan yükle (statik veri)
      const storedHolidays = localStorage.getItem('holidays');
      if (storedHolidays) {
        setHolidays(JSON.parse(storedHolidays));
      } else {
        const defaultHolidays = turkeyHolidays.map(h => ({ 
          ...h, 
          id: Date.now().toString() + Math.random().toString(36).slice(2) 
        }));
        setHolidays(defaultHolidays);
        localStorage.setItem('holidays', JSON.stringify(defaultHolidays));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Save data to localStorage whenever data changes (only for holidays)
  useEffect(() => {
    localStorage.setItem('holidays', JSON.stringify(holidays));
  }, [holidays]);

  // Salary functions
  const addSalary = async (salary: Omit<Salary, 'id' | 'createdAt'>) => {
    if (!user?.id) return;
    
    try {
      const newSalaryData = {
        ...salary,
        userId: user.id
      };
      const id = await salaryService.add(newSalaryData);
      if (id) {
        const newSalary: Salary = {
          ...salary,
          id,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setSalaries(prev => [...prev, newSalary]);
      }
    } catch (error) {
      console.error('Error adding salary:', error);
    }
  };

  const updateSalary = async (id: string, salary: Partial<Salary>) => {
    try {
      const success = await salaryService.update(id, salary);
      if (success) {
        setSalaries(prev => prev.map(s => s.id === id ? { ...s, ...salary } : s));
      }
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const deleteSalary = async (id: string) => {
    try {
      const success = await salaryService.delete(id);
      if (success) {
        setSalaries(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting salary:', error);
    }
  };

  // Overtime functions
  const addOvertime = async (overtime: Omit<Overtime, 'id'>) => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Adding overtime for user:', user.id);
      console.log('📝 Overtime data:', overtime);
      
      // Firebase için uyumlu veri oluştur
      const firebaseOvertime = {
        employeeId: user.id,
        date: overtime.date,
        hours: overtime.hours,
        description: 'Mesai',
        status: 'approved' as const,
        userId: user.id
      };
      
      const id = await overtimeService.add(firebaseOvertime);
      if (id) {
        const newOvertime: Overtime = {
          ...overtime,
          id,
          userId: user.id
        };
        console.log('✅ Overtime added successfully:', newOvertime);
        setOvertimes(prev => [...prev, newOvertime]);
      }
    } catch (error) {
      console.error('Error adding overtime:', error);
    }
  };

  const updateOvertime = async (id: string, overtime: Partial<Overtime>) => {
    try {
      const success = await overtimeService.update(id, overtime);
      if (success) {
        setOvertimes(prev => prev.map(o => o.id === id ? { ...o, ...overtime } : o));
      }
    } catch (error) {
      console.error('Error updating overtime:', error);
    }
  };

  const deleteOvertime = async (id: string) => {
    try {
      console.log('🔄 Deleting overtime:', id);
      const success = await overtimeService.delete(id);
      if (success) {
        setOvertimes(prev => prev.filter(o => o.id !== id));
        console.log('✅ Overtime deleted successfully');
      } else {
        console.error('❌ Failed to delete overtime from Firebase');
      }
    } catch (error) {
      console.error('Error deleting overtime:', error);
    }
  };

  // Leave functions
  const addLeave = async (leave: Omit<Leave, 'id'>) => {
    if (!user?.id) return;
    
    try {
      const newLeaveData = {
        ...leave,
        userId: user.id
      };
      const id = await leaveService.add(newLeaveData);
      if (id) {
        const newLeave: Leave = {
          ...leave,
          id
        };
        setLeaves(prev => [...prev, newLeave]);
      }
    } catch (error) {
      console.error('Error adding leave:', error);
    }
  };

  const updateLeave = async (id: string, leave: Partial<Leave>) => {
    try {
      const success = await leaveService.update(id, leave);
      if (success) {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...leave } : l));
      }
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      console.log('🔄 Deleting leave:', id);
      const success = await leaveService.delete(id);
      if (success) {
        setLeaves(prev => prev.filter(l => l.id !== id));
        console.log('✅ Leave deleted successfully');
      } else {
        console.error('❌ Failed to delete leave from Firebase');
      }
    } catch (error) {
      console.error('Error deleting leave:', error);
    }
  };

  // Holiday functions
  const addHoliday = (holiday: Omit<Holiday, 'id'>) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: Date.now().toString()
    };
    setHolidays(prev => [...prev, newHoliday]);
  };

  const updateHoliday = (id: string, holiday: Partial<Holiday>) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...holiday } : h));
  };

  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const contextValue = {
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
    deleteHoliday
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}; 