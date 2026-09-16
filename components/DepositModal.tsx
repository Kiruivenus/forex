'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Bitcoin, Copy, Check, AlertCircle, Loader2, ArrowRight, ArrowLeft, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  const [cryptoStep, setCryptoStep] = useState<'FORM' | 'GENERATING' | 'PAYMENT_PAGE'>('FORM');
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAssetOption[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAssetOption | null>(null);
  const [cryptoAmountUSD, setCryptoAmountUSD] = useState('50');
  const [txHash, setTxHash] = useState('');
  const [cryptoStatus, setCryptoStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [cryptoError, setCryptoError] = useState('');
  const [copied, setCopied] = useState(false);
  const [cryptoDepositId, setCryptoDepositId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes timer

  // System settings state
  const [minDepositUSD, setMinDepositUSD] = useState<number>(5.0);
  const [mpesaRate, setMpesaRate] = useState<number>(130.0);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/system/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            if (data.settings.MIN_DEPOSIT) setMinDepositUSD(Number(data.settings.MIN_DEPOSIT));
            if (data.settings.MPESA_USD_RATE) setMpesaRate(Number(data.settings.MPESA_USD_RATE));
          }
        })
        .catch((err) => console.error('Fetch system settings error:', err));
    }
  }, [isOpen]);

  const minKesRequired = Math.ceil(minDepositUSD * mpesaRate);

  useEffect(() => {
    if (isOpen && activeTab === 'CRYPTO') {
      fetch('/api/deposits/crypto')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.assets.length > 0) {
            setCryptoAssets(data.assets);
            if (!selectedAsset) setSelectedAsset(data.assets[0]);
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

  // 15-Minute Countdown Timer for Crypto Payment
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && activeTab === 'CRYPTO' && cryptoStep === 'PAYMENT_PAGE' && cryptoStatus !== 'COMPLETED' && cryptoStatus !== 'FAILED') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCryptoStatus('FAILED');
            setCryptoError('Payment window expired (15 minutes time limit exceeded). Deposit status updated to FAILED.');
            if (cryptoDepositId) {
              fetch('/api/deposits/crypto/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ depositId: cryptoDepositId, action: 'EXPIRE' }),
              }).catch((err) => console.error(err));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, activeTab, cryptoStep, cryptoStatus, cryptoDepositId]);

  // Crypto Deposit Status Polling Loop
  useEffect(() => {
    let pollTimer: NodeJS.Timeout;
    if (cryptoDepositId && (cryptoStatus === 'SUCCESS' || cryptoStatus === 'SUBMITTING')) {
      pollTimer = setInterval(async () => {
        try {
          const res = await fetch(`/api/deposits/crypto/status?depositId=${cryptoDepositId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              if (data.status === 'COMPLETED') {
                setCryptoStatus('COMPLETED');
                if (onSuccess) onSuccess();
              } else if (data.status === 'FAILED') {
                setCryptoStatus('FAILED');
                setCryptoError(data.failureReason || 'Deposit failed.');
              }
            }
          }
        } catch (err) {
          console.error('Crypto status poll error:', err);
        }
      }, 3000);
    }
    return () => clearInterval(pollTimer);
  }, [cryptoDepositId, cryptoStatus, onSuccess]);

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

  const handleGenerateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setCryptoError('');

    const amt = Number(cryptoAmountUSD);
    const minRequired = Math.max(minDepositUSD, selectedAsset.minDeposit || 5.0);
    if (amt < minRequired) {
      setCryptoError(`Minimum deposit amount for ${selectedAsset.symbol} is $${minRequired.toFixed(2)} USD.`);
      return;
    }

    setCryptoStep('GENERATING');
    setTimeLeft(900); // 15 minutes timer
    setCryptoDepositId(null);
    setCryptoStatus('IDLE');
    setTimeout(() => {
      setCryptoStep('PAYMENT_PAGE');
    }, 1400);
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
          depositAddress: selectedAsset.depositAddress,
          txHash: txHash.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.depositId) setCryptoDepositId(data.depositId);
        setCryptoStatus('SUCCESS');
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
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
            onClick={() => {
              setActiveTab('MPESA');
              setCryptoStep('FORM');
            }}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'MPESA'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30 font-bold'
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
                ? 'border-purple-500 text-purple-300 bg-purple-950/30 font-bold'
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
                <label className="block text-slate-400 font-medium mb-1.5">
                  Deposit Amount (KES) <span className="text-purple-400 font-normal text-[11px]">(Min: KES {minKesRequired})</span>
                </label>
                <input
                  type="number"
                  value={amountKES}
                  onChange={(e) => setAmountKES(e.target.value)}
                  min={minKesRequired}
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Estimated Wallet Credit: <span className="font-bold text-emerald-400">${(Number(amountKES) / mpesaRate).toFixed(2)} USD</span> (1 USD ≈ {mpesaRate} KES)
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
            /* CRYPTO TRANSFER MULTI-STEP FLOW */
            <div>
              {cryptoStep === 'FORM' && (
                <form onSubmit={handleGenerateAddress} className="space-y-4 text-xs">
                  {/* Asset / Network Selector */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Select Asset & Network</label>
                    <div className="grid grid-cols-2 gap-2">
                      {cryptoAssets.map((asset) => (
                        <button
                          key={`${asset.symbol}-${asset.network}`}
                          type="button"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setCryptoError('');
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            selectedAsset?.symbol === asset.symbol && selectedAsset?.network === asset.network
                              ? 'bg-purple-900/60 border-purple-500 text-slate-100 ring-2 ring-purple-500/40'
                              : 'bg-[#0b0818] border-purple-900/40 text-slate-400 hover:text-slate-200 hover:border-purple-800'
                          }`}
                        >
                          <span className="font-bold text-slate-100">{asset.name || asset.symbol}</span>
                          <span className="text-[10px] text-purple-400 font-mono font-bold mt-1">{asset.network}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deposit Amount USD Input */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">
                      Deposit Amount ($ USD) <span className="text-purple-400 font-normal text-[11px]">(Min: ${Math.max(minDepositUSD, selectedAsset?.minDeposit || 5.0).toFixed(2)})</span>
                    </label>
                    <input
                      type="number"
                      value={cryptoAmountUSD}
                      onChange={(e) => {
                        setCryptoAmountUSD(e.target.value);
                        setCryptoError('');
                      }}
                      min={Math.max(minDepositUSD, selectedAsset?.minDeposit || 5.0)}
                      className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  {cryptoError && (
                    <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-xl flex items-start space-x-2 text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p>{cryptoError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedAsset}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Generate Payment Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* GENERATING LOADING STATE */}
              {cryptoStep === 'GENERATING' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center animate-fade-in">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                    <Bitcoin className="w-5 h-5 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="font-extrabold text-sm text-slate-100">Generating Payment Address...</p>
                  <p className="text-xs text-slate-400">Fetching active {selectedAsset?.symbol} ({selectedAsset?.network}) deposit wallet</p>
                </div>
              )}

              {/* PAYMENT PAGE (DEDICATED SUB-VIEW WITH WAITING STATUS & 15-MIN TIMER) */}
              {cryptoStep === 'PAYMENT_PAGE' && selectedAsset && (
                <div className="space-y-4 text-xs animate-fade-in">
                  {/* Status Banner with 15-Min Timer */}
                  <div className={`p-3 rounded-xl flex items-center justify-between shadow-md border ${
                    cryptoStatus === 'COMPLETED'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                      : cryptoStatus === 'FAILED'
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  }`}>
                    <div className="flex items-center space-x-2 font-bold">
                      {cryptoStatus === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : cryptoStatus === 'FAILED' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                      )}
                      <span>
                        Status: {cryptoStatus === 'COMPLETED'
                          ? 'Completed'
                          : cryptoStatus === 'FAILED'
                          ? 'Failed'
                          : cryptoStatus === 'SUCCESS'
                          ? 'Waiting for Network Confirmation'
                          : 'Waiting for Payment'}
                      </span>
                    </div>

                    {cryptoStatus !== 'COMPLETED' && cryptoStatus !== 'FAILED' && (
                      <div className="flex items-center space-x-1.5 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono text-xs font-extrabold text-amber-300">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Summary Details Card */}
                  <div className="bg-[#181335] p-3 rounded-xl border border-purple-900/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Selected Asset</span>
                      <span className="font-extrabold text-slate-100">{selectedAsset.name || selectedAsset.symbol} ({selectedAsset.network})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-semibold uppercase">Expected Deposit</span>
                      <span className="font-extrabold text-emerald-400 text-sm font-mono">${Number(cryptoAmountUSD).toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Matched Deposit Address Card */}
                  <div className="bg-[#0b0818] p-3.5 rounded-xl border border-purple-900/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold">Deposit Address ({selectedAsset.network})</span>
                      <span className="text-purple-400 text-[10px] font-mono">Send {selectedAsset.symbol} ONLY</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-xs text-purple-200 bg-[#16112d] p-3 rounded-xl border border-purple-950">
                      <span className="truncate mr-2 font-extrabold tracking-tight">{selectedAsset.depositAddress}</span>
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center space-x-1 font-sans font-bold text-[11px] transition-colors shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Deposit Proof Submission Form */}
                  <form onSubmit={handleCryptoSubmit} className="space-y-3 pt-1">
                    {cryptoStatus === 'SUCCESS' && (
                      <div className="bg-emerald-950/60 border border-emerald-600/50 p-3 rounded-xl text-emerald-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">Deposit submitted! Your account will be credited once confirmed on the network.</span>
                      </div>
                    )}

                    {cryptoStatus === 'COMPLETED' && (
                      <div className="bg-emerald-950/60 border border-emerald-600/50 p-3 rounded-xl text-emerald-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">Deposit confirmed! Funds credited to your trading wallet.</span>
                      </div>
                    )}

                    {cryptoStatus === 'FAILED' && (
                      <div className="bg-rose-950/60 border border-rose-600/50 p-3 rounded-xl flex items-center space-x-2 text-rose-300">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{cryptoError}</span>
                      </div>
                    )}

                    {cryptoError && cryptoStatus !== 'FAILED' && (
                      <div className="bg-rose-950/60 border border-rose-600/50 p-3 rounded-xl flex items-center space-x-2 text-rose-300">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{cryptoError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={cryptoStatus === 'SUBMITTING' || cryptoStatus === 'SUCCESS' || cryptoStatus === 'COMPLETED' || cryptoStatus === 'FAILED'}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {cryptoStatus === 'SUBMITTING' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Transfer...</span>
                        </>
                      ) : cryptoStatus === 'SUCCESS' ? (
                        <span>Transfer Submitted (Waiting Network)</span>
                      ) : cryptoStatus === 'COMPLETED' ? (
                        <span>Transfer Completed</span>
                      ) : (
                        <span>Confirm I Have Made The Transfer</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCryptoStep('FORM');
                        setCryptoStatus('IDLE');
                        setCryptoError('');
                        setCryptoDepositId(null);
                      }}
                      className="w-full text-center text-slate-400 hover:text-slate-200 text-[11px] font-semibold pt-1 flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back / Modify Amount</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

