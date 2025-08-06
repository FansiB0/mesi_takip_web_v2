import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { localAuthService } from './localAuthService';

// Netlify kontrolü
const isNetlify = () => {
  return window.location.hostname.includes('netlify.app');
};

// Network bağlantı kontrolü
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    return response.status !== 0;
  } catch (error) {
    console.log('🌐 Network connection check failed:', error);
    return false;
  }
};

export const register = async (email: string, password: string, userData: any) => {
  try {
    // Netlify'da localStorage kullan
    if (isNetlify()) {
      console.log('🌐 Using localStorage for Netlify');
      return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
    }

    // Firebase ile dene
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore'a kullanıcı bilgilerini kaydet
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email: user.email,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now()
    });

    return { user, success: true };
  } catch (error: any) {
    console.error('❌ Firebase register error:', error);
    
    // Network hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.code === 'auth/too-many-requests' ||
        error.message.includes('Failed to fetch')) {
      console.log('🌐 Network error detected, falling back to localStorage');
      return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
    }
    
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Netlify'da localStorage kullan
    if (isNetlify()) {
      console.log('🌐 Using localStorage for Netlify');
      return await localAuthService.loginUser(email, password);
    }

    // Firebase ile dene
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, success: true };
  } catch (error: any) {
    console.error('❌ Firebase login error:', error);
    
    // Network hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.code === 'auth/too-many-requests' ||
        error.message.includes('Failed to fetch')) {
      console.log('🌐 Network error detected, falling back to localStorage');
      return await localAuthService.loginUser(email, password);
    }
    
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Netlify'da localStorage kullan
    if (isNetlify()) {
      console.log('🌐 Using localStorage for Netlify');
      return await localAuthService.logoutUser();
    }

    // Firebase ile dene
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Firebase logout error:', error);
    
    // Network hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.code === 'auth/too-many-requests' ||
        error.message.includes('Failed to fetch')) {
      console.log('🌐 Network error detected, falling back to localStorage');
      return await localAuthService.logoutUser();
    }
    
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Netlify'da localStorage kullan
  if (isNetlify()) {
    console.log('🌐 Using localStorage for Netlify');
    return localAuthService.onAuthStateChange(callback);
  }

  // Firebase ile dene
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  // Netlify'da localStorage kullan
  if (isNetlify()) {
    console.log('🌐 Using localStorage for Netlify');
    return localAuthService.getCurrentUser();
  }

  // Firebase ile dene
  return auth.currentUser;
}; 