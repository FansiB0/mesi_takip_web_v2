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
import { 
  registerUser as supabaseRegister, 
  loginUser as supabaseLogin, 
  logoutUser as supabaseLogout,
  getCurrentUser as supabaseGetCurrentUser,
  onAuthStateChange as supabaseOnAuthStateChange
} from './supabaseAuthService';

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
      
      // Supabase hatası varsa Firebase'e geç
      const firebaseAvailable = await isFirebaseAvailable();
      
      if (firebaseAvailable) {
        console.log('🔥 Falling back to Firebase');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          email: user.email,
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now()
        });

        return { user, success: true };
      } else {
        console.log('💾 Falling back to localStorage');
        return await localAuthService.registerUser(email, password, userData.name, userData.startDate);
      }
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
      
      // Supabase hatası varsa Firebase'e geç
      const firebaseAvailable = await isFirebaseAvailable();
      
      if (firebaseAvailable) {
        console.log('🔥 Falling back to Firebase');
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, success: true };
      } else {
        console.log('💾 Falling back to localStorage');
        return await localAuthService.loginUser(email, password);
      }
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
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