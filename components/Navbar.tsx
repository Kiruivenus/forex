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
} from 'lucide-react';
import { getStoredAccountMode, setStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';
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
  const [user, setUser] = useState<UserSession | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<AccountMode>('REAL');

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 h-14 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Hamburger Menu & Brand */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
            <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain shrink-0" />
            <span className="text-slate-900 font-extrabold text-xl">
              Pal<span className="text-purple-600">Option</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 ml-6 text-xs font-medium">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/dashboard' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/deposit' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deposit</span>
              </Link>
              <Link
                href="/withdraw"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/withdraw' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
                <span>Withdraw</span>
              </Link>
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/history' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>
              <Link
                href="/chat"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/chat' ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Support Chat
              </Link>
              {/* AI Scanner Header Button (DESKTOP ONLY) */}
              <button
                onClick={() => {
                  if (onOpenAIScanner) {
                    onOpenAIScanner();
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 border border-pink-300 hover:border-pink-400 text-pink-700 hover:text-pink-900 transition-all shadow-xs group font-bold text-xs cursor-pointer ml-1"
              >
                <AIScannerIcon className="w-5 h-5 shrink-0 drop-shadow-xs" />
                <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                  AI Scanner
                </span>
              </button>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 flex items-center space-x-1 font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Account Switcher & Wallet Display */}
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200/90 hover:border-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-xs text-slate-900"
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] ${
                      activeMode === 'DEMO' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeMode === 'DEMO' ? 'D' : 'R'}
                  </span>
                  <span className="text-slate-900 text-xs tracking-tight">
                    ${activeMode === 'DEMO'
                      ? (liveWallet?.demoBalance ?? wallet?.demoBalance ?? 10000.0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : (liveWallet?.availableBalance ?? wallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500">
                      Select Trading Account
                    </div>
                    <button
                      onClick={() => switchAccountMode('DEMO')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        activeMode === 'DEMO' ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                          D
                        </span>
                        <div>
                          <p className="font-semibold leading-tight text-slate-900">Demo Account</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ${(liveWallet?.demoBalance ?? wallet?.demoBalance ?? 10000.0).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      {activeMode === 'DEMO' && <span className="text-rose-600 font-bold text-[11px]">Active</span>}
                    </button>

                    <button
                      onClick={() => switchAccountMode('REAL')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        activeMode === 'REAL' ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          R
                        </span>
                        <div>
                          <p className="font-semibold leading-tight text-slate-900">Real Account</p>
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
                  className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate text-slate-800 font-semibold">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-800">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      <span>Profile Details</span>
                    </Link>

                    <Link
                      href="/verify-identity"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>KYC Verification</span>
                    </Link>

                    <Link
                      href="/settings/security"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Security & 2FA</span>
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium border-t border-slate-100"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>Help Center</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-left"
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
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 text-sm text-slate-800 shadow-lg">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                Deposit (M-Pesa / Crypto)
              </Link>
              <Link
                href="/withdraw"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                Withdraw
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                Transaction & Trade History
              </Link>
              <Link
                href="/verify-identity"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                KYC Verification
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-purple-700 font-medium border-b border-slate-100"
              >
                Support Chat
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-amber-700 font-bold border-b border-slate-100"
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
                className="block w-full text-center py-2 bg-slate-100 rounded-lg text-slate-800 font-medium"
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
