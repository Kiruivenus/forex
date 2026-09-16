import React from 'react';

interface AIScannerIconProps {
  className?: string;
}

export default function AIScannerIcon({ className = 'w-11 h-11' }: AIScannerIconProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Soft Glow Aura */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff7e36] via-[#e91e63] to-[#9c27b0] blur-[8px] opacity-75 animate-pulse" />

      {/* Main Rounded Square App Icon Box */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#ff7e36] via-[#e91e63] to-[#9c27b0] shadow-lg shadow-pink-500/50 flex items-center justify-center overflow-hidden border border-white/20">
        {/* Subtle Inner Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />

        {/* 4-Pointed Magic Sparkle Star */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65%] h-[65%] text-white drop-shadow-md">
          {/* Main Big 4-pointed Star */}
          <path
            d="M24 7 C24 15.5 15.5 24 7 24 C15.5 24 24 32.5 24 41 C24 32.5 32.5 24 41 24 C32.5 24 24 15.5 24 7 Z"
            fill="white"
          />
          {/* Top-Right Secondary Small Sparkle */}
          <path
            d="M35 7 C35 9.5 32.5 12 30 12 C32.5 12 35 14.5 35 17 C35 14.5 37.5 12 40 12 C37.5 12 35 9.5 35 7 Z"
            fill="white"
            opacity="0.95"
          />
        </svg>
      </div>
    </div>
  );
}
