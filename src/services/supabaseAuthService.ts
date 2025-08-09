import { supabase } from '../config/supabase'

export interface SupabaseUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  startDate?: string
  employeeType?: 'normal' | 'manager' | 'admin'
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
  startDate?: string
}): Promise<{ user: SupabaseUser; profile: SupabaseUserProfile | null }> => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔄 Starting Supabase registration for:', userData.email);
    }
    
    // 1. Supabase Auth ile kullanıcı oluştur (email onayı olmadan)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'user'
        }
      }
    })

    if (authError) {
      if (import.meta.env.DEV) {
        console.error('❌ Auth signup error:', authError);
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı')
    }

    if (import.meta.env.DEV) {
      console.log('✅ Auth user created:', authData.user.id);
    }

    // 2. Users tablosuna kullanıcı bilgilerini ekle (eğer yoksa)
    const userInsertData = {
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (import.meta.env.DEV) {
      console.log('🔄 Inserting user data:', userInsertData);
    }

    // Önce kullanıcının var olup olmadığını kontrol et
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    let userDataResult;
    if (checkError && checkError.code !== 'PGRST116') {
      if (import.meta.env.DEV) {
        console.error('❌ User check error:', checkError);
      }
      throw checkError;
    }

    if (existingUser) {
      if (import.meta.env.DEV) {
        console.log('✅ User already exists, updating...');
      }
      // Kullanıcı varsa güncelle
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          role: userData.role || 'user',
          updated_at: new Date().toISOString()
        })
        .eq('email', userData.email)
        .select()
        .single();

      if (updateError) {
        if (import.meta.env.DEV) {
          console.error('❌ User update error:', updateError);
        }
        throw updateError;
      }
      userDataResult = updatedUser;
    } else {
      if (import.meta.env.DEV) {
        console.log('✅ User does not exist, creating...');
      }
      // Kullanıcı yoksa oluştur
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userInsertData)
        .select()
        .single();

      if (insertError) {
        if (import.meta.env.DEV) {
          console.error('❌ User insert error:', insertError);
        }
        throw insertError;
      }
      userDataResult = newUser;
    }

    if (import.meta.env.DEV) {
      console.log('✅ User data inserted successfully:', userDataResult);
    }

    return {
      user: userDataResult,
      profile: null
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Supabase register error:', error)
    }
    throw error
  }
}

// Kullanıcı girişi
export const loginUser = async (email: string, password: string): Promise<SupabaseUser> => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔄 Attempting login with:', { email, password: '***' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Auth error:', error);
      }
      throw error;
    }

    if (!data.user) {
      if (import.meta.env.DEV) {
        console.error('❌ No user data returned');
      }
      throw new Error('Giriş başarısız')
    }

    if (import.meta.env.DEV) {
      console.log('✅ Auth successful, user ID:', data.user.id);
    }

    // Users tablosundan kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      if (import.meta.env.DEV) {
        console.error('❌ User data fetch error:', userError);
      }
      // Eğer users tablosunda kullanıcı yoksa, auth kullanıcısından bilgileri al
      if (userError.code === 'PGRST116') {
        if (import.meta.env.DEV) {
          console.log('⚠️ User not found in users table, creating from auth data...');
        }
        const fallbackUser: SupabaseUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: (data.user.user_metadata?.name as string) || 'Unknown User',
          role: (data.user.user_metadata?.role as 'admin' | 'user') || 'user',
          startDate: undefined,
          employeeType: 'normal',
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString()
        };
        return fallbackUser;
      }
      throw userError;
    }

    if (import.meta.env.DEV) {
      console.log('✅ User data fetched:', userData);
    }
    
    // Supabase snake_case'i camelCase'e çevir
    const mappedUserData: SupabaseUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      startDate: userData.start_date,
      employeeType: userData.employee_type || 'normal',
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
    
    return mappedUserData
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase login error:', error)
    }
    throw error
  }
}

// Kullanıcı çıkışı
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase logout error:', error)
    }
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

    if (error) {
      // Eğer users tablosunda kullanıcı yoksa, auth kullanıcısından bilgileri al
      if (error.code === 'PGRST116') {
        if (import.meta.env.DEV) {
          console.log('⚠️ User not found in users table, creating from auth data...');
        }
        const fallbackUser: SupabaseUser = {
          id: user.id,
          email: user.email || '',
          name: (user.user_metadata?.name as string) || 'Unknown User',
          role: (user.user_metadata?.role as 'admin' | 'user') || 'user',
          startDate: undefined,
          employeeType: 'normal',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        };
        return fallbackUser;
      }
      throw error;
    }

    // Supabase snake_case'i camelCase'e çevir
    const mappedUserData: SupabaseUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      startDate: userData.start_date,
      employeeType: userData.employee_type || 'normal',
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
    
    return mappedUserData
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase getCurrentUser error:', error)
    }
    return null
  }
}

// Auth state değişikliklerini dinle
export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (import.meta.env.DEV) {
      console.log('🔄 Auth state change event:', event, session?.user?.id);
    }
    
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          // Eğer users tablosunda kullanıcı yoksa, auth kullanıcısından bilgileri al
          if (error.code === 'PGRST116') {
            if (import.meta.env.DEV) {
              console.log('⚠️ User not found in users table, creating from auth data...');
            }
            const fallbackUser: SupabaseUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: (session.user.user_metadata?.name as string) || 'Unknown User',
              role: (session.user.user_metadata?.role as 'admin' | 'user') || 'user',
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: session.user.updated_at || new Date().toISOString()
            };
            callback(fallbackUser);
            return;
          }
          throw error;
        }
        
        if (import.meta.env.DEV) {
          console.log('✅ User data found in auth state change:', userData);
        }
        callback(userData);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Auth state change error:', error);
        }
        callback(null);
      }
    } else if (event === 'SIGNED_OUT') {
      if (import.meta.env.DEV) {
        console.log('🔄 User signed out');
      }
      callback(null);
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Token yenilendiğinde de kullanıcı bilgilerini al
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            const fallbackUser: SupabaseUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: (session.user.user_metadata?.name as string) || 'Unknown User',
              role: (session.user.user_metadata?.role as 'admin' | 'user') || 'user',
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: session.user.updated_at || new Date().toISOString()
            };
            callback(fallbackUser);
            return;
          }
          throw error;
        }
        
        callback(userData);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Token refresh error:', error);
        }
        callback(null);
      }
    }
  });
  
  return () => subscription.unsubscribe();
};

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
    if (import.meta.env.DEV) {
      console.error('Supabase createProfile error:', error)
    }
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
    if (import.meta.env.DEV) {
      console.error('Supabase getUserProfile error:', error)
    }
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
    if (import.meta.env.DEV) {
      console.error('Supabase updateUserProfile error:', error)
    }
    throw error
  }
}
