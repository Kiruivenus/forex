'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [msg, setMsg] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations);
          if (!selectedConvId && data.conversations.length > 0) {
            setSelectedConvId(data.conversations[0]._id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !replyContent) return;

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConvId, content: replyContent, status: 'RESOLVED' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplyContent('');
        setMsg('Support reply sent.');
        fetchConversations();
      }
    } catch {
      setMsg('Error sending reply.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Customer Support Inbox</h1>
        <p className="text-xs text-slate-400">Reply to trader inquiries and manage support resolution status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-4 overflow-y-auto space-y-2 text-xs">
          {conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedConvId(c._id)}
              className={`w-full text-left p-3 rounded-xl border ${
                selectedConvId === c._id ? 'bg-purple-950 border-purple-500' : 'bg-[#181335] border-purple-950'
              }`}
            >
              <span className="font-bold block text-slate-200">{c.subject}</span>
              <span className="text-[10px] text-purple-300">{c.status}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-[#120f26] border border-purple-900/60 rounded-2xl p-4 flex flex-col">
          <div className="flex-1 p-4 bg-[#0b0818] rounded-xl border border-purple-950 text-xs">
            <p className="text-slate-400">Select a conversation thread on the left to respond.</p>
          </div>

          <form onSubmit={handleReply} className="pt-3 flex space-x-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type official admin response..."
              className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl">
              Reply & Resolve
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
