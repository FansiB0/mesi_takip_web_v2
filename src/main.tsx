import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Firebase'i doğrudan import et
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

console.log('🔍 Testing Firebase imports in main.tsx...');
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
  console.log('🚀 About to call initializeApp...');
  console.log('🚀 initializeApp function:', typeof initializeApp);
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  console.log('✅ App name:', app.name);
  console.log('✅ App options:', app.options);
} catch (error: any) {
  console.error('❌ Firebase app initialization failed:', error);
  console.error('❌ Error message:', error.message);
  console.error('❌ Error stack:', error.stack);
}

// Auth ve Firestore servislerini başlat
let auth, db;
if (app) {
  console.log('🔐 Initializing Firebase Auth...');
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized:', auth);

  console.log('🗄️ Initializing Firestore...');
  db = getFirestore(app);
  console.log('✅ Firestore initialized:', db);
} else {
  console.error('❌ Cannot initialize Firebase services - app is undefined');
}

// Firebase'i global olarak tanımla (debug için)
(window as any).firebase = app;
(window as any).firebaseAuth = auth;
(window as any).firebaseDb = db;
(window as any).auth = auth;
(window as any).db = db;

console.log('🔥 Firebase successfully bound to window object');
console.log('🚀 Firebase initialized globally:', app);
console.log('🚀 Firebase auth available:', auth);
console.log('🚀 Firebase db available:', db);
console.log('🚀 Window.firebase:', (window as any).firebase);
console.log('🚀 Window.auth:', (window as any).auth);
console.log('🚀 Window.db:', (window as any).db);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
