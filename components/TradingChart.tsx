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
} from 'lucide-react';

import { getDeterministicPrice } from '@/lib/trading-engine';

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
  const [zoomLevel, setZoomLevel] = useState<'100%' | '50%'>('100%');
  const [activeChartTool, setActiveChartTool] = useState<'line' | 'bars' | 'trend'>('line');

  // Initialize tick series deterministically based on timestamp
  useEffect(() => {
    setCurrentPrice(instrument.currentPrice);
    const initialTicks: TickPoint[] = [];
    const basePrice = instrument.currentPrice;
    const nowSec = Math.floor(Date.now() / 1000);

    for (let i = 45; i >= 0; i--) {
      const sec = nowSec - i;
      const timeStr = new Date(sec * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const price = getDeterministicPrice(instrument.symbol, basePrice, sec);
      initialTicks.push({
        time: timeStr,
        price,
      });
    }
    setTicks(initialTicks);
  }, [instrument.symbol, instrument.currentPrice]);

  // Micro tick stream updated deterministically every second
  useEffect(() => {
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const timeStr = new Date(nowSec * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const price = getDeterministicPrice(instrument.symbol, instrument.currentPrice, nowSec);

      setTicks((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        return [...prev.slice(-60), { time: timeStr, price }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [instrument.symbol, instrument.currentPrice]);

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

  // Render HTML5 Canvas Trading Graph (Matching Image 1: Light Theme, Non-Smooth Tick Line)
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

    // Canvas Background: Light gray/slate matching Image 1 (#f0f3f8)
    ctx.fillStyle = '#f0f3f8';
    ctx.fillRect(0, 0, width, height);

    if (ticks.length < 2) return;

    const prices = ticks.map((t) => t.price);
    const minPrice = Math.min(...prices) * 0.9992;
    const maxPrice = Math.max(...prices) * 1.0008;
    const priceRange = maxPrice - minPrice || 1;

    // Grid lines styling (faint light gray lines matching Image 1)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    const rightMargin = 75;
    const gridRows = 6;

    // Horizontal grid lines & Y-Axis Prices
    for (let i = 0; i <= gridRows; i++) {
      const y = (height / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - rightMargin, y);
      ctx.stroke();

      // Right axis price label in slate text
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
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(ticks[i].time, Math.max(5, x - 20), height - 8);
      }
    }

    // Plot Tick Line Chart (Dark charcoal stroke with realistic discrete tick steps, NOT smooth sine curves, matching Image 1)
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];

    ticks.forEach((tick, idx) => {
      const x = (idx / (ticks.length - 1)) * (width - rightMargin);
      const y = (height - 40) - ((tick.price - minPrice) / priceRange) * (height - 70);
      points.push({ x, y });

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        // Direct lineTo for authentic non-smooth tick step movements (Image 1 style)
        ctx.lineTo(x, y);
      }
    });

    // Dark charcoal stroke matching Image 1 (#2a324b)
    ctx.strokeStyle = '#2a324b';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Soft subtle fill underneath tick line
    if (points.length > 0) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(42, 50, 75, 0.05)');
      gradient.addColorStop(1, 'rgba(42, 50, 75, 0.0)');

      ctx.lineTo(points[points.length - 1].x, height - 25);
      ctx.lineTo(points[0].x, height - 25);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw Active Price Dot & Y-Axis Dark Pill Badge (Image 1 Match)
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      // Dotted horizontal reference line across canvas
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.moveTo(0, lastPoint.y);
      ctx.lineTo(width - rightMargin, lastPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Active tick dot
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#2a324b';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Right Axis Price Badge Pill (Image 1 Match: Dark rounded rectangle with bold white price text)
      const badgeY = lastPoint.y - 10;
      const badgeX = width - rightMargin + 2;
      const badgeW = 68;
      const badgeH = 20;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(currentPrice.toFixed(2), badgeX + 8, badgeY + 14);
    }
  }, [ticks, currentPrice]);

  // Calculate Last Digit Statistics (0-9)
  const lastDigit = Math.abs(Math.floor(currentPrice * 100)) % 10;
  const digitCounts = Array(10).fill(0);
  ticks.forEach((t) => {
    const d = Math.abs(Math.floor(t.price * 100)) % 10;
    digitCounts[d]++;
  });
  const total = ticks.length || 1;
  const digitPercentages = digitCounts.map((c) => ((c / total) * 100).toFixed(1));

  // Determine max and min percentage digits for hot/cold indicators
  const numericPcts = digitCounts.map((c) => (c / total) * 100);
  const maxPct = Math.max(...numericPcts);
  const minPct = Math.min(...numericPcts);

  return (
    <div className="relative bg-[#f0f3f8] border border-slate-200/90 rounded-2xl overflow-hidden shadow-md flex flex-col h-[260px] sm:h-[600px] lg:h-[calc(100vh-105px)] min-h-[250px] lg:min-h-[540px] max-h-[750px]">
      {/* 1. TOP-LEFT FLOATING INSTRUMENT SELECTOR CARD (Image 1 Match: White Card with Shadow) */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30">
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white/95 border border-slate-200/90 rounded-xl p-2 sm:p-2.5 shadow-md backdrop-blur-md cursor-pointer hover:border-slate-400 transition-all flex flex-col space-y-0.5 sm:space-y-1 min-w-[170px] sm:min-w-[220px]"
        >
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-5 h-5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 tracking-tight">
                {instrument.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2 font-mono text-[10px] sm:text-[11px] pt-0.5">
            <span className="font-bold text-slate-900 text-[11px] sm:text-xs tracking-tight">
              {currentPrice.toFixed(2)}
            </span>
            <span
              className={`font-semibold ${
                instrument.change24h >= 0 ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {instrument.change24h >= 0 ? `+${instrument.change24h}%` : `${instrument.change24h}%`}
            </span>
          </div>
        </div>

        {/* Dropdown Popover (Image 1 Light Theme Match) */}
        {isDropdownOpen && allInstruments.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 text-xs max-h-80 overflow-y-auto font-sans">
            {allInstruments
              .filter((inst) => inst.symbol.startsWith('VOL'))
              .map((inst) => {
                const isSelected = instrument.symbol === inst.symbol;
                return (
                  <button
                    key={inst.symbol}
                    onClick={() => {
                      if (onSelectInstrument) onSelectInstrument(inst);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-slate-100 text-teal-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <BarChart2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-[11px] sm:text-xs text-slate-800">{inst.name}</span>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal-600" />
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* 2. LEFT VERTICAL FLOATING TOOLBAR (Image 1 Light Theme Match) */}
      <div className="absolute top-16 sm:top-20 left-2 sm:left-3 z-30 flex flex-col space-y-0.5 sm:space-y-1 bg-white/95 border border-slate-200/90 rounded-xl p-1 shadow-md backdrop-blur-md text-slate-600">
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shadow-xs">
          1T
        </button>
        <button
          onClick={() => setActiveChartTool('trend')}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'trend' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => setActiveChartTool('bars')}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'bars' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => setActiveChartTool('line')}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
            activeChartTool === 'line' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* 3. TOP-RIGHT FLOATING ZOOM BADGE (Image 1 Match: 100% Pill) */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 flex items-center space-x-2">
        <button
          onClick={() => setZoomLevel(zoomLevel === '100%' ? '50%' : '100%')}
          className="bg-white/95 border border-slate-200/90 px-2.5 sm:px-3 py-1 rounded-xl text-slate-800 font-mono text-[11px] sm:text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm backdrop-blur-md"
        >
          {zoomLevel}
        </button>
      </div>

      {/* 4. BOTTOM-LEFT FLOATING ZOOM CONTROLS (Desktop/Tablet Only - Image 1 Match) */}
      <div className="absolute bottom-12 sm:bottom-14 left-2 sm:left-3 z-30 flex flex-col space-y-1 bg-white/95 border border-slate-200/90 p-1 rounded-xl text-slate-600 shadow-md backdrop-blur-md hidden sm:flex">
        <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Plus className="w-4 h-4" />
        </button>
        <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* 5. CANVAS CHART AREA */}
      <div className="relative flex-1 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* 6. BOTTOM FLOATING CIRCULAR DIGIT STATISTICS OVERLAY (Image 1 Match: White Digit Circles) */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1 sm:space-x-2 max-w-[98vw] overflow-x-auto no-scrollbar py-0.5 px-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
          const isActive = lastDigit === digit;
          const pctVal = numericPcts[digit];
          const pctStr = digitPercentages[digit];
          const isHot = pctVal === maxPct && pctVal > 0;
          const isCold = pctVal === minPct && pctVal < maxPct;

          return (
            <div key={digit} className="flex flex-col items-center relative flex-shrink-0">
              <div
                className={`w-7 h-7 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center font-mono transition-all shadow-md backdrop-blur-md relative ${
                  isActive
                    ? 'bg-white border-2 border-teal-500 text-slate-900 shadow-teal-500/20 scale-105 sm:scale-110'
                    : 'bg-white/95 border border-slate-200/90 text-slate-800 hover:border-slate-400'
                }`}
              >
                {/* Hot / Cold Percentage Accent Bar */}
                {isHot && (
                  <span className="absolute -top-0.5 w-3.5 sm:w-5 h-1 bg-emerald-500 rounded-full" />
                )}
                {isCold && (
                  <span className="absolute -top-0.5 w-3.5 sm:w-5 h-1 bg-rose-500 rounded-full" />
                )}

                <span className="font-extrabold text-[10px] sm:text-sm leading-none text-slate-900">{digit}</span>
                <span
                  className={`text-[7.5px] sm:text-[9px] mt-0.5 font-semibold ${
                    isHot ? 'text-emerald-600' : isCold ? 'text-rose-500' : isActive ? 'text-teal-600' : 'text-slate-500'
                  }`}
                >
                  {pctStr}%
                </span>
              </div>

              {/* Active Digit Pointer Arrow */}
              {isActive && (
                <div className="w-0 h-0 border-l-[3.5px] sm:border-l-[5px] border-l-transparent border-r-[3.5px] sm:border-r-[5px] border-r-transparent border-t-[4.5px] sm:border-t-[6px] border-t-amber-500 mt-0.5 sm:mt-1 animate-bounce" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
