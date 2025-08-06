import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, ApiResponse } from '../types';
import { localAuthService } from './localAuthService';
import { logService } from './logService';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string;
}

// GitHub Pages için basitleştirilmiş auth service
const isGitHubPages = () => {
  return window.location.hostname === 'abdulkadir06akcan.github.io' || 
         window.location.hostname === 'fansibo.github.io' ||
         window.location.hostname.includes('github.io');
};

// Kullanıcı kaydı
export const register = async (
  name: string, 
  email: string, 
  password: string, 
  startDate: string
): Promise<ApiResponse<{ user: User }>> => {
  try {
    console.log('=== AUTHENTICATION REGISTRATION ATTEMPT ===');
    console.log('Email:', email);
    console.log('Current hostname:', window.location.hostname);
    console.log('Is GitHub Pages:', isGitHubPages());
    
    // GitHub Pages'de sadece localStorage kullan
    if (isGitHubPages()) {
      console.log('🔄 Using localStorage for GitHub Pages');
      return await localAuthService.registerUser(email, password, name, startDate);
    }
    
    // Localhost'ta Firebase kullan
    console.log('🔄 Using Firebase for localhost');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase registration successful:', userCredential.user);
    console.log('User UID:', userCredential.user.uid);
    console.log('User Email:', userCredential.user.email);
    
    // Kullanıcı bilgilerini Firestore'a kaydet
    const userData: Omit<User, 'id'> = {
      name,
      email,
      startDate,
      employeeType: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Firestore'a kullanıcı bilgilerini kaydet (users koleksiyonu)
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, userData);
    console.log('✅ User data saved to Firestore (users collection)');
    
                // userProfiles koleksiyonuna da kaydet
            const userProfileRef = doc(db, 'userProfiles', userCredential.user.uid);
            const userProfileData = {
              uid: userCredential.user.uid,
              name,
              email,
              password: password, // Şifreyi de kaydet
              startDate,
              employeeType: 'normal',
              isActive: true,
              lastLogin: new Date().toISOString(),
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            };
            await setDoc(userProfileRef, userProfileData);
            console.log('✅ User profile saved to Firestore (userProfiles collection)');
    
         console.log('=== END FIREBASE REGISTRATION ===');
     
     // Log başarılı kayıt
     await logService.logUserRegistration(userCredential.user.uid, email, true);
     
     return { 
       success: true, 
       data: {
         user: {
           id: userCredential.user.uid,
           name,
           email,
           startDate,
           employeeType: 'normal'
         }
       }
     };
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Herhangi bir hata durumunda localStorage fallback
    console.log('🔄 Using localStorage fallback due to error');
    if (name && startDate) {
      return await localAuthService.registerUser(email, password, name, startDate);
    }
    return { success: false, error: 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.' };
  }
};

// Kullanıcı girişi
export const loginUser = async (email: string, password: string) => {
  try {
    console.log('=== AUTHENTICATION LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Current hostname:', window.location.hostname);
    console.log('Is GitHub Pages:', isGitHubPages());
    
    // GitHub Pages'de sadece localStorage kullan
    if (isGitHubPages()) {
      console.log('🔄 Using localStorage for GitHub Pages');
      return await localAuthService.loginUser(email, password);
    }
    
    // Localhost'ta Firebase kullan
    console.log('🔄 Using Firebase for localhost');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase login successful:', userCredential.user);
    console.log('User UID:', userCredential.user.uid);
    
    // Kullanıcı profilini güncelle (lastLogin)
    try {
      const userProfileRef = doc(db, 'userProfiles', userCredential.user.uid);
      await updateDoc(userProfileRef, {
        lastLogin: new Date().toISOString(),
        updatedAt: Timestamp.now()
      });
      console.log('✅ User profile updated with lastLogin');
    } catch (profileError) {
      console.log('⚠️ Could not update user profile:', profileError);
    }
    
    console.log('=== END FIREBASE LOGIN ===');
    
    // Log başarılı giriş
    await logService.logUserLogin(userCredential.user.uid, email, true);
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Herhangi bir hata durumunda localStorage fallback
    console.log('🔄 Using localStorage fallback due to error');
    return await localAuthService.loginUser(email, password);
  }
};

// Kullanıcı çıkışı
export const logoutUser = async () => {
  try {
    // GitHub Pages'de localStorage temizle
    if (isGitHubPages()) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userToken');
      return { success: true };
    }
    
    // Localhost'ta Firebase logout
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  // GitHub Pages'de localStorage listener
  if (isGitHubPages()) {
    const checkAuthState = () => {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        callback(user as any);
      } else {
        callback(null);
      }
    };
    
    // İlk kontrol
    checkAuthState();
    
    // Storage event listener
    window.addEventListener('storage', checkAuthState);
    
    return () => {
      window.removeEventListener('storage', checkAuthState);
    };
  }
  
  // Localhost'ta Firebase listener
  return onAuthStateChanged(auth, callback);
};

// Mevcut kullanıcıyı al
export const getCurrentUser = () => {
  // GitHub Pages'de localStorage'dan al
  if (isGitHubPages()) {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  
  // Localhost'ta Firebase'den al
  return auth.currentUser;
};

// Mevcut kullanıcılar için userProfiles oluştur
export const createUserProfileForExistingUser = async (uid: string, userData: any) => {
  try {
    console.log('🔄 Creating user profile for existing user:', uid);
    
    const userProfileRef = doc(db, 'userProfiles', uid);
                    const userProfileData = {
                  uid: uid,
                  name: userData.name || 'Kullanıcı',
                  email: userData.email || '',
                  password: 'Şifre bilgisi mevcut değil', // Mevcut kullanıcılar için varsayılan
                  startDate: userData.startDate || new Date().toISOString().split('T')[0],
                  employeeType: userData.employeeType || 'normal',
                  isActive: true,
                  lastLogin: new Date().toISOString(),
                  createdAt: Timestamp.now(),
                  updatedAt: Timestamp.now()
                };
    
    await setDoc(userProfileRef, userProfileData);
    console.log('✅ User profile created for existing user');
    return true;
  } catch (error: any) {
    console.error('❌ Error creating user profile for existing user:', error);
    return false;
  }
}; 