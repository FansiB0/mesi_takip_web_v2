import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

console.log('🔍 Testing Firebase imports...');
console.log('📦 Firebase modules loaded:', { initializeApp, getAuth, getFirestore });

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyAwuGiCbhncNHERF9vOV1wV5QiA3RXdgPk",
  authDomain: "mesi-takip-web-v1.firebaseapp.com",
  projectId: "mesi-takip-web-v1",
  storageBucket: "mesi-takip-web-v1.firebasestorage.app",
  messagingSenderId: "1061767802586",
  appId: "1:1061767802586:web:edefb08963448c70b2bfe3",
  measurementId: "G-75T6X9CPSP"
};

console.log('⚙️ Firebase config:', firebaseConfig);

// Firebase'i başlat
console.log('🚀 Initializing Firebase app...');
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Auth ve Firestore servislerini export et
console.log('🔐 Initializing Firebase Auth...');
export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized:', auth);

console.log('🗄️ Initializing Firestore...');
export const db = getFirestore(app);
console.log('✅ Firestore initialized:', db);

// Firebase'i global olarak export et (debug için)
export const firebase = app;

// Global window object'e bağla
console.log('🌐 Binding Firebase to window object...');
if (typeof window !== 'undefined') {
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
} else {
  console.log('⚠️ Window object not available (server-side)');
}

export default app; 