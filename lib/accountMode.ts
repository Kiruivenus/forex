export type AccountMode = 'DEMO' | 'REAL';

const STORAGE_KEY = 'apex_account_mode';
export const EVENT_NAME = 'apexAccountModeChanged';

export function getStoredAccountMode(): AccountMode {
  if (typeof window === 'undefined') return 'DEMO';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'REAL' ? 'REAL' : 'DEMO';
}

export function setStoredAccountMode(mode: AccountMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: mode }));
}
