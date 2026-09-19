'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Globe, ShieldCheck, Calendar, Lock, ShieldAlert } from 'lucide-react';
import { getStoredTheme, THEME_EVENT_NAME, ThemeMode } from '@/lib/theme';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    setTheme(getStoredTheme());
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener(THEME_EVENT_NAME, handleThemeChange);
    return () => window.removeEventListener(THEME_EVENT_NAME, handleThemeChange);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      });
  }, []);

  if (!user) return null;

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#07090e] text-slate-100'}`}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Trader Account</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>User Profile & Account Info</h1>
          <p className={`text-xs sm:text-sm max-w-md ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Review registered account details and identity status.
          </p>
        </div>

        {/* Main Card */}
        <div className={`border rounded-3xl p-5 sm:p-8 shadow-md space-y-6 transition-colors ${
          isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900/60 border-purple-500/20'
        }`}>
          <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b pb-6 text-center sm:text-left ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center font-bold text-3xl text-white shadow-md shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5 flex-1">
              <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  Role: {user.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                    user.isVerified
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500/30 dark:text-emerald-400'
                      : 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/50 dark:border-amber-500/30 dark:text-amber-400'
                  }`}
                >
                  {user.isVerified ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Trader (KYC Passed)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>Unverified (KYC Pending)</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Phone Number (M-Pesa)</span>
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{user.phone || 'Not Provided'}</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Country of Residence</span>
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{user.country || 'Kenya'}</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Account Member Since</span>
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'}`}>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Two-Factor Auth (2FA)</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Enabled</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
