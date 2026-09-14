'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Shield } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.logs);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Append-Only Audit Trail</h1>
        <p className="text-xs text-slate-400">Immutable log of administrative operations and compliance decisions</p>
      </div>

      <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#181335] text-slate-400 uppercase text-[10px] border-b border-purple-950">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target Resource</th>
              <th className="p-3">Reason / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-950/60 text-slate-200">
            {logs.map((l) => (
              <tr key={l._id} className="hover:bg-purple-950/30">
                <td className="p-3 text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3 font-semibold text-purple-300">{l.adminEmail}</td>
                <td className="p-3 font-bold text-amber-400">{l.action}</td>
                <td className="p-3 text-slate-300">{l.targetResource}</td>
                <td className="p-3 text-slate-400">{l.reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
