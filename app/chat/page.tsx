'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, Send, User, Shield, Clock, Plus } from 'lucide-react';

interface ChatMessage {
  _id: string;
  senderRole: 'USER' | 'ADMIN';
  senderName: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  subject: string;
  status: string;
  lastMessageAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat');
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          subject: newSubject || 'Support Inquiry',
          content: messageContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessageContent('');
        setNewSubject('');
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-8 w-full flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversation List Sidebar */}
        <div className="bg-[#120f26] border border-purple-900/60 rounded-2xl p-4 space-y-4 flex flex-col h-[550px]">
          <div className="flex items-center justify-between border-b border-purple-950 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Support Threads</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs">
            {conversations.length > 0 ? (
              conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedConvId(c._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedConvId === c._id
                      ? 'bg-purple-950/60 border-purple-500 text-slate-100'
                      : 'bg-[#181335] border-purple-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block text-slate-200 truncate">{c.subject}</span>
                  <div className="flex justify-between items-center text-[10px] mt-1">
                    <span className="text-purple-300 font-mono">{c.status}</span>
                    <span className="text-slate-500">{new Date(c.lastMessageAt).toLocaleTimeString()}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No support tickets found. Send a message to start.</div>
            )}
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="md:col-span-2 bg-[#120f26] border border-purple-900/60 rounded-2xl p-4 flex flex-col h-[550px]">
          <div className="border-b border-purple-950 pb-3">
            <h3 className="font-bold text-sm text-slate-100">Live Agent Support Inbox</h3>
            <p className="text-[11px] text-slate-400">Response time: Usually within 15 minutes</p>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-900/40 text-purple-200 max-w-md">
              <span className="font-bold block text-[11px] text-purple-300">ApexTrader Support System</span>
              Hello! How can our compliance or technical support team assist you today?
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-purple-950 flex items-center space-x-2">
            {!selectedConvId && (
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject line"
                className="w-1/3 bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
            )}
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message to support..."
              className="flex-1 bg-[#0b0818] border border-purple-900/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
