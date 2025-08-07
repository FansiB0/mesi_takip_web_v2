import { supabase } from '../config/supabase'
import type { User, UserProfile } from '../types'

export interface SupabaseUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface SupabaseUserProfile {
  id: string
  user_id: string
  department: string
  position: string
  hire_date: string
  salary: number
  created_at: string
  updated_at: string
}

// Kullanıcı kaydı
export const registerUser = async (userData: {
  email: string
  password: string
  name: string
  role?: 'admin' | 'user'
}): Promise<{ user: SupabaseUser; profile: SupabaseUserProfile | null }> => {
  try {
    // 1. Supabase Auth ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı')
    }

    // 2. Users tablosuna kullanıcı bilgilerini ekle
    const { data: userDataResult, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
      })
      .select()
      .single()

    if (userError) throw userError

    return {
      user: userDataResult,
      profile: null
    }
  } catch (error) {
    console.error('Supabase register error:', error)
    throw error
  }
}

// Kullanıcı girişi
export const loginUser = async (email: string, password: string): Promise<SupabaseUser> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (!data.user) {
      throw new Error('Giriş başarısız')
    }

    // Users tablosundan kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) throw userError

    return userData
  } catch (error) {
    console.error('Supabase login error:', error)
    throw error
  }
}

// Kullanıcı çıkışı
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Supabase logout error:', error)
    throw error
  }
}

// Mevcut kullanıcıyı al
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Users tablosundan kullanıcı bilgilerini al
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return userData
  } catch (error) {
    console.error('Supabase getCurrentUser error:', error)
    return null
  }
}

// Auth state değişikliklerini dinle
export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        callback(userData)
      } catch (error) {
        console.error('Auth state change error:', error)
        callback(null)
      }
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
  
  return () => subscription.unsubscribe()
}

// Kullanıcı profili oluştur
export const createUserProfile = async (profileData: {
  user_id: string
  department: string
  position: string
  hire_date: string
  salary: number
}): Promise<SupabaseUserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Supabase createProfile error:', error)
    throw error
  }
}

// Kullanıcı profili al
export const getUserProfile = async (userId: string): Promise<SupabaseUserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Kayıt bulunamadı
      throw error
    }

    return data
  } catch (error) {
    console.error('Supabase getUserProfile error:', error)
    return null
  }
}

// Kullanıcı profili güncelle
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<SupabaseUserProfile, 'id' | 'user_id' | 'created_at'>>
): Promise<SupabaseUserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Supabase updateUserProfile error:', error)
    throw error
  }
}
