'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [minStake, setMinStake] = useState('1.0');
  const [mpesaRate, setMpesaRate] = useState('130.0');
  const [msg, setMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: any, description: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`Setting ${key} updated successfully.`);
        fetchSettings();
      }
    } catch {
      setMsg('Failed to update setting.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">System Configuration</h1>
        <p className="text-xs text-slate-400">Configure global trading parameters, M-Pesa KES rates, and emergency toggles</p>
      </div>

      {msg && <p className="text-purple-300 text-xs font-semibold">{msg}</p>}

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-6 space-y-6 max-w-xl text-xs">
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-purple-200">M-Pesa Conversion Rate</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={mpesaRate}
              onChange={(e) => setMpesaRate(e.target.value)}
              className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
            />
            <button
              onClick={() => handleUpdate('MPESA_USD_RATE', Number(mpesaRate), 'KES to USD Rate')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
            >
              Update Rate
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-purple-950">
          <h3 className="font-bold text-sm text-purple-200">Minimum Stake Limit</h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minStake}
              onChange={(e) => setMinStake(e.target.value)}
              className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
            />
            <button
              onClick={() => handleUpdate('MIN_STAKE', Number(minStake), 'Minimum trade stake in USD')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
            >
              Update Min Stake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
