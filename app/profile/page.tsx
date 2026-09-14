'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Globe, ShieldCheck, Calendar, Lock, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      });
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Trader Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">User Profile & Account Info</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Review registered account details and identity status.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-950/20 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-slate-800 pb-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-purple-950/50 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-semibold uppercase tracking-wider">
                  Role: {user.role}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                    user.isVerified
                      ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-950/50 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {user.isVerified ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>KYC Verified Trader</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>Unverified Identity</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Full Name</span>
              </div>
              <span className="font-semibold text-slate-100 block text-xs">{user.name}</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email Address</span>
              </div>
              <span className="font-semibold text-slate-100 block text-xs">{user.email}</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Phone Number</span>
              </div>
              <span className="font-semibold text-slate-100 block text-xs">{user.phone || 'N/A'}</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Country Jurisdiction</span>
              </div>
              <span className="font-semibold text-slate-100 block text-xs">{user.country || 'Kenya'}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

