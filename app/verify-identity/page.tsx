'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyIdentityPage() {
  const [kyc, setKyc] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [documentType, setDocumentType] = useState('NATIONAL_ID');
  const [documentNumber, setDocumentNumber] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [address, setAddress] = useState('');
  const [documentFrontUrl, setDocumentFrontUrl] = useState('https://apextrader.com/kyc/doc_front_sample.jpg');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchKYC = async () => {
    try {
      const res = await fetch('/api/kyc');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.kyc) {
          setKyc(data.kyc);
          setFullName(data.kyc.fullName);
          setDocumentNumber(data.kyc.documentNumber);
          setAddress(data.kyc.address);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          dateOfBirth,
          documentType,
          documentNumber,
          country,
          address,
          documentFrontUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('KYC document submitted successfully. Under compliance review.');
        fetchKYC();
      } else {
        setErrorMsg(data.message || 'KYC submission failed.');
      }
    } catch {
      setErrorMsg('Network error submitting KYC verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-10 w-full flex-1 space-y-6">
        <div className="bg-[#120f26] p-6 rounded-2xl border border-purple-900/60 shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100">Identity Verification (KYC)</h1>
              <p className="text-xs text-slate-400">Submit government-issued document to enable full withdrawal access</p>
            </div>
          </div>

          {kyc && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                kyc.status === 'APPROVED'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : kyc.status === 'PENDING'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <div>
                <span className="font-bold text-sm block">Status: {kyc.status}</span>
                <span className="text-[11px] block mt-0.5">
                  {kyc.status === 'APPROVED'
                    ? 'Your identity has been verified by compliance.'
                    : kyc.status === 'PENDING'
                    ? 'Documents are currently under review by an administrator.'
                    : `Rejection reason: ${kyc.rejectionReason || 'Please resubmit legible documents.'}`}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Legal Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As shown on passport / National ID"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none"
                >
                  <option value="NATIONAL_ID">National ID Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Document Number</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="ID / Passport Number"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address, City, Country"
                className="w-full bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {statusMsg && (
              <div className="bg-emerald-950/50 border border-emerald-600/40 p-3 rounded-xl text-emerald-300">
                <p>{statusMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-600/40 p-3 rounded-xl text-rose-300">
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || kyc?.status === 'APPROVED'}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit KYC Documents'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
