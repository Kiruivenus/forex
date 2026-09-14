'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AlertTriangle, ShieldCheck, HeartHandshake, Lock, HelpCircle } from 'lucide-react';

export default function ResponsibleTradingPage() {
  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 sm:p-8 rounded-2xl border border-purple-900/60 shadow-xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-purple-950 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">Responsible Trading Policy</h1>
              <p className="text-xs text-slate-400">Essential risk disclosure and account control guidelines</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="bg-[#181335] p-5 rounded-xl border border-purple-950 space-y-2">
              <h3 className="font-bold text-sm text-purple-200 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>1. Understanding Financial & Market Risk</span>
              </h3>
              <p>
                Trading synthetic indices, foreign exchange, and cryptocurrency contracts carries a high level of risk and may result in the loss of all invested capital. Before trading, ensure you fully understand the mechanics of contracts, leverage, and volatility factors.
              </p>
            </div>

            <div className="bg-[#181335] p-5 rounded-xl border border-purple-950 space-y-2">
              <h3 className="font-bold text-sm text-purple-200 flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                <span>2. AI Scanner Analytical Disclaimer</span>
              </h3>
              <p>
                The AI Entry Scanner provides technical indicator approximations (RSI, trend momentum, volatility) for analytical purposes only. Signals are not financial advice and do not guarantee profitable trading outcomes.
              </p>
            </div>

            <div className="bg-[#181335] p-5 rounded-xl border border-purple-950 space-y-2">
              <h3 className="font-bold text-sm text-purple-200 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>3. Self-Exclusion & Deposit Limits</span>
              </h3>
              <p>
                Traders can request voluntary self-exclusion or custom daily deposit caps at any time by contacting compliance at support@apextrader.com.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
