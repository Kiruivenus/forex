'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  ShieldCheck,
  MessageSquare,
  FileText,
  Settings,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Lock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === 'ADMIN') {
          setAuthorized(true);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (!authorized) return null;

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { label: 'Crypto Payments', href: '/admin/payment-methods', icon: TrendingUp },
    { label: 'KYC Verification', href: '/admin/kyc', icon: ShieldCheck },
    { label: 'Support Inbox', href: '/admin/support', icon: MessageSquare },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080a12] text-slate-100 flex font-sans">
      {/* Admin Compact Sidebar */}
      <aside className="w-64 bg-[#0e0c1f] border-r border-purple-950/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-14 px-6 border-b border-purple-950/80 flex items-center space-x-2 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-slate-100">ApexTrader <span className="text-amber-400">Admin</span></span>
          </div>

          <nav className="p-3 space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-colors ${
                    active ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-purple-950/80 text-xs">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Return to Trader Hub</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 overflow-y-auto">
        <header className="h-14 bg-[#0e0c1f] border-b border-purple-950/80 px-6 flex items-center justify-between text-xs font-semibold">
          <span className="text-amber-400">ADMIN OPERATIONAL CONSOLE</span>
          <span className="text-slate-400">Environment: Production Mode</span>
        </header>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
