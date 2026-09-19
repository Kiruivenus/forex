'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Cpu, ShieldCheck, Zap, Lock, Globe, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About PalOption',
    url: `${baseUrl}/about`,
    description:
      'PalOption is an institutional-grade high-frequency trading platform offering synthetic volatility indices, forex pairs, and crypto contracts.',
    mainEntity: {
      '@type': 'Organization',
      name: 'PalOption Technologies',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${baseUrl}/about`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>High-Frequency Trading Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">About PalOption</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Institutional-grade execution, algorithmic synthetic market pricing, and automated mobile money settlement.
          </p>
        </div>

        {/* Content Section Cards */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>1. Our Technology Stack & Architecture</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              PalOption was built to deliver reliable microsecond tick processing for traders demanding high-precision contract execution. Our proprietary algorithmic engine generates transparent synthetic volatility indices (Vol 10, Vol 25, Vol 50, Vol 75, Vol 100) using cryptographically verified random walk generators.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>2. Security, Custody & Instant Settlement</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We prioritize trader capital security above all else. PalOption integrates directly with Safaricom M-Pesa Daraja and GravityPay APIs for instant STK push mobile deposits, alongside multi-chain cryptocurrency wallet support (USDT TRC20/ERC20, BTC, ETH) protected by 256-bit SSL encryption.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>3. AI Entry Scanning Signals</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our AI Entry Scanner evaluates multi-timeframe technical indicator convergence (RSI momentum, Exponential Moving Averages, and volatility bands) to provide traders with real-time market insights and risk confidence ratings.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ready to start trading with zero risk?</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold w-full sm:w-auto">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all flex items-center justify-center space-x-1.5 w-full sm:w-auto"
              >
                <span>Open Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors w-full sm:w-auto text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
