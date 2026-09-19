'use client';

import React from 'react';
import AIScannerIcon from './AIScannerIcon';

interface MobileBottomNavProps {
  activeTab: 'TRADE' | 'POSITIONS';
  onTabChange: (tab: 'TRADE' | 'POSITIONS') => void;
  onOpenAIScanner: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  onOpenAIScanner,
}: MobileBottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0e17]/95 backdrop-blur-md border-t border-slate-200 dark:border-purple-900/40 flex items-center justify-around h-16 px-6 shadow-lg transition-colors">
      {/* Trade Button (3 Vertical Bars matching reference image) */}
      <button
        onClick={() => onTabChange('TRADE')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'TRADE' ? 'text-purple-700 dark:text-purple-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 fill-current" viewBox="0 0 24 24">
          <rect x="3" y="10" width="3.5" height="10" rx="1.5" />
          <rect x="10.25" y="4" width="3.5" height="16" rx="1.5" />
          <rect x="17.5" y="8" width="3.5" height="12" rx="1.5" />
        </svg>
        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 tracking-wide">Trade</span>
      </button>

      {/* Prominent Enlarged AI Scanner Button matching reference image */}
      <button
        onClick={onOpenAIScanner}
        className="flex flex-col items-center justify-center space-y-1 group transition-transform active:scale-95 cursor-pointer -mt-1"
      >
        <AIScannerIcon className="w-11 h-11" />
        <span className="font-extrabold text-[12px] bg-gradient-to-r from-pink-600 via-purple-600 to-purple-800 dark:from-pink-400 dark:via-purple-400 dark:to-purple-300 bg-clip-text text-transparent group-hover:brightness-125 tracking-wider">
          AI
        </span>
      </button>

      {/* Positions Button */}
      <button
        onClick={() => onTabChange('POSITIONS')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          activeTab === 'POSITIONS' ? 'text-purple-700 dark:text-purple-400 font-bold scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
        <span className="text-[11px] font-semibold">Positions</span>
      </button>
    </div>
  );
}
