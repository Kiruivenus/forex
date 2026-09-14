'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertTriangle, ShieldCheck, HeartHandshake, Lock, HelpCircle, Shield } from 'lucide-react';

export default function ResponsibleTradingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Risk Protection Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Responsible Trading Policy</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Essential risk disclosures, analytical disclaimers, and voluntary self-exclusion options.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-950/20 space-y-5">
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1. Financial & Market Risk Awareness</span>
              </h3>
              <p className="text-slate-400">
                Trading synthetic indices, foreign exchange, and derivative contracts carries a high level of risk and may result in the loss of capital. Ensure you fully understand market leverage, price volatility, and risk management strategies before opening active trades.
              </p>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                <span>2. AI Scanner & Automated Strategy Disclaimer</span>
              </h3>
              <p className="text-slate-400">
                The ApexTrader AI Scanner provides technical indicator approximations (RSI, trend momentum, volatility signals) for informational purposes. Signals and autotrading configurations do not constitute guaranteed returns or formal financial advice.
              </p>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>3. Self-Exclusion & Deposit Caps</span>
              </h3>
              <p className="text-slate-400">
                Traders can request voluntary self-exclusion or custom daily/monthly deposit limits at any time by contacting our compliance desk at <span className="text-purple-300 font-mono">support@apextrader.com</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

