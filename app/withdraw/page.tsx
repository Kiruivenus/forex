'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WithdrawalModal from '@/components/WithdrawalModal';
import { ArrowDownLeft, Wallet, History, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { getStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';

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
    <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Main Header & Balance Card */}
        <div className="bg-[#120f26] border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-950/40">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Withdraw Funds</h1>
                <p className="text-xs sm:text-sm text-slate-400">Payout to your M-Pesa phone number or Crypto wallet</p>
              </div>
            </div>

            <div className="bg-[#181335] px-5 py-3 rounded-2xl border border-purple-900/50 sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Withdrawable Real Balance</span>
              <span className="font-mono font-black text-emerald-400 text-xl">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2"
          >
            <span>New Withdrawal Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Withdrawal Request History */}
        <div className="bg-[#120f26] border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center space-x-2.5 border-b border-purple-950/80 pb-4">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-base text-white">Withdrawal History</h3>
          </div>

          {withdrawals.length > 0 ? (
            <div className="space-y-3 text-xs">
              {withdrawals.map((w) => (
                <div key={w._id} className="bg-[#16122d] p-4 rounded-2xl border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-purple-700/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white text-sm">{w.method}</span>
                      <span className="text-slate-400 font-mono font-bold text-xs">${w.amount.toFixed(2)} USD</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Destination: {w.destination}</p>
                  </div>
                  <div className="sm:text-right font-mono flex sm:flex-col justify-between items-center sm:items-end">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        w.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : w.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {w.status}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No withdrawal requests recorded</p>
              <p className="text-[11px] text-slate-500">Your submitted payout requests will appear here with live status updates.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
