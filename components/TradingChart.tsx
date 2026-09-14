'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, Activity } from 'lucide-react';

interface InstrumentInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
}

interface TradingChartProps {
  instrument: InstrumentInfo;
  onPriceUpdate?: (price: number) => void;
}

interface TickPoint {
  time: string;
  price: number;
}

export default function TradingChart({ instrument, onPriceUpdate }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ticks, setTicks] = useState<TickPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(instrument.currentPrice);
  const [timeframe, setTimeframe] = useState<'1s' | '5s' | '1m'>('1s');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize tick series based on instrument price
  useEffect(() => {
    setCurrentPrice(instrument.currentPrice);
    const initialTicks: TickPoint[] = [];
    const basePrice = instrument.currentPrice;
    const now = Date.now();

    for (let i = 30; i >= 0; i--) {
      const timeStr = new Date(now - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const variance = (Math.random() - 0.5) * (basePrice * 0.0008);
      initialTicks.push({
        time: timeStr,
        price: Number((basePrice + variance).toFixed(4)),
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
        const nextPrice = Number((lastPrice * (1 + changePercent)).toFixed(4));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return [...prev.slice(-45), { time: timeStr, price: nextPrice }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [instrument.symbol]);

  // Safely sync current price & notify parent without trigger set-state during render
  useEffect(() => {
    if (ticks.length > 0) {
      const latestPrice = ticks[ticks.length - 1].price;
      setCurrentPrice(latestPrice);
      if (onPriceUpdate) {
        onPriceUpdate(latestPrice);
      }
    }
  }, [ticks, onPriceUpdate]);

  // Render HTML5 Canvas Trading Graph
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

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    if (ticks.length < 2) return;

    const prices = ticks.map((t) => t.price);
    const minPrice = Math.min(...prices) * 0.9995;
    const maxPrice = Math.max(...prices) * 1.0005;
    const priceRange = maxPrice - minPrice || 1;

    // Draw Grid Lines
    ctx.strokeStyle = '#1d1936';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const gridRows = 5;
    for (let i = 0; i <= gridRows; i++) {
      const y = (height / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Price labels on right
      const priceAtY = (maxPrice - (i / gridRows) * priceRange).toFixed(4);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(priceAtY, width - 65, y - 4);
    }

    // Vertical grid lines
    const gridCols = 6;
    for (let i = 0; i <= gridCols; i++) {
      const x = (width / gridCols) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Plot Tick Line Chart with Gradient Fill
    ctx.beginPath();
    const points: { x: number; y: number }[] = [];

    ticks.forEach((tick, idx) => {
      const x = (idx / (ticks.length - 1)) * (width - 70);
      const y = height - ((tick.price - minPrice) / priceRange) * (height - 20) - 10;
      points.push({ x, y });

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Stroke line
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Area Gradient Fill
    if (points.length > 0) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

      ctx.lineTo(points[points.length - 1].x, height);
      ctx.lineTo(points[0].x, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw Last Price Pulse Dot & Line
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.moveTo(0, lastPoint.y);
      ctx.lineTo(width, lastPoint.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Glowing pulse circle
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }, [ticks]);

  return (
    <div className={`relative bg-[#0e0b1f] border border-purple-950/70 rounded-xl overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[360px] sm:h-[420px]'}`}>
      {/* Chart Top Control Header */}
      <div className="bg-[#15112a] border-b border-purple-950/80 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100">{instrument.name}</span>
            <span className="text-[10px] bg-purple-900/60 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-800/40">
              {instrument.symbol}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-400">Price:</span>
            <span className="font-bold text-emerald-400 text-sm tracking-wide">
              {currentPrice.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Timeframe & Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#0b0818] p-0.5 rounded-lg border border-purple-900/40 text-[11px] font-semibold">
            {(['1s', '5s', '1m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded ${timeframe === tf ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 border-l border-purple-900/60 pl-2 text-slate-400">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* HTML5 Canvas Chart Body */}
      <div className="relative flex-1 bg-[#0b0818] p-2">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Indicator Badge */}
        <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-[#16112d]/90 backdrop-blur border border-purple-900/60 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-400">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>LIVE TICK STREAM</span>
        </div>
      </div>
    </div>
  );
}
