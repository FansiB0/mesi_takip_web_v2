import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Supabase bağlantı testi (sadece development ortamında)
if (import.meta.env.DEV) {
  console.log('✅ Supabase configuration loaded in main.tsx');
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
