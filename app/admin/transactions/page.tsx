'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, ShieldAlert, Clock, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'DEPOSITS' | 'WITHDRAWALS'>('DEPOSITS');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeposits(data.deposits);
          setWithdrawals(data.withdrawals);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type: 'DEPOSIT' | 'WITHDRAWAL', id: string, action: 'APPROVE' | 'REJECT') => {
    const reason = prompt(`Provide reason or notes for ${action.toLowerCase()}ing this transaction:`) || '';
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, reason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`Transaction ${action.toLowerCase()}d successfully.`);
        fetchData();
      } else {
        setMsg(data.message || 'Transaction action failed.');
      }
    } catch {
      setMsg('Network error.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <span>Transaction Operations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review M-Pesa & Crypto deposit receipts, payment failures, KES amounts, and withdrawal requests.
        </p>
      </div>

      <div className="flex border-b border-purple-950 bg-[#120f26] rounded-xl p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('DEPOSITS')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            activeTab === 'DEPOSITS' ? 'bg-purple-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Deposits Log ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            activeTab === 'WITHDRAWALS' ? 'bg-purple-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Withdrawals Queue ({withdrawals.filter((w) => w.status === 'PENDING').length})
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-purple-950/60 border border-purple-700/60 rounded-xl text-purple-200 text-xs font-semibold">
          {msg}
        </div>
      )}

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl overflow-x-auto shadow-xl">
        {activeTab === 'DEPOSITS' ? (
          <table className="w-full text-left text-xs font-mono min-w-[900px]">
            <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Trader User</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount USD</th>
                <th className="p-3">Amount Paid (KES)</th>
                <th className="p-3">Receipt / Tx Hash</th>
                <th className="p-3">Status / Failure Reason</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60 text-slate-200">
              {deposits.map((d) => {
                const isUserObj = d.userId && typeof d.userId === 'object';
                const userName = isUserObj ? d.userId.name : 'Trader';
                const userEmail = isUserObj ? d.userId.email : String(d.userId || 'N/A');
                const isMpesa = d.method === 'MPESA';

                return (
                  <tr key={d._id} className="hover:bg-purple-950/30 transition-colors">
                    {/* Date & Time */}
                    <td className="p-3 text-[11px] text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{formatDate(d.createdAt)}</span>
                      </div>
                    </td>

                    {/* Trader User */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-100">{userName}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{userEmail}</div>
                    </td>

                    {/* Method */}
                    <td className="p-3">
                      <span className="font-bold text-slate-200">{d.method}</span>
                      {d.mpesaPhoneNumber && (
                        <div className="text-[10px] text-slate-400">{d.mpesaPhoneNumber}</div>
                      )}
                      {d.cryptoAsset && (
                        <div className="text-[10px] text-amber-400">{d.cryptoAsset} ({d.cryptoNetwork})</div>
                      )}
                    </td>

                    {/* Amount USD */}
                    <td className="p-3 font-bold text-emerald-400 text-sm">
                      ${Number(d.usdEquivalent || 0).toFixed(2)} USD
                    </td>

                    {/* Amount Paid (KES) */}
                    <td className="p-3 font-bold text-slate-100">
                      {isMpesa ? (
                        <span className="text-emerald-300">KES {Number(d.amount || 0).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-500 font-sans text-[11px]">N/A (Crypto)</span>
                      )}
                    </td>

                    {/* Receipt / Tx Hash */}
                    <td className="p-3 text-[11px] font-mono">
                      {d.mpesaReceipt ? (
                        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-200 font-bold">
                          {d.mpesaReceipt}
                        </span>
                      ) : d.txHash ? (
                        <span className="text-purple-300 truncate max-w-[120px] block" title={d.txHash}>
                          {d.txHash.slice(0, 10)}...
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>

                    {/* Status & Failure Reason */}
                    <td className="p-3 max-w-[240px]">
                      {d.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-600/60 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          COMPLETED
                        </span>
                      ) : d.status === 'FAILED' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-600/60 text-rose-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            FAILED
                          </span>
                          {d.failureReason && (
                            <p className="text-[10px] text-rose-400 font-sans leading-tight mt-1" title={d.failureReason}>
                              {d.failureReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-600/60 text-amber-300">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 space-x-1 whitespace-nowrap">
                      {d.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleAction('DEPOSIT', d._id, 'APPROVE')}
                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('DEPOSIT', d._id, 'REJECT')}
                            className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-600 text-[10px] font-sans">Finalized</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs font-mono min-w-[900px]">
            <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Trader User</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount USD</th>
                <th className="p-3">Est. KES Payout</th>
                <th className="p-3">Destination Account</th>
                <th className="p-3">Status / Rejection Reason</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60 text-slate-200">
              {withdrawals.map((w) => {
                const isUserObj = w.userId && typeof w.userId === 'object';
                const userName = isUserObj ? w.userId.name : 'Trader';
                const userEmail = isUserObj ? w.userId.email : String(w.userId || 'N/A');
                const isMpesa = w.method === 'MPESA';
                const estKesPayout = Math.round((w.amount || 0) * 130);

                return (
                  <tr key={w._id} className="hover:bg-purple-950/30 transition-colors">
                    {/* Date & Time */}
                    <td className="p-3 text-[11px] text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{formatDate(w.createdAt)}</span>
                      </div>
                    </td>

                    {/* Trader User */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-100">{userName}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{userEmail}</div>
                    </td>

                    {/* Method */}
                    <td className="p-3 font-bold text-slate-200">{w.method}</td>

                    {/* Amount USD */}
                    <td className="p-3 font-bold text-amber-400 text-sm">
                      ${Number(w.amount || 0).toFixed(2)} USD
                    </td>

                    {/* Est KES Payout */}
                    <td className="p-3 font-bold text-slate-100">
                      {isMpesa ? (
                        <span className="text-emerald-300">~KES {estKesPayout.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-500 font-sans text-[11px]">N/A (Crypto)</span>
                      )}
                    </td>

                    {/* Destination Account */}
                    <td className="p-3 text-[11px] text-purple-300 font-mono">{w.destination}</td>

                    {/* Status & Rejection Reason */}
                    <td className="p-3 max-w-[240px]">
                      {w.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-600/60 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          COMPLETED
                        </span>
                      ) : w.status === 'REJECTED' || w.status === 'FAILED' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-600/60 text-rose-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            REJECTED
                          </span>
                          {w.rejectionReason && (
                            <p className="text-[10px] text-rose-400 font-sans leading-tight mt-1" title={w.rejectionReason}>
                              {w.rejectionReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 border border-amber-600/60 text-amber-300">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 space-x-1 whitespace-nowrap">
                      {w.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleAction('WITHDRAWAL', w._id, 'APPROVE')}
                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('WITHDRAWAL', w._id, 'REJECT')}
                            className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-600 text-[10px] font-sans">Finalized</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
