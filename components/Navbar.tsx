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

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isVerified?: boolean;
}

interface WalletState {
  availableBalance: number;
  currency: string;
}

interface NavbarProps {
  onOpenAIScanner?: () => void;
}

export default function Navbar({ onOpenAIScanner }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setWallet(data.wallet);
        }
      }
    } catch (err) {
      console.error('Navbar session fetch error:', err);
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
  };

  return (
    <header className="sticky top-0 z-40 bg-[#120f24] border-b border-purple-950/60 text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent font-extrabold text-xl">
              Apex<span className="text-purple-400">Trader</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 ml-6 text-xs font-medium">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/dashboard' ? 'bg-purple-900/50 text-purple-200 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/deposit' ? 'bg-purple-900/50 text-purple-200 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deposit</span>
              </Link>
              <Link
                href="/withdraw"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/withdraw' ? 'bg-purple-900/50 text-purple-200 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Withdraw</span>
              </Link>
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${
                  pathname === '/history' ? 'bg-purple-900/50 text-purple-200 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>
              <Link
                href="/chat"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === '/chat' ? 'bg-purple-900/50 text-purple-200 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Support Chat
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center space-x-1 font-semibold"
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
          {/* AI Entry Scanner Action Button */}
          {onOpenAIScanner && (
            <button
              onClick={onOpenAIScanner}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-md shadow-purple-900/30 transition-all border border-purple-400/30"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span className="hidden sm:inline">AI Scanner</span>
            </button>
          )}

          {user ? (
            <>
              {/* Wallet Balance Display */}
              <Link
                href="/deposit"
                className="flex items-center space-x-2 bg-[#1b1633] border border-purple-800/40 hover:border-purple-600/60 px-3 py-1 rounded-lg text-xs transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 hidden sm:inline">Balance:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ${wallet ? wallet.availableBalance.toFixed(2) : '0.00'}
                </span>
              </Link>

              {/* User Avatar Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700/80 p-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#16122c] border border-purple-900/60 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-purple-950/80">
                      <p className="font-semibold text-slate-100 truncate">{user.name}</p>
                      <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-semibold">
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-900/40 text-slate-200"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Profile Details</span>
                    </Link>

                    <Link
                      href="/verify-identity"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-900/40 text-slate-200"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>KYC Verification</span>
                    </Link>

                    <Link
                      href="/settings/security"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-900/40 text-slate-200"
                    >
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Security & 2FA</span>
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-purple-900/40 text-slate-200 border-t border-purple-950/80"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Help Center</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-950/50 text-red-400 font-medium text-left"
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
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#16122b] border-b border-purple-900/60 px-4 py-3 space-y-2 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                Trader Hub
              </Link>
              <Link
                href="/deposit"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                Deposit (M-Pesa / Crypto)
              </Link>
              <Link
                href="/withdraw"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                Withdraw
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                Transaction & Trade History
              </Link>
              <Link
                href="/verify-identity"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                KYC Verification
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-200 hover:text-purple-300 border-b border-slate-800"
              >
                Support Chat
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-amber-400 font-semibold border-b border-slate-800"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-400 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-slate-800 rounded-lg text-slate-200"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-purple-600 rounded-lg text-white font-semibold"
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
