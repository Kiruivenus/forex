'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Simulate/API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch {
      setErrorMsg('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col font-sans">
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
              <img src="/logo.png" alt="ApexTrader Logo" className="w-7 h-7 object-contain mix-blend-screen" />
              <span className="font-extrabold text-xl tracking-tight text-white">ApexTrader</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Recover your account access
              </h1>
              <p className="text-purple-100 text-sm lg:text-base leading-relaxed opacity-90">
                Institutional-grade security protecting your trading wallet and position assets. Fast, secure account recovery.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>256-bit encrypted single-use recovery token</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Instant dispatch to your verified email</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>2FA protection and identity log security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column (Directly on dark background, NO card container) */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 bg-[#090714] w-full">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Reset password</h2>
              <p className="text-xs sm:text-sm text-slate-400">Enter your email address to receive recovery instructions</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/60 border border-emerald-600/40 p-5 rounded-2xl space-y-3 text-emerald-200">
                <div className="flex items-center space-x-2.5 font-bold text-sm text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Password Reset Email Sent</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have dispatched a password reset link to <strong className="text-white">{email}</strong>. Please check your inbox or spam folder.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 text-xs text-purple-400 hover:text-purple-300 font-bold pt-2 transition-colors"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="bg-rose-950/60 border border-rose-600/40 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#120f24] border border-purple-950 focus:border-purple-500/80 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Instructions...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-xs text-slate-400 pt-4">
              Remember your password?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
