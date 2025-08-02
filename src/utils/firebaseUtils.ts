import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase bağlantı durumunu kontrol et
export const checkFirebaseConnection = async () => {
  try {
    console.log('🔍 Checking Firebase connection...');
    
    // Firestore bağlantısını test et
    const db = getFirestore();
    console.log('✅ Firestore instance created');
    
    // Auth bağlantısını test et
    const auth = getAuth();
    console.log('✅ Auth instance created');
    
    return { success: true, db, auth };
  } catch (error) {
    console.error('❌ Firebase connection check failed:', error);
    return { success: false, error };
  }
};

// Network bağlantısını kontrol et
export const checkNetworkConnection = async () => {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.error('❌ Network connection check failed:', error);
    return false;
  }
};

// Firebase bağlantı hatası için kullanıcı bilgilendirme
export const showFirebaseError = (error: any) => {
  console.error('🔥 Firebase Error:', error);
  
  // Kullanıcıya bilgi ver
  const errorMessage = document.createElement('div');
  errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md';
  errorMessage.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <div>
        <div class="font-semibold">Bağlantı Hatası</div>
        <div class="text-sm">Firebase bağlantısında sorun var. Lütfen internet bağlantınızı kontrol edin.</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(errorMessage);
  
  // 5 saniye sonra kaldır
  setTimeout(() => {
    if (errorMessage.parentNode) {
      errorMessage.parentNode.removeChild(errorMessage);
    }
  }, 5000);
};

// Firebase bağlantı durumunu izle
export const monitorFirebaseConnection = () => {
  let isConnected = true;
  
  const checkConnection = async () => {
    try {
      const networkOk = await checkNetworkConnection();
      if (!networkOk) {
        if (isConnected) {
          isConnected = false;
          showFirebaseError(new Error('Network connection lost'));
        }
      } else {
        if (!isConnected) {
          isConnected = true;
          console.log('✅ Network connection restored');
        }
      }
    } catch (error) {
      console.error('❌ Connection monitoring error:', error);
    }
  };
  
  // Her 30 saniyede bir kontrol et
  setInterval(checkConnection, 30000);
  
  return { isConnected: () => isConnected };
}; 