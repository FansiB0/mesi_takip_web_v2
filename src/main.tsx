import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { firebase, auth, db } from './config/firebase';

// Firebase'i global olarak tanımla (debug için)
(window as any).firebase = firebase;
(window as any).firebaseAuth = auth;
(window as any).firebaseDb = db;

console.log('Firebase initialized globally:', firebase);
console.log('Firebase auth available:', auth);
console.log('Firebase db available:', db);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
