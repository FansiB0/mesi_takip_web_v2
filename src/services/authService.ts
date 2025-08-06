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