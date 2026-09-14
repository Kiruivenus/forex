'use client';

import React from 'react';
import { AlertCircle, X, ArrowRight } from 'lucide-react';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: () => void;
  stakeAmount: number;
  availableBalance: number;
}

export default function InsufficientBalanceModal({
  isOpen,
  onClose,
  onDeposit,
  stakeAmount,
  availableBalance,
}: InsufficientBalanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#14102b] border border-rose-600/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-600/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Insufficient Balance</h3>
            <p className="text-xs text-rose-300 font-semibold">Trade execution blocked</p>
          </div>
        </div>

        <div className="bg-[#0b0818] p-4 rounded-2xl border border-rose-900/30 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-300">
            <span>Required Stake Amount:</span>
            <span className="font-bold text-rose-400 text-sm">${stakeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-purple-950">
            <span>Available Real Balance:</span>
            <span className="font-bold text-emerald-400 text-sm">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your order stake of <strong className="text-white">${stakeAmount.toFixed(2)} USD</strong> exceeds your available Real Account balance. Please deposit funds into your wallet to continue trading.
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors text-center"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onDeposit();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Deposit Funds</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
