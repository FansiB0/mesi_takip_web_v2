import { User } from '../types';

// LocalStorage tabanlı authentication servisi
export const localAuthService = {
  // Kullanıcı kaydı
  registerUser: async (email: string, password: string, name: string, startDate: string) => {
    try {
      // Mevcut kullanıcıları kontrol et
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'Bu email adresi zaten kullanılıyor' };
      }
      
      // Yeni kullanıcı oluştur
      const newUser = {
        uid: Date.now().toString(),
        email,
        password: btoa(password), // Basit encoding
        name,
        startDate,
        employeeType: 'normal'
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return { 
        success: true, 
        user: { 
          uid: newUser.uid, 
          email: newUser.email,
          displayName: newUser.name
        } 
      };
    } catch (error) {
      return { success: false, error: 'Kayıt sırasında hata oluştu' };
    }
  },

  // Kullanıcı girişi
  loginUser: async (email: string, password: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === btoa(password));
      
      if (!user) {
        return { success: false, error: 'Email veya şifre hatalı' };
      }
      
      return { 
        success: true, 
        user: { 
          uid: user.uid, 
          email: user.email,
          displayName: user.name
        } 
      };
    } catch (error) {
      return { success: false, error: 'Giriş sırasında hata oluştu' };
    }
  },

  // Kullanıcı çıkışı
  logoutUser: async () => {
    localStorage.removeItem('currentUser');
    return { success: true };
  },

  // Auth state listener (simulated)
  onAuthStateChange: (callback: (user: any) => void) => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      callback(JSON.parse(currentUser));
    } else {
      callback(null);
    }
    
    // Simulate auth state changes
    return () => {};
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }
}; 