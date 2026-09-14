'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { History, ArrowUpRight, ArrowDownLeft, TrendingUp, Layers } from 'lucide-react';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'TRADES' | 'DEPOSITS' | 'WITHDRAWALS' | 'LEDGER'>('TRADES');
  const [trades, setTrades] = useState<unknown[]>([]);
  const [ledger, setLedger] = useState<unknown[]>([]);

  useEffect(() => {
    fetch('/api/trades/history?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrades(data.trades);
      });

    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLedger(data.ledger);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-purple-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">Audit & Transaction History</h1>
              <p className="text-xs text-slate-400">Comprehensive server-recorded financial and trade ledger</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-purple-950/80 bg-[#0e0b1f] rounded-xl p-1 text-xs font-semibold">
            {(['TRADES', 'LEDGER'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-lg transition-all ${
                  activeTab === tab ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'TRADES' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
                  <tr>
                    <th className="p-3">Trade ID</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Stake</th>
                    <th className="p-3">Entry/Exit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Profit / Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/60 text-slate-200">
                  {trades.map((t: any) => (
                    <tr key={t.tradeId} className="hover:bg-purple-950/30">
                      <td className="p-3 font-bold text-purple-300">{t.tradeId}</td>
                      <td className="p-3">{t.symbol}</td>
                      <td className="p-3">{t.tradeType} ({t.direction})</td>
                      <td className="p-3">${t.stake}</td>
                      <td className="p-3">{t.entryPrice} → {t.exitPrice?.toFixed(4)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'WON' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className={`p-3 font-bold ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.profit >= 0 ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              {ledger.map((l: any) => (
                <div key={l._id} className="p-3 bg-[#181335] rounded-xl border border-purple-950 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-purple-300 block">{l.type}</span>
                    <span className="text-[11px] text-slate-300">{l.description}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${l.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {l.amount >= 0 ? `+$${l.amount.toFixed(2)}` : `-$${Math.abs(l.amount).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 block">After: ${l.balanceAfter.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
