import React, { createContext, useContext, useState, useEffect } from 'react';
import { Salary, Overtime, Leave, Holiday } from '../types';
import { turkeyHolidays } from '../utils/turkeyHolidays';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedSalaries = localStorage.getItem('salaries');
    const storedOvertimes = localStorage.getItem('overtimes');
    const storedLeaves = localStorage.getItem('leaves');
    const storedHolidays = localStorage.getItem('holidays');

    if (storedSalaries) setSalaries(JSON.parse(storedSalaries));
    if (storedOvertimes) setOvertimes(JSON.parse(storedOvertimes));
    if (storedLeaves) setLeaves(JSON.parse(storedLeaves));
    if (storedHolidays) {
      setHolidays(JSON.parse(storedHolidays));
    } else {
      setHolidays(turkeyHolidays.map(h => ({ ...h, id: Date.now().toString() + Math.random().toString(36).slice(2) })));
      localStorage.setItem('holidays', JSON.stringify(turkeyHolidays.map(h => ({ ...h, id: Date.now().toString() + Math.random().toString(36).slice(2) }))));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('salaries', JSON.stringify(salaries));
  }, [salaries]);

  useEffect(() => {
    localStorage.setItem('overtimes', JSON.stringify(overtimes));
  }, [overtimes]);

  useEffect(() => {
    localStorage.setItem('leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('holidays', JSON.stringify(holidays));
  }, [holidays]);

  // Salary functions
  const addSalary = (salary: Omit<Salary, 'id' | 'createdAt'>) => {
    const newSalary: Salary = {
      ...salary,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSalaries(prev => [...prev, newSalary]);
  };

  const updateSalary = (id: string, salary: Partial<Salary>) => {
    setSalaries(prev => prev.map(s => s.id === id ? { ...s, ...salary } : s));
  };

  const deleteSalary = (id: string) => {
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  // Overtime functions
  const addOvertime = (overtime: Omit<Overtime, 'id'>) => {
    const newOvertime: Overtime = {
      ...overtime,
      id: Date.now().toString()
    };
    setOvertimes(prev => [...prev, newOvertime]);
  };

  const updateOvertime = (id: string, overtime: Partial<Overtime>) => {
    setOvertimes(prev => prev.map(o => o.id === id ? { ...o, ...overtime } : o));
  };

  const deleteOvertime = (id: string) => {
    setOvertimes(prev => prev.filter(o => o.id !== id));
  };

  // Leave functions
  const addLeave = (leave: Omit<Leave, 'id'>) => {
    const newLeave: Leave = {
      ...leave,
      id: Date.now().toString()
    };
    setLeaves(prev => [...prev, newLeave]);
  };

  const updateLeave = (id: string, leave: Partial<Leave>) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...leave } : l));
  };

  const deleteLeave = (id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
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

  return (
    <DataContext.Provider value={{
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
    }}>
      {children}
    </DataContext.Provider>
  );
}; 