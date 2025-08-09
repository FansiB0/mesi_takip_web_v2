import { supabase } from '../config/supabase';

// Kullanıcı profil veri tipi
export interface UserProfile {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
}

// Local storage fallback için key
const USER_PROFILE_STORAGE_KEY = 'userProfile_';

// Kullanıcı profil servisi
export const userProfileService = {
  // Kullanıcı profilini oluştur
  async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      console.log('🔄 Creating user profile for:', profile.uid);
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: profile.uid,
          email: profile.email,
          name: profile.name,
          role: profile.employeeType === 'admin' ? 'admin' : 'user',
          start_date: profile.startDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Local storage'a da kaydet (fallback için)
      localStorage.setItem(USER_PROFILE_STORAGE_KEY + profile.uid, JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('✅ User profile created successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error creating user profile:', error);
      
      // Supabase başarısız olursa local storage'a kaydet
      try {
        const fallbackData = {
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profil bulunamadı, local storage'dan kontrol et
          const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
          if (localData) {
            console.log('💾 Profile found in local storage');
            return JSON.parse(localData);
          }
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      
      // Supabase başarısız olursa local storage'dan getir
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          console.log('💾 Profile loaded from local storage');
          return JSON.parse(localData);
        }
      } catch (localError) {
        console.error('❌ Failed to load from local storage:', localError);
      }
      
      return null;
    }
  },

  // Kullanıcı profilini güncelle
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      console.log('🔄 Updating user profile for:', uid);
      
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (error) throw error;
      
      // Local storage'ı da güncelle
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const profile = JSON.parse(localData);
          const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedProfile));
        }
      } catch (localError) {
        console.error('❌ Failed to update local storage:', localError);
      }
      
      console.log('✅ User profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error updating user profile:', error);
      
      // Supabase başarısız olursa local storage'ı güncelle
      try {
        const localData = localStorage.getItem(USER_PROFILE_STORAGE_KEY + uid);
        if (localData) {
          const profile = JSON.parse(localData);
          const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
          localStorage.setItem(USER_PROFILE_STORAGE_KEY + uid, JSON.stringify(updatedProfile));
          console.log('💾 Profile updated in local storage');
          return true;
        }
      } catch (localError) {
        console.error('❌ Failed to update local storage:', localError);
      }
      
      return false;
    }
  },

  // Tüm kullanıcıları getir (admin için)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  },

  // Kullanıcı durumunu güncelle
  async updateUserStatus(uid: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('❌ Error updating user status:', error);
      return false;
    }
  },

  // Kullanıcıyı sil
  async deleteUser(uid: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', uid);

      if (error) throw error;
      
      // Local storage'dan da sil
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY + uid);
      
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  },

  // Kullanıcı rolünü güncelle
  async updateUserRole(uid: string, role: 'normal' | 'manager' | 'admin'): Promise<boolean> {
    try {
      console.log('🔄 Updating user role:', { uid, role });
      
      const { error } = await supabase
        .from('users')
        .update({
          role: role === 'admin' ? 'admin' : 'user',
          employee_type: role, // Bu satır eklendi!
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (error) {
        console.error('❌ Supabase role update error:', error);
        throw error;
      }
      
      console.log('✅ User role updated successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error updating user role:', error);
      return false;
    }
  }
}; 