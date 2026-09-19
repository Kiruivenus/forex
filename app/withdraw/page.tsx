'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WithdrawalModal from '@/components/WithdrawalModal';
import { ArrowDownLeft, History, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { getStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';

interface WithdrawalItem {
  _id: string;
  method: string;
  amount: number;
  netAmount: number;
  destination: string;
  status: string;
  createdAt: string;
}

export default function WithdrawPage() {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>('REAL');
  const { isLight } = useTheme();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAvailableBalance(data.wallet.availableBalance);
        }
      }

      const wRes = await fetch('/api/withdrawals');
      if (wRes.ok) {
        const wData = await wRes.json();
        if (wData.success) {
          setWithdrawals(wData.withdrawals);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
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
        {/* Main Header & Balance Card */}
        <div className="border border-slate-200/90 dark:border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 transition-colors bg-white dark:bg-[#120f26]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-600/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Withdraw Funds</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Payout to your M-Pesa phone number or Crypto wallet</p>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl border sm:text-right shrink-0 bg-slate-50 dark:bg-[#181335] border-slate-200 dark:border-purple-900/50">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-0.5">Withdrawable Real Balance</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xl">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>New Withdrawal Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Withdrawal Request History */}
        <div className="border border-slate-200/90 dark:border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-md space-y-5 transition-colors bg-white dark:bg-[#120f26]">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-purple-950/80 pb-4">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Withdrawal History</h3>
          </div>

          {withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w._id}
                  className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-[#181335] border-slate-200 dark:border-purple-900/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm uppercase">{w.method}</span>
                      <span className="font-mono font-extrabold text-sm text-purple-600 dark:text-purple-400">${w.amount.toFixed(2)} USD</span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px]">Destination: {w.destination}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className="text-slate-400 text-[10px] font-mono">{new Date(w.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border uppercase ${
                      w.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No withdrawal history found yet.
            </div>
          )}
        </div>
      </main>

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        onSuccess={fetchData}
      />

      <Footer />
    </div>
  );
}
