'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Mail, User, Phone, Globe, AlertCircle, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { setStoredAccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { isLight } = useTheme();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the Terms of Service and Risk Disclosure Policy.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, country, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStoredAccountMode('REAL');
        router.push('/dashboard');
      } else {
        setErrorMsg(data.message || 'Registration failed. Please check inputs.');
      }
    } catch {
      setErrorMsg('Network error during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors bg-[#f8fafc] dark:bg-[#090714] text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Main split layout container */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 pt-14 min-h-[calc(100vh)]">
        {/* Left Hero Panel */}
        <div className="hidden md:flex flex-col justify-center px-8 lg:px-16 py-12 bg-gradient-to-br from-fuchsia-700 via-purple-700 to-indigo-950 relative overflow-hidden text-white border-r border-purple-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg space-y-8">
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain mix-blend-screen" />
              <span className="font-extrabold text-xl tracking-tight text-white">PalOption</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Start your trading journey today
              </h1>
              <p className="text-purple-100 text-sm lg:text-base leading-relaxed opacity-90">
                Join over a million traders worldwide. Get access to powerful tools, real-time data, and instant payouts.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Free demo with $10,000 virtual funds</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Trade 100+ assets — crypto, forex, synthetic indices</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Up to 95% profit on winning trades</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-purple-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Instant deposits, fast withdrawals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 w-full transition-colors bg-[#f8fafc] dark:bg-[#090714]">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Create account</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Fill in your details to get started</p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-600/40 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                    required
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Phone Number (M-Pesa)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="2547XXXXXXXX"
                      className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none transition-colors bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Country</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none transition-colors appearance-none cursor-pointer bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                    >
                      <option value="Kenya">Kenya</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Uganda">Uganda</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>
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
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none transition-colors bg-white dark:bg-[#120f24] border-slate-200 dark:border-purple-950 text-slate-900 dark:text-slate-100 focus:border-purple-600 dark:focus:border-purple-500/80"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-purple-900 bg-purple-600 text-white focus:ring-purple-500 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span className="leading-tight">
                    I agree to the{' '}
                    <Link href="/responsible-trading" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/responsible-trading" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs pt-4 text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold transition-colors">
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
