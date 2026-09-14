'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WithdrawalModal from '@/components/WithdrawalModal';
import { ArrowDownLeft, Wallet, ShieldAlert, History, Info, ArrowRight } from 'lucide-react';
import { getStoredAccountMode, setStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';

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
  const [demoBalance, setDemoBalance] = useState(10000);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>('DEMO');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAvailableBalance(data.wallet.availableBalance);
          setDemoBalance(data.wallet.demoBalance || 10000);
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
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        {/* Real Account Notice Banner */}
        <div className="bg-amber-950/40 border border-amber-600/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3 text-slate-200">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Real Balance Withdrawal Policy</span>
              <span className="text-slate-300">
                Payouts are processed exclusively from your <strong className="text-emerald-400 font-mono">Real Account</strong> available balance (${availableBalance.toFixed(2)} USD). Demo virtual funds (${demoBalance.toFixed(2)}) are for practice and cannot be withdrawn.
              </span>
            </div>
          </div>

          {accountMode === 'DEMO' && (
            <button
              onClick={() => setStoredAccountMode('REAL')}
              className="shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <span>Switch to Real Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-amber-400">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-100">Withdraw Funds</h1>
                <p className="text-xs text-slate-400">Request payout to M-Pesa or Crypto wallet</p>
              </div>
            </div>

            <div className="bg-[#181335] px-4 py-2 rounded-xl border border-purple-950 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Withdrawable Real Balance</span>
              <span className="font-extrabold text-emerald-400 text-lg font-mono">${availableBalance.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            New Withdrawal Request
          </button>
        </div>

        {/* Withdrawal Request History */}
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>Withdrawal Requests History</span>
          </h3>

          {withdrawals.length > 0 ? (
            <div className="space-y-2 text-xs">
              {withdrawals.map((w) => (
                <div key={w._id} className="bg-[#181335] p-3.5 rounded-xl border border-purple-950 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">{w.method} - ${w.amount} USD</span>
                    <span className="text-[10px] text-slate-400 font-mono">To: {w.destination}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        w.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : w.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {w.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">No withdrawal requests found.</div>
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
