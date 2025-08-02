import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Firebase'i config dosyasından import et
import { firebase, auth, db, signInAnonymously, signOut } from './config/firebase';

console.log('🔍 Firebase imported from config in main.tsx...');
console.log('📦 Firebase instances:', { firebase, auth, db });

// Firebase bağlantısını test et (sadece development ortamında)
if (import.meta.env.DEV) {
  const testFirebaseConnection = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      // Firebase app'in başlatılıp başlatılmadığını kontrol et
      if (!firebase) {
        console.error('❌ Firebase app is not initialized');
        return;
      }
      
      // Auth'un başlatılıp başlatılmadığını kontrol et
      if (!auth) {
        console.error('❌ Firebase auth is not initialized');
        return;
      }
      
      console.log('✅ Firebase services initialized successfully');
      
    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
    }
  };

  // Test'i çalıştır
  testFirebaseConnection();
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
