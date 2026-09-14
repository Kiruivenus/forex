import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, HelpCircle, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#090b12] border-t border-purple-950/60 text-slate-400 py-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-100">
            <span className="bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent text-lg">
              Apex<span className="text-purple-400">Trader</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Institutional-grade digital trading platform engineered with high-density market analytics, atomic wallet settlement, and real-time execution.
          </p>
          <div className="flex items-center space-x-3 text-slate-300 text-xs">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-bit</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>2FA Secured</span>
            </span>
          </div>
        </div>

        {/* Products */}
        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Trading Products</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
                Synthetic Indices (Vol 10, Vol 75)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
                Forex Pairs (EUR/USD, GBP/USD)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
                Crypto Contracts (BTC/USD)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-300 transition-colors">
                AI Entry Scanner
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform & Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/responsible-trading" className="hover:text-purple-300 transition-colors">
                Responsible Trading Policy
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-purple-300 transition-colors">
                Help Center & FAQs
              </Link>
            </li>
            <li>
              <Link href="/verify-identity" className="hover:text-purple-300 transition-colors">
                Identity & KYC Verification
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-purple-300 transition-colors">
                Customer Support Chat
              </Link>
            </li>
          </ul>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-[#120e24] p-4 rounded-xl border border-purple-950/80 space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>High Risk Investment Warning</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Trading financial instruments and synthetic index contracts involves substantial risk of loss and is not suitable for all investors. Never trade with capital you cannot afford to lose.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 space-y-2 sm:space-y-0">
        <p>© {new Date().getFullYear()} ApexTrader Inc. All rights reserved.</p>
        <div className="flex space-x-4">
          <Link href="/responsible-trading" className="hover:text-slate-300">
            Terms of Service
          </Link>
          <Link href="/responsible-trading" className="hover:text-slate-300">
            Privacy Policy
          </Link>
          <Link href="/help" className="hover:text-slate-300">
            Security Overview
          </Link>
        </div>
      </div>
    </footer>
  );
}
