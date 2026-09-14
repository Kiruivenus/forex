'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Edit, Lock, CheckCircle, ShieldAlert, DollarSign, X } from 'lucide-react';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  wallet: {
    availableBalance: number;
    totalDeposited: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [balanceAdjustment, setBalanceAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUpdating(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          status: newStatus,
          balanceAdjustment: balanceAdjustment ? Number(balanceAdjustment) : 0,
          adjustmentReason: reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('User updated and audit log recorded.');
        fetchUsers();
        setTimeout(() => setSelectedUser(null), 1500);
      } else {
        setMsg(data.message || 'Failed to update user.');
      }
    } catch {
      setMsg('Error updating user.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">User Management</h1>
          <p className="text-xs text-slate-400">View balances, modify account status, and perform audited balance adjustments</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full bg-[#120f26] border border-purple-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Available Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-950/60 text-slate-200">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-purple-950/30">
                <td className="p-3 font-semibold text-slate-100">
                  {u.name}
                  <span className="block text-[10px] text-slate-400 font-normal">{u.email}</span>
                </td>
                <td className="p-3 text-slate-300">{u.phone}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-bold">
                    {u.role}
                  </span>
                </td>
                <td className="p-3 font-bold text-emerald-400">${u.wallet?.availableBalance.toFixed(2) || '0.00'}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setNewStatus(u.status);
                      setBalanceAdjustment('');
                      setReason('');
                    }}
                    className="p-1.5 bg-purple-950 text-purple-300 rounded hover:bg-purple-900 font-sans"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120f26] border border-purple-800/60 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-purple-950 pb-3">
              <h3 className="font-bold text-base">Manage {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Account Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Balance Adjustment ($ USD)</label>
                <input
                  type="number"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                  placeholder="e.g. +50 or -20"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adjustment Reason (Required for Audit Log)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for balance modification"
                  className="w-full bg-[#0b0818] border border-purple-900/60 rounded-lg p-2 text-slate-100"
                />
              </div>

              {msg && <p className="text-purple-300 font-semibold">{msg}</p>}

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
              >
                {updating ? 'Saving Changes...' : 'Save User Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
