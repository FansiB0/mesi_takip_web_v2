import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { firebase } from './config/firebase';

// Firebase'i global olarak tanımla (debug için)
(window as any).firebase = firebase;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
