import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://paputejxuotwgzunxlma.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcHV0ZWp4dW90d2d6dW54bG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzIwNDgsImV4cCI6MjA3MDEwODA0OH0.pEwgGE1ONYT9QvFS6TLyq4mnX8QyONrvuIqcFr8i8Vk'

console.log('🗄️ Supabase URL:', supabaseUrl)
console.log('🗄️ Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-10) : 'NOT SET')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found!')
  console.error('Please check your .env file')
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
