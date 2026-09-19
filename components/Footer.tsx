import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#090b12] border-t border-slate-200 dark:border-purple-950/60 text-slate-600 dark:text-slate-400 py-10 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 font-bold text-base text-slate-900 dark:text-white">
            <img src="/logo.png" alt="PalOption Logo" className="w-6 h-6 object-contain shrink-0" />
            <span className="text-slate-900 dark:text-white text-lg font-extrabold">
              Pal<span className="text-purple-600 dark:text-purple-400">Option</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Institutional-grade digital trading platform engineered with high-density market analytics, atomic wallet settlement, and real-time execution.
          </p>
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-xs">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SSL 256-bit</span>
            </span>
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>2FA Secured</span>
            </span>
          </div>
        </div>

        {/* Products */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-3">Trading Products</h4>
          <ul className="space-y-2 font-medium">
            <li>
              <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Synthetic Indices (Vol 10, Vol 75)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Forex Pairs (EUR/USD, GBP/USD)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Crypto Contracts (BTC/USD)
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                AI Entry Scanner
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-3">Platform & Legal</h4>
          <ul className="space-y-2 font-medium">
            <li>
              <Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                About PalOption
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Contact Support Desk
              </Link>
            </li>
            <li>
              <Link href="/responsible-trading" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Responsible Trading Policy
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Help Center & FAQs
              </Link>
            </li>
            <li>
              <Link href="/verify-identity" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Identity & KYC Verification
              </Link>
            </li>
          </ul>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>High Risk Investment Warning</span>
          </div>
          <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            Trading financial instruments and synthetic index contracts involves substantial risk of loss and is not suitable for all investors. Never trade with capital you cannot afford to lose.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-slate-100 dark:border-purple-950/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 space-y-2 sm:space-y-0 font-medium">
        <p>© {new Date().getFullYear()} PalOption Inc. All rights reserved.</p>
        <div className="flex space-x-4">
          <Link href="/about" className="hover:text-slate-800 dark:hover:text-slate-200">
            About
          </Link>
          <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-200">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-slate-800 dark:hover:text-slate-200">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
