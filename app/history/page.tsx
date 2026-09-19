'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { History, Layers, Clock, TrendingUp, Wallet } from 'lucide-react';
import { getStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';
import { useTheme } from '@/components/ThemeProvider';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'TRADES' | 'LEDGER'>('TRADES');
  const [trades, setTrades] = useState<unknown[]>([]);
  const [ledger, setLedger] = useState<unknown[]>([]);
  const [accountMode, setAccountMode] = useState<AccountMode>('REAL');
  const { isLight } = useTheme();

  const fetchHistory = (mode: AccountMode) => {
    fetch(`/api/trades/history?accountMode=${mode}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrades(data.trades);
      })
      .catch((err) => console.error(err));

    fetch(`/api/wallet?accountMode=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLedger(data.ledger);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const initialMode = getStoredAccountMode();
    setAccountMode(initialMode);
    fetchHistory(initialMode);

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<AccountMode>;
      if (customEvent.detail) {
        setAccountMode(customEvent.detail);
        fetchHistory(customEvent.detail);
      }
    };
    window.addEventListener(EVENT_NAME, handleModeChange);
    return () => window.removeEventListener(EVENT_NAME, handleModeChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans transition-colors bg-[#f8fafc] dark:bg-[#090714] text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Main Card */}
        <div className="border border-slate-200/90 dark:border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 transition-colors bg-white dark:bg-[#120f26]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-purple-950/80 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-600/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Trade & Ledger History</h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Audit trail of all executed trades and financial wallet activities</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Mode:</span>
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wide ${
                  accountMode === 'DEMO'
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {accountMode === 'DEMO' ? 'DEMO ACCOUNT' : 'REAL ACCOUNT'}
              </span>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex p-1.5 rounded-2xl border text-xs font-semibold max-w-md bg-slate-100 dark:bg-[#0b0818] border-slate-200 dark:border-purple-900/40">
            {(['TRADES', 'LEDGER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl transition-all font-bold cursor-pointer ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'TRADES' ? 'Trade History' : 'Financial Ledger'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'TRADES' ? (
            trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b text-[11px] uppercase tracking-wider border-slate-200 dark:border-purple-950 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0d091e]">
                      <th className="py-3 px-4">Trade ID</th>
                      <th className="py-3 px-4">Symbol</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Stake</th>
                      <th className="py-3 px-4">Entry/Exit</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-purple-950/60">
                    {trades.map((t: any) => (
                      <tr key={t.tradeId} className="hover:bg-slate-50 dark:hover:bg-[#181335] transition-colors text-slate-800 dark:text-slate-200">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{t.tradeId}</td>
                        <td className="py-3 px-4 font-semibold">{t.symbol}</td>
                        <td className="py-3 px-4 text-purple-600 dark:text-purple-300">{t.tradeType} ({t.direction})</td>
                        <td className="py-3 px-4">${t.stake.toFixed(2)}</td>
                        <td className="py-3 px-4 text-[11px]">{t.entryPrice?.toFixed(2)} &rarr; {t.exitPrice?.toFixed(2) || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'WON'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-400'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-bold ${t.status === 'WON' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {t.status === 'WON' ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">No trade history records found.</div>
            )
          ) : (
            ledger.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b text-[11px] uppercase tracking-wider border-slate-200 dark:border-purple-950 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0d091e]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Balance After</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-purple-950/60">
                    {ledger.map((entry: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#181335] transition-colors text-slate-800 dark:text-slate-200">
                        <td className="py-3 px-4 text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold">{entry.type}</td>
                        <td className={`py-3 px-4 font-bold ${entry.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {entry.amount >= 0 ? `+$${entry.amount.toFixed(2)}` : `-$${Math.abs(entry.amount).toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4 font-bold">${entry.balanceAfter?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-500">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">No financial ledger entries found.</div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
