'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Check, X } from 'lucide-react';

export default function AdminPaymentMethodsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [symbol, setSymbol] = useState('USDT');
  const [name, setName] = useState('Tether USD');
  const [network, setNetwork] = useState('TRC20');
  const [depositAddress, setDepositAddress] = useState('');
  const [minDeposit, setMinDeposit] = useState('10');
  const [msg, setMsg] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAssets(data.assets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          name,
          network,
          depositAddress,
          minDeposit: Number(minDeposit),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('Crypto deposit method saved successfully.');
        setDepositAddress('');
        fetchAssets();
      } else {
        setMsg(data.message || 'Failed to save crypto asset.');
      }
    } catch {
      setMsg('Error saving payment method.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Crypto Payment Methods Manager</h1>
        <p className="text-xs text-slate-400">Database-driven configuration for active deposit assets and addresses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="bg-[#120f26] p-5 rounded-2xl border border-purple-900/60 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-purple-200">Add / Edit Crypto Asset Address</h3>

          <div>
            <label className="block text-slate-400 mb-1">Asset Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. USDT or BTC"
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Asset Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tether USD"
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Network</label>
            <input
              type="text"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="e.g. TRC20, ERC20, BTC"
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Deposit Wallet Address</label>
            <input
              type="text"
              value={depositAddress}
              onChange={(e) => setDepositAddress(e.target.value)}
              placeholder="Admin destination wallet address"
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono text-[11px]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Minimum Deposit ($ USD)</label>
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
              required
            />
          </div>

          {msg && <p className="text-purple-300 font-semibold">{msg}</p>}

          <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg">
            Save Payment Method
          </button>
        </form>

        <div className="lg:col-span-2 bg-[#120f26] border border-purple-900/60 rounded-2xl p-4 overflow-hidden">
          <h3 className="font-bold text-sm text-slate-100 mb-4">Configured Active Payment Methods</h3>
          <div className="space-y-3 text-xs font-mono">
            {assets.map((a) => (
              <div key={a._id} className="p-3 bg-[#181335] rounded-xl border border-purple-950 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-200 block">{a.symbol} ({a.network})</span>
                  <span className="text-[10px] text-purple-300">{a.depositAddress}</span>
                </div>
                <span className="text-emerald-400 font-bold">Min ${a.minDeposit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
