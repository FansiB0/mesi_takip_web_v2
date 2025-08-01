import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, logoutUser, onAuthStateChange, getCurrentUser } from '../services/authService';
import { userProfileService } from '../services/userProfileService';
import { settingsService } from '../services/settingsService';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, startDate: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => Promise<void>;
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
    // Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Önce Firebase'den kullanıcı profilini al
        const userProfile = await userProfileService.getProfile(firebaseUser.uid);
        
        if (userProfile) {
          // Profil bilgilerini kullan
          const userData: User = {
            id: userProfile.uid,
            name: userProfile.name,
            email: userProfile.email,
            startDate: userProfile.startDate,
            employeeType: userProfile.employeeType
          };
          setUser(userData);
        } else {
          // Profil yoksa varsayılan bilgilerle oluştur
          const userData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
            email: firebaseUser.email || '',
            startDate: new Date().toISOString().split('T')[0],
            employeeType: 'normal'
          };
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
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

  const register = async (name: string, email: string, password: string, startDate: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (password.length < 6) {
        return { success: false, error: 'Şifre en az 6 karakter olmalıdır' };
      }
      const result = await registerUser(email, password, name, startDate);
      
      if (result.success && result.user) {
        // Firebase bağlantısı varsa profil ve ayarlar oluştur
        try {
          const profileCreated = await userProfileService.createProfile({
            uid: result.user.uid,
            name,
            email,
            startDate,
            employeeType: 'normal'
          });
          
          if (!profileCreated) {
            console.error('Failed to create user profile');
          }
          
          const settingsCreated = await settingsService.createSettings(result.user.uid);
          
          if (!settingsCreated) {
            console.error('Failed to create user settings');
          }
        } catch (error) {
          console.log('Firebase services not available, using localStorage only');
        }
      }
      
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Kayıt sırasında bir hata oluştu' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => {
    if (!user) return;
    
    try {
      console.log('🔄 Updating user profile in Firebase:', updates);
      
      // Firebase'de kullanıcı profilini güncelle
      const success = await userProfileService.updateProfile(user.id, updates);
      
      if (success) {
        console.log('✅ User profile updated in Firebase successfully');
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      } else {
        console.error('❌ Failed to update user profile in Firebase');
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
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};