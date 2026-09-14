'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TradingChart from '@/components/TradingChart';
import AIEntryScannerModal from '@/components/AIEntryScannerModal';
import DepositModal from '@/components/DepositModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import {
  TrendingUp,
  Cpu,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Instrument {
  _id?: string;
  symbol: string;
  name: string;
  category: string;
  currentPrice: number;
  change24h: number;
  volatility: number;
  minStake: number;
  maxStake: number;
}

interface TradeRecord {
  _id: string;
  tradeId: string;
  symbol: string;
  tradeType: string;
  direction: string;
  stake: number;
  entryPrice: number;
  exitPrice?: number;
  status: 'WON' | 'LOST' | 'OPEN' | 'PENDING';
  payout: number;
  profit: number;
  createdAt: string;
}

const DEFAULT_INSTRUMENTS: Instrument[] = [
  { symbol: 'VOL10_1S', name: 'Volatility 10 (1s) Index', category: 'SYNTHETIC', currentPrice: 6842.15, change24h: 1.25, volatility: 0.0015, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL75_1S', name: 'Volatility 75 (1s) Index', category: 'SYNTHETIC', currentPrice: 142850.40, change24h: -0.84, volatility: 0.0035, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL100', name: 'Volatility 100 Index', category: 'SYNTHETIC', currentPrice: 9420.80, change24h: 2.10, volatility: 0.0040, minStake: 1, maxStake: 1000 },
  { symbol: 'EURUSD', name: 'EUR/USD Forex', category: 'FOREX', currentPrice: 1.0845, change24h: 0.12, volatility: 0.0008, minStake: 1, maxStake: 1000 },
  { symbol: 'GBPUSD', name: 'GBP/USD Forex', category: 'FOREX', currentPrice: 1.2960, change24h: -0.35, volatility: 0.0010, minStake: 1, maxStake: 1000 },
  { symbol: 'BTCUSD', name: 'Bitcoin / USD Crypto', category: 'CRYPTO', currentPrice: 64250.00, change24h: 3.45, volatility: 0.0080, minStake: 1, maxStake: 1000 },
];

export default function DashboardPage() {
  const [instruments, setInstruments] = useState<Instrument[]>(DEFAULT_INSTRUMENTS);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(DEFAULT_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number>(DEFAULT_INSTRUMENTS[0].currentPrice);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [leftTab, setLeftTab] = useState<'OPEN' | 'CLOSED' | 'TRANSACTIONS'>('OPEN');
  const [mobileTab, setMobileTab] = useState<'TRADE' | 'POSITIONS'>('TRADE');

  // Trade Ticket Form State
  const [tradeType, setTradeType] = useState<'RISE_FALL' | 'EVEN_ODD' | 'MATCH_DIFFER' | 'OVER_UNDER'>('RISE_FALL');
  const [stake, setStake] = useState<number>(1);
  const [barrier, setBarrier] = useState<number>(5);
  const [tradeExecuting, setTradeExecuting] = useState(false);
  const [tradeFeedback, setTradeFeedback] = useState<{ status: string; message: string; code?: string } | null>(null);

  // Modals
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const fetchInstruments = async () => {
    try {
      const res = await fetch('/api/instruments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.instruments && data.instruments.length > 0) {
          setInstruments(data.instruments);
          setSelectedInstrument(data.instruments[0]);
          setLivePrice(data.instruments[0].currentPrice);
        }
      }
    } catch (err) {
      console.error('Fetch instruments error:', err);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTrades(data.trades);
        }
      }
    } catch (err) {
      console.error('Fetch trades error:', err);
    }
  };

  useEffect(() => {
    fetchInstruments();
    fetchTrades();
  }, []);

  const handleExecuteTrade = async (direction: string) => {
    if (!selectedInstrument) return;
    setTradeExecuting(true);
    setTradeFeedback(null);

    try {
      const res = await fetch('/api/trades/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedInstrument.symbol,
          tradeType,
          direction,
          stake,
          barrier,
          durationSeconds: 3,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const t = data.trade;
        if (t.status === 'WON') {
          setTradeFeedback({
            status: 'WON',
            message: `WIN! +$${t.profit.toFixed(2)} USD (Payout $${t.payout.toFixed(2)})`,
          });
        } else {
          setTradeFeedback({
            status: 'LOST',
            message: `Trade Closed (${t.status}). -$${stake.toFixed(2)} USD`,
          });
        }
        fetchTrades();
      } else {
        setTradeFeedback({
          status: 'ERROR',
          code: data.code,
          message: data.message || 'Trade execution failed.',
        });
      }
    } catch {
      setTradeFeedback({
        status: 'ERROR',
        message: 'Network error executing trade contract.',
      });
    } finally {
      setTradeExecuting(false);
    }
  };

  // Quick Stake Adjustment
  const adjustStake = (delta: number) => {
    setStake((prev) => Math.max(1, Math.min(1000, Number((prev + delta).toFixed(2)))));
  };

  // Multiplier preview
  let multiplier = 1.95;
  if (tradeType === 'MATCH_DIFFER') multiplier = 8.5;
  else if (tradeType === 'OVER_UNDER') multiplier = 1.9;

  const potentialPayout = Number((stake * multiplier).toFixed(2));

  const openPositions = trades.filter((t) => t.status === 'OPEN' || t.status === 'PENDING');
  const closedPositions = trades.filter((t) => t.status === 'WON' || t.status === 'LOST');

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <Navbar onOpenAIScanner={() => setIsAIScannerOpen(true)} />

      {/* Main Terminal Workspace 3-Panel Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT PANEL: Trade History & Positions (Desktop Col 3) */}
        <div
          className={`lg:col-span-3 bg-[#120f26] border border-purple-950/80 rounded-xl overflow-hidden flex flex-col h-[600px] ${
            mobileTab === 'POSITIONS' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="bg-[#181335] px-3 py-2.5 border-b border-purple-950/80 flex items-center justify-between">
            <div className="flex bg-[#0b0818] p-0.5 rounded-lg border border-purple-900/40 text-[11px] font-semibold w-full">
              <button
                onClick={() => setLeftTab('OPEN')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'OPEN' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Open ({openPositions.length})
              </button>
              <button
                onClick={() => setLeftTab('CLOSED')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'CLOSED' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Closed
              </button>
              <button
                onClick={() => setLeftTab('TRANSACTIONS')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'TRANSACTIONS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                History
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {leftTab === 'OPEN' ? (
              openPositions.length > 0 ? (
                openPositions.map((t) => (
                  <div key={t.tradeId} className="bg-[#181335] p-3 rounded-lg border border-purple-900/50 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-purple-300">{t.symbol}</span>
                      <span className="text-amber-400 font-mono text-[10px] bg-amber-950/50 px-2 py-0.5 rounded">OPEN</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Stake: ${t.stake}</span>
                      <span>Entry: {t.entryPrice}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="font-semibold text-slate-300">No Open Positions</p>
                  <p className="text-[11px]">Active trades will appear here automatically.</p>
                </div>
              )
            ) : leftTab === 'CLOSED' ? (
              closedPositions.length > 0 ? (
                closedPositions.map((t) => (
                  <div key={t.tradeId} className="bg-[#181335] p-3 rounded-lg border border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{t.symbol} ({t.direction})</span>
                      <span
                        className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded ${
                          t.status === 'WON' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {t.status === 'WON' ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                      <span>Stake: ${t.stake}</span>
                      <span>Exit: {t.exitPrice?.toFixed(4)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">No closed positions yet.</div>
              )
            ) : (
              <div className="space-y-2">
                {trades.slice(0, 15).map((t) => (
                  <div key={t.tradeId} className="p-2.5 bg-[#181335] rounded-lg border border-purple-950 flex justify-between items-center text-[11px]">
                    <div>
                      <p className="font-semibold text-slate-200">{t.tradeId}</p>
                      <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className={`font-mono font-bold ${t.status === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.status === 'WON' ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Instrument Selector & Live Canvas Trading Chart (Desktop Col 6) */}
        <div
          className={`lg:col-span-6 space-y-3 ${
            mobileTab === 'TRADE' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Instrument Selector Toolbar */}
          <div className="bg-[#120f26] border border-purple-950/80 rounded-xl p-3 flex items-center justify-between text-xs overflow-x-auto">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium shrink-0">Market:</span>
              <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                {instruments.map((inst) => (
                  <button
                    key={inst.symbol}
                    onClick={() => {
                      setSelectedInstrument(inst);
                      setLivePrice(inst.currentPrice);
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-semibold shrink-0 transition-all ${
                      selectedInstrument?.symbol === inst.symbol
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                        : 'bg-[#181335] border-purple-950 text-slate-300 hover:text-white'
                    }`}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Interactive Tick Chart */}
          {selectedInstrument && (
            <TradingChart
              instrument={selectedInstrument}
              onPriceUpdate={(p) => setLivePrice(p)}
            />
          )}
        </div>

        {/* RIGHT PANEL: Order Execution Controls (Desktop Col 3) */}
        <div
          className={`lg:col-span-3 bg-[#120f26] border border-purple-950/80 rounded-xl p-4 space-y-4 text-xs ${
            mobileTab === 'TRADE' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-purple-950 pb-3">
            <span className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Order Execution</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40 font-mono font-bold">
              95.0% Payout
            </span>
          </div>

          {/* Trade Contract Type Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Contract Type</label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#0b0818] p-1 rounded-xl border border-purple-900/40">
              <button
                onClick={() => setTradeType('RISE_FALL')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  tradeType === 'RISE_FALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rise / Fall
              </button>
              <button
                onClick={() => setTradeType('EVEN_ODD')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  tradeType === 'EVEN_ODD' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Even / Odd
              </button>
              <button
                onClick={() => setTradeType('MATCH_DIFFER')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  tradeType === 'MATCH_DIFFER' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Match / Differ
              </button>
              <button
                onClick={() => setTradeType('OVER_UNDER')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  tradeType === 'OVER_UNDER' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Over / Under
              </button>
            </div>
          </div>

          {/* Stake Amount Input & Quick Chips */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-400 font-medium">Stake ($ USD)</label>
              <span className="text-[10px] text-slate-400 font-mono">Min $1.00</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustStake(-1)}
                className="w-9 h-9 rounded-lg bg-[#181335] border border-purple-900/60 hover:bg-purple-900/40 text-slate-200 flex items-center justify-center font-bold text-base"
              >
                -
              </button>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                min="1"
                max="1000"
                className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-2 text-center text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => adjustStake(1)}
                className="w-9 h-9 rounded-lg bg-[#181335] border border-purple-900/60 hover:bg-purple-900/40 text-slate-200 flex items-center justify-center font-bold text-base"
              >
                +
              </button>
            </div>

            {/* Quick Stake Preset Buttons */}
            <div className="grid grid-cols-6 gap-1 mt-2">
              {[1, 5, 10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  className={`py-1 rounded font-mono font-semibold transition-colors ${
                    stake === amt
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#181335] text-slate-400 border border-purple-950 hover:text-slate-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Barrier Digit Selector for Match/Differ and Over/Under */}
          {(tradeType === 'MATCH_DIFFER' || tradeType === 'OVER_UNDER') && (
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Last Digit Barrier ({barrier})</label>
              <div className="grid grid-cols-5 gap-1 font-mono font-bold">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => setBarrier(digit)}
                    className={`py-1.5 rounded transition-all ${
                      barrier === digit
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#181335] text-slate-400 hover:text-slate-200 border border-purple-950'
                    }`}
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Potential Payout Metrics */}
          <div className="bg-[#0b0818] p-3 rounded-xl border border-purple-900/40 space-y-2 font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Multiplier Rate:</span>
              <span className="font-bold text-purple-300">{multiplier}x</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-purple-950">
              <span className="text-slate-300 font-semibold">Potential Payout:</span>
              <span className="font-extrabold text-emerald-400 text-sm">${potentialPayout.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Trade Result Feedback Banner */}
          {tradeFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold space-y-1.5 ${
                tradeFeedback.status === 'WON'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : tradeFeedback.status === 'LOST'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {tradeFeedback.status === 'WON' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{tradeFeedback.message}</span>
              </div>
              {tradeFeedback.code === 'INSUFFICIENT_BALANCE' && (
                <button
                  onClick={() => setIsDepositOpen(true)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-md flex items-center justify-center space-x-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Deposit via M-Pesa / Crypto Now</span>
                </button>
              )}
            </div>
          )}

          {/* Big Order Entry Execution Action Buttons */}
          <div className="pt-2 space-y-2">
            {tradeType === 'RISE_FALL' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteTrade('HIGHER')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex flex-col items-center justify-center space-y-0.5 disabled:opacity-50"
                >
                  {tradeExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                  <span>HIGHER ▲</span>
                </button>

                <button
                  onClick={() => handleExecuteTrade('LOWER')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-950/50 flex flex-col items-center justify-center space-y-0.5 disabled:opacity-50"
                >
                  {tradeExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownRight className="w-5 h-5" />}
                  <span>LOWER ▼</span>
                </button>
              </div>
            )}

            {tradeType === 'EVEN_ODD' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteTrade('EVEN')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>EVEN DIGIT</span>
                </button>
                <button
                  onClick={() => handleExecuteTrade('ODD')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>ODD DIGIT</span>
                </button>
              </div>
            )}

            {tradeType === 'MATCH_DIFFER' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteTrade('MATCH')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>MATCHES ({barrier})</span>
                </button>
                <button
                  onClick={() => handleExecuteTrade('DIFFER')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>DIFFERS ({barrier})</span>
                </button>
              </div>
            )}

            {tradeType === 'OVER_UNDER' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteTrade('OVER')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>OVER ({barrier})</span>
                </button>
                <button
                  onClick={() => handleExecuteTrade('UNDER')}
                  disabled={tradeExecuting}
                  className="py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>UNDER ({barrier})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dedicated Mobile Bottom Bar Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={(t) => setMobileTab(t)}
        onOpenAIScanner={() => setIsAIScannerOpen(true)}
      />

      {/* Modals */}
      <AIEntryScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        currentSymbol={selectedInstrument?.symbol}
        onExecuteAISignal={(dir) => handleExecuteTrade(dir)}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </div>
  );
}
