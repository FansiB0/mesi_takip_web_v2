import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key gerekli!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database tabloları için tip tanımları
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          department: string
          position: string
          hire_date: string
          salary: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          department: string
          position: string
          hire_date: string
          salary: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          department?: string
          position?: string
          hire_date?: string
          salary?: number
          created_at?: string
          updated_at?: string
        }
      }
      leaves: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          type: 'annual' | 'sick' | 'personal' | 'other'
          status: 'pending' | 'approved' | 'rejected'
          reason: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          type: 'annual' | 'sick' | 'personal' | 'other'
          status?: 'pending' | 'approved' | 'rejected'
          reason: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          type?: 'annual' | 'sick' | 'personal' | 'other'
          status?: 'pending' | 'approved' | 'rejected'
          reason?: string
          created_at?: string
          updated_at?: string
        }
      }
      overtime: {
        Row: {
          id: string
          user_id: string
          date: string
          hours: number
          description: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          hours: number
          description: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          hours?: number
          description?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      salary_records: {
        Row: {
          id: string
          user_id: string
          month: string
          year: number
          base_salary: number
          overtime_pay: number
          deductions: number
          net_salary: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          year: number
          base_salary: number
          overtime_pay: number
          deductions: number
          net_salary: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          year?: number
          base_salary?: number
          overtime_pay?: number
          deductions?: number
          net_salary?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
