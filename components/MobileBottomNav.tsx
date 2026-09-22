'use client';

import React from 'react';
import AIScannerIcon from './AIScannerIcon';
import { BarChart2, Clock } from 'lucide-react';

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120e26] border-t border-[#241a45] flex items-center justify-around h-16 px-6 shadow-2xl transition-colors">
      {/* Trade Button (Screenshot 1) */}
      <button
        onClick={() => onTabChange('TRADE')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
          activeTab === 'TRADE' ? 'text-[#a78bfa] font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <BarChart2 className="w-5 h-5 text-[#a78bfa]" />
        <span className="text-xs font-bold text-[#a78bfa]">Trade</span>
      </button>

      {/* Prominent Glowing AI Scanner Button (Screenshot 1) */}
      <button
        onClick={onOpenAIScanner}
        className="flex flex-col items-center justify-center space-y-1 group transition-transform active:scale-95 cursor-pointer -mt-1"
      >
        <AIScannerIcon className="w-11 h-11" />
        <span className="font-extrabold text-[12px] text-[#f472b6] group-hover:brightness-125 tracking-wider">
          AI
        </span>
      </button>

      {/* Positions Button (Screenshot 1) */}
      <button
        onClick={() => onTabChange('POSITIONS')}
        className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
          activeTab === 'POSITIONS' ? 'text-[#a78bfa] font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Clock className="w-5 h-5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400">Positions</span>
      </button>
    </div>
  );
}

