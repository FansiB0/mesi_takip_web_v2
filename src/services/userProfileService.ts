import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { retryOperation, logError } from '../utils/errorHandler';

// Kullanıcı profil veri tipi
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  startDate: string;
  employeeType: 'normal' | 'manager' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  lastLogin?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Local storage fallback için key
const USER_PROFILE_STORAGE_KEY = 'userProfile_';

// Kullanıcı profil servisi
export const userProfileService = {
  // Kullanıcı profilini oluştur
  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      console.log('🔄 Creating user profile for:', profile.uid);
      
      const docRef = doc(db, 'userProfiles', profile.uid);
      const profileData = {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Retry mekanizması ile Firebase'e kaydet
      await retryOperation(async () => {
        await setDoc(docRef, profileData);
      });
      
      // Local storage'a da kaydet (fallback için)
      localStorage.setItem(USER_PROFILE_STORAGE_KEY + profile.uid, JSON.stringify({
        ...profileData,
        createdAt: profileData.createdAt.toDate().toISOString(),
        updatedAt: profileData.updatedAt.toDate().toISOString()
      }));
      
      console.log('✅ User profile created successfully');
      return true;
    } catch (error: any) {
      logError(error, 'createProfile');
      console.error('❌ Error creating user profile:', error);
      
      // Firebase başarısız olursa local storage'a kaydet
      try {
        const fallbackData = {
          ...profile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(USER_PROFILE_STORAGE_KEY + profile.uid, JSON.stringify(fallbackData));
        console.log('💾 Profile saved to local storage as fallback');
        return true;
      } catch (localError) {
        console.error('❌ Failed to save to local storage:', localError);
      return false;
      }
    }
  },

  // Kullanıcı profilini getir
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      console.log('🔄 Getting user profile for:', uid);
      
      const docRef = doc(db, 'userProfiles', uid);
      
      // Retry mekanizması ile Firebase'den getir
      const docSnap = await retryOperation(async () => {
        return await getDoc(docRef);
      });
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        console.log('✅ User profile retrieved from Firebase');
        return data;
      } else {
        console.log('⚠️ User profile not found in Firebase, checking local storage');
        
        // Firebase'de yoksa local storage'dan getir
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log('✅ User profile retrieved from local storage');
          return {
            ...parsedData,
            createdAt: Timestamp.fromDate(new Date(parsedData.createdAt)),
            updatedAt: Timestamp.fromDate(new Date(parsedData.updatedAt))
          };
        }
        
        return null;
      }
    } catch (error: any) {
      logError(error, 'getProfile');
      console.error('❌ Error getting user profile from Firebase:', error);
      
      // Firebase başarısız olursa local storage'dan getir
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log('✅ User profile retrieved from local storage (fallback)');
          return {
            ...parsedData,
            createdAt: Timestamp.fromDate(new Date(parsedData.createdAt)),
            updatedAt: Timestamp.fromDate(new Date(parsedData.updatedAt))
          };
        }
      } catch (localError) {
        console.error('❌ Failed to get from local storage:', localError);
      }
      
      return null;
    }
  },

  // Kullanıcı profilini güncelle
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log('🔄 Updating user profile for:', uid);
      
      const docRef = doc(db, 'userProfiles', uid);
      
      // Önce mevcut profili kontrol et
      const docSnap = await retryOperation(async () => {
        return await getDoc(docRef);
      });
      
      if (docSnap.exists()) {
        // Profil varsa güncelle
        const updateData = {
          ...updates,
          updatedAt: Timestamp.now()
        };
        
        await retryOperation(async () => {
          await updateDoc(docRef, updateData);
        });
        
        // Local storage'ı da güncelle
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const updatedLocalData = {
            ...parsedData,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
        }
        
        console.log('✅ User profile updated successfully');
        return true;
      } else {
        // Profil yoksa oluştur
        console.log('⚠️ User profile not found, creating new profile');
        const newProfile = {
          uid,
          name: updates.name || 'Kullanıcı',
          email: updates.email || '',
          startDate: updates.startDate || new Date().toISOString().split('T')[0],
          employeeType: updates.employeeType || 'normal',
          ...updates,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        return await this.createProfile(newProfile);
      }
    } catch (error: any) {
      logError(error, 'updateProfile');
      console.error('❌ Error updating user profile:', error);
      
      // Firebase başarısız olursa local storage'ı güncelle
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const updatedLocalData = {
            ...parsedData,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
          console.log('💾 Profile updated in local storage as fallback');
          return true;
        }
      } catch (localError) {
        console.error('❌ Failed to update local storage:', localError);
      }
      
      return false;
    }
  },

  // Tüm kullanıcıları getir (Admin panel için)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('🔄 Getting all users for admin panel');
      
      const usersRef = collection(db, 'userProfiles');
      
      // Retry mekanizması ile Firebase'den getir
      const querySnapshot = await retryOperation(async () => {
        return await getDocs(usersRef);
      });
      
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      
      console.log(`✅ Retrieved ${users.length} users from Firebase`);
      return users;
    } catch (error: any) {
      logError(error, 'getAllUsers');
      console.error('❌ Error getting all users:', error);
      
      // Firebase başarısız olursa local storage'dan getir
      try {
        const users: UserProfile[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(USER_PROFILE_STORAGE_KEY)) {
            const localData = localStorage.getItem(key);
            if (localData) {
              const parsedData = JSON.parse(localData);
              users.push({
                ...parsedData,
                createdAt: Timestamp.fromDate(new Date(parsedData.createdAt)),
                updatedAt: Timestamp.fromDate(new Date(parsedData.updatedAt))
              });
            }
          }
        }
        console.log(`✅ Retrieved ${users.length} users from local storage (fallback)`);
        return users;
      } catch (localError) {
        console.error('❌ Failed to get users from local storage:', localError);
        return [];
      }
    }
  },

  // Kullanıcı durumunu güncelle (Admin panel için)
  async updateUserStatus(uid: string, isActive: boolean): Promise<boolean> {
    try {
      console.log(`🔄 Updating user status for ${uid}: ${isActive ? 'active' : 'inactive'}`);
      
      const docRef = doc(db, 'userProfiles', uid);
      
      const updateData = {
        isActive,
        updatedAt: Timestamp.now()
      };
      
      await retryOperation(async () => {
        await updateDoc(docRef, updateData);
      });
      
      // Local storage'ı da güncelle
      const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
      if (localData) {
        const parsedData = JSON.parse(localData);
        const updatedLocalData = {
          ...parsedData,
          isActive,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
      }
      
      console.log('✅ User status updated successfully');
      return true;
    } catch (error: any) {
      logError(error, 'updateUserStatus');
      console.error('❌ Error updating user status:', error);
      
      // Firebase başarısız olursa local storage'ı güncelle
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const updatedLocalData = {
            ...parsedData,
            isActive,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
          console.log('💾 User status updated in local storage as fallback');
          return true;
        }
      } catch (localError) {
        console.error('❌ Failed to update local storage:', localError);
      }
      
      return false;
    }
  },

  // Kullanıcıyı sil (Admin panel için)
  async deleteUser(uid: string): Promise<boolean> {
    try {
      console.log(`🔄 Deleting user: ${uid}`);
      
      const docRef = doc(db, 'userProfiles', uid);
      
      await retryOperation(async () => {
        await deleteDoc(docRef);
      });
      
      // Local storage'dan da sil
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY + uid);
      
      console.log('✅ User deleted successfully');
      return true;
    } catch (error: any) {
      logError(error, 'deleteUser');
      console.error('❌ Error deleting user:', error);
      
      // Firebase başarısız olursa local storage'dan sil
      try {
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY + uid);
        console.log('💾 User deleted from local storage as fallback');
        return true;
      } catch (localError) {
        console.error('❌ Failed to delete from local storage:', localError);
      }
      
      return false;
    }
  },

  // Kullanıcı rolünü güncelle (Admin panel için)
  async updateUserRole(uid: string, role: 'normal' | 'manager' | 'admin'): Promise<boolean> {
    try {
      console.log(`🔄 Updating user role for ${uid}: ${role}`);
      
      const docRef = doc(db, 'userProfiles', uid);
      
      const updateData = {
        employeeType: role,
        updatedAt: Timestamp.now()
      };
      
      await retryOperation(async () => {
        await updateDoc(docRef, updateData);
      });
      
      // Local storage'ı da güncelle
      const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
      if (localData) {
        const parsedData = JSON.parse(localData);
        const updatedLocalData = {
          ...parsedData,
          employeeType: role,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
      }
      
      console.log('✅ User role updated successfully');
      return true;
    } catch (error: any) {
      logError(error, 'updateUserRole');
      console.error('❌ Error updating user role:', error);
      
      // Firebase başarısız olursa local storage'ı güncelle
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const updatedLocalData = {
            ...parsedData,
            employeeType: role,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedLocalData));
          console.log('💾 User role updated in local storage as fallback');
          return true;
        }
      } catch (localError) {
        console.error('❌ Failed to update local storage:', localError);
      }
      
      return false;
    }
  }
}; 