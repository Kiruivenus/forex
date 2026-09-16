'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Bitcoin, AlertCircle, Loader2 } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: number;
  onSuccess?: () => void;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance = 0,
  onSuccess,
}: WithdrawalModalProps) {
  const [method, setMethod] = useState<'MPESA' | 'CRYPTO'>('MPESA');
  const [amountUSD, setAmountUSD] = useState('20');
  const [destination, setDestination] = useState('');
  const [cryptoAsset, setCryptoAsset] = useState('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState('TRC20');
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [minWithdrawalUSD, setMinWithdrawalUSD] = useState<number>(10.0);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/system/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings?.MIN_WITHDRAWAL) {
            setMinWithdrawalUSD(Number(data.settings.MIN_WITHDRAWAL));
          }
        })
        .catch((err) => console.error('Fetch withdrawal settings error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setErrorMsg('');

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          amountUSD: Number(amountUSD),
          destination,
          cryptoAsset: method === 'CRYPTO' ? cryptoAsset : undefined,
          cryptoNetwork: method === 'CRYPTO' ? cryptoNetwork : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('SUCCESS');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#120f26] border border-purple-800/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-[#181335] px-5 py-4 border-b border-purple-950/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100">Withdraw Funds</h3>
            <p className="text-[11px] text-slate-400">Available: <span className="font-bold text-emerald-400">${availableBalance.toFixed(2)} USD</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector */}
        <div className="flex border-b border-purple-950/80 bg-[#0e0b1f] text-xs font-semibold">
          <button
            onClick={() => setMethod('MPESA')}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              method === 'MPESA'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>M-Pesa Payout</span>
          </button>

          <button
            onClick={() => setMethod('CRYPTO')}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              method === 'CRYPTO'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bitcoin className="w-4 h-4 text-amber-400" />
            <span>Crypto Wallet</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              Withdrawal Amount ($ USD) <span className="text-purple-400 font-normal text-[11px]">(Min: ${minWithdrawalUSD.toFixed(2)})</span>
            </label>
            <input
              type="number"
              value={amountUSD}
              onChange={(e) => setAmountUSD(e.target.value)}
              min={minWithdrawalUSD}
              max={availableBalance}
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {method === 'MPESA' ? (
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">M-Pesa Phone Number</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Payout Fee: $0.50 USD. Received as KES via Safaricom M-Pesa B2C.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Asset</label>
                  <select
                    value={cryptoAsset}
                    onChange={(e) => setCryptoAsset(e.target.value)}
                    className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-2 py-2 text-slate-100"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Network</label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-2 py-2 text-slate-100"
                  >
                    <option value="TRC20">TRC20</option>
                    <option value="ERC20">ERC20</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Destination Wallet Address</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Paste your crypto wallet address"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Network Fee: $2.00 USD.</p>
              </div>
            </>
          )}

          {status === 'SUCCESS' && (
            <div className="bg-emerald-950/50 border border-emerald-600/40 p-3 rounded-lg text-emerald-300">
              <p className="font-semibold">Withdrawal request submitted! Funds will be transferred upon security review.</p>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-lg flex items-start space-x-2 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'SUBMITTING' || availableBalance < Number(amountUSD)}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {status === 'SUBMITTING' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : (
              <span>Submit Withdrawal Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
