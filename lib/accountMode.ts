export type AccountMode = 'DEMO' | 'REAL';

const STORAGE_KEY = 'paloption_account_mode';
export const EVENT_NAME = 'paloptionAccountModeChanged';

export function getStoredAccountMode(): AccountMode {
  if (typeof window === 'undefined') return 'REAL';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return 'REAL';
  return saved === 'DEMO' ? 'DEMO' : 'REAL';
}

export function setStoredAccountMode(mode: AccountMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: mode }));
}

