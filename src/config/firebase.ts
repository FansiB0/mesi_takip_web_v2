import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signOut, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

console.log('🔍 Testing Firebase imports...');
console.log('📦 Firebase modules loaded:', { initializeApp, getAuth, getFirestore });

// Firebase konfigürasyonu - Environment variables'dan al
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwuGiCbhncNHERF9vOV1wV5QiA3RXdgPk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mesi-takip-web-v1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mesi-takip-web-v1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mesi-takip-web-v1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1061767802586",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1061767802586:web:edefb08963448c70b2bfe3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-75T6X9CPSP"
};

console.log('⚙️ Firebase config:', firebaseConfig);

// Firebase'i başlat
console.log('🚀 Initializing Firebase app...');
let app;
try {
  console.log('🚀 About to call initializeApp...');
  console.log('🚀 initializeApp function:', typeof initializeApp);
  console.log('🚀 firebaseConfig:', firebaseConfig);
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  console.log('✅ App name:', app.name);
  console.log('✅ App options:', app.options);
} catch (error: any) {
  console.error('❌ Firebase app initialization failed:', error);
  console.error('❌ Error message:', error.message);
  console.error('❌ Error stack:', error.stack);
  throw error;
}

// Auth ve Firestore servislerini export et
console.log('🔐 Initializing Firebase Auth...');
export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized:', auth);

console.log('🗄️ Initializing Firestore...');
export const db = getFirestore(app);
console.log('✅ Firestore initialized:', db);

// Development ortamında emulator kullan (şimdilik devre dışı)
if (import.meta.env.DEV && false) {
  console.log('🔧 Development mode detected, connecting to emulator...');
  
  try {
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Auth emulator connected');
    
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore emulator connected');
  } catch (error: any) {
    console.warn('⚠️ Emulator connection failed, using production:', error.message);
  }
} else {
  console.log('🌐 Using production Firebase services');
}

// Firebase'i global olarak export et (debug için)
export const firebase = app;

// Auth fonksiyonlarını export et
export { signInAnonymously, signOut };

// Global window object'e bağla (sadece development ortamında)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log('🌐 Binding Firebase to window object...');
  try {
    (window as any).firebase = app;
    (window as any).firebaseAuth = auth;
    (window as any).firebaseDb = db;
    (window as any).auth = auth;
    (window as any).db = db;
    
    console.log('🔥 Firebase successfully bound to window object');
    console.log('window.firebase:', (window as any).firebase);
    console.log('window.auth:', (window as any).auth);
    console.log('window.db:', (window as any).db);
    console.log('window.firebaseAuth:', (window as any).firebaseAuth);
    console.log('window.firebaseDb:', (window as any).firebaseDb);
  } catch (error) {
    console.error('❌ Error binding Firebase to window:', error);
  }
} else if (import.meta.env.DEV) {
  console.log('⚠️ Window object not available (server-side)');
}

export default app; 