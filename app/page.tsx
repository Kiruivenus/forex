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
  Cpu,
  ArrowRight,
  BarChart3,
  Lock,
  Globe,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    // Seed or fetch basic FAQs for public landing page
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
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col font-sans">
      <Navbar onOpenAIScanner={() => setIsAIScannerOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Generation High-Frequency Trading Terminal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Institutional Speed.{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            Algorithmic Edge.
          </span>
        </h1>

        <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Trade Synthetic Volatility Indices, Forex Pairs, and Crypto with microsecond execution, automated M-Pesa STK Push deposits, and AI-driven entry scanning.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center space-x-2"
          >
            <span>Open Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            Terminal Login
          </Link>
        </div>

        {/* Live Terminal Preview Frame */}
        <div className="mt-12 max-w-5xl mx-auto rounded-2xl bg-[#120f26] border border-purple-900/60 p-2 sm:p-4 shadow-2xl relative text-left">
          <div className="bg-[#181335] px-4 py-2.5 rounded-xl border border-purple-950 flex items-center justify-between text-xs mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-purple-300">ApexTrader Terminal v2.4</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span className="text-emerald-400">● LIVE</span>
              <span>VOL 10 (1S) INDEX</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#0b0818] p-4 rounded-xl border border-purple-950 h-64 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Volatility 10 (1s) Tick Stream</span>
                <span className="font-mono text-emerald-400 font-bold text-base">6,842.15</span>
              </div>
              <div className="flex-1 flex items-end space-x-1 py-4">
                {[45, 52, 48, 60, 58, 65, 62, 70, 78, 74, 82, 89, 85, 92, 98].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>12:00:00</span>
                <span>12:00:30</span>
                <span>12:01:00</span>
              </div>
            </div>

            <div className="bg-[#181335] p-4 rounded-xl border border-purple-950 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block">Quick Order Ticket</span>
              <div>
                <span className="text-slate-400 block text-[11px]">Stake ($ USD)</span>
                <div className="flex items-center space-x-2 mt-1">
                  {['$5', '$10', '$25', '$50'].map((amt) => (
                    <span key={amt} className="px-2.5 py-1 bg-purple-950/60 rounded border border-purple-800/40 text-purple-300 font-mono">
                      {amt}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button className="py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-md">
                  HIGHER ▲ 1.95x
                </button>
                <button className="py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md">
                  LOWER ▼ 1.95x
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-[#090b13] border-t border-purple-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Built for Professional Traders</h2>
            <p className="text-slate-400 text-sm mt-2">Every component is engineered for reliability, security, and maximum precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Safaricom M-Pesa STK Push</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Deposit instantly using Safaricom M-Pesa. Receive automated payment prompts directly on your mobile device with atomic ledger crediting.
              </p>
            </div>

            <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-base text-slate-100">AI Entry Scanner</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real-time algorithmic scanning evaluating RSI, MACD, and trend momentum to identify optimal entry zones with clear risk ratings.
              </p>
            </div>

            <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
                <Bitcoin className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Multi-Asset & Crypto Wallet</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Support for Tether USDT (TRC20, ERC20) and Bitcoin deposits & withdrawals with full admin-managed address security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <h2 className="text-2xl font-extrabold text-slate-100 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#120f26] p-5 rounded-xl border border-purple-950 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-purple-200 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{faq.question}</span>
              </h4>
              <p className="text-slate-400 leading-relaxed pl-6">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      <AIEntryScannerModal isOpen={isAIScannerOpen} onClose={() => setIsAIScannerOpen(false)} />
    </div>
  );
}
