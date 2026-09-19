'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
        name: 'Privacy Policy',
        item: `${baseUrl}/privacy`,
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
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">PalOption Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: September 19, 2026. How we protect and manage user personal information.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect account registration details (full name, email address, phone number for M-Pesa deposits), government identity documents for KYC verification, and encrypted transaction metadata necessary to execute financial trading contracts.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">2. Encryption & Security Standards</h2>
            <p>
              All client data, session tokens, and passwords are protected using industry-standard bcrypt hashing, 256-bit SSL encryption, and isolated database clusters. We never store raw M-Pesa PIN numbers or unencrypted financial credentials.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">3. Third-Party Services & Webhooks</h2>
            <p>
              Payment data transmitted to Safaricom Daraja or GravityPay API is encrypted in transit via HMAC SHA-256 signatures for payment verification. We do not sell or trade user data to third-party marketing brokers.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">4. Your Data Rights & Contact</h2>
            <p>
              You have the right to request a copy of your verified data or request account deletion by emailing our privacy compliance team at{' '}
              <a href="mailto:support@paloption.com" className="text-purple-300 font-mono font-bold hover:underline">
                support@paloption.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
