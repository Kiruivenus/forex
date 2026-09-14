'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Pencil,
  Download,
  Plus,
  Minus,
  Crosshair,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface InstrumentInfo {
  _id?: string;
  symbol: string;
  name: string;
  category?: string;
  currentPrice: number;
  change24h: number;
  volatility?: number;
  minStake?: number;
  maxStake?: number;
}

interface TradingChartProps {
  instrument: InstrumentInfo;
  allInstruments?: InstrumentInfo[];
  onSelectInstrument?: (inst: InstrumentInfo) => void;
  onPriceUpdate?: (price: number) => void;
}

interface TickPoint {
  time: string;
  price: number;
}

export default function TradingChart({
  instrument,
  allInstruments = [],
  onSelectInstrument,
  onPriceUpdate,
}: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ticks, setTicks] = useState<TickPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(instrument.currentPrice);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'100%' | '50%'>('50%');
  const [activeChartTool, setActiveChartTool] = useState<'line' | 'bars' | 'trend'>('line');

  // Initialize tick series
  useEffect(() => {
    setCurrentPrice(instrument.currentPrice);
    const initialTicks: TickPoint[] = [];
    const basePrice = instrument.currentPrice;
    const now = Date.now();

    for (let i = 40; i >= 0; i--) {
      const timeStr = new Date(now - i * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const variance = (Math.random() - 0.5) * (basePrice * 0.0008);
      initialTicks.push({
        time: timeStr,
        price: Number((basePrice + variance).toFixed(2)),
      });
    }
    setTicks(initialTicks);
  }, [instrument.symbol]);

  // Micro tick generator simulation stream
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks((prev) => {
        const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : instrument.currentPrice;
        const changePercent = (Math.random() - 0.495) * 0.0012;
        const nextPrice = Number((lastPrice * (1 + changePercent)).toFixed(2));
        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return [...prev.slice(-55), { time: timeStr, price: nextPrice }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [instrument.symbol]);

  // Notify parent of latest price
  useEffect(() => {
    if (ticks.length > 0) {
      const latestPrice = ticks[ticks.length - 1].price;
      setCurrentPrice(latestPrice);
      if (onPriceUpdate) {
        onPriceUpdate(latestPrice);
      }
    }
  }, [ticks, onPriceUpdate]);

  // Render HTML5 Canvas Trading Graph (Matching Reference Screenshot 1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear Canvas with sleek dark terminal background (#151722)
    ctx.fillStyle = '#141722';
    ctx.fillRect(0, 0, width, height);

    if (ticks.length < 2) return;

    const prices = ticks.map((t) => t.price);
    const minPrice = Math.min(...prices) * 0.9992;
    const maxPrice = Math.max(...prices) * 1.0008;
    const priceRange = maxPrice - minPrice || 1;

    // Grid lines styling
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal grid lines & Y-Axis Prices
    const gridRows = 6;
    const rightMargin = 75;

    for (let i = 0; i <= gridRows; i++) {
      const y = (height / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - rightMargin, y);
      ctx.stroke();

      // Right axis price text
      const priceAtY = (maxPrice - (i / gridRows) * priceRange).toFixed(2);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(priceAtY, width - 62, y + 3);
    }

    // Vertical grid lines & Bottom X-Axis Time Labels
    const visibleTimeCount = 6;
    const step = Math.floor(ticks.length / visibleTimeCount) || 1;

    for (let i = 0; i < ticks.length; i += step) {
      const x = (i / (ticks.length - 1)) * (width - rightMargin);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 25);
      ctx.stroke();

      // Time labels at bottom axis
      if (ticks[i]) {
        ctx.fillStyle = '#475569';
        ctx.font = '9px monospace';
        ctx.fillText(ticks[i].time, Math.max(5, x - 20), height - 8);
      }
    }

    // Plot Tick Line Chart (Smooth White Curve like Image 1)
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];

    ticks.forEach((tick, idx) => {
      const x = (idx / (ticks.length - 1)) * (width - rightMargin);
      const y = (height - 35) - ((tick.price - minPrice) / priceRange) * (height - 60);
      points.push({ x, y });

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        const prev = points[idx - 1];
        const xc = (prev.x + x) / 2;
        const yc = (prev.y + y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, xc, yc);
      }
    });

    // Solid bright line stroke
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Subtle ambient glow gradient fill underneath
    if (points.length > 0) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.lineTo(points[points.length - 1].x, height - 25);
      ctx.lineTo(points[0].x, height - 25);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw Active Price Dot & Y-Axis Pill Badge (Image 1 Match)
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      // Dotted horizontal line across chart
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, lastPoint.y);
      ctx.lineTo(width - rightMargin, lastPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Solid white pulsing dot on tick line
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Right Axis Price Badge Pill (Image 1 Match: Dark rounded box with white price text)
      const badgeY = lastPoint.y - 10;
      const badgeX = width - rightMargin + 2;
      const badgeW = 68;
      const badgeH = 20;

      ctx.fillStyle = '#1e2334';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(currentPrice.toFixed(2), badgeX + 8, badgeY + 14);
    }
  }, [ticks, currentPrice]);

  // Calculate Last Digit Statistics
  const lastDigit = Math.abs(Math.floor(currentPrice * 100)) % 10;
  const digitCounts = Array(10).fill(0);
  ticks.forEach((t) => {
    const d = Math.abs(Math.floor(t.price * 100)) % 10;
    digitCounts[d]++;
  });
  const total = ticks.length || 1;
  const digitPercentages = digitCounts.map((c) => ((c / total) * 100).toFixed(1));

  return (
    <div className="relative bg-[#141722] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px] sm:h-[550px]">
      {/* 1. TOP-LEFT FLOATING INSTRUMENT SELECTOR CARD (Image 1 Match) */}
      <div className="absolute top-3 left-3 z-30">
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-[#1e2334]/95 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md cursor-pointer hover:border-slate-500 transition-all flex flex-col space-y-1 min-w-[210px]"
        >
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span className="font-extrabold text-xs text-white tracking-tight">{instrument.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px] pt-0.5">
            <span className="font-bold text-white text-xs tracking-tight">{currentPrice.toFixed(2)}</span>
            <span
              className={`font-semibold ${
                instrument.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {instrument.change24h >= 0 ? `+${instrument.change24h}%` : `${instrument.change24h}%`}
            </span>
          </div>
        </div>

        {/* Dropdown Popover for selecting any instrument */}
        {isDropdownOpen && allInstruments.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1e2d] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-40 text-xs max-h-64 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              Select Market Symbol
            </div>
            {allInstruments.map((inst) => (
              <button
                key={inst.symbol}
                onClick={() => {
                  if (onSelectInstrument) onSelectInstrument(inst);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-purple-900/40 transition-colors ${
                  instrument.symbol === inst.symbol ? 'bg-purple-900/50 font-bold text-white' : 'text-slate-300'
                }`}
              >
                <span>{inst.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{inst.currentPrice.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. LEFT VERTICAL FLOATING TOOLBAR (Image 1 Match) */}
      <div className="absolute top-20 left-3 z-30 flex flex-col space-y-1 bg-[#1e2334]/90 border border-slate-700/80 rounded-xl p-1 shadow-xl backdrop-blur-md text-slate-300">
        <button className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] flex items-center justify-center border border-emerald-500/40">
          1T
        </button>
        <button
          onClick={() => setActiveChartTool('trend')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'trend' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveChartTool('bars')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'bars' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveChartTool('line')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'line' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center justify-center">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* 3. TOP-RIGHT FLOATING ZOOM BADGE (Image 1 Match: 50% pill only) */}
      <div className="absolute top-3 right-3 z-30 flex items-center space-x-2">
        <button
          onClick={() => setZoomLevel(zoomLevel === '100%' ? '50%' : '100%')}
          className="bg-[#1e2334]/90 border border-slate-700/80 px-3 py-1 rounded-xl text-slate-200 font-mono text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg backdrop-blur-md"
        >
          {zoomLevel}
        </button>
      </div>

      {/* 4. BOTTOM-LEFT FLOATING ZOOM CONTROLS (Image 1 Match) */}
      <div className="absolute bottom-14 left-3 z-30 flex flex-col space-y-1 bg-[#1e2334]/90 border border-slate-700/80 p-1 rounded-xl text-slate-300 shadow-xl backdrop-blur-md">
        <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </button>
        <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center">
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* 5. CANVAS CHART AREA */}
      <div className="relative flex-1 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* 6. BOTTOM FLOATING CIRCULAR DIGIT STATISTICS OVERLAY (Image 1 Match) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 sm:space-x-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
          const isActive = lastDigit === digit;
          const pct = digitPercentages[digit];
          return (
            <div key={digit} className="flex flex-col items-center relative">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center font-mono transition-all shadow-xl backdrop-blur-md ${
                  isActive
                    ? 'bg-[#1b253b] border-2 border-teal-400 text-white shadow-teal-950/80 scale-110'
                    : 'bg-[#1c2235]/95 border border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="font-extrabold text-xs sm:text-sm leading-none">{digit}</span>
                <span
                  className={`text-[9px] mt-0.5 font-semibold ${
                    isActive ? 'text-teal-400' : 'text-slate-400'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Active Digit Pointer Arrow (Image 1 Match) */}
              {isActive && (
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-500 mt-1 animate-bounce" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
