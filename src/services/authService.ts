import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { localAuthService } from './localAuthService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string;
}

// Kullanıcı kaydı
export const registerUser = async (email: string, password: string, name?: string, startDate?: string) => {
  try {
    console.log('Attempting Firebase registration...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Firebase registration successful:', userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    
    // Firebase bağlantı hatası durumunda localStorage fallback
    if (error.code === 'auth/network-request-failed' || error.message.includes('ERR_CONNECTION_RESET')) {
      console.log('Using localStorage fallback for registration');
      if (name && startDate) {
        return await localAuthService.registerUser(email, password, name, startDate);
      }
      return { success: false, error: 'Firebase bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.' };
    }
    
    return { success: false, error: error.message };
  }
};

// Kullanıcı girişi
export const loginUser = async (email: string, password: string) => {
  try {
    console.log('Attempting Firebase login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase login successful:', userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Firebase login error:', error);
    
    // Firebase bağlantı hatası durumunda localStorage fallback
    if (error.code === 'auth/network-request-failed' || error.message.includes('ERR_CONNECTION_RESET')) {
      console.log('Using localStorage fallback for login');
      return await localAuthService.loginUser(email, password);
    }
    
    return { success: false, error: error.message };
  }
};

// Kullanıcı çıkışı
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Mevcut kullanıcıyı al
export const getCurrentUser = () => {
  return auth.currentUser;
}; 