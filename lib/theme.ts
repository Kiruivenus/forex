export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'paloption_theme';
export const THEME_EVENT_NAME = 'paloption-theme-change';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT_NAME, { detail: theme }));
}

export function initTheme(): ThemeMode {
  const current = getStoredTheme();
  if (typeof window !== 'undefined') {
    if (current === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  return current;
}
