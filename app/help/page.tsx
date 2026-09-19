'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, Search, BookOpen, Smartphone, Bitcoin, ShieldCheck, Cpu } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Account & Security', icon: ShieldCheck, count: '6 articles' },
    { title: 'M-Pesa Deposits', icon: Smartphone, count: '4 articles' },
    { title: 'Crypto Payments', icon: Bitcoin, count: '5 articles' },
    { title: 'Trading Engine', icon: BookOpen, count: '8 articles' },
    { title: 'AI Entry Scanner', icon: Cpu, count: '3 articles' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">PalOption Knowledge Base</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Search guides, deposit instructions, and terminal documentation</p>

          <div className="relative mt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles (e.g. M-Pesa STK, KYC approval)..."
              className="w-full bg-white dark:bg-[#120f26] border border-slate-200 dark:border-purple-900/60 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-md dark:shadow-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="bg-white dark:bg-[#120f26] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 hover:border-purple-600 transition-all space-y-2 cursor-pointer shadow-sm hover:shadow-md">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cat.title}</h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
