'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, Send, User, Shield, Clock, Plus, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <Headphones className="w-3.5 h-3.5 text-purple-400" />
            <span>24/7 Client Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Live Agent Support Inbox</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Get instant help from our compliance and technical trading support specialists.
          </p>
        </div>

        {/* Chat Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch min-h-[500px]">
          {/* Conversation List Sidebar */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-4 sm:p-5 flex flex-col h-[350px] md:h-auto shadow-xl shadow-purple-950/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Support Threads</span>
              </h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                {conversations.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {conversations.length > 0 ? (
                conversations.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedConvId(c._id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      selectedConvId === c._id
                        ? 'bg-purple-950/40 border-purple-500/50 text-slate-100 shadow-md'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-medium block text-slate-200 truncate text-xs">{c.subject}</span>
                    <div className="flex justify-between items-center text-[10px] mt-1.5">
                      <span className="text-purple-400 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                        {c.status}
                      </span>
                      <span className="text-slate-500">{new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active support tickets found.<br />Send a message to open a thread.
                </div>
              )}
            </div>
          </div>

          {/* Chat Stream Window */}
          <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-4 sm:p-6 flex flex-col h-[480px] md:h-auto shadow-xl shadow-purple-950/20">
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>ApexTrader Specialist Desk</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Average response time: &lt; 15 minutes</p>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium hidden sm:inline-block">
                Agents Online
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/60 mb-4">
              <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl text-purple-200 max-w-md space-y-1">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold mb-1">
                  <span>ApexTrader System Support</span>
                  <span>System Bot</span>
                </div>
                <p className="text-xs text-slate-200">
                  Hello! Welcome to ApexTrader support. How can our compliance or trading desk assist you today?
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              {!selectedConvId && (
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Inquiry Subject (e.g. Withdrawal Verification)"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message to support..."
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

