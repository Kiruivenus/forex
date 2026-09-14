'use client';

import React, { useState, useEffect } from 'react';
import { X, Cpu, RefreshCw, AlertCircle, ShieldAlert, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface AISignal {
  symbol: string;
  symbolName: string;
  currentPrice: number;
  marketCondition: string;
  trend: string;
  rsi: number;
  macd: string;
  volatility: string;
  signalDirection: string;
  confidenceScore: number;
  entryZone: string;
  riskLevel: string;
  signalExpiry: string;
  disclaimer: string;
}

interface AIEntryScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
  onExecuteAISignal?: (direction: 'HIGHER' | 'LOWER') => void;
}

export default function AIEntryScannerModal({
  isOpen,
  onClose,
  currentSymbol = 'VOL10_1S',
  onExecuteAISignal,
}: AIEntryScannerModalProps) {
  const [scanState, setScanState] = useState<'SCANNING' | 'ANALYZING' | 'READY' | 'ERROR'>('SCANNING');
  const [signal, setSignal] = useState<AISignal | null>(null);

  const fetchAISignal = async () => {
    setScanState('SCANNING');
    try {
      setTimeout(() => setScanState('ANALYZING'), 1000);

      const res = await fetch(`/api/ai/scanner?symbol=${currentSymbol}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTimeout(() => {
            setSignal(data.signal);
            setScanState('READY');
          }, 2000);
          return;
        }
      }
      setScanState('ERROR');
    } catch {
      setScanState('ERROR');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAISignal();
    }
  }, [isOpen, currentSymbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#120f26] border border-purple-800/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#191436] px-5 py-4 border-b border-purple-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Cpu className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">AI Entry Scanner</h3>
              <p className="text-[11px] text-purple-300">Algorithmic Technical Indicator Signal Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {scanState === 'SCANNING' || scanState === 'ANALYZING' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
                <div className="w-14 h-14 rounded-full bg-purple-900/40 border border-purple-500 flex items-center justify-center text-purple-400">
                  <Cpu className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-200 text-sm">
                  {scanState === 'SCANNING' ? 'Scanning Order Books & Market Ticks...' : 'Evaluating RSI & Trend Momentum...'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Analyzing tick volatility for {currentSymbol}</p>
              </div>
            </div>
          ) : scanState === 'READY' && signal ? (
            <div className="space-y-4">
              {/* Signal Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  signal.signalDirection.includes('CALL')
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                      signal.signalDirection.includes('CALL') ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {signal.signalDirection.includes('CALL') ? (
                      <ArrowUpRight className="w-6 h-6" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">AI Recommended Signal</span>
                    <h4 className="font-extrabold text-lg tracking-wide">{signal.signalDirection}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] block opacity-80">Confidence Rating</span>
                  <span className="text-xl font-extrabold font-mono">{signal.confidenceScore}%</span>
                </div>
              </div>

              {/* Technical Indicator Details */}
              <div className="bg-[#181333] p-4 rounded-xl border border-purple-900/50 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Instrument</span>
                  <span className="font-semibold text-slate-200">{signal.symbolName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Current Price</span>
                  <span className="font-mono font-bold text-emerald-400">{signal.currentPrice.toFixed(4)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">RSI (14)</span>
                  <span className="font-mono font-semibold text-purple-300">{signal.rsi}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Trend Condition</span>
                  <span className="font-semibold text-slate-200">{signal.trend}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Optimal Entry Zone</span>
                  <span className="font-mono text-slate-200 text-[11px]">{signal.entryZone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Risk Profile</span>
                  <span
                    className={`font-semibold ${
                      signal.riskLevel === 'LOW'
                        ? 'text-emerald-400'
                        : signal.riskLevel === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {signal.riskLevel}
                  </span>
                </div>
              </div>

              {/* Analytical Disclaimer */}
              <div className="bg-[#100d20] p-3 rounded-lg border border-purple-950 text-[11px] text-slate-400 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{signal.disclaimer}</p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={fetchAISignal}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan</span>
                </button>

                {onExecuteAISignal && (
                  <button
                    onClick={() => {
                      onExecuteAISignal(signal.signalDirection.includes('CALL') ? 'HIGHER' : 'LOWER');
                      onClose();
                    }}
                    className={`flex-1 py-2.5 font-bold text-xs rounded-lg text-white shadow-lg transition-all flex items-center justify-center space-x-1.5 ${
                      signal.signalDirection.includes('CALL')
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Signal to Order</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="font-semibold text-slate-200 text-sm">Insufficient Data</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Insufficient live tick data to generate a high-confidence signal for {currentSymbol}. Try rescanning.
              </p>
              <button
                onClick={fetchAISignal}
                className="px-4 py-2 bg-purple-600 text-white font-semibold text-xs rounded-lg"
              >
                Rescan Market
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
