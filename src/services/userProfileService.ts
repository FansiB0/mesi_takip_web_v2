import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Kullanıcı profil veri tipi
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  startDate: string;
  employeeType: 'normal' | 'manager';
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Kullanıcı profil servisi
export const userProfileService = {
  // Kullanıcı profilini oluştur
  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const docRef = doc(db, 'userProfiles', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  },

  // Kullanıcı profilini getir
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Kullanıcı profilini güncelle
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const docRef = doc(db, 'userProfiles', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
}; 