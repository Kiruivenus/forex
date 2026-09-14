'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Globe, ShieldCheck, Calendar, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-6">
          <div className="flex items-center space-x-4 border-b border-purple-950 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-purple-900/50">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">{user.name}</h1>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-semibold">
                  Role: {user.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                    user.isVerified ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user.isVerified ? 'KYC Verified' : 'Unverified Identity'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 space-y-1">
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-100">{user.name}</span>
            </div>

            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 space-y-1">
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="font-semibold text-slate-100">{user.email}</span>
            </div>

            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 space-y-1">
              <span className="text-slate-400 block text-[11px]">Phone Number</span>
              <span className="font-semibold text-slate-100">{user.phone}</span>
            </div>

            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 space-y-1">
              <span className="text-slate-400 block text-[11px]">Country</span>
              <span className="font-semibold text-slate-100">{user.country}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
