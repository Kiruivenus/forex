'use client';

import React from 'react';
import { TrendingUp, ListOrdered } from 'lucide-react';

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120f26]/95 backdrop-blur-md border-t border-purple-900/60 flex items-center justify-around h-14 px-2 text-slate-400 font-medium text-[11px]">
      <button
        onClick={() => onTabChange('TRADE')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'TRADE' ? 'text-purple-400 font-bold' : 'hover:text-slate-200'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span>Trade</span>
      </button>

      <button
        onClick={onOpenAIScanner}
        className="flex-1 flex flex-col items-center justify-center py-1 text-pink-300 hover:text-white transition-colors"
      >
        <img src="/ai-scanner-icon.png" alt="AI Scanner" className="w-6 h-6 object-contain mb-0.5 rounded-lg shadow-md shadow-pink-950/60" />
        <span className="font-bold text-[10px] bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">AI Scanner</span>
      </button>

      <button
        onClick={() => onTabChange('POSITIONS')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === 'POSITIONS' ? 'text-purple-400 font-bold' : 'hover:text-slate-200'
        }`}
      >
        <ListOrdered className="w-5 h-5 mb-0.5" />
        <span>Positions</span>
      </button>
    </div>
  );
}
