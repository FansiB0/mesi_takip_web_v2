import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

// Kullanıcı verilerini localStorage'da saklamak için interface
interface StoredUser extends User {
  password: string; // Şifre hash'lenmiş olarak saklanacak
}

// Basit hash fonksiyonu (gerçek uygulamada bcrypt kullanılmalı)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding (basit örnek)
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return btoa(password) === hashedPassword;
};

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
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Stored user data is invalid:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Kullanıcıları localStorage'dan al
      const storedUsers = localStorage.getItem('users');
      const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Email ile kullanıcıyı bul
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }
      
      // Şifreyi doğrula
      if (!verifyPassword(password, user.password)) {
        return { success: false, error: 'Hatalı şifre' };
      }
      
      // Şifreyi çıkar ve kullanıcıyı set et
      const { password: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true };
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const storedUsers = localStorage.getItem('users');
      const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : [];
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Bu email adresi zaten kullanılıyor' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Şifre en az 6 karakter olmalıdır' };
      }
      const newUser: StoredUser = {
        id: Date.now().toString(),
        name,
        email: email.toLowerCase(),
        startDate,
        employeeType: 'normal',
        password: hashPassword(password)
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Kayıt sırasında bir hata oluştu' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = async (updates: Partial<Pick<User, 'name' | 'email' | 'startDate'>>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // users array'inde de güncelle
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users: any[] = JSON.parse(storedUsers);
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};