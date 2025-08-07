import { localAuthService } from './localAuthService';
import { 
  registerUser as supabaseRegister, 
  loginUser as supabaseLogin, 
  logoutUser as supabaseLogout,
  getCurrentUser as supabaseGetCurrentUser,
  onAuthStateChange as supabaseOnAuthStateChange,
  type SupabaseUser
} from './supabaseAuthService';

// Supabase kullanılabilir mi kontrol et
const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    // Supabase bağlantısını test et
    const response = await fetch('https://paputejxuotwgzunxlma.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcHV0ZWp4dW90d2d6dW54bG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzIwNDgsImV4cCI6MjA3MDEwODA0OH0.pEwgGE1ONYT9QvFS6TLyq4mnX8QyONrvuIqcFr8i8Vk',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcHV0ZWp4dW90d2d6dW54bG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzIwNDgsImV4cCI6MjA3MDEwODA0OH0.pEwgGE1ONYT9QvFS6TLyq4mnX8QyONrvuIqcFr8i8Vk'
      }
    });
    return response.status === 200;
  } catch (error) {
    console.log('❌ Supabase connection check failed:', error);
    return false;
  }
};

export const register = async (email: string, password: string, userData: any) => {
  try {
    // Önce Supabase'i dene
    console.log('🗄️ Trying Supabase for registration');
    
    try {
      const result = await supabaseRegister({
        email,
        password,
        name: userData.name,
        role: userData.role || 'user'
      });
      
      console.log('✅ Supabase registration successful');
      return { user: result.user, success: true };
    } catch (supabaseError: any) {
      console.log('❌ Supabase registration failed:', supabaseError);
      
      // Supabase hatası varsa localStorage'a geç
      console.log('💾 Falling back to localStorage');
      return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
    }
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Önce Supabase'i dene
    console.log('🗄️ Trying Supabase for login');
    
    try {
      const user = await supabaseLogin(email, password);
      console.log('✅ Supabase login successful');
      return { user, success: true };
    } catch (supabaseError: any) {
      console.log('❌ Supabase login failed:', supabaseError);
      
      // Supabase hatası varsa localStorage'a geç
      console.log('💾 Falling back to localStorage');
      return await localAuthService.loginUser(email, password);
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Önce Supabase'i dene
    console.log('🗄️ Trying Supabase for logout');
    
    try {
      await supabaseLogout();
      console.log('✅ Supabase logout successful');
      return { success: true };
    } catch (supabaseError: any) {
      console.log('❌ Supabase logout failed:', supabaseError);
      
      // Supabase hatası varsa localStorage'a geç
      console.log('💾 Falling back to localStorage');
      return await localAuthService.logoutUser();
    }
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  // Supabase Auth state listener'ı başlat
  const unsubscribe = supabaseOnAuthStateChange(callback);
  
  return unsubscribe;
};

export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  // Supabase kullanıcısını kontrol et
  try {
    const user = await supabaseGetCurrentUser();
    return user;
  } catch (error) {
    console.log('❌ Supabase getCurrentUser failed:', error);
    return null;
  }
}; 