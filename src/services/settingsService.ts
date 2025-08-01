import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Kullanıcı ayarları veri tipi
export interface UserSettings {
  uid: string;
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    overtime: boolean;
    leave: boolean;
    salary: boolean;
  };
  workingHours: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  overtimeRate: {
    normal: number;
    weekend: number;
    holiday: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Varsayılan ayarlar
export const defaultSettings: Omit<UserSettings, 'uid' | 'createdAt' | 'updatedAt'> = {
  theme: 'light',
  language: 'tr',
  notifications: {
    email: true,
    push: true,
    overtime: true,
    leave: true,
    salary: true
  },
  workingHours: {
    daily: 8,
    weekly: 40,
    monthly: 160
  },
  overtimeRate: {
    normal: 1.5,
    weekend: 2.0,
    holiday: 2.5
  }
};

// Kullanıcı ayarları servisi
export const settingsService = {
  // Kullanıcı ayarlarını oluştur
  async createSettings(uid: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'userSettings', uid);
      await setDoc(docRef, {
        uid,
        ...defaultSettings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error creating user settings:', error);
      return false;
    }
  },

  // Kullanıcı ayarlarını getir
  async getSettings(uid: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(db, 'userSettings', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      } else {
        // Ayarlar yoksa oluştur
        const created = await this.createSettings(uid);
        if (created) {
          return await this.getSettings(uid);
        }
        return null;
      }
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  },

  // Kullanıcı ayarlarını güncelle
  async updateSettings(uid: string, updates: Partial<UserSettings>): Promise<boolean> {
    try {
      const docRef = doc(db, 'userSettings', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Ayarlar varsa güncelle
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });
        console.log('✅ User settings updated successfully');
        return true;
      } else {
        // Ayarlar yoksa oluştur
        console.log('⚠️ User settings not found, creating new settings');
        const newSettings = {
          uid,
          ...defaultSettings,
          ...updates,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await setDoc(docRef, newSettings);
        console.log('✅ New user settings created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }
}; 