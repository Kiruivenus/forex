'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DepositModal from '@/components/DepositModal';
import { Smartphone, Bitcoin, ArrowRight } from 'lucide-react';
import { getStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';

export default function DepositPage() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>('REAL');
  const { isLight } = useTheme();

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
    <div className="min-h-screen flex flex-col justify-between font-sans transition-colors bg-[#f8fafc] dark:bg-[#090714] text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* M-Pesa STK Push Card */}
          <div className="border rounded-3xl p-6 space-y-5 transition-all shadow-md hover:shadow-xl relative overflow-hidden group bg-white dark:bg-[#120f26] border-slate-200/90 dark:border-purple-900/50 hover:border-emerald-500 dark:hover:border-emerald-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                STK Push · Instant
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Safaricom M-Pesa</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Direct mobile money deposit via Safaricom Daraja STK Push API. Enter your phone number and confirm payment prompt on your handset.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs border-slate-100 dark:border-purple-950/60 text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Fee:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">0% Zero Fees</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Speed:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Instant (&lt; 10 seconds)</span>
              </div>
            </div>

            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Deposit via M-Pesa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Crypto Transfer Card */}
          <div className="border rounded-3xl p-6 space-y-5 transition-all shadow-md hover:shadow-xl relative overflow-hidden group bg-white dark:bg-[#120f26] border-slate-200/90 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-purple-950/80 border border-amber-300 dark:border-purple-600/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                <Bitcoin className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">
                USDT / BTC / ETH
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Crypto Transfer</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Transfer Tether USDT (TRC20, ERC20) or Bitcoin to our secure admin deposit address and submit your transaction hash.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs border-slate-100 dark:border-purple-950/60 text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Networks:</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">TRC20, ERC20, BTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Speed:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">1 Blockchain Confirmation</span>
              </div>
            </div>

            <button
              onClick={() => setIsDepositOpen(true)}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Deposit via Crypto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />

      <Footer />
    </div>
  );
}
