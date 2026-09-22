'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: number;
  onSuccess?: () => void;
}

function UsdtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.75 14.5v-1.1c2.14-.14 3.75-.82 3.75-1.65 0-.83-1.61-1.51-3.75-1.65v-1.3c2.47.16 4.35.94 4.35 1.95 0 1.01-1.88 1.79-4.35 1.95v1.8h-1.5v-1.8c-2.47-.16-4.35-.94-4.35-1.95 0-1.01 1.88-1.79 4.35-1.95v1.3c-2.14.14-3.75.82-3.75 1.65 0 .83 1.61 1.51 3.75 1.65v1.1h1.5zM12 6.5c3.5 0 6.5.67 6.5 1.5S15.5 9.5 12 9.5 5.5 8.83 5.5 8 8.5 6.5 12 6.5z" />
    </svg>
  );
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance = 0,
  onSuccess,
}: WithdrawalModalProps) {
  const [step, setStep] = useState<'METHOD_SELECT' | 'FORM'>('METHOD_SELECT');
  const [method, setMethod] = useState<'MPESA' | 'USDT'>('MPESA');
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [destination, setDestination] = useState('');
  const [userPhone, setUserPhone] = useState('2541***826');
  const [rawPhone, setRawPhone] = useState('25418134131826');
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [minWithdrawalUSD, setMinWithdrawalUSD] = useState<number>(1);
  const [maxWithdrawalUSD, setMaxWithdrawalUSD] = useState<number>(1900);

  useEffect(() => {
    if (isOpen) {
      setStep('METHOD_SELECT');
      setStatus('IDLE');
      setErrorMsg('');
      setSuccessMsg('');
      
      // Fetch user profile and system limits
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user?.phone) {
            const ph = data.user.phone;
            setRawPhone(ph);
            if (ph.length >= 7) {
              const start = ph.slice(0, 4);
              const end = ph.slice(-3);
              setUserPhone(`${start}***${end}`);
            } else {
              setUserPhone(ph);
            }
          }
        })
        .catch(() => {});

      fetch('/api/system/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings?.MIN_WITHDRAWAL) {
            setMinWithdrawalUSD(Number(data.settings.MIN_WITHDRAWAL));
          }
          if (data.success && data.settings?.MAX_WITHDRAWAL) {
            setMaxWithdrawalUSD(Number(data.settings.MAX_WITHDRAWAL));
          }
        })
        .catch((err) => console.error('Fetch withdrawal settings error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMethod = (selected: 'MPESA' | 'USDT') => {
    setMethod(selected);
    setStep('FORM');
    setStatus('IDLE');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setErrorMsg('');

    const numericAmount = Number(amountUSD.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setStatus('FAILED');
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          amountUSD: numericAmount,
          destination: method === 'MPESA' ? (rawPhone || destination) : destination,
          cryptoAsset: method === 'USDT' ? 'USDT' : undefined,
          cryptoNetwork: method === 'USDT' ? 'TRC20' : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('SUCCESS');
        setSuccessMsg('Withdrawal request submitted successfully! Funds will be processed shortly.');
        if (onSuccess) onSuccess();
      } else {
        setStatus('FAILED');
        setErrorMsg(data.message || 'Withdrawal request failed.');
      }
    } catch {
      setStatus('FAILED');
      setErrorMsg('Network error while processing withdrawal request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1d1838] border border-[#2b2256] rounded-3xl w-full max-w-md overflow-hidden p-6 sm:p-7 shadow-2xl text-white transition-colors relative">
        {/* Header matching Screenshots 3 & 4 */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-xl text-white tracking-tight">Withdraw Funds</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Balance: ${availableBalance.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: METHOD SELECTION (Screenshot 3) */}
        {step === 'METHOD_SELECT' && (
          <div className="space-y-3">
            {/* M-Pesa Option */}
            <button
              onClick={() => handleSelectMethod('MPESA')}
              className={`w-full bg-[#16112e] rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group text-left ${
                method === 'MPESA' ? 'border-2 border-slate-200 shadow-lg' : 'border border-[#2b2256] hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-[#2a2252] text-[#a78bfa] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">M-Pesa</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Withdraw to mobile money</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* USDT (TRC20) Option */}
            <button
              onClick={() => handleSelectMethod('USDT')}
              className={`w-full bg-[#16112e] rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group text-left ${
                method === 'USDT' ? 'border-2 border-slate-200 shadow-lg' : 'border border-[#2b2256] hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-[#0d9488]/20 text-[#14b8a6] flex items-center justify-center shrink-0">
                  <UsdtIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">USDT (TRC20)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Withdraw to crypto wallet</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}

        {/* STEP 2: AMOUNT & DETAILS (Screenshot 4) */}
        {step === 'FORM' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Back Navigation Link */}
            <button
              type="button"
              onClick={() => {
                setStep('METHOD_SELECT');
                setStatus('IDLE');
                setErrorMsg('');
              }}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Amount Field */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">Amount (USD)</label>
              <input
                type="text"
                value={amountUSD}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  setAmountUSD(raw);
                }}
                className="w-full bg-[#130e26] border border-[#2b2256] focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-none transition-colors"
                placeholder="0.00"
                required
              />
              <p className="text-slate-400 text-xs mt-1.5 font-medium">
                Min: ${minWithdrawalUSD} • Max: ${maxWithdrawalUSD.toLocaleString()}
              </p>
            </div>

            {/* Method Details (M-Pesa or Crypto) */}
            {method === 'MPESA' ? (
              <div className="space-y-1 pt-1">
                <h4 className="text-xs font-bold text-white">M-Pesa</h4>
                <p className="text-xs text-slate-300 font-normal">
                  Withdrawals will be sent to your registered number: <span className="font-bold text-white">{userPhone}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <h4 className="text-xs font-bold text-white mb-1">USDT (TRC20) Address</h4>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter your USDT TRC20 wallet address"
                  className="w-full bg-[#130e26] border border-[#2b2256] focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none transition-colors"
                  required
                />
              </div>
            )}

            {/* Notifications */}
            {status === 'SUCCESS' && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {status === 'FAILED' && (
              <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button (Screenshot 4) */}
            <button
              type="submit"
              disabled={status === 'SUBMITTING'}
              className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {status === 'SUBMITTING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Withdrawal...</span>
                </>
              ) : (
                <span>Withdraw</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

