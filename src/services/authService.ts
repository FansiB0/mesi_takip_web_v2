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

// Firebase bağlantı kontrolü
const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Firebase Auth API'sine test isteği gönder
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    return response.status !== 0;
  } catch (error) {
    console.log('🌐 Firebase connection check failed:', error);
    return false;
  }
};

// Firebase kullanılabilir mi kontrol et
const isFirebaseAvailable = async (): Promise<boolean> => {
  try {
    // Firebase Auth'un hazır olup olmadığını kontrol et
    if (!auth) {
      console.log('❌ Firebase Auth not initialized');
      return false;
    }
    
    // Network bağlantısını kontrol et
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.log('❌ Firebase network connection failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Firebase availability check failed:', error);
    return false;
  }
};

export const register = async (email: string, password: string, userData: any) => {
  try {
    // Önce Firebase'in kullanılabilir olup olmadığını kontrol et
    const firebaseAvailable = await isFirebaseAvailable();
    
    if (firebaseAvailable) {
      console.log('🔥 Using Firebase for registration');
      
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
    } else {
      console.log('💾 Firebase not available, using localStorage');
      return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
    }
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Firebase hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.code === 'auth/too-many-requests' ||
        error.message.includes('Failed to fetch') ||
        error.code === 'auth/operation-not-allowed') {
      console.log('🌐 Firebase error detected, falling back to localStorage');
      return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
    }
    
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Önce Firebase'in kullanılabilir olup olmadığını kontrol et
    const firebaseAvailable = await isFirebaseAvailable();
    
    if (firebaseAvailable) {
      console.log('🔥 Using Firebase for login');
      
      // Firebase ile dene
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, success: true };
    } else {
      console.log('💾 Firebase not available, using localStorage');
      return await localAuthService.loginUser(email, password);
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    // Firebase hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.code === 'auth/too-many-requests' ||
        error.message.includes('Failed to fetch') ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password') {
      console.log('🌐 Firebase error detected, falling back to localStorage');
      return await localAuthService.loginUser(email, password);
    }
    
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Önce Firebase'in kullanılabilir olup olmadığını kontrol et
    const firebaseAvailable = await isFirebaseAvailable();
    
    if (firebaseAvailable) {
      console.log('🔥 Using Firebase for logout');
      
      // Firebase ile dene
      await signOut(auth);
      return { success: true };
    } else {
      console.log('💾 Firebase not available, using localStorage');
      return await localAuthService.logoutUser();
    }
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    
    // Firebase hatası varsa localStorage'a geç
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('ERR_CONNECTION_RESET') ||
        error.message.includes('Failed to fetch')) {
      console.log('🌐 Firebase error detected, falling back to localStorage');
      return await localAuthService.logoutUser();
    }
    
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Firebase Auth state listener'ı başlat
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Firebase kullanıcısı varsa onu kullan
      callback(firebaseUser);
    } else {
      // Firebase kullanıcısı yoksa localStorage'ı kontrol et
      const localUser = localAuthService.getCurrentUser();
      callback(localUser);
    }
  });
  
  return unsubscribe;
};

export const getCurrentUser = (): User | null => {
  // Önce Firebase kullanıcısını kontrol et
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    return firebaseUser;
  }
  
  // Firebase kullanıcısı yoksa localStorage'ı kontrol et
  return localAuthService.getCurrentUser();
}; 