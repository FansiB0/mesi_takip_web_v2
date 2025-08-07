import { supabase } from '../config/supabase'
import type { Leave, Overtime, SalaryRecord } from '../types'

// İzin işlemleri
export const createLeave = async (leaveData: {
  user_id: string
  start_date: string
  end_date: string
  type: 'annual' | 'sick' | 'personal' | 'other'
  reason: string
}) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .insert({
        ...leaveData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase createLeave error:', error)
    throw error
  }
}

export const getLeaves = async (userId?: string) => {
  try {
    let query = supabase.from('leaves').select('*').order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Supabase getLeaves error:', error)
    throw error
  }
}

export const updateLeaveStatus = async (leaveId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .update({ status })
      .eq('id', leaveId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase updateLeaveStatus error:', error)
    throw error
  }
}

// Fazla mesai işlemleri
export const createOvertime = async (overtimeData: {
  user_id: string
  date: string
  hours: number
  description: string
}) => {
  try {
    const { data, error } = await supabase
      .from('overtime')
      .insert({
        ...overtimeData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase createOvertime error:', error)
    throw error
  }
}

export const getOvertime = async (userId?: string) => {
  try {
    let query = supabase.from('overtime').select('*').order('date', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Supabase getOvertime error:', error)
    throw error
  }
}

export const updateOvertimeStatus = async (overtimeId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('overtime')
      .update({ status })
      .eq('id', overtimeId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase updateOvertimeStatus error:', error)
    throw error
  }
}

// Maaş kayıtları
export const createSalaryRecord = async (salaryData: {
  user_id: string
  month: string
  year: number
  base_salary: number
  overtime_pay: number
  deductions: number
  net_salary: number
}) => {
  try {
    const { data, error } = await supabase
      .from('salary_records')
      .insert(salaryData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase createSalaryRecord error:', error)
    throw error
  }
}

export const getSalaryRecords = async (userId?: string) => {
  try {
    let query = supabase.from('salary_records').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Supabase getSalaryRecords error:', error)
    throw error
  }
}

// Kullanıcı listesi (Admin için)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Supabase getAllUsers error:', error)
    throw error
  }
}

// İstatistikler
export const getDashboardStats = async () => {
  try {
    // Toplam kullanıcı sayısı
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Bekleyen izin sayısı
    const { count: pendingLeaves } = await supabase
      .from('leaves')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Bekleyen fazla mesai sayısı
    const { count: pendingOvertime } = await supabase
      .from('overtime')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Bu ayki toplam maaş
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM formatı
    const { data: monthlySalaries } = await supabase
      .from('salary_records')
      .select('net_salary')
      .eq('month', currentMonth)

    const totalMonthlySalary = monthlySalaries?.reduce((sum, record) => sum + record.net_salary, 0) || 0

    return {
      totalUsers: totalUsers || 0,
      pendingLeaves: pendingLeaves || 0,
      pendingOvertime: pendingOvertime || 0,
      totalMonthlySalary
    }
  } catch (error) {
    console.error('Supabase getDashboardStats error:', error)
    throw error
  }
}
