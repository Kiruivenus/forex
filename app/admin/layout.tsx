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
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="h-screen bg-[#080a12] text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Sticky Top Bar */}
      <div className="md:hidden h-14 bg-[#0e0c1f] border-b border-purple-950/80 px-4 flex items-center justify-between z-40 shrink-0 sticky top-0">
        <div className="flex items-center space-x-2 font-bold text-sm">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle admin navigation menu"
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-purple-900/40 transition-colors focus:outline-none mr-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6 text-slate-200" />}
          </button>
          <img src="/logo.png" alt="PalOption Logo" className="w-6 h-6 object-contain mix-blend-screen shrink-0" />
          <span className="text-slate-100 text-xs">
            PalOption <span className="text-amber-400 font-extrabold">Admin</span>
          </span>
        </div>

        <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
          PROD MODE
        </span>
      </div>

      {/* Mobile Slide-out Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 bg-[#0e0c1f] border-r border-purple-950 flex flex-col justify-between p-4 space-y-4 z-50 shadow-2xl animate-fade-in h-full overflow-y-auto">
            <div>
              <div className="h-12 border-b border-purple-950 flex items-center justify-between pb-2 mb-3">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain mix-blend-screen shrink-0" />
                  <span className="text-slate-100">PalOption <span className="text-amber-400">Admin</span></span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-xs font-semibold">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-colors ${
                        active ? 'bg-purple-600 text-white shadow-md font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-purple-950 text-xs">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4 text-purple-400" />
                <span>Return to Trader Hub</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar (Isolated Scroll Container) */}
      <aside className="hidden md:flex w-64 bg-[#0e0c1f] border-r border-purple-950/80 flex-col justify-between shrink-0 h-screen overflow-y-auto z-20">
        <div>
          <div className="h-14 px-6 border-b border-purple-950/80 flex items-center space-x-2 font-bold text-sm sticky top-0 bg-[#0e0c1f] z-10">
            <img src="/logo.png" alt="PalOption Logo" className="w-7 h-7 object-contain mix-blend-screen shrink-0" />
            <span className="text-slate-100">PalOption <span className="text-amber-400">Admin</span></span>
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

        <div className="p-4 border-t border-purple-950/80 text-xs bg-[#0e0c1f]">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Return to Trader Hub</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area with Fixed Top Header & Independent Scroll */}
      <div className="flex-1 flex flex-col h-full md:h-screen overflow-hidden w-full relative">
        {/* Fixed Top Header Bar */}
        <header className="hidden md:flex h-14 bg-[#0e0c1f]/95 backdrop-blur-md border-b border-purple-950/80 px-6 items-center justify-between text-xs font-semibold shrink-0 z-30 sticky top-0">
          <span className="text-amber-400 font-extrabold tracking-wide">ADMIN OPERATIONAL CONSOLE</span>
          <span className="text-slate-400 font-mono">Environment: Production Mode</span>
        </header>

        {/* Independent Scrollable Page Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
