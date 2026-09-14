'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DepositModal from '@/components/DepositModal';
import { Smartphone, Bitcoin, ArrowUpRight, ShieldCheck, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { getStoredAccountMode, setStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';

export default function DepositPage() {
  const [isDepositOpen, setIsDepositOpen] = useState(true);
  const [accountMode, setAccountMode] = useState<AccountMode>('DEMO');

  useEffect(() => {
    setAccountMode(getStoredAccountMode());
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<AccountMode>;
      if (customEvent.detail) {
        setAccountMode(customEvent.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleModeChange);
    return () => window.removeEventListener(EVENT_NAME, handleModeChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-100">Deposit Funds</h1>
                <p className="text-xs text-slate-400">Add capital to your real trading wallet instantly</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 rounded-full text-xs font-bold font-mono">
              ● REAL ACCOUNT ONLY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="bg-[#181335] p-5 rounded-xl border border-purple-900/50 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>Safaricom M-Pesa STK Push</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Instant mobile deposit via Safaricom Daraja API. Enter your phone number and approve the prompt on your phone.
              </p>
              <button
                onClick={() => setIsDepositOpen(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
              >
                Deposit via M-Pesa
              </button>
            </div>

            <div className="bg-[#181335] p-5 rounded-xl border border-purple-900/50 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Bitcoin className="w-5 h-5" />
                <span>Crypto Transfer (USDT / BTC)</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Transfer Tether USDT (TRC20, ERC20) or Bitcoin to our admin-managed wallet address and submit transaction hash.
              </p>
              <button
                onClick={() => setIsDepositOpen(true)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
              >
                Deposit via Crypto
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </div>
  );
}
