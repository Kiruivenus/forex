'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, MessageSquare, Headphones, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact PalOption Support',
    url: `${baseUrl}/contact`,
    description: 'Contact PalOption 24/7 client support desk for deposit assistance and account inquiry.',
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
        name: 'Contact',
        item: `${baseUrl}/contact`,
      },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 text-purple-400" />
            <span>24/7 Client Support Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Contact PalOption Support</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Have questions about M-Pesa deposits, trading execution, or KYC verification? Reach out to our technical team.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Channel Cards */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-purple-500/20 space-y-2">
              <Mail className="w-6 h-6 text-purple-400" />
              <h2 className="font-bold text-sm text-white">Email Support</h2>
              <p className="text-xs text-slate-400">Direct inquiries to our compliance desk</p>
              <a href="mailto:support@paloption.com" className="text-xs font-mono text-purple-300 font-bold hover:underline block pt-1">
                support@paloption.com
              </a>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-2xl border border-purple-500/20 space-y-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Live Support Chat</h2>
              <p className="text-xs text-slate-400">Average response time under 15 mins</p>
              <Link href="/chat" className="text-xs text-emerald-400 font-bold hover:underline block pt-1">
                Open Support Chat →
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Send Us a Direct Message</h2>

            {submitted ? (
              <div className="bg-emerald-950/60 border border-emerald-600/40 p-5 rounded-2xl space-y-2 text-emerald-200">
                <div className="flex items-center space-x-2 font-bold text-sm text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Message Sent Successfully</span>
                </div>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. A PalOption compliance agent will respond to <strong className="text-white">{email}</strong> within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. M-Pesa STK Inquiry, KYC status"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry in detail..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Support Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
