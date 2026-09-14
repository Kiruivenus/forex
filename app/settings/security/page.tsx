'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Shield, CheckCircle2, AlertCircle, Loader2, QrCode } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(data.message || 'Failed to update password.');
      }
    } catch {
      setErrorMsg('Network error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">Security & Password Management</h1>
              <p className="text-xs text-slate-400">Configure account credentials and authenticator 2FA</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-purple-200">Change Password</h3>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 chars"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                  required
                />
              </div>
            </div>

            {successMsg && (
              <div className="bg-emerald-950/50 border border-emerald-600/40 p-3 rounded-xl text-emerald-300">
                <p>{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-xl text-rose-300">
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* 2FA Section */}
          <div className="pt-6 border-t border-purple-950 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-purple-200 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Two-Factor Authentication (2FA)</span>
            </h3>
            <p className="text-slate-400">
              Enhance account security by linking an authenticator app (Google Authenticator, Authy).
            </p>
            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Authenticator App Status</span>
                <span className="text-[11px] text-slate-400">Protected login & sensitive payouts</span>
              </div>
              <button className="px-4 py-2 bg-purple-950 text-purple-300 border border-purple-800/40 rounded-lg hover:bg-purple-900/50 font-semibold">
                Setup 2FA
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
