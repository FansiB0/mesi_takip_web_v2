import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Firestore servislerini export et
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase'i global olarak export et (debug için)
export const firebase = app;

// Global window object'e bağla
if (typeof window !== 'undefined') {
  (window as any).firebase = app;
  (window as any).firebaseAuth = auth;
  (window as any).firebaseDb = db;
}

export default app; 