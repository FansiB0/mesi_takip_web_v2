import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { firebase, auth, db } from './config/firebase';

// Firebase'i global olarak tanımla (debug için)
(window as any).firebase = firebase;
(window as any).firebaseAuth = auth;
(window as any).firebaseDb = db;
(window as any).auth = auth;
(window as any).db = db;

console.log('🚀 Firebase initialized globally:', firebase);
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
