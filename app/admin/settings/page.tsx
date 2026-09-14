'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, DollarSign, Wallet, Smartphone, Bitcoin, AlertTriangle, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface SettingItem {
  key: string;
  value: any;
  description: string;
}

export default function AdminSettingsPage() {
  const [settingsMap, setSettingsMap] = useState<Record<string, any>>({
    MIN_DEPOSIT: 5.0,
    MIN_STAKE: 1.0,
    MAX_STAKE: 5000.0,
    MIN_WITHDRAWAL: 10.0,
    MAX_DAILY_WITHDRAWAL: 25000.0,
    MPESA_USD_RATE: 130.0,
    USDT_TRC20_ADDRESS: 'TYu8aX9kL3pQmRn2vW7zH1bC4dE5fG6hJk',
    USDT_ERC20_ADDRESS: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    BTC_ADDRESS: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH_ADDRESS: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    MAINTENANCE_MODE: false,
  });

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.settings)) {
          const map: Record<string, any> = { ...settingsMap };
          data.settings.forEach((s: SettingItem) => {
            map[s.key] = s.value;
          });
          setSettingsMap(map);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: any, description: string) => {
    setSavingKey(key);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsMap((prev) => ({ ...prev, [key]: value }));
        setFeedbackMsg({ type: 'SUCCESS', text: `Setting '${key}' updated successfully.` });
      } else {
        setFeedbackMsg({ type: 'ERROR', text: data.message || `Failed to update '${key}'.` });
      }
    } catch {
      setFeedbackMsg({ type: 'ERROR', text: `Network error while updating '${key}'.` });
    } finally {
      setSavingKey(null);
    }
  };

  const handleInputChange = (key: string, val: any) => {
    setSettingsMap((prev) => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading system configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-purple-400" />
          <span>System Configuration & Operational Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage minimum trade stakes, deposit & withdrawal limits, M-Pesa exchange rates, and admin deposit wallet addresses.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
            feedbackMsg.type === 'SUCCESS'
              ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-600/40 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: TRADING LIMITS */}
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-purple-950 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-sm text-slate-100">Trading Limits</h2>
          </div>

          {/* Min Stake */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Minimum Amount to Open Trade ($ USD)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={settingsMap.MIN_STAKE ?? 1.0}
                onChange={(e) => handleInputChange('MIN_STAKE', Number(e.target.value))}
                className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdateSetting('MIN_STAKE', Number(settingsMap.MIN_STAKE), 'Minimum trade stake in USD')}
                disabled={savingKey === 'MIN_STAKE'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                {savingKey === 'MIN_STAKE' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Max Stake */}
          <div className="space-y-1.5 pt-2 border-t border-purple-950/60">
            <label className="block text-xs font-semibold text-slate-300">Maximum Amount per Trade ($ USD)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="10"
                value={settingsMap.MAX_STAKE ?? 5000.0}
                onChange={(e) => handleInputChange('MAX_STAKE', Number(e.target.value))}
                className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdateSetting('MAX_STAKE', Number(settingsMap.MAX_STAKE), 'Maximum trade stake in USD')}
                disabled={savingKey === 'MAX_STAKE'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                {savingKey === 'MAX_STAKE' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: DEPOSIT & WITHDRAWAL LIMITS */}
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-purple-950 pb-3">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-sm text-slate-100">Deposit & Payout Limits</h2>
          </div>

          {/* Min Deposit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Minimum Deposit Limit ($ USD)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.5"
                value={settingsMap.MIN_DEPOSIT ?? 5.0}
                onChange={(e) => handleInputChange('MIN_DEPOSIT', Number(e.target.value))}
                className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdateSetting('MIN_DEPOSIT', Number(settingsMap.MIN_DEPOSIT), 'Minimum deposit limit in USD')}
                disabled={savingKey === 'MIN_DEPOSIT'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                {savingKey === 'MIN_DEPOSIT' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Min Withdrawal */}
          <div className="space-y-1.5 pt-2 border-t border-purple-950/60">
            <label className="block text-xs font-semibold text-slate-300">Minimum Withdrawal Limit ($ USD)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="1"
                value={settingsMap.MIN_WITHDRAWAL ?? 10.0}
                onChange={(e) => handleInputChange('MIN_WITHDRAWAL', Number(e.target.value))}
                className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdateSetting('MIN_WITHDRAWAL', Number(settingsMap.MIN_WITHDRAWAL), 'Minimum withdrawal limit in USD')}
                disabled={savingKey === 'MIN_WITHDRAWAL'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                {savingKey === 'MIN_WITHDRAWAL' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: M-PESA EXCHANGE RATE */}
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2.5 border-b border-purple-950 pb-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-sm text-slate-100">M-Pesa STK Gateway Rate</h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">KES to 1.00 USD Conversion Rate</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.5"
                value={settingsMap.MPESA_USD_RATE ?? 130.0}
                onChange={(e) => handleInputChange('MPESA_USD_RATE', Number(e.target.value))}
                className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleUpdateSetting('MPESA_USD_RATE', Number(settingsMap.MPESA_USD_RATE), 'M-Pesa KES exchange rate to 1 USD')}
                disabled={savingKey === 'MPESA_USD_RATE'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
              >
                {savingKey === 'MPESA_USD_RATE' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Rate</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Example: 130.00 means KES 130 equals 1 USD. Used for STK push deposit calculation.
            </p>
          </div>
        </div>

        {/* SECTION 4: CRYPTO DEPOSIT ADDRESSES */}
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-6 space-y-4 shadow-xl md:col-span-2">
          <div className="flex items-center space-x-2.5 border-b border-purple-950 pb-3">
            <Bitcoin className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-sm text-slate-100">Admin Crypto Wallet Deposit Addresses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USDT TRC20 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">USDT (TRC20 - Tron Network) Address</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={settingsMap.USDT_TRC20_ADDRESS ?? ''}
                  onChange={(e) => handleInputChange('USDT_TRC20_ADDRESS', e.target.value)}
                  className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleUpdateSetting('USDT_TRC20_ADDRESS', settingsMap.USDT_TRC20_ADDRESS, 'USDT TRC20 Admin Address')}
                  disabled={savingKey === 'USDT_TRC20_ADDRESS'}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  {savingKey === 'USDT_TRC20_ADDRESS' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Bitcoin BTC */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Bitcoin (BTC Network) Address</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={settingsMap.BTC_ADDRESS ?? ''}
                  onChange={(e) => handleInputChange('BTC_ADDRESS', e.target.value)}
                  className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleUpdateSetting('BTC_ADDRESS', settingsMap.BTC_ADDRESS, 'Bitcoin BTC Admin Address')}
                  disabled={savingKey === 'BTC_ADDRESS'}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  {savingKey === 'BTC_ADDRESS' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* USDT ERC20 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">USDT (ERC20 - Ethereum Network) Address</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={settingsMap.USDT_ERC20_ADDRESS ?? ''}
                  onChange={(e) => handleInputChange('USDT_ERC20_ADDRESS', e.target.value)}
                  className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleUpdateSetting('USDT_ERC20_ADDRESS', settingsMap.USDT_ERC20_ADDRESS, 'USDT ERC20 Admin Address')}
                  disabled={savingKey === 'USDT_ERC20_ADDRESS'}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  {savingKey === 'USDT_ERC20_ADDRESS' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Ethereum ETH */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Ethereum (ETH Network) Address</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={settingsMap.ETH_ADDRESS ?? ''}
                  onChange={(e) => handleInputChange('ETH_ADDRESS', e.target.value)}
                  className="flex-1 bg-[#0b0818] border border-purple-950 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleUpdateSetting('ETH_ADDRESS', settingsMap.ETH_ADDRESS, 'Ethereum ETH Admin Address')}
                  disabled={savingKey === 'ETH_ADDRESS'}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  {savingKey === 'ETH_ADDRESS' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
