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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md h-14 border-b transition-colors bg-white/95 dark:bg-[#120f24]/95 border-slate-200/90 dark:border-purple-950/60 text-slate-800 dark:text-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          {/* Hamburger Menu & Brand */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-1 rounded-lg transition-colors focus:outline-none text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-2xl bg-[#7c3aed] text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                P
              </div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white hidden sm:inline">
                Pal<span className="text-purple-600 dark:text-purple-400">Option</span>
              </span>
            </Link>

            {/* Platform Trader Badge Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-200 text-xs font-semibold">
              <span className="w-5 h-5 rounded bg-purple-800/80 text-purple-300 font-bold text-[10px] flex items-center justify-center">TO</span>
              <span>PalOption Trader</span>
            </div>

            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1 ml-6 text-xs font-medium">
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  Trader Hub
                </Link>
                <Link
                  href="/deposit"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                    pathname === '/deposit'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Deposit</span>
                </Link>
                <Link
                  href="/withdraw"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                    pathname === '/withdraw'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />
                  <span>Withdraw</span>
                </Link>
                <Link
                  href="/history"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                    pathname === '/history'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </Link>
                <Link
                  href="/chat"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === '/chat'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
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

          {/* Right Action Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Sound Mute/Unmute Toggle Icon */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-1.5 rounded-lg border transition-colors shadow-xs bg-slate-100 dark:bg-purple-950/50 border-slate-200 dark:border-purple-900/60 hover:bg-slate-200 dark:hover:bg-purple-900/60 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* LIGHT MODE / DARK MODE TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              title={isLight ? 'Turn Off Light Mode (Dark Mode)' : 'Turn On Light Mode'}
              className="p-1.5 rounded-lg border transition-all shadow-xs flex items-center justify-center bg-slate-100 dark:bg-purple-950/50 border-slate-200 dark:border-purple-900/60 hover:bg-slate-200 dark:hover:bg-purple-900/60 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Sun className="w-4 h-4 text-amber-500 dark:hidden" />
              <Moon className="w-4 h-4 text-purple-400 hidden dark:block" />
            </button>

            {user ? (
              <>
                {/* Account Switcher & Wallet Display */}
                <div className="relative">
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center space-x-1.5 border px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all shadow-xs bg-[#1b1633] border-purple-800/60 hover:border-purple-500/80 text-white cursor-pointer"
                  >
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-extrabold text-[11px] ${
                        activeMode === 'DEMO' ? 'bg-rose-600 text-white' : 'bg-[#7c3aed] text-white'
                      }`}
                    >
                      {activeMode === 'DEMO' ? 'D' : 'R'}
                    </span>
                    <span className="text-xs font-extrabold tracking-tight text-white">
                      ${activeMode === 'DEMO'
                        ? (liveWallet?.demoBalance ?? wallet?.demoBalance ?? 10000.0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : (liveWallet?.availableBalance ?? wallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 text-[10px]">▼</span>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 text-xs border bg-[#16122c] border-purple-900/80 text-slate-200">
                      <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                        Select Trading Account
                      </div>
                      <button
                        onClick={() => switchAccountMode('DEMO')}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                          activeMode === 'DEMO'
                            ? 'bg-purple-900/50 font-bold text-white'
                            : 'text-slate-300 hover:bg-purple-900/40'
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
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                          activeMode === 'REAL'
                            ? 'bg-purple-900/50 font-bold text-white'
                            : 'text-slate-300 hover:bg-purple-900/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px]">
                            R
                          </span>
                          <div>
                            <p className="font-semibold leading-tight">Real Account</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              ${(liveWallet?.availableBalance ?? wallet?.availableBalance ?? 0).toFixed(2)} USD
                            </p>
                          </div>
                        </div>
                        {activeMode === 'REAL' && <span className="text-emerald-400 font-bold text-[11px]">Active</span>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Deposit Quick Action Button */}
                <Link
                  href="/deposit"
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md transition-all"
                >
                  <span>Deposit</span>
                </Link>

                {/* Notification Bell Button */}
                <button
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-purple-900/40 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
      </header>

      {/* Side Drawer Menu (Outside header to allow full-screen fixed positioning matching Screenshot 2) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex animate-fade-in">
          {/* Backdrop Blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Container (Screenshot 2) */}
          <div className="relative w-72 sm:w-80 bg-[#120e26] border-r border-[#241a45] text-white flex flex-col justify-between h-full shadow-2xl z-[101] overflow-y-auto animate-slide-right">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#241a45] flex items-center justify-between">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-base text-white">Menu</h3>
                <div className="px-2 py-0.5 rounded bg-[#1e173e] text-xs font-semibold text-slate-300 border border-[#2b2256]">
                  GB EN
                </div>
              </div>

              {/* User Profile Info Card (Screenshot 2) */}
              <div className="p-5 border-b border-[#241a45] flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-[#7c3aed] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-base truncate">
                    {user?.name || 'Patrick Kirui'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email ? `${user.email.slice(0, 2)}***${user.email.slice(user.email.indexOf('@') - 2)}` : 'Pa***13@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Drawer Menu Items List */}
              <div className="p-3 space-y-1 text-xs font-semibold">
                {/* Brand Logo item */}
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1c163a] cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#7c3aed] text-white font-extrabold flex items-center justify-center text-xs">
                    P
                  </div>
                  <span className="font-bold text-white text-sm">PalOption</span>
                </div>

                {/* Account Settings */}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Account settings</span>
                  </div>
                  <span className="text-slate-500 text-xs">›</span>
                </Link>

                {/* Deposit */}
                <Link
                  href="/deposit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ArrowDownLeft className="w-4 h-4 text-slate-400" />
                    <span>Deposit</span>
                  </div>
                  <span className="text-slate-500 text-xs">›</span>
                </Link>

                {/* Withdraw */}
                <Link
                  href="/withdraw"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    <span>Withdraw</span>
                  </div>
                  <span className="text-slate-500 text-xs">›</span>
                </Link>

                {/* History */}
                <Link
                  href="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>History</span>
                  </div>
                  <span className="text-slate-500 text-xs">›</span>
                </Link>

                {/* Refer & Earn (Highlighted Item in Screenshot 2) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#23184a] text-purple-300 border border-purple-800/40 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-base">🎁</span>
                    <span className="font-bold text-purple-200">Refer & Earn</span>
                  </div>
                </div>

                {/* Dark Theme Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200">
                  <div className="flex items-center space-x-3">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <span>Dark theme</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      !isLight ? 'bg-[#7c3aed]' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                        !isLight ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Help Centre */}
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Help Centre</span>
                  </div>
                </Link>

                {/* Responsible Trading */}
                <Link
                  href="/responsible-trading"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1c163a] text-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span>Responsible Trading</span>
                  </div>
                  <span className="text-slate-500 text-xs">›</span>
                </Link>

                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-rose-400 hover:bg-rose-950/30 text-left font-bold cursor-pointer pt-4 border-t border-[#241a45]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer Timestamp */}
            <div className="p-4 text-[11px] text-slate-500 font-mono text-center border-t border-[#241a45]">
              2026-09-22 18:43:40 GMT •
            </div>
          </div>
        </div>
      )}
    </>
  );
}


