import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, logoutUser, onAuthStateChange, getCurrentUser } from '../services/supabaseAuthService';
import { userProfileService } from '../services/userProfileService';
import { settingsService } from '../services/settingsService';
import type { SupabaseUser } from '../services/supabaseAuthService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, startDate: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Hemen false yap

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 Setting up auth state listener...');
    }
    
    // Basit bir kontrol - hemen loading'i false yap
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          if (import.meta.env.DEV) {
            console.log('✅ Current user found:', currentUser);
          }
          const userData: User = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            startDate: new Date().toISOString().split('T')[0], // Varsayılan tarih
            employeeType: 'normal'
          };
          setUser(userData);
          localStorage.setItem('currentUser', currentUser.id);
        } else {
          if (import.meta.env.DEV) {
            console.log('❌ No current user found');
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Error checking current user:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Hemen başlat
    initializeAuth();
    
    // Güvenlik için 3 saniye sonra loading'i false yap
    const timeoutId = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.log('⚠️ Loading timeout reached, forcing isLoading to false');
      }
      setIsLoading(false);
    }, 3000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Starting login process...');
      }
      const user = await loginUser(email, password);
      if (import.meta.env.DEV) {
        console.log('✅ Login process completed');
      }
      
      // User'ı hemen set et
      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        startDate: new Date().toISOString().split('T')[0], // Varsayılan tarih
        employeeType: 'normal'
      };
      setUser(userData);
      localStorage.setItem('currentUser', user.id);
      
      if (import.meta.env.DEV) {
        console.log('✅ User set in context immediately:', userData);
      }
      setIsLoading(false);
      
      return { success: true };
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      const errorMessage = error.message || 'Giriş sırasında bir hata oluştu';
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string, startDate: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Starting registration in AuthContext...');
      }
      const result = await registerUser({ email, password, name, role: 'user', startDate });
      
      if (import.meta.env.DEV) {
        console.log('✅ Registration result from service:', result);
      }
      
      // User'ı hemen set et
      const userData: User = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        startDate,
        employeeType: 'normal'
      };
      setUser(userData);
      localStorage.setItem('currentUser', result.user.id);
      
      if (import.meta.env.DEV) {
        console.log('✅ User set in context immediately:', userData);
      }
      
      return { success: true };
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ Registration error in AuthContext:', error);
      }
      return { success: false, error: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // localStorage'dan kullanıcı ID'sini temizle
      localStorage.removeItem('currentUser');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Logout error:', error);
      }
    }
  };

  // Kullanıcıyı yeniden yükle
  const reloadUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      if (import.meta.env.DEV) {
        console.log('🔄 Reloading user data...');
      }
      const userData: User = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        startDate: new Date().toISOString().split('T')[0], // Varsayılan tarih
        employeeType: 'normal'
      };
      setUser(userData);
      if (import.meta.env.DEV) {
        console.log('✅ User reloaded:', userData);
      }
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => {
    if (!user) return;
    
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Updating user profile in Supabase:', updates);
      }
      
      // Supabase'de kullanıcı profilini güncelle
      const success = await userProfileService.updateProfile(user.id, updates);
      
      if (success) {
        if (import.meta.env.DEV) {
          console.log('✅ User profile updated in Supabase successfully');
        }
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } else {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to update user profile in Supabase');
        }
        // Yine de local state'i güncelle
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Error updating user profile:', error);
      }
      // Hata durumunda da local state'i güncelle
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  // Debug için console log (sadece development'ta)
  if (import.meta.env.DEV) {
    console.log('🔄 AuthContext render:', { user: user?.id, isLoading });
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};