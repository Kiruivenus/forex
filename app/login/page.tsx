'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Mail, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { setStoredAccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isLight } = useTheme();

  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (data.success && data.user) {
            window.location.href = '/dashboard';
          }
        });
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStoredAccountMode('REAL');
        if (data.requires2FA) {
          router.push(`/2fa?userId=${data.userId}`);
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setErrorMsg(data.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setErrorMsg('Network error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors bg-[#f8fafc] dark:bg-[#090714] text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Main split layout container */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 pt-14 min-h-[calc(100vh)]">
        {/* Left Hero Panel (Desktop Mode) */}
        <div className="hidden md:flex flex-col justify-center px-8 lg:px-16 py-12 bg-gradient-to-br from-fuchsia-700 via-purple-700 to-indigo-950 relative overflow-hidden text-white border-r border-purple-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg space-y-8">
            {/* Frameless Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain mix-blend-screen" />
              <span className="font-extrabold text-xl tracking-tight text-white">PalOption</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Trade smarter with real-time markets
              </h1>
              <p className="text-purple-100 text-sm lg:text-base leading-relaxed opacity-90">
                Access 100+ assets, microsecond execution, and up to 95% returns — all from one institutional trading terminal.
              </p>
            </div>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
              <div>
                <p className="text-2xl lg:text-3xl font-black text-white">1M+</p>
                <p className="text-xs text-purple-200/80 uppercase font-medium tracking-wider mt-0.5">Traders</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-black text-white">100+</p>
                <p className="text-xs text-purple-200/80 uppercase font-medium tracking-wider mt-0.5">Assets</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-black text-white">95%</p>
                <p className="text-xs text-purple-200/80 uppercase font-medium tracking-wider mt-0.5">Payout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 w-full transition-colors bg-[#f8fafc] dark:bg-[#090714]">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Sign in to your account to continue</p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-600/40 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none transition-colors bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-purple-900 bg-purple-600 text-white focus:ring-purple-500 w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>

                <Link href="/forgot-password" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs pt-4 text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
