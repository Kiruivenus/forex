'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredTheme, setStoredTheme, applyThemeClass, THEME_EVENT_NAME, ThemeMode } from '@/lib/theme';

interface ThemeContextType {
  theme: ThemeMode;
  isLight: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isLight: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    applyThemeClass(initialTheme);
    setMounted(true);

    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'paloption_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setTheme(e.newValue);
        applyThemeClass(e.newValue);
      }
    };

    window.addEventListener(THEME_EVENT_NAME, handleThemeEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(THEME_EVENT_NAME, handleThemeEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
    setStoredTheme(mode);
  };

  const isLight = mounted ? theme === 'light' : false;

  return (
    <ThemeContext.Provider value={{ theme, isLight, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
