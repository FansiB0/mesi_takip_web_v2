import { supabase } from '../config/supabase';

// Types dosyasından import et
import { Salary, Overtime, Leave, Employee } from '../types';

// Çalışan işlemleri
export const employeeService = {
  // Tüm çalışanları getir
  async getAll(userId: string): Promise<Employee[]> {
    try {
      // Geçici olarak RLS bypass
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('RLS error, trying without auth:', error);
        // RLS hatası varsa, auth olmadan dene
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      
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
        .from('users')
        .insert({
          id: employee.userId,
          name: employee.name,
          email: employee.email,
          role: 'user',
          start_date: employee.startDate,
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
        .from('users')
        .update({
          name: employee.name,
          email: employee.email,
          start_date: employee.startDate,
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
        .from('users')
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
        .from('overtime')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Supabase'den gelen veriyi frontend tipine dönüştür
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        employeeId: item.user_id,
        date: item.date,
        hours: item.hours,
        hourlyRate: item.hourly_rate || 0, // EKLENDI!
        overtimeType: item.overtime_type || 'normal', // EKLENDI!
        totalPayment: item.total_payment || 0, // EKLENDI!
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error getting overtimes:', error);
      return [];
    }
  },

  // Mesai ekle
  async add(overtime: Omit<Overtime, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('overtime')
        .insert({
          user_id: overtime.userId,
          date: overtime.date,
          hours: overtime.hours,
          hourly_rate: overtime.hourlyRate || 0, // EKLENDI!
          overtime_type: overtime.overtimeType || 'normal', // EKLENDI!
          total_payment: overtime.totalPayment || 0, // EKLENDI!
          description: overtime.description || 'Fazla mesai',
          status: overtime.status || 'approved',
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
        .from('overtime')
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
        .from('overtime')
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
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      // Supabase'den gelen veriyi frontend tipine dönüştür
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        employeeId: item.user_id,
        startDate: item.start_date,
        endDate: item.end_date,
        type: item.type,
        leaveType: item.leave_type || item.type || 'annual',
        daysUsed: item.days_used || 1,
        reason: item.reason || '',
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
          user_id: leave.userId,
          start_date: leave.startDate,
          end_date: leave.endDate,
          type: leave.type,
          leave_type: leave.leaveType || leave.type || 'annual',
          days_used: leave.daysUsed || 1,
          reason: leave.reason || '',
          status: leave.status,
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
        .from('salary_records')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      
      // Supabase'den gelen veriyi frontend tipine dönüştür
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        month: item.month,
        year: item.year,
        grossSalary: item.gross_salary || 0,
        netSalary: item.net_salary || 0,
        bonus: item.bonus || 0,
        besDeduction: item.bes_deduction || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error getting salaries:', error);
      return [];
    }
  },

  // Maaş ekle
  async add(salary: Omit<Salary, 'id'>): Promise<string | null> {
    try {
      console.log('🔄 Adding salary:', salary);
      
      // User ID kontrolü
      if (!salary.userId) {
        console.error('❌ User ID is missing!');
        throw new Error('Kullanıcı bilgisi eksik - lütfen çıkış yapıp tekrar giriş yapın');
      }
      
      const insertData = {
        user_id: salary.userId,
        month: salary.month,
        year: salary.year,
        gross_salary: salary.grossSalary || 0,
        net_salary: salary.netSalary || 0,
        bonus: salary.bonus || 0,
        bes_deduction: salary.besDeduction || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('salary_records')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Salary insert error:', error);
        console.error('📊 Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('✅ Salary added successfully:', data);
      return data?.id || null;
    } catch (error) {
      console.error('💥 Salary add exception:', error);
      throw error; // Re-throw to get detailed error in DataContext
    }
  },

  // Maaş güncelle
  async update(id: string, salary: Partial<Salary>): Promise<boolean> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (salary.month) updateData.month = salary.month;
      if (salary.year) updateData.year = salary.year;
      if (salary.grossSalary) updateData.gross_salary = salary.grossSalary;
      if (salary.netSalary) updateData.net_salary = salary.netSalary;
      if (salary.bonus) updateData.bonus = salary.bonus;
      if (salary.besDeduction) updateData.bes_deduction = salary.besDeduction;

      const { error } = await supabase
        .from('salary_records')
        .update(updateData)
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
        .from('salary_records')
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