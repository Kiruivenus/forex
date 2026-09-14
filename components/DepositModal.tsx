'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Bitcoin, Copy, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface CryptoAssetOption {
  symbol: string;
  name: string;
  network: string;
  depositAddress: string;
  minDeposit: number;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [activeTab, setActiveTab] = useState<'MPESA' | 'CRYPTO'>('MPESA');

  // M-Pesa state
  const [phoneNumber, setPhoneNumber] = useState('254712345678');
  const [amountKES, setAmountKES] = useState('500');
  const [mpesaStatus, setMpesaStatus] = useState<'IDLE' | 'INITIATING' | 'WAITING_PIN' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [mpesaError, setMpesaError] = useState('');

  // Crypto state
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAssetOption[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAssetOption | null>(null);
  const [cryptoAmountUSD, setCryptoAmountUSD] = useState('50');
  const [txHash, setTxHash] = useState('');
  const [cryptoStatus, setCryptoStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [cryptoError, setCryptoError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'CRYPTO') {
      fetch('/api/deposits/crypto')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.assets.length > 0) {
            setCryptoAssets(data.assets);
            setSelectedAsset(data.assets[0]);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen, activeTab]);

  // STK Push Status Polling Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mpesaStatus === 'WAITING_PIN' && checkoutRequestId) {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/deposits/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              if (data.status === 'COMPLETED') {
                setMpesaStatus('SUCCESS');
                setMpesaMessage(`Payment received! Receipt: ${data.mpesaReceipt}. Wallet credited.`);
                if (onSuccess) onSuccess();
              } else if (data.status === 'FAILED') {
                setMpesaStatus('FAILED');
                setMpesaError(data.failureReason || 'Payment failed or cancelled.');
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [mpesaStatus, checkoutRequestId, onSuccess]);

  if (!isOpen) return null;

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMpesaStatus('INITIATING');
    setMpesaError('');
    setMpesaMessage('');

    try {
      const res = await fetch('/api/deposits/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          amountKES: Number(amountKES),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        setMpesaStatus('WAITING_PIN');
        setMpesaMessage(data.customerMessage || 'STK Push sent. Check your phone and enter M-Pesa PIN.');
      } else {
        setMpesaStatus('FAILED');
        setMpesaError(data.message || 'Failed to initiate M-Pesa STK push.');
      }
    } catch {
      setMpesaStatus('FAILED');
      setMpesaError('Network error while connecting to Safaricom Daraja API.');
    }
  };

  const handleCryptoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setCryptoStatus('SUBMITTING');
    setCryptoError('');

    try {
      const res = await fetch('/api/deposits/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedAsset.symbol,
          network: selectedAsset.network,
          amountUSD: Number(cryptoAmountUSD),
          txHash,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCryptoStatus('SUCCESS');
        if (onSuccess) onSuccess();
      } else {
        setCryptoStatus('FAILED');
        setCryptoError(data.message || 'Failed to submit crypto deposit.');
      }
    } catch {
      setCryptoStatus('FAILED');
      setCryptoError('Network error while submitting crypto deposit.');
    }
  };

  const copyAddress = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#120f26] border border-purple-800/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#181335] px-5 py-4 border-b border-purple-950/80 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100">Deposit Funds</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-purple-950/80 bg-[#0e0b1f] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('MPESA')}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'MPESA'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>M-Pesa STK Push</span>
          </button>

          <button
            onClick={() => setActiveTab('CRYPTO')}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'CRYPTO'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bitcoin className="w-4 h-4 text-amber-400" />
            <span>Crypto Transfer</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'MPESA' ? (
            <form onSubmit={handleMpesaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">M-Pesa Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="2547XXXXXXXX or 07XXXXXXXX"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Deposit Amount (KES)</label>
                <input
                  type="number"
                  value={amountKES}
                  onChange={(e) => setAmountKES(e.target.value)}
                  min="10"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Estimated Wallet Credit: <span className="font-bold text-emerald-400">${(Number(amountKES) / 130).toFixed(2)} USD</span> (1 USD ≈ 130 KES)
                </p>
              </div>

              {/* Status Message Banners */}
              {mpesaStatus === 'WAITING_PIN' && (
                <div className="bg-purple-950/50 border border-purple-600/40 p-3 rounded-lg flex items-center space-x-2 text-purple-200">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                  <span>{mpesaMessage}</span>
                </div>
              )}

              {mpesaStatus === 'SUCCESS' && (
                <div className="bg-emerald-950/50 border border-emerald-600/40 p-3 rounded-lg text-emerald-300">
                  <p className="font-semibold">{mpesaMessage}</p>
                </div>
              )}

              {mpesaStatus === 'FAILED' && (
                <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-lg flex items-start space-x-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{mpesaError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={mpesaStatus === 'INITIATING' || mpesaStatus === 'WAITING_PIN'}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {mpesaStatus === 'INITIATING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating STK Push...</span>
                  </>
                ) : (
                  <>
                    <span>Initiate M-Pesa STK Push</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCryptoSubmit} className="space-y-4 text-xs">
              {/* Asset / Network Selector */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Select Asset & Network</label>
                <div className="grid grid-cols-2 gap-2">
                  {cryptoAssets.map((asset) => (
                    <button
                      key={`${asset.symbol}-${asset.network}`}
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${
                        selectedAsset?.symbol === asset.symbol && selectedAsset?.network === asset.network
                          ? 'bg-purple-900/50 border-purple-500 text-slate-100'
                          : 'bg-[#0b0818] border-purple-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-slate-100">{asset.symbol}</span>
                      <span className="text-[10px] text-purple-400 font-mono">{asset.network}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedAsset && (
                <>
                  <div className="bg-[#0b0818] p-3 rounded-lg border border-purple-900/40 space-y-2">
                    <span className="text-[11px] text-slate-400 block">Deposit Address ({selectedAsset.network})</span>
                    <div className="flex items-center justify-between font-mono text-[11px] text-purple-300 bg-[#16112d] p-2 rounded border border-purple-950">
                      <span className="truncate mr-2">{selectedAsset.depositAddress}</span>
                      <button type="button" onClick={copyAddress} className="p-1 hover:text-white shrink-0">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Deposit Amount ($ USD)</label>
                    <input
                      type="number"
                      value={cryptoAmountUSD}
                      onChange={(e) => setCryptoAmountUSD(e.target.value)}
                      min={selectedAsset.minDeposit}
                      className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Transaction Hash (TxID)</label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste blockchain transaction hash"
                      className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </>
              )}

              {cryptoStatus === 'SUCCESS' && (
                <div className="bg-emerald-950/50 border border-emerald-600/40 p-3 rounded-lg text-emerald-300">
                  <p className="font-semibold">Deposit proof submitted! Your transaction is pending admin verification.</p>
                </div>
              )}

              {cryptoStatus === 'FAILED' && (
                <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-lg text-rose-300">
                  <p>{cryptoError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={cryptoStatus === 'SUBMITTING' || !selectedAsset}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {cryptoStatus === 'SUBMITTING' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Proof...</span>
                  </>
                ) : (
                  <span>Submit Deposit Proof</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
