'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function UsdtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.75 14.5v-1.1c2.14-.14 3.75-.82 3.75-1.65 0-.83-1.61-1.51-3.75-1.65v-1.3c2.47.16 4.35.94 4.35 1.95 0 1.01-1.88 1.79-4.35 1.95v1.8h-1.5v-1.8c-2.47-.16-4.35-.94-4.35-1.95 0-1.01 1.88-1.79 4.35-1.95v1.3c-2.14.14-3.75.82-3.75 1.65 0 .83 1.61 1.51 3.75 1.65v1.1h1.5zM12 6.5c3.5 0 6.5.67 6.5 1.5S15.5 9.5 12 9.5 5.5 8.83 5.5 8 8.5 6.5 12 6.5z" />
    </svg>
  );
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [step, setStep] = useState<'METHOD_SELECT' | 'FORM'>('METHOD_SELECT');
  const [selectedMethod, setSelectedMethod] = useState<'MPESA' | 'USDT' | 'CARD'>('MPESA');

  // Deposit Form State
  const [amountUSD, setAmountUSD] = useState('0.00');
  const [phoneNumber, setPhoneNumber] = useState('25418134131826');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [status, setStatus] = useState<'IDLE' | 'INITIATING' | 'WAITING_PIN' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('METHOD_SELECT');
      setStatus('IDLE');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  // STK Push status polling loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'WAITING_PIN' && checkoutRequestId) {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/deposits/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              if (data.status === 'COMPLETED') {
                setStatus('SUCCESS');
                setSuccessMessage(`Payment received! Receipt: ${data.mpesaReceipt || 'Success'}. Wallet credited.`);
                if (onSuccess) onSuccess();
              } else if (data.status === 'FAILED') {
                setStatus('FAILED');
                setErrorMessage(data.failureReason || 'Payment failed or cancelled by user.');
              }
            }
          }
        } catch (err) {
          console.error('M-Pesa status poll error:', err);
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [status, checkoutRequestId, onSuccess]);

  if (!isOpen) return null;

  const numericAmount = Math.max(0, Number(amountUSD) || 0);

  const handleSelectMethod = (method: 'MPESA' | 'USDT' | 'CARD') => {
    setSelectedMethod(method);
    setStep('FORM');
    setErrorMessage('');
    setStatus('IDLE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (numericAmount <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
      return;
    }

    if (selectedMethod === 'MPESA') {
      setStatus('INITIATING');
      try {
        const rate = 130;
        const amountKES = Math.ceil(numericAmount * rate);

        const res = await fetch('/api/deposits/mpesa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            amountKES,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setCheckoutRequestId(data.checkoutRequestId);
          setStatus('WAITING_PIN');
          setSuccessMessage(data.customerMessage || 'STK Push prompt sent to your phone. Enter your M-Pesa PIN.');
        } else {
          setStatus('FAILED');
          setErrorMessage(data.message || 'Failed to initiate M-Pesa STK push.');
        }
      } catch {
        setStatus('FAILED');
        setErrorMessage('Network error initiating M-Pesa STK push.');
      }
    } else if (selectedMethod === 'USDT') {
      setStatus('INITIATING');
      try {
        const res = await fetch('/api/deposits/crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: 'USDT',
            network: 'TRC20',
            amountUSD: numericAmount,
            depositAddress: 'TXYZ1234567890PalOptionAddressTRC20',
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('SUCCESS');
          setSuccessMessage('Crypto deposit request created. Please transfer funds to the designated wallet.');
          if (onSuccess) onSuccess();
        } else {
          setStatus('FAILED');
          setErrorMessage(data.message || 'Deposit request failed.');
        }
      } catch {
        setStatus('FAILED');
        setErrorMessage('Network error processing deposit.');
      }
    } else {
      // Card Payment (Not supported)
      setStatus('FAILED');
      setErrorMessage('Card payment method is currently not supported in your region. Please select M-Pesa or USDT (TRC20).');
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#191432] border-t sm:border border-[#2b2256] rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden p-6 sm:p-7 shadow-2xl text-white transition-all relative">
        {/* Modal Header (Matching Screenshots 1 & 2) */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-xl text-white tracking-tight">Deposit Funds</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Choose your payment method</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: PAYMENT METHOD SELECTION (Screenshot 1) */}
        {step === 'METHOD_SELECT' && (
          <div className="space-y-3">
            {/* M-Pesa Option */}
            <button
              onClick={() => handleSelectMethod('MPESA')}
              className="w-full bg-[#140f2a] hover:bg-[#1f193e] border border-[#2b2256] hover:border-purple-500/50 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-[#251b4c] text-[#a78bfa] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">M-Pesa</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Instant mobile money</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* USDT (TRC20) Option */}
            <button
              onClick={() => handleSelectMethod('USDT')}
              className="w-full bg-[#140f2a] hover:bg-[#1f193e] border border-[#2b2256] hover:border-purple-500/50 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-[#0d9488]/20 text-[#14b8a6] flex items-center justify-center shrink-0">
                  <UsdtIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">USDT (TRC20)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Cryptocurrency · auto-credited</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Credit/Debit Card Option */}
            <button
              onClick={() => handleSelectMethod('CARD')}
              className="w-full bg-[#140f2a] hover:bg-[#1f193e] border border-[#2b2256] hover:border-purple-500/50 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-[#251b4c] text-[#a78bfa] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Card</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Visa, Mastercard</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {/* Bottom Footer Indicators (Matching uploaded screenshot) */}
            <div className="pt-4 mt-2 flex items-center justify-center space-x-6 text-[11px] text-slate-400 font-semibold border-t border-[#251d48]">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Instant</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FORM DETAILS (Screenshot 2) */}
        {step === 'FORM' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Back Navigation Link */}
            <button
              type="button"
              onClick={() => {
                setStep('METHOD_SELECT');
                setStatus('IDLE');
                setErrorMessage('');
              }}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Amount Field & Preset Chips */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">Amount (USD)</label>
              <div className="relative">
                <input
                  type="text"
                  value={amountUSD === '0.00' ? '$ 0.00' : amountUSD.startsWith('$') ? amountUSD : `$ ${amountUSD}`}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    setAmountUSD(raw);
                  }}
                  className="w-full bg-[#130e26] border border-[#2b2256] focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-none transition-colors"
                  placeholder="$ 0.00"
                  required
                />
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-6 gap-1.5 mt-2 font-mono text-xs">
                {['1', '10', '25', '50', '100', '250'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountUSD(val)}
                    className={`py-1.5 rounded-lg border text-center font-semibold transition-colors cursor-pointer ${
                      amountUSD === val
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-[#231a47] border-[#352968] hover:bg-[#352968] text-white'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Form Fields Based on Selected Payment Method */}
            {selectedMethod === 'MPESA' && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  className="w-full bg-[#130e26] border border-[#2b2256] focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-sm font-bold focus:outline-none transition-colors"
                  required
                />
                <p className="text-slate-400 text-[11px] mt-1.5 font-medium leading-normal">
                  You can edit this number until your first deposit is verified.
                </p>
              </div>
            )}

            {selectedMethod === 'USDT' && (
              <div className="space-y-2 text-xs">
                <div className="bg-[#130e26] p-3 rounded-xl border border-[#2b2256]">
                  <p className="text-slate-400 text-[11px]">Deposit Address (TRC20)</p>
                  <p className="font-mono text-purple-300 text-xs truncate mt-1 font-bold">TXYZ1234567890PalOptionAddressTRC20</p>
                </div>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• ••••"
                    className="w-full bg-[#130e26] border border-[#2b2256] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-[#130e26] border border-[#2b2256] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full bg-[#130e26] border border-[#2b2256] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status Banners */}
            {status === 'WAITING_PIN' && (
              <div className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-xl flex items-center space-x-2 text-purple-200 text-xs">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {status === 'SUCCESS' && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {status === 'FAILED' && (
              <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Deposit Action Button (Matching Screenshot 2) */}
            <button
              type="submit"
              disabled={status === 'INITIATING' || status === 'WAITING_PIN'}
              className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {status === 'INITIATING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Deposit ${numericAmount}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
