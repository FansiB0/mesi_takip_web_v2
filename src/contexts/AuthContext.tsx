import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, register as registerUser, logoutUser, onAuthStateChange, getCurrentUser, createUserProfileForExistingUser } from '../services/authService';
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
    // Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      console.log('🔄 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        // Önce Firebase'den kullanıcı profilini al
        const userProfile = await userProfileService.getProfile(firebaseUser.uid);
        
        if (userProfile) {
          console.log('📋 User profile found:', userProfile);
          console.log('🆔 Firebase user UID:', firebaseUser.uid);
          // Profil bilgilerini kullan
          const userData: User = {
            id: firebaseUser.uid, // Firebase user ID'sini kullan
            name: userProfile.name,
            email: userProfile.email,
            startDate: userProfile.startDate,
            employeeType: userProfile.employeeType
          };
          setUser(userData);
          console.log('✅ User set in context:', userData);
          // localStorage'a kullanıcı ID'sini kaydet
          localStorage.setItem('currentUser', userProfile.uid);
        } else {
          // Profil yoksa otomatik oluştur
          console.log('🔄 User profile not found, creating automatically...');
          const userData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
            email: firebaseUser.email || '',
            startDate: new Date().toISOString().split('T')[0],
            employeeType: 'normal'
          };
          
          // userProfiles koleksiyonuna otomatik kaydet
          await createUserProfileForExistingUser(firebaseUser.uid, userData);
          
          setUser(userData);
          console.log('✅ User set in context (fallback):', userData);
          // localStorage'a kullanıcı ID'sini kaydet
          localStorage.setItem('currentUser', firebaseUser.uid);
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

  const register = async (name: string, email: string, password: string, startDate: string) => {
    try {
      const result = await registerUser(name, email, password, startDate);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Kayıt sırasında bir hata oluştu' };
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
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('🔄 Reloading user data...');
      const userProfile = await userProfileService.getProfile(currentUser.uid);
      if (userProfile) {
        const userData: User = {
          id: currentUser.uid,
          name: userProfile.name,
          email: userProfile.email,
          startDate: userProfile.startDate,
          employeeType: userProfile.employeeType
        };
        setUser(userData);
        console.log('✅ User reloaded:', userData);
      }
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
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};