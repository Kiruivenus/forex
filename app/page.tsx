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
import LandingLiveTerminal from '@/components/LandingLiveTerminal';

export default function LandingPage() {
  const router = useRouter();
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

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

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors bg-[#f8fafc] dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100">
      <Navbar onOpenAIScanner={() => setIsAIScannerOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-16 w-full text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Next-Generation High-Frequency Trading Terminal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto text-slate-900 dark:text-white">
            Trade Synthetic Indices &amp; Forex with <span className="text-purple-600 dark:text-purple-400">Atomic Microsecond Speed</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Instant Safaricom M-Pesa STK Push deposits, microsecond contract execution, automated risk controls, and real-time AI signal scanning.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Start Trading Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 dark:border-purple-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-900/40 font-bold text-sm transition-all text-center"
            >
              Terminal Login
            </Link>
          </div>
        </div>

        {/* Live Terminal Preview Widget & Ticker Bar matching reference image */}
        <LandingLiveTerminal />
      </section>


      {/* Feature Grid */}
      <section className="py-16 border-t bg-white dark:bg-[#090714] border-slate-200 dark:border-purple-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Engineered for Precision</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Built from the ground up for high-frequency algorithmic traders and mobile money users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border space-y-3 bg-slate-50 dark:bg-[#120f26] border-slate-200 dark:border-purple-900/50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant M-Pesa STK Push</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Deposit seamlessly using Safaricom M-Pesa. Wallet credits in seconds with zero hidden fees.</p>
            </div>

            <div className="p-6 rounded-2xl border space-y-3 bg-slate-50 dark:bg-[#120f26] border-slate-200 dark:border-purple-900/50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Synthetic Volatility Indices</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Trade Vol 10, Vol 25, Vol 50, Vol 75, and Vol 100 1s with deterministic tick integrity 24/7/365.</p>
            </div>

            <div className="p-6 rounded-2xl border space-y-3 bg-slate-50 dark:bg-[#120f26] border-slate-200 dark:border-purple-900/50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">256-Bit Bank-Grade Security</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Atomic wallet transactions backed by SSL encryption and optional 2FA TOTP authentication.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t bg-[#f8fafc] dark:bg-[#0b0e17] border-slate-200 dark:border-purple-950/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Everything you need to know about PalOption trading and deposits</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl border space-y-2 bg-white dark:bg-[#120f26] border-slate-200 dark:border-purple-900/40">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{faq.question}</h4>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
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
