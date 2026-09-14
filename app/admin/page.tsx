'use client';

import React, { useEffect, useState } from 'react';
import { Users, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, MessageSquare, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  openTickets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTradeVolume: number;
  netPlatformProfit: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Platform Analytics Overview</h1>
        <p className="text-xs text-slate-400">Real-time aggregate operational metrics from MongoDB ledger</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#120f26] p-5 rounded-2xl border border-purple-900/60 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Total Registered Traders</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-extrabold text-slate-100 font-mono">{stats.totalUsers}</span>
            <span className="text-[10px] text-emerald-400 block">{stats.activeUsers} Active Accounts</span>
          </div>

          <div className="bg-[#120f26] p-5 rounded-2xl border border-purple-900/60 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Gross Deposited Capital</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">${stats.totalDeposits.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">Via M-Pesa & Crypto</span>
          </div>

          <div className="bg-[#120f26] p-5 rounded-2xl border border-purple-900/60 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Net Withdrawals Payouts</span>
              <ArrowDownLeft className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">${stats.totalWithdrawals.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block">Processed Payouts</span>
          </div>

          <div className="bg-[#120f26] p-5 rounded-2xl border border-purple-900/60 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span>Pending Action Queue</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-extrabold text-purple-300 font-mono">{stats.pendingKYC}</span>
            <span className="text-[10px] text-amber-400 block">Pending KYC Reviews</span>
          </div>
        </div>
      )}
    </div>
  );
}
