'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIEntryScannerModal from '@/components/AIEntryScannerModal';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Smartphone,
  Bitcoin,
  ArrowRight,
  BarChart3,
  Lock,
  Globe,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStoredTheme, THEME_EVENT_NAME, ThemeMode } from '@/lib/theme';

export default function LandingPage() {
  const router = useRouter();
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
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

  useEffect(() => {
    setFaqs([
      {
        question: 'How fast are deposits processed via Safaricom M-Pesa?',
        answer: 'M-Pesa STK Push deposits are processed instantly via our Safaricom Daraja integration. Funds credit to your wallet balance within 3-5 seconds after entering your PIN.',
      },
      {
        question: 'What is the minimum stake for executing a trade contract?',
        answer: 'The minimum trade stake is $1.00 USD, allowing you to manage risk precisely across synthetic indices, forex pairs, and crypto contracts.',
      },
      {
        question: 'How does the AI Entry Scanner generate signals?',
        answer: 'The AI Entry Scanner computes multi-timeframe convergence of RSI, EMA trend momentum, and tick volatility. It provides analytical direction, confidence ratings, and entry bounds.',
      },
    ]);
  }, []);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0e17] text-slate-100'}`}>
      <Navbar onOpenAIScanner={() => setIsAIScannerOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Next-Generation High-Frequency Trading Terminal</span>
        </div>

        <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Institutional Speed.{' '}
          <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-300 dark:to-indigo-400 bg-clip-text text-transparent">
            Algorithmic Edge.
          </span>
        </h1>

        <p className={`mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Trade Synthetic Volatility Indices, Forex Pairs, and Crypto with microsecond execution, automated M-Pesa STK Push deposits, and AI-driven entry scanning.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Open Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl border font-semibold text-sm transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            Terminal Login
          </Link>
        </div>

        {/* Live Terminal Preview Frame */}
        <div className={`mt-12 max-w-5xl mx-auto rounded-2xl border p-2 sm:p-4 shadow-xl relative text-left transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#120f26] border-purple-900/60'
        }`}>
          <div className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs mb-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181335] border-purple-950'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <img src="/logo.png" alt="PalOption Logo" className="w-5 h-5 object-contain ml-2 shrink-0" />
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">PalOption Terminal v2.4</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">● LIVE</span>
              <span>VOL 10 (1S) INDEX</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 p-4 rounded-xl border h-64 flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0818] border-purple-950'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Volatility 10 (1s) Tick Stream</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-base">6,842.15</span>
              </div>

              {/* Mock Tick Wave Line */}
              <div className="flex items-end justify-between h-36 px-2 pt-4">
                {[40, 55, 35, 70, 60, 85, 45, 90, 75, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-2 rounded-t bg-purple-600 dark:bg-purple-400 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0818] border-purple-950'
            }`}>
              <div className="space-y-3 text-xs">
                <p className={`font-bold uppercase tracking-wider text-[11px] ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>Quick Order Ticket</p>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Stake ($ USD)</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">$25.00</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Contract</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Rise / Fall</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Est. Payout</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">$48.75 USD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-center font-bold">HIGHER</div>
                <div className="p-2.5 rounded-lg bg-rose-600 text-white text-center font-bold">LOWER</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className={`py-16 border-t ${isLight ? 'bg-white border-slate-200' : 'bg-[#090714] border-purple-950/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Engineered for Precision</h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Built from the ground up for high-frequency algorithmic traders and mobile money users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#120f26] border-purple-900/50'}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Instant M-Pesa STK Push</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Deposit seamlessly using Safaricom M-Pesa. Wallet credits in seconds with zero hidden fees.</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#120f26] border-purple-900/50'}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Synthetic Volatility Indices</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Trade Vol 10, Vol 25, Vol 50, Vol 75, and Vol 100 1s with deterministic tick integrity 24/7/365.</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#120f26] border-purple-900/50'}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>256-Bit Bank-Grade Security</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Atomic wallet transactions backed by SSL encryption and optional 2FA TOTP authentication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 border-t ${isLight ? 'bg-[#f8fafc] border-slate-200' : 'bg-[#0b0e17] border-purple-950/60'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions</h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Everything you need to know about PalOption trading and deposits</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`p-5 rounded-2xl border space-y-2 ${isLight ? 'bg-white border-slate-200' : 'bg-[#120f26] border-purple-900/40'}`}>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{faq.question}</h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AIEntryScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        allInstruments={[]}
        onLoadMarket={() => {
          setIsAIScannerOpen(false);
          router.push('/dashboard');
        }}
      />

      <Footer />
    </div>
  );
}
