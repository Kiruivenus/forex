'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const TICKER_ITEMS: TickerItem[] = [
  { symbol: 'EUR/USD', price: '$1.0892', change: '+0.12%', isPositive: true },
  { symbol: 'SOL/USD', price: '$98.42', change: '+5.67%', isPositive: true },
  { symbol: 'GBP/USD', price: '$1.2654', change: '-0.08%', isPositive: false },
  { symbol: 'BTC/USD', price: '$43,268.84', change: '+2.34%', isPositive: true },
  { symbol: 'ETH/USD', price: '$2,284.15', change: '+1.87%', isPositive: true },
  { symbol: 'AAPL', price: '$178.32', change: '-0.45%', isPositive: false },
  { symbol: 'XAU/USD', price: '$2,042.60', change: '+0.55%', isPositive: true },
  { symbol: 'VOL 10 (1s)', price: '6,842.15', change: '+1.25%', isPositive: true },
];

interface LiveTrade {
  id: string;
  name: string;
  amount: number;
  direction: 'Higher' | 'Lower';
  time: string;
}

const INITIAL_TRADES: LiveTrade[] = [
  { id: '1', name: 'Anna', amount: 100, direction: 'Higher', time: 'just now' },
  { id: '2', name: 'Mike', amount: 20, direction: 'Higher', time: 'just now' },
  { id: '3', name: 'James', amount: 200, direction: 'Higher', time: 'just now' },
  { id: '4', name: 'Emma', amount: 20, direction: 'Higher', time: 'just now' },
  { id: '5', name: 'James', amount: 25, direction: 'Higher', time: 'just now' },
  { id: '6', name: 'Nina', amount: 200, direction: 'Lower', time: 'just now' },
];

const NAMES = ['Alex', 'Sarah', 'David', 'Elena', 'Lucas', 'Sophia', 'Daniel', 'Maya', 'Liam', 'Olivia'];

export default function LandingLiveTerminal() {
  const [btcPrice, setBtcPrice] = useState(43268.84);
  const [priceChange, setPriceChange] = useState('+0.03%');
  const [trades, setTrades] = useState<LiveTrade[]>(INITIAL_TRADES);

  // Tick simulation & live trade feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small price fluctuate
      const delta = (Math.random() - 0.48) * 12;
      setBtcPrice((prev) => {
        const next = Math.max(40000, Number((prev + delta).toFixed(2)));
        const diffPercent = (((next - 43250) / 43250) * 100).toFixed(2);
        setPriceChange(`${diffPercent >= '0' ? '+' : ''}${diffPercent}%`);
        return next;
      });

      // Add dynamic trade to sidebar
      if (Math.random() > 0.3) {
        const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
        const randomAmt = [10, 20, 25, 50, 100, 200, 500][Math.floor(Math.random() * 7)];
        const randomDir: 'Higher' | 'Lower' = Math.random() > 0.3 ? 'Higher' : 'Lower';
        const newTrade: LiveTrade = {
          id: Date.now().toString(),
          name: randomName,
          amount: randomAmt,
          direction: randomDir,
          time: 'just now',
        };

        setTrades((prev) => [newTrade, ...prev.slice(0, 5)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Top Scrolling Ticker Bar */}
      <div className="w-full overflow-hidden bg-slate-100/90 dark:bg-[#07090e]/90 backdrop-blur-md border-y border-slate-200/90 dark:border-purple-950/60 py-2 text-xs transition-colors">
        <div className="flex items-center space-x-6 animate-marquee whitespace-nowrap px-4">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="inline-flex items-center space-x-2 font-mono text-[11px] font-semibold">
              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-[9px]">
                {item.symbol.charAt(0)}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{item.symbol}</span>
              <span className="text-slate-600 dark:text-slate-400">{item.price}</span>
              <span className={item.isPositive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Terminal Widget Card */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white dark:bg-[#120f26] border border-slate-200/90 dark:border-purple-900/60 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-purple-950/10 transition-colors">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-lg flex items-center justify-center font-mono border border-amber-500/30">
                B
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">BTC/USD</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bitcoin / US Dollar</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-500 dark:text-rose-400 tracking-tight">
                ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{priceChange}</p>
            </div>
          </div>

          {/* Grid Layout: Chart (Left 2 cols) + Live Trades Sidebar (Right 1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-stretch">
            {/* Chart Area (Col 8) */}
            <div className="lg:col-span-8 bg-slate-50/60 dark:bg-[#0b0818] border border-slate-200/80 dark:border-purple-950/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[320px]">
              {/* SVG Curve Chart */}
              <div className="w-full h-full min-h-[260px] relative flex flex-col justify-end">
                <svg className="w-full h-56 overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="landingGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Dotted Baseline */}
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#10b981" strokeDasharray="4 4" strokeOpacity="0.3" strokeWidth="1.5" />

                  {/* Filled Area */}
                  <path
                    d="M 0 60 Q 30 50, 60 90 T 120 120 T 180 60 T 240 100 T 300 80 T 360 110 T 420 50 T 480 90 L 500 80 L 500 180 L 0 180 Z"
                    fill="url(#landingGreenGrad)"
                  />

                  {/* Main Line */}
                  <path
                    d="M 0 60 Q 30 50, 60 90 T 120 120 T 180 60 T 240 100 T 300 80 T 360 110 T 420 50 T 480 90 L 500 80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Current Tick Head Pulsing Dot */}
                  <circle cx="500" cy="80" r="5" fill="#10b981" className="animate-ping" />
                  <circle cx="500" cy="80" r="4" fill="#10b981" />
                </svg>

                {/* Floating Price Pill Callout Tag */}
                <div className="absolute top-10 right-4 bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md border border-emerald-400">
                  ${btcPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Live Trades Sidebar (Col 4) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0e0b1d] border border-slate-200/80 dark:border-purple-950/80 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">LIVE TRADES</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Trade List Stream */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {trades.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#181335] border border-slate-100 dark:border-purple-950/60 text-xs transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
                            t.direction === 'Higher' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        >
                          {t.direction === 'Higher' ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{t.name}</p>
                          <p className="text-[10px] text-slate-400">{t.time}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className={t.direction === 'Higher' ? 'text-emerald-600 dark:text-emerald-400 font-bold text-xs' : 'text-rose-600 dark:text-rose-400 font-bold text-xs'}>
                          ${t.amount}
                        </p>
                        <p className={t.direction === 'Higher' ? 'text-emerald-600 dark:text-emerald-400 text-[10px]' : 'text-rose-600 dark:text-rose-400 text-[10px]'}>
                          {t.direction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Trading CTA Button matching reference image */}
              <Link
                href="/register"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm text-center shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Trading</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
