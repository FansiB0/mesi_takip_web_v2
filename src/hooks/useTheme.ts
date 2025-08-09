import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const useTheme = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const applyTheme = () => {
      const { theme } = settings.appearance;
      const root = document.documentElement;

      // Mevcut tema class'larını kaldır
      root.classList.remove('dark', 'light');

      if (theme === 'auto') {
        // Sistem temasını kullan
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      } else {
        // Manuel tema seçimi
        root.classList.add(theme);
      }

      // Font boyutunu uygula
      const fontSize = settings.appearance.fontSize;
      root.classList.remove('text-sm', 'text-base', 'text-lg');
      
      switch (fontSize) {
        case 'small':
          root.classList.add('text-sm');
          break;
        case 'medium':
          root.classList.add('text-base');
          break;
        case 'large':
          root.classList.add('text-lg');
          break;
        default:
          root.classList.add('text-base');
      }

      // Renk şemasını uygula
      const colorScheme = settings.appearance.colorScheme;
      root.classList.remove('scheme-blue', 'scheme-green', 'scheme-purple', 'scheme-orange');
      root.classList.add(`scheme-${colorScheme}`);

      // Compact mode'u uygula
      if (settings.appearance.compactMode) {
        root.classList.add('compact-mode');
      } else {
        root.classList.remove('compact-mode');
      }

      // Animasyonları uygula
      if (!settings.appearance.showAnimations) {
        root.classList.add('no-animations');
      } else {
        root.classList.remove('no-animations');
      }
    };

    applyTheme();

    // Sistem tema değişikliklerini dinle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.appearance.theme === 'auto') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings.appearance]);

  return { currentTheme: settings.appearance.theme };
};
