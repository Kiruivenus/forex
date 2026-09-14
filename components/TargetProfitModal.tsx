'use client';

import React from 'react';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface TargetProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'TARGET_PROFIT' | 'STOP_LOSS';
  amountGain: number;
  totalTrades: number;
  wonCount: number;
  lostCount: number;
}

export default function TargetProfitModal({
  isOpen,
  onClose,
  type,
  amountGain,
  totalTrades,
  wonCount,
  lostCount,
}: TargetProfitModalProps) {
  if (!isOpen) return null;

  const winRate = totalTrades > 0 ? ((wonCount / totalTrades) * 100).toFixed(1) : '0.0';
  const isTargetProfit = type === 'TARGET_PROFIT';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#15102a] border border-purple-800/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-6 relative border-t-2 border-t-purple-500/40">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-purple-950/60 rounded-full hover:bg-purple-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon Badge */}
        <div className="flex justify-center pt-2">
          {isTargetProfit ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-pulse" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-950">
              <ShieldAlert className="w-9 h-9 text-rose-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Headline & Amount */}
        <div className="space-y-2">
          <h2
            className={`font-black text-2xl sm:text-3xl tracking-tight ${
              isTargetProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isTargetProfit ? 'Target Profit Reached!' : 'Stop Loss Reached!'}
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            {isTargetProfit
              ? 'Trading strategy execution paused automatically on reaching target.'
              : 'Trading strategy execution paused automatically to preserve capital.'}
          </p>
          <div
            className={`text-3xl sm:text-4xl font-mono font-black tracking-tight pt-1 ${
              amountGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {amountGain >= 0 ? `+${amountGain.toFixed(2)}` : `${amountGain.toFixed(2)}`}{' '}
            <span className="text-sm font-normal text-slate-400 font-sans">USD</span>
          </div>
        </div>

        {/* Statistics Breakdown Box */}
        <div className="bg-[#0b0818] border border-purple-900/60 rounded-2xl p-4 space-y-2.5 font-mono text-sm">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Trades</span>
            <span className="font-bold text-slate-100 text-sm">{totalTrades}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400 text-xs pt-1 border-t border-purple-950">
            <span>W / L</span>
            <div className="font-bold text-sm">
              <span className="text-emerald-400">{wonCount}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-rose-400">{lostCount}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-400 text-xs pt-1 border-t border-purple-950">
            <span>Win Rate</span>
            <span className="font-extrabold text-slate-100 text-sm">{winRate}%</span>
          </div>
        </div>

        {/* Continue Trading CTA Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${
            isTargetProfit
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/60'
          }`}
        >
          Continue Trading
        </button>
      </div>
    </div>
  );
}
