'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, User, Calendar, FileBadge, MapPin } from 'lucide-react';

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
          setFullName(data.kyc.fullName || '');
          setDocumentNumber(data.kyc.documentNumber || '');
          setAddress(data.kyc.address || '');
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
        setStatusMsg('KYC documents submitted successfully. Under compliance review.');
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 space-y-6">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Account Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Identity Verification (KYC)</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Verify your government identity to unlock full withdrawal access and higher account limits.
          </p>
        </div>

        {/* Main Glass Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-950/20 space-y-6">
          {kyc && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs transition-all ${
                kyc.status === 'APPROVED'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : kyc.status === 'PENDING'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {kyc.status === 'APPROVED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : kyc.status === 'PENDING' ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-sm block capitalize">Verification Status: {kyc.status}</span>
                <span className="text-xs text-slate-300 mt-0.5 block">
                  {kyc.status === 'APPROVED'
                    ? 'Your identity has been verified. Payouts and full features are enabled.'
                    : kyc.status === 'PENDING'
                    ? 'Your application is under review by our compliance team. Verification takes 1–2 hours.'
                    : `Rejection reason: ${kyc.rejectionReason || 'Please resubmit valid, clear document details.'}`}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Legal Full Name</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As shown on passport / National ID"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                  required
                  disabled={kyc?.status === 'APPROVED'}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                  required
                  disabled={kyc?.status === 'APPROVED'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <FileBadge className="w-3.5 h-3.5 text-purple-400" />
                  <span>Document Type</span>
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 text-xs transition-all cursor-pointer"
                  disabled={kyc?.status === 'APPROVED'}
                >
                  <option value="NATIONAL_ID">National ID Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Document Number</span>
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="ID or Passport Number"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                  required
                  disabled={kyc?.status === 'APPROVED'}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Residential Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address, City, Country"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs transition-all"
                required
                disabled={kyc?.status === 'APPROVED'}
              />
            </div>

            {statusMsg && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || kyc?.status === 'APPROVED'}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{kyc?.status === 'APPROVED' ? 'Identity Verified' : 'Submit KYC Verification'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

