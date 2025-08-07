import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, register as registerUser, logoutUser, onAuthStateChange, getCurrentUser } from '../services/authService';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Supabase auth state listener
    const unsubscribe = onAuthStateChange((supabaseUser: SupabaseUser | null) => {
      console.log('🔄 Auth state changed:', supabaseUser ? 'User logged in' : 'User logged out');
      if (supabaseUser) {
        // Supabase kullanıcı bilgilerini kullan
        const userData: User = {
          id: supabaseUser.id,
          name: supabaseUser.name,
          email: supabaseUser.email,
          startDate: new Date().toISOString().split('T')[0],
          employeeType: 'normal'
        };
        setUser(userData);
        console.log('✅ User set in context:', userData);
        // localStorage'a kullanıcı ID'sini kaydet
        localStorage.setItem('currentUser', supabaseUser.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Giriş sırasında bir hata oluştu' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, startDate: string) => {
    try {
      const userData = { name, startDate, employeeType: 'normal' };
      const result = await registerUser(email, password, userData);
      
      if (result.success && result.user) {
        const user: User = {
          id: (result.user as any).id || (result.user as any).uid,
          name,
          email,
          startDate,
          employeeType: 'normal'
        };
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: 'Kayıt sırasında bir hata oluştu' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
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
      console.error('Logout error:', error);
    }
  };

  // Kullanıcıyı yeniden yükle
  const reloadUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      console.log('🔄 Reloading user data...');
      const userData: User = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        startDate: new Date().toISOString().split('T')[0],
        employeeType: 'normal'
      };
      setUser(userData);
      console.log('✅ User reloaded:', userData);
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => {
    if (!user) return;
    
    try {
      console.log('🔄 Updating user profile in Supabase:', updates);
      
      // Supabase'de kullanıcı profilini güncelle
      const success = await userProfileService.updateProfile(user.id, updates);
      
      if (success) {
        console.log('✅ User profile updated in Supabase successfully');
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } else {
        console.error('❌ Failed to update user profile in Supabase');
        // Yine de local state'i güncelle
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      // Hata durumunda da local state'i güncelle
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};