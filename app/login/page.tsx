'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TrendingUp, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          if (data.success && data.user) {
            router.push('/dashboard');
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
        if (data.requires2FA) {
          router.push(`/2fa?userId=${data.userId}`);
        } else {
          router.push('/dashboard');
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
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 pt-20 sm:pt-24 pb-12">
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img src="/logo.png" alt="ApexTrader Logo" className="w-14 h-14 object-contain mix-blend-screen" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to access your trading workspace</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-xl flex items-start space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Password</label>
                <Link href="/forgot-password" className="text-purple-400 hover:underline text-[11px]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-purple-950">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-purple-400 hover:underline font-semibold">
              Create Free Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
