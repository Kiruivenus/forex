'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldAlert, FileText } from 'lucide-react';

export default function TermsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

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
        name: 'Terms of Service',
        item: `${baseUrl}/terms`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">PalOption Terms of Service</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: September 19, 2026. Official terms governing trading accounts and platform usage.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Account Registration & Qualification</h2>
            <p>
              By creating a PalOption account, you confirm that you are at least 18 years old (or legal age in your jurisdiction) and capable of entering into binding legal contracts. You agree to provide accurate registration details and maintain valid identification documents for compliance verification.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">2. Trade Contract Execution & Settlement</h2>
            <p>
              PalOption executes synthetic volatility indices and derivative contracts using microsecond pricing streams. Contract payouts (Even/Odd, Match/Differ, Over/Under, Rise/Fall) are calculated automatically based on tick prices. All settled profits are credited directly to your account wallet.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">3. Deposits & Payout Withdrawals</h2>
            <p>
              Deposits via Safaricom M-Pesa STK Push and Cryptocurrency (USDT TRC20/ERC20, BTC, ETH) credit upon atomic verification. Withdrawals are processed to the account owner&apos;s verified mobile number or wallet address following standard anti-money laundering (AML) checks.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">4. Risk Disclosure & Limitation of Liability</h2>
            <p>
              Trading synthetic indices involves significant risk of loss. Users should read our{' '}
              <Link href="/responsible-trading" className="text-purple-300 font-bold hover:underline">
                Responsible Trading Policy
              </Link>{' '}
              before placing active contract stakes. PalOption does not guarantee profits or provide investment advice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
