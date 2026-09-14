'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { History, Layers, Clock, TrendingUp, Wallet } from 'lucide-react';
import { getStoredAccountMode, EVENT_NAME, AccountMode } from '@/lib/accountMode';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'TRADES' | 'LEDGER'>('TRADES');
  const [trades, setTrades] = useState<unknown[]>([]);
  const [ledger, setLedger] = useState<unknown[]>([]);
  const [accountMode, setAccountMode] = useState<AccountMode>('REAL');

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
    <div className="min-h-screen bg-[#090714] text-slate-100 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Main Card */}
        <div className="bg-[#120f26] border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-950/80 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-600/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-950/40">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Trade & Ledger History</h1>
                <p className="text-xs sm:text-sm text-slate-400">Audit trail of all executed trades and financial wallet activities</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Mode:</span>
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wide ${
                  accountMode === 'DEMO'
                    ? 'bg-rose-950/80 border border-rose-600/40 text-rose-300'
                    : 'bg-emerald-950/80 border border-emerald-600/40 text-emerald-300'
                }`}
              >
                {accountMode === 'DEMO' ? 'DEMO ACCOUNT' : 'REAL ACCOUNT'}
              </span>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex bg-[#0b0818] p-1.5 rounded-2xl border border-purple-900/40 text-xs font-semibold max-w-md">
            {(['TRADES', 'LEDGER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl transition-all font-bold ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50'
                    : 'text-slate-400 hover:text-white'
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
                  <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
                    <tr>
                      <th className="p-3.5">Trade ID</th>
                      <th className="p-3.5">Symbol</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Stake</th>
                      <th className="p-3.5">Entry/Exit</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/60 text-slate-200">
                    {trades.map((t: any) => (
                      <tr key={t.tradeId || t._id} className="hover:bg-purple-950/30 transition-colors">
                        <td className="p-3.5 font-bold text-purple-300">{t.tradeId}</td>
                        <td className="p-3.5 font-semibold text-white">{t.symbol}</td>
                        <td className="p-3.5">{t.tradeType} ({t.direction})</td>
                        <td className="p-3.5">${t.stake}</td>
                        <td className="p-3.5">{t.entryPrice} → {t.exitPrice?.toFixed(4)}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'WON'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                : t.status === 'LOST'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className={`p-3.5 font-bold ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.profit >= 0 ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-14 text-center text-slate-400 text-xs space-y-2">
                <Clock className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No recorded trades found</p>
                <p className="text-[11px] text-slate-500">Executed positions for {accountMode} account will appear here.</p>
              </div>
            )
          ) : (
            ledger.length > 0 ? (
              <div className="space-y-2.5 text-xs font-mono">
                {ledger.map((l: any) => (
                  <div key={l._id} className="p-4 bg-[#16122d] rounded-2xl border border-purple-900/40 flex justify-between items-center hover:border-purple-700/50 transition-colors">
                    <div>
                      <span className="font-bold text-purple-300 block text-xs">{l.type}</span>
                      <span className="text-[11px] text-slate-300">{l.description}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm ${l.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {l.amount >= 0 ? `+$${l.amount.toFixed(2)}` : `-$${Math.abs(l.amount).toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">After: ${l.balanceAfter.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-slate-400 text-xs space-y-2">
                <Wallet className="w-8 h-8 text-purple-400/40 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No financial ledger entries found</p>
                <p className="text-[11px] text-slate-500">Wallet transactions for {accountMode} mode will appear here.</p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
