import { 
  updatePassword, 
  deleteUser, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Güvenlik servisi
export const securityService = {
  // Şifre değiştir
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      // Mevcut şifre ile yeniden doğrula
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Yeni şifreyi ayarla
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Mevcut şifre hatalı' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Yeni şifre çok zayıf' };
      } else {
        return { success: false, error: 'Şifre değiştirilirken hata oluştu' };
      }
    }
  },

  // Hesabı sil
  async deleteAccount(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      // Şifre ile yeniden doğrula
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Hesabı sil
      await deleteUser(user);

      return { success: true };
    } catch (error: any) {
      console.error('Hesap silme hatası:', error);
      
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Şifre hatalı' };
      } else {
        return { success: false, error: 'Hesap silinirken hata oluştu' };
      }
    }
  },

  // İki faktörlü kimlik doğrulama durumunu kontrol et
  async getTwoFactorStatus(): Promise<{ enabled: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { enabled: false, error: 'Kullanıcı bulunamadı' };
      }

      // Firebase Auth'da 2FA durumunu kontrol et
      const multiFactor = user.multiFactor;
      const enrolledFactors = multiFactor.enrolledFactors;

      return { enabled: enrolledFactors.length > 0 };
    } catch (error: any) {
      console.error('2FA durum kontrolü hatası:', error);
      return { enabled: false, error: '2FA durumu kontrol edilemedi' };
    }
  },

  // Aktif oturumları getir (simulated)
  async getActiveSessions(): Promise<{ sessions: any[]; error?: string }> {
    try {
      // Bu Firebase Auth'da doğrudan desteklenmiyor, 
      // gerçek uygulamada backend API kullanılır
      const sessions = [
        {
          id: '1',
          device: 'Chrome - Windows',
          location: 'İstanbul, Türkiye',
          lastActive: new Date().toISOString(),
          current: true
        }
      ];

      return { sessions };
    } catch (error: any) {
      console.error('Oturum bilgileri alınırken hata:', error);
      return { sessions: [], error: 'Oturum bilgileri alınamadı' };
    }
  }
}; 