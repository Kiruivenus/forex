'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TradingChart from '@/components/TradingChart';
import AIEntryScannerModal from '@/components/AIEntryScannerModal';
import DepositModal from '@/components/DepositModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import TargetProfitModal from '@/components/TargetProfitModal';
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
  Play,
  Square,
  Grid,
  Triangle,
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
  { symbol: 'VOL10_1S', name: 'Volatility 10 (1s) Index', category: 'SYNTHETIC', currentPrice: 9681.83, change24h: -1.91, volatility: 0.0015, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL10', name: 'Volatility 10 Index', category: 'SYNTHETIC', currentPrice: 6842.15, change24h: 1.25, volatility: 0.0015, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL15_1S', name: 'Volatility 15 (1s) Index', category: 'SYNTHETIC', currentPrice: 15234.50, change24h: 0.85, volatility: 0.0020, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL25_1S', name: 'Volatility 25 (1s) Index', category: 'SYNTHETIC', currentPrice: 25410.20, change24h: -0.42, volatility: 0.0025, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL25', name: 'Volatility 25 Index', category: 'SYNTHETIC', currentPrice: 25120.80, change24h: 1.10, volatility: 0.0025, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL30_1S', name: 'Volatility 30 (1s) Index', category: 'SYNTHETIC', currentPrice: 30180.40, change24h: -1.05, volatility: 0.0028, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL50_1S', name: 'Volatility 50 (1s) Index', category: 'SYNTHETIC', currentPrice: 50420.60, change24h: 0.64, volatility: 0.0030, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL50', name: 'Volatility 50 Index', category: 'SYNTHETIC', currentPrice: 49850.15, change24h: -0.92, volatility: 0.0030, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL75_1S', name: 'Volatility 75 (1s) Index', category: 'SYNTHETIC', currentPrice: 142850.40, change24h: -0.84, volatility: 0.0035, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL75', name: 'Volatility 75 Index', category: 'SYNTHETIC', currentPrice: 138900.00, change24h: 1.45, volatility: 0.0035, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL100_1S', name: 'Volatility 100 (1s) Index', category: 'SYNTHETIC', currentPrice: 9840.50, change24h: -0.55, volatility: 0.0040, minStake: 1, maxStake: 1000 },
  { symbol: 'VOL100', name: 'Volatility 100 Index', category: 'SYNTHETIC', currentPrice: 9420.80, change24h: 2.10, volatility: 0.0040, minStake: 1, maxStake: 1000 },
];

export default function DashboardPage() {
  const [instruments, setInstruments] = useState<Instrument[]>(DEFAULT_INSTRUMENTS);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(DEFAULT_INSTRUMENTS[0]);
  const [livePrice, setLivePrice] = useState<number>(DEFAULT_INSTRUMENTS[0].currentPrice);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [leftTab, setLeftTab] = useState<'OPEN' | 'CLOSED' | 'TRANSACTIONS'>('OPEN');
  const [mobileTab, setMobileTab] = useState<'TRADE' | 'POSITIONS'>('TRADE');
  const [accountMode, setAccountMode] = useState<'DEMO' | 'REAL'>('DEMO');

  // Trading Mode (AUTO vs MANUAL)
  const [tradingMode, setTradingMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  // Trade Ticket Form State
  const [tradeType, setTradeType] = useState<'RISE_FALL' | 'EVEN_ODD' | 'MATCH_DIFFER' | 'OVER_UNDER'>('EVEN_ODD');
  const [stake, setStake] = useState<number>(15);
  const [barrier, setBarrier] = useState<number>(5);
  const [targetProfit, setTargetProfit] = useState<number>(200);
  const [stopLoss, setStopLoss] = useState<number>(999);
  const [multiplierValue, setMultiplierValue] = useState<number>(2);
  const [tradeExecuting, setTradeExecuting] = useState(false);
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [tradeFeedback, setTradeFeedback] = useState<{ status: string; message: string; code?: string } | null>(null);

  // Target Profit / Stop Loss Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'TARGET_PROFIT' | 'STOP_LOSS';
    amountGain: number;
  } | null>(null);
  const [hasTriggeredTarget, setHasTriggeredTarget] = useState(false);
  const [wallet, setWallet] = useState<{ availableBalance: number; demoBalance: number } | null>(null);

  // Modals
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAiScannerActive, setIsAiScannerActive] = useState(false);

  const fetchInstruments = async () => {
    try {
      const res = await fetch('/api/instruments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.instruments && data.instruments.length > 0) {
          const volOnly = data.instruments.filter((inst: Instrument) => inst.symbol.startsWith('VOL'));
          if (volOnly.length > 0) {
            setInstruments(volOnly);
            setSelectedInstrument(volOnly[0]);
            setLivePrice(volOnly[0].currentPrice);
          }
        }
      }
    } catch (err) {
      console.error('Fetch instruments error:', err);
    }
  };

  const fetchTrades = async (mode = accountMode) => {
    try {
      const res = await fetch(`/api/trades/history?accountMode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTrades(data.trades);
          if (data.wallet) {
            setWallet(data.wallet);
          }
        }
      }
    } catch (err) {
      console.error('Fetch trades error:', err);
    }
  };

  useEffect(() => {
    fetchInstruments();
    fetchTrades(accountMode);
  }, [accountMode]);

  // Poll for open positions auto-settlement
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrades(accountMode);
    }, 3000);
    return () => clearInterval(interval);
  }, [accountMode]);

  // Compute Session Metrics
  const closedPositions = trades.filter((t) => t.status === 'WON' || t.status === 'LOST');
  const wonCount = closedPositions.filter((t) => t.status === 'WON').length;
  const lostCount = closedPositions.filter((t) => t.status === 'LOST').length;
  const sessionPL = closedPositions.reduce((acc, t) => acc + (t.profit || 0), 0);

  // Check Target Profit / Stop Loss Thresholds
  useEffect(() => {
    if (closedPositions.length === 0) return;

    if (!hasTriggeredTarget && targetProfit > 0 && sessionPL >= targetProfit) {
      setHasTriggeredTarget(true);
      setIsAutoTrading(false);
      setModalState({
        isOpen: true,
        type: 'TARGET_PROFIT',
        amountGain: sessionPL,
      });
    } else if (!hasTriggeredTarget && stopLoss > 0 && sessionPL <= -stopLoss) {
      setHasTriggeredTarget(true);
      setIsAutoTrading(false);
      setModalState({
        isOpen: true,
        type: 'STOP_LOSS',
        amountGain: sessionPL,
      });
    }
  }, [sessionPL, targetProfit, stopLoss, closedPositions.length, hasTriggeredTarget]);

  // Auto-Trading Engine Stream Loop
  useEffect(() => {
    if (!isAutoTrading) return;

    const autoInterval = setInterval(() => {
      if (!tradeExecuting) {
        const directions = tradeType === 'EVEN_ODD' ? ['EVEN', 'ODD'] : ['HIGHER', 'LOWER'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        handleExecuteTrade(randomDir);
      }
    }, 4000);

    return () => clearInterval(autoInterval);
  }, [isAutoTrading, tradeExecuting, tradeType]);

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
          accountMode,
          isAiScanner: isAiScannerActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.wallet) {
          setWallet(data.wallet);
        }
        // Switch left tab to OPEN so trader sees active contract card
        setLeftTab('OPEN');
        setTradeFeedback({
          status: 'OPEN',
          message: `Trade Placed: $${stake} USD on ${selectedInstrument.symbol} (${direction}). Contract active...`,
        });

        fetchTrades(accountMode);

        // Auto-settle refresh after 3.5 seconds
        setTimeout(() => {
          fetchTrades(accountMode);
        }, 3500);
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

  const handleCloseTrade = async (tradeId: string) => {
    setClosingTradeId(tradeId);
    try {
      const res = await fetch('/api/trades/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.wallet) {
          setWallet(data.wallet);
        }
        setTradeFeedback({
          status: data.trade.status,
          message: data.message,
        });
        fetchTrades(accountMode);
      }
    } catch (err) {
      console.error('Error closing trade:', err);
    } finally {
      setClosingTradeId(null);
    }
  };

  // Quick Stake Adjustment
  const adjustStake = (delta: number) => {
    setStake((prev) => Math.max(1, Math.min(1000, Number((prev + delta).toFixed(2)))));
  };

  // Multiplier calculation preview
  let multiplier = 1.95;
  if (tradeType === 'MATCH_DIFFER') multiplier = 8.5;
  else if (tradeType === 'OVER_UNDER') multiplier = 1.9;

  const potentialPayout = Number((stake * multiplier).toFixed(2));

  const openPositions = trades.filter((t) => t.status === 'OPEN' || t.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col font-sans pt-16 sm:pt-16 pb-16 md:pb-0">
      <Navbar
        accountMode={accountMode}
        onAccountModeChange={(mode) => setAccountMode(mode)}
        onOpenAIScanner={() => setIsAIScannerOpen(true)}
        liveWallet={wallet}
      />

      {/* Main Terminal Workspace 3-Panel Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT PANEL: Trade History & Positions (Desktop Col 3) */}
        <div
          className={`lg:col-span-3 bg-[#120f26] border border-purple-950/80 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-130px)] min-h-[calc(100vh-130px)] sm:h-[600px] lg:h-[calc(100vh-105px)] sm:min-h-[540px] max-h-[750px] ${
            mobileTab === 'POSITIONS' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="bg-[#181335] px-3 py-2.5 border-b border-purple-950/80 flex items-center justify-between">
            <div className="flex bg-[#0b0818] p-0.5 rounded-lg border border-purple-900/40 text-[11px] font-semibold w-full">
              <button
                onClick={() => setLeftTab('OPEN')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'OPEN' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Open ({openPositions.length})
              </button>
              <button
                onClick={() => setLeftTab('CLOSED')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'CLOSED' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Closed ({closedPositions.length})
              </button>
              <button
                onClick={() => setLeftTab('TRANSACTIONS')}
                className={`flex-1 py-1 rounded transition-colors ${leftTab === 'TRANSACTIONS' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                History
              </button>
            </div>
          </div>

          {/* Position Cards List Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {leftTab === 'OPEN' ? (
              openPositions.length > 0 ? (
                openPositions.map((t) => (
                  <div
                    key={t.tradeId}
                    className="bg-[#181335] p-3 rounded-xl border border-purple-900/60 space-y-2 relative shadow-lg"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-100 text-xs">{t.symbol}</span>
                        <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-mono border border-purple-800/40">
                          ● {t.direction}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Tick 1</span>
                      </span>
                    </div>

                    <div className="text-[10px] bg-[#0d091e] p-2 rounded-lg space-y-1 font-mono text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">USD Tag:</span>
                        <span className="font-bold text-slate-200">USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Profit/Loss:</span>
                        <span className="text-amber-400 font-bold animate-pulse">0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Value:</span>
                        <span>0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stake:</span>
                        <span className="font-bold text-white">${t.stake.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Potential Payout:</span>
                        <span className="text-purple-300 font-bold">${(t.stake * 1.95).toFixed(3)}</span>
                      </div>
                    </div>

                    {/* Manual Close Position Action Button */}
                    <button
                      onClick={() => handleCloseTrade(t.tradeId)}
                      disabled={closingTradeId === t.tradeId}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center space-x-1"
                    >
                      {closingTradeId === t.tradeId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>CLOSE POSITION</span>
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="font-semibold text-slate-300">No Open Positions</p>
                  <p className="text-[11px]">Active trade contracts will appear here automatically.</p>
                </div>
              )
            ) : leftTab === 'CLOSED' ? (
              closedPositions.length > 0 ? (
                closedPositions.map((t) => (
                  <div key={t.tradeId} className="bg-[#181335] p-3 rounded-xl border border-purple-900/40 space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-200 font-bold">{t.symbol}</span>
                        <span className="text-[10px] text-purple-300">● {t.direction}</span>
                      </div>
                      <span
                        className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded ${
                          t.status === 'WON' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {t.status === 'WON' ? `+$${t.profit.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                      <span>Stake: ${t.stake.toFixed(2)}</span>
                      <span>Contract Val: {t.payout.toFixed(2)}</span>
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

          {/* Session Summary Footer Bar (Reference UI Match) */}
          <div className="bg-[#16112e] p-3 border-t border-purple-950 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <span>● Auto-Trading</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                {trades.length} trades ({wonCount}W / {lostCount}L)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-purple-900/40">
              <span className="text-slate-300">Session P/L:</span>
              <span className={sessionPL >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                {sessionPL >= 0 ? `+${sessionPL.toFixed(2)} USD` : `${sessionPL.toFixed(2)} USD`}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Sleek Integrated Trading Terminal Chart (Desktop Col 6) */}
        <div
          className={`lg:col-span-6 ${
            mobileTab === 'TRADE' ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedInstrument && (
            <TradingChart
              instrument={selectedInstrument}
              allInstruments={instruments}
              onSelectInstrument={(inst) => {
                setSelectedInstrument(inst as Instrument);
                setLivePrice(inst.currentPrice);
              }}
              onPriceUpdate={(p) => setLivePrice(p)}
            />
          )}
        </div>

        {/* RIGHT PANEL: Order Execution Controls (Desktop Col 3) */}
        <div
          className={`lg:col-span-3 bg-[#120f26] border border-purple-950/80 rounded-2xl p-4 flex flex-col justify-between h-[540px] sm:h-[600px] lg:h-[calc(100vh-105px)] min-h-[540px] max-h-[750px] overflow-y-auto text-xs ${
            mobileTab === 'TRADE' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* TRADING MODE Switcher Header (Reference UI Match) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-[11px] text-slate-200 uppercase tracking-wider">Trading Mode</span>
              <span className="text-[10px] text-purple-300 font-medium">
                {tradingMode === 'AUTO' ? 'Bot places trades · martingale + targets' : 'You place each trade · same probabilities'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-[#0b0818] p-1 rounded-xl border border-purple-900/40 font-bold text-xs">
              <button
                onClick={() => setTradingMode('AUTO')}
                className={`py-2 rounded-lg transition-all ${
                  tradingMode === 'AUTO' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AUTO
              </button>
              <button
                onClick={() => {
                  setTradingMode('MANUAL');
                  setIsAutoTrading(false);
                }}
                className={`py-2 rounded-lg transition-all ${
                  tradingMode === 'MANUAL' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MANUAL
              </button>
            </div>
          </div>

          {/* Trade Contract Type Selector */}
          <div>
            <div className="grid grid-cols-3 gap-1 bg-[#0b0818] p-1 rounded-xl border border-purple-900/40 font-semibold text-[11px]">
              <button
                onClick={() => setTradeType('EVEN_ODD')}
                className={`py-1.5 rounded-lg transition-all ${
                  tradeType === 'EVEN_ODD' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Even / Odd
              </button>
              <button
                onClick={() => setTradeType('MATCH_DIFFER')}
                className={`py-1.5 rounded-lg transition-all ${
                  tradeType === 'MATCH_DIFFER' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Match / Differ
              </button>
              <button
                onClick={() => setTradeType('OVER_UNDER')}
                className={`py-1.5 rounded-lg transition-all ${
                  tradeType === 'OVER_UNDER' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Over / Under
              </button>
            </div>
          </div>

          {/* Stake Amount Input & Quick Chips */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-medium">STAKE AMOUNT</label>
              <div className="flex bg-[#0b0818] p-0.5 rounded border border-purple-900/40 text-[10px] font-mono font-bold">
                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded">Stake</span>
                <span className="px-1.5 py-0.5 text-slate-400">Payout</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => adjustStake(-1)}
                className="w-9 h-9 rounded-lg bg-[#181335] border border-purple-900/60 hover:bg-purple-900/40 text-slate-200 flex items-center justify-center font-bold text-base"
              >
                -
              </button>
              <div className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-lg px-3 py-1.5 flex items-center justify-center space-x-1 font-mono font-bold text-base text-slate-100">
                <span className="text-purple-400">$</span>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-16 bg-transparent text-center focus:outline-none"
                />
              </div>
              <button
                onClick={() => adjustStake(1)}
                className="w-9 h-9 rounded-lg bg-[#181335] border border-purple-900/60 hover:bg-purple-900/40 text-slate-200 flex items-center justify-center font-bold text-base"
              >
                +
              </button>
            </div>

            {/* Quick Stake Preset Buttons */}
            <div className="grid grid-cols-6 gap-1 mt-1.5 font-mono text-[11px]">
              {[1, 5, 10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  className={`py-1 rounded font-semibold transition-colors ${
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
              <label className="block text-slate-400 font-medium mb-1">Last Digit Barrier ({barrier})</label>
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

          {/* Payout Display Line */}
          <div className="flex justify-between items-center text-xs font-mono py-1 px-2 bg-[#0b0818] rounded-lg border border-purple-900/30">
            <span className="text-slate-400">Payout</span>
            <span className="font-extrabold text-slate-100">${potentialPayout.toFixed(2)} USD</span>
          </div>

          {/* Target Profit, Stop Loss, Multiplier Widgets (Reference Match) */}
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="bg-[#0b0818] p-2 rounded-xl border border-emerald-900/40">
              <span className="block text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Target Profit</span>
              <div className="flex items-center justify-center space-x-1 mt-1 text-slate-100 font-bold text-xs">
                <span className="text-emerald-400">$</span>
                <input
                  type="number"
                  value={targetProfit}
                  onChange={(e) => {
                    setTargetProfit(Number(e.target.value));
                    setHasTriggeredTarget(false);
                  }}
                  className="w-12 bg-transparent text-center text-emerald-300 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#0b0818] p-2 rounded-xl border border-rose-900/40">
              <span className="block text-[9px] text-rose-400 font-bold uppercase tracking-wider">Stop Loss</span>
              <div className="flex items-center justify-center space-x-1 mt-1 text-slate-100 font-bold text-xs">
                <span className="text-rose-400">$</span>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => {
                    setStopLoss(Number(e.target.value));
                    setHasTriggeredTarget(false);
                  }}
                  className="w-12 bg-transparent text-center text-rose-300 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#0b0818] p-2 rounded-xl border border-amber-900/40">
              <span className="block text-[9px] text-amber-400 font-bold uppercase tracking-wider">Multiplier</span>
              <div className="flex items-center justify-center space-x-0.5 mt-1 text-amber-300 font-bold text-xs">
                <span>x</span>
                <input
                  type="number"
                  value={multiplierValue}
                  onChange={(e) => setMultiplierValue(Number(e.target.value))}
                  className="w-8 bg-transparent text-center text-amber-300 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Live Session Strip Bar */}
          <div className="bg-[#181335] p-2.5 rounded-xl border border-purple-900/50 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-[10px] font-bold">
                LAST {trades.length}T · {wonCount}W - {lostCount}L
              </span>
            </div>
            <div className="text-right">
              <span className={`font-extrabold text-sm ${sessionPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {sessionPL >= 0 ? `+$${sessionPL.toFixed(2)}` : `-$${Math.abs(sessionPL).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Trade Execution Action Controls */}
          {tradingMode === 'AUTO' ? (
            <div className="pt-1">
              <button
                onClick={() => setIsAutoTrading(!isAutoTrading)}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center space-x-2 ${
                  isAutoTrading
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60'
                }`}
              >
                {isAutoTrading ? (
                  <>
                    <Square className="w-5 h-5 fill-white" />
                    <span>STOP AUTO-TRADING</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>RUN AUTO-TRADING</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {tradeType === 'EVEN_ODD' && (
                <div className="space-y-2 font-mono">
                  {/* Even Order Action Card (Reference Match) */}
                  <button
                    onClick={() => handleExecuteTrade('EVEN')}
                    disabled={tradeExecuting}
                    className="w-full bg-[#181335] hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 p-3 rounded-2xl flex items-center justify-between transition-all group shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Grid className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-slate-100 text-sm">Even</span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-400 text-xs">${potentialPayout.toFixed(2)} USD</p>
                      <p className="text-[10px] text-slate-400 font-bold">95.22%</p>
                    </div>
                  </button>

                  {/* Odd Order Action Card (Reference Match) */}
                  <button
                    onClick={() => handleExecuteTrade('ODD')}
                    disabled={tradeExecuting}
                    className="w-full bg-[#181335] hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-500 p-3 rounded-2xl flex items-center justify-between transition-all group shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                        <Triangle className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-slate-100 text-sm">Odd</span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-rose-400 text-xs">${potentialPayout.toFixed(2)} USD</p>
                      <p className="text-[10px] text-slate-400 font-bold">95.22%</p>
                    </div>
                  </button>
                </div>
              )}

              {tradeType === 'MATCH_DIFFER' && (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    onClick={() => handleExecuteTrade('MATCH')}
                    disabled={tradeExecuting}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1"
                  >
                    <span>MATCHES ({barrier})</span>
                  </button>
                  <button
                    onClick={() => handleExecuteTrade('DIFFER')}
                    disabled={tradeExecuting}
                    className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1"
                  >
                    <span>DIFFERS ({barrier})</span>
                  </button>
                </div>
              )}

              {tradeType === 'OVER_UNDER' && (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    onClick={() => handleExecuteTrade('OVER')}
                    disabled={tradeExecuting}
                    className="py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1"
                  >
                    <span>OVER ({barrier})</span>
                  </button>
                  <button
                    onClick={() => handleExecuteTrade('UNDER')}
                    disabled={tradeExecuting}
                    className="py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1"
                  >
                    <span>UNDER ({barrier})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Dedicated Mobile Bottom Bar Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={(t) => setMobileTab(t)}
        onOpenAIScanner={() => setIsAIScannerOpen(true)}
      />

      {/* Target Profit / Stop Loss Popup Modal (Reference Match) */}
      <TargetProfitModal
        isOpen={modalState?.isOpen ?? false}
        onClose={() => setModalState(null)}
        type={modalState?.type ?? 'TARGET_PROFIT'}
        amountGain={modalState?.amountGain ?? 0}
        totalTrades={trades.length}
        wonCount={wonCount}
        lostCount={lostCount}
      />

      {/* Modals */}
      <AIEntryScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        allInstruments={instruments}
        onLoadMarket={(symbol, category) => {
          const inst = instruments.find((i) => i.symbol === symbol || i.name.toLowerCase().includes(symbol.toLowerCase()));
          if (inst) {
            setSelectedInstrument(inst);
            setLivePrice(inst.currentPrice);
          }
          if (category) {
            setTradeType(category as any);
          }
          setTradingMode('AUTO');
          setIsAutoTrading(true);
          setIsAiScannerActive(true);
          setTradeFeedback({
            status: 'OPEN',
            message: `🚀 AI Scanner Loaded: Auto-Trading Active on ${inst?.name || symbol} (93%+ Win Confidence)`,
          });
        }}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </div>
  );
}
