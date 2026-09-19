'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  ShieldAlert,
  User,
  LogOut,
  Bell,
  Cpu,
  HelpCircle,
  Menu,
  X,
  Lock,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getStoredAccountMode, setStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';
import AIScannerIcon from './AIScannerIcon';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isVerified?: boolean;
}

interface WalletState {
  availableBalance: number;
  demoBalance?: number;
  currency: string;
}

interface NavbarProps {
  onOpenAIScanner?: () => void;
  accountMode?: 'DEMO' | 'REAL';
  onAccountModeChange?: (mode: 'DEMO' | 'REAL') => void;
  liveWallet?: { availableBalance: number; demoBalance?: number } | null;
}

export default function Navbar({ onOpenAIScanner, accountMode, onAccountModeChange, liveWallet }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLight, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserSession | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<AccountMode>('REAL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setActiveMode(accountMode || getStoredAccountMode());
    const handleModeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AccountMode>;
      if (customEvent.detail) {
        setActiveMode(customEvent.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleModeEvent);
    return () => window.removeEventListener(EVENT_NAME, handleModeEvent);
  }, [accountMode]);

  const switchAccountMode = (mode: AccountMode) => {
    setStoredAccountMode(mode);
    setActiveMode(mode);
    if (onAccountModeChange) {
      onAccountModeChange(mode);
    }
    setAccountDropdownOpen(false);
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setWallet(data.wallet);
          return;
        }
      }
      setUser(null);
      setWallet(null);
    } catch (err) {
      console.error('Navbar session fetch error:', err);
      setUser(null);
      setWallet(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setWallet(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md h-14 border-b transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-xs'
          : 'bg-[#120f24]/95 border-purple-950/60 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Hamburger Menu & Brand */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`p-1 rounded-lg transition-colors focus:outline-none ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-purple-900/40'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
            <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain shrink-0" />
            <span className={`font-extrabold text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Pal<span className="text-purple-600">Option</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 ml-6 text-xs font-medium">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/dashboard'
                    ? isLight
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'bg-purple-900/50 text-purple-200 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/deposit'
                    ? isLight
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'bg-purple-900/50 text-purple-200 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deposit</span>
              </Link>
              <Link
                href="/withdraw"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/withdraw'
                    ? isLight
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'bg-purple-900/50 text-purple-200 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>Withdraw</span>
              </Link>
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/history'
                    ? isLight
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'bg-purple-900/50 text-purple-200 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>
              <Link
                href="/chat"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/chat'
                    ? isLight
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                      : 'bg-purple-900/50 text-purple-200 font-semibold'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Support Chat
              </Link>
              {/* AI Scanner Header Button */}
              <button
                onClick={() => {
                  if (onOpenAIScanner) {
                    onOpenAIScanner();
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md group font-bold text-xs cursor-pointer ml-1"
              >
                <AIScannerIcon className="w-4 h-4 shrink-0" />
                <span>AI Scanner</span>
              </button>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center space-x-1 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Action Bar (Matching Image 3: Sound Icon + Moon/Sun Theme Icon + Account + Deposit + Avatar) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Sound Mute/Unmute Toggle Icon (Matching Image 3) */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className={`p-1.5 rounded-lg border transition-colors shadow-xs ${
              isLight
                ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                : 'bg-purple-950/50 border-purple-900/60 hover:bg-purple-900/60 text-slate-300'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* LIGHT MODE / DARK MODE TOGGLE BUTTON (Exact Image 3 Match: Moon / Sun Icon) */}
          <button
            onClick={toggleTheme}
            title={isLight ? 'Turn Off Light Mode (Dark Mode)' : 'Turn On Light Mode'}
            className={`p-1.5 rounded-lg border transition-all shadow-xs flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                : 'bg-purple-950/50 border-purple-900/60 hover:bg-purple-900/60 text-slate-200'
            }`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {user ? (
            <>
              {/* Account Switcher & Wallet Display */}
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className={`flex items-center space-x-1.5 border px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-xs ${
                    isLight
                      ? 'bg-slate-100 border-slate-200/90 hover:border-slate-300 text-slate-900'
                      : 'bg-[#1b1633] border-purple-800/60 hover:border-purple-500/80 text-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] ${
                      activeMode === 'DEMO' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeMode === 'DEMO' ? 'D' : 'R'}
                  </span>
                  <span className="text-xs tracking-tight">
                    ${activeMode === 'DEMO'
                      ? (liveWallet?.demoBalance ?? wallet?.demoBalance ?? 10000.0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : (liveWallet?.availableBalance ?? wallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </button>

                {accountDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 text-xs border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#16122c] border-purple-900/80 text-slate-200'
                    }`}
                  >
                    <div className="px-3 py-1.5 border-b text-[10px] uppercase font-bold text-slate-500">
                      Select Trading Account
                    </div>
                    <button
                      onClick={() => switchAccountMode('DEMO')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        activeMode === 'DEMO'
                          ? isLight ? 'bg-slate-100 font-bold text-slate-900' : 'bg-purple-900/50 font-bold text-white'
                          : isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-purple-900/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                          D
                        </span>
                        <div>
                          <p className="font-semibold leading-tight">Demo Account</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ${(liveWallet?.demoBalance ?? wallet?.demoBalance ?? 10000.0).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {activeMode === 'DEMO' && <span className="text-rose-600 font-bold text-[11px]">Active</span>}
                    </button>

                    <button
                      onClick={() => switchAccountMode('REAL')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        activeMode === 'REAL'
                          ? isLight ? 'bg-slate-100 font-bold text-slate-900' : 'bg-purple-900/50 font-bold text-white'
                          : isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-purple-900/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          R
                        </span>
                        <div>
                          <p className="font-semibold leading-tight">Real Account</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ${(liveWallet?.availableBalance ?? wallet?.availableBalance ?? 0).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {activeMode === 'REAL' && <span className="text-emerald-600 font-bold text-[11px]">Active</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Deposit Quick Action Button */}
              <Link
                href="/deposit"
                className="hidden sm:flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
              >
                <span>Deposit</span>
              </Link>

              {/* User Avatar Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-1 p-1.5 rounded-lg border text-xs transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate font-semibold">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 text-xs border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#16122c] border-purple-900/60 text-slate-200'
                    }`}
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="font-bold truncate">{user.name}</p>
                      <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                        Role: {user.role}
                      </span>
                    </div>

                    {/* Quick Light/Dark Mode Switcher inside profile menu */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-medium"
                    >
                      <div className="flex items-center space-x-2">
                        {isLight ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        <span>{isLight ? 'Light Mode ON' : 'Dark Mode ON'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-purple-200">
                        Toggle
                      </span>
                    </button>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-medium"
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      <span>Profile Details</span>
                    </Link>

                    <Link
                      href="/verify-identity"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>KYC Verification</span>
                    </Link>

                    <Link
                      href="/settings/security"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-medium"
                    >
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Security & 2FA</span>
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-medium border-t"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>Help Center</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 py-3 space-y-2 text-sm shadow-lg ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#16122b] border-purple-900/60 text-slate-200'
          }`}
        >
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-2 text-purple-700 dark:text-purple-300 font-bold border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center space-x-2">
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-400" />}
              <span>Theme: {isLight ? 'Light Mode (Active)' : 'Dark Mode (Active)'}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              Switch Theme
            </span>
          </button>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                Deposit (M-Pesa / Crypto)
              </Link>
              <Link
                href="/withdraw"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                Withdraw
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                Transaction & Trade History
              </Link>
              <Link
                href="/verify-identity"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                KYC Verification
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-purple-700 font-medium border-b border-slate-100 dark:border-slate-800"
              >
                Support Chat
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-amber-600 font-bold border-b border-slate-100 dark:border-slate-800"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-rose-600 font-bold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-purple-600 rounded-lg text-white font-bold"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
