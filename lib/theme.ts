export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'paloption_theme';
export const THEME_EVENT_NAME = 'paloption-theme-change';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark'; // Default theme is DARK
}

export function applyThemeClass(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyThemeClass(theme);
  window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT_NAME, { detail: theme }));
}

export function initTheme(): ThemeMode {
  const current = getStoredTheme();
  applyThemeClass(current);
  return current;
}
