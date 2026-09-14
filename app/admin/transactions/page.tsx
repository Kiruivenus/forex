'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, ShieldAlert } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Transaction Operations</h1>
        <p className="text-xs text-slate-400">Review pending crypto deposits and payout withdrawal requests</p>
      </div>

      <div className="flex border-b border-purple-950 bg-[#120f26] rounded-xl p-1 text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('DEPOSITS')}
          className={`flex-1 py-2 rounded-lg ${activeTab === 'DEPOSITS' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
        >
          Deposits Queue ({deposits.filter((d) => d.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`flex-1 py-2 rounded-lg ${activeTab === 'WITHDRAWALS' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
        >
          Withdrawals Queue ({withdrawals.filter((w) => w.status === 'PENDING').length})
        </button>
      </div>

      {msg && <p className="text-purple-300 text-xs font-semibold">{msg}</p>}

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl overflow-hidden shadow-xl">
        {activeTab === 'DEPOSITS' ? (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount USD</th>
                <th className="p-3">Tx Hash / Receipt</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60 text-slate-200">
              {deposits.map((d) => (
                <tr key={d._id} className="hover:bg-purple-950/30">
                  <td className="p-3 font-semibold">{d.userId?.toString()}</td>
                  <td className="p-3">{d.method} {d.cryptoAsset ? `(${d.cryptoAsset})` : ''}</td>
                  <td className="p-3 font-bold text-emerald-400">${d.usdEquivalent}</td>
                  <td className="p-3 text-[10px] text-purple-300">{d.txHash || d.mpesaReceipt || 'N/A'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400">{d.status}</span>
                  </td>
                  <td className="p-3 space-x-1">
                    {d.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction('DEPOSIT', d._id, 'APPROVE')} className="p-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">Approve</button>
                        <button onClick={() => handleAction('DEPOSIT', d._id, 'REJECT')} className="p-1 bg-rose-950 text-rose-400 border border-rose-800 rounded">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Method</th>
                <th className="p-3">Amount USD</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60 text-slate-200">
              {withdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-purple-950/30">
                  <td className="p-3 font-semibold">{w.userId?.toString()}</td>
                  <td className="p-3">{w.method}</td>
                  <td className="p-3 font-bold text-amber-400">${w.amount}</td>
                  <td className="p-3 text-[10px] text-purple-300">{w.destination}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400">{w.status}</span>
                  </td>
                  <td className="p-3 space-x-1">
                    {w.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction('WITHDRAWAL', w._id, 'APPROVE')} className="p-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">Approve</button>
                        <button onClick={() => handleAction('WITHDRAWAL', w._id, 'REJECT')} className="p-1 bg-rose-950 text-rose-400 border border-rose-800 rounded">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
