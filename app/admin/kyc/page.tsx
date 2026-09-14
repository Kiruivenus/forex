'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, FileText } from 'lucide-react';

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const fetchKYCs = async () => {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setKycs(data.kycs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKYCs();
  }, []);

  const handleKYC = async (kycId: string, action: 'APPROVE' | 'REJECT') => {
    const reason = prompt(`Enter notes/reason for ${action.toLowerCase()}ing:`) || '';
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, action, rejectionReason: reason, adminNotes: reason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`KYC record ${action.toLowerCase()}d successfully.`);
        fetchKYCs();
      }
    } catch {
      setMsg('Error updating KYC.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Identity Verification Inbox</h1>
        <p className="text-xs text-slate-400">Review submitted user national ID and passport identity documents</p>
      </div>

      {msg && <p className="text-purple-300 text-xs font-semibold">{msg}</p>}

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Doc Type</th>
              <th className="p-3">Doc Number</th>
              <th className="p-3">Country</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-950/60 text-slate-200">
            {kycs.map((k) => (
              <tr key={k._id} className="hover:bg-purple-950/30">
                <td className="p-3 font-semibold">{k.fullName}</td>
                <td className="p-3">{k.documentType}</td>
                <td className="p-3 text-purple-300">{k.documentNumber}</td>
                <td className="p-3">{k.country}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      k.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {k.status}
                  </span>
                </td>
                <td className="p-3 space-x-1">
                  {k.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleKYC(k._id, 'APPROVE')} className="p-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">Approve</button>
                      <button onClick={() => handleKYC(k._id, 'REJECT')} className="p-1 bg-rose-950 text-rose-400 border border-rose-800 rounded">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
