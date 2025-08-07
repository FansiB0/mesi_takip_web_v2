import { supabase } from '../config/supabase';

// Çalışan veri tipi
export interface Employee {
  id?: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  userId: string;
  created_at?: string;
  updated_at?: string;
}

// Mesai veri tipi
export interface Overtime {
  id?: string;
  employeeId: string;
  date: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  created_at?: string;
  updated_at?: string;
}

// İzin veri tipi
export interface Leave {
  id?: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  daysUsed: number;
  type: 'annual' | 'sick' | 'personal' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  created_at?: string;
  updated_at?: string;
}

// Maaş veri tipi
export interface Salary {
  id?: string;
  userId: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  bonus: number;
  besDeduction: number;
  created_at?: string;
  updated_at?: string;
}

// Çalışan işlemleri
export const employeeService = {
  // Tüm çalışanları getir
  async getAll(userId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  },

  // Çalışan ekle
  async add(employee: Omit<Employee, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employee,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error adding employee:', error);
      return null;
    }
  },

  // Çalışan güncelle
  async update(id: string, employee: Partial<Employee>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          ...employee,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  },

  // Çalışan sil
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }
};

// Mesai işlemleri
export const overtimeService = {
  // Tüm mesaileri getir
  async getAll(userId: string): Promise<Overtime[]> {
    try {
      const { data, error } = await supabase
        .from('overtimes')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting overtimes:', error);
      return [];
    }
  },

  // Mesai ekle
  async add(overtime: Omit<Overtime, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('overtimes')
        .insert({
          ...overtime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error adding overtime:', error);
      return null;
    }
  },

  // Mesai güncelle
  async update(id: string, overtime: Partial<Overtime>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('overtimes')
        .update({
          ...overtime,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating overtime:', error);
      return false;
    }
  },

  // Mesai sil
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('overtimes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Overtime deleted from Supabase:', id);
      return true;
    } catch (error) {
      console.error('Error deleting overtime:', error);
      return false;
    }
  }
};

// İzin işlemleri
export const leaveService = {
  // Tüm izinleri getir
  async getAll(userId: string): Promise<Leave[]> {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .eq('userId', userId)
        .order('startDate', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting leaves:', error);
      return [];
    }
  },

  // İzin ekle
  async add(leave: Omit<Leave, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('leaves')
        .insert({
          ...leave,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error adding leave:', error);
      return null;
    }
  },

  // İzin güncelle
  async update(id: string, leave: Partial<Leave>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({
          ...leave,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating leave:', error);
      return false;
    }
  },

  // İzin sil
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leaves')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Leave deleted from Supabase:', id);
      return true;
    } catch (error) {
      console.error('Error deleting leave:', error);
      return false;
    }
  }
};

// Maaş işlemleri
export const salaryService = {
  // Tüm maaşları getir
  async getAll(userId: string): Promise<Salary[]> {
    try {
      const { data, error } = await supabase
        .from('salaries')
        .select('*')
        .eq('userId', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting salaries:', error);
      return [];
    }
  },

  // Maaş ekle
  async add(salary: Omit<Salary, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('salaries')
        .insert({
          ...salary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error adding salary:', error);
      return null;
    }
  },

  // Maaş güncelle
  async update(id: string, salary: Partial<Salary>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('salaries')
        .update({
          ...salary,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating salary:', error);
      return false;
    }
  },

  // Maaş sil
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('salaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting salary:', error);
      return false;
    }
  }
}; 