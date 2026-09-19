'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, Send, Headphones } from 'lucide-react';
import { getStoredTheme, THEME_EVENT_NAME, ThemeMode } from '@/lib/theme';

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
  const [newSubject, setNewSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    setTheme(getStoredTheme());
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener(THEME_EVENT_NAME, handleThemeChange);
    return () => window.removeEventListener(THEME_EVENT_NAME, handleThemeChange);
  }, []);

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

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#07090e] text-slate-100'}`}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-12 w-full flex-1 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>24/7 Client Desk</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Live Agent Support Inbox</h1>
          <p className={`text-xs sm:text-sm max-w-md ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Get instant help from our compliance and technical trading support specialists.
          </p>
        </div>

        {/* Chat Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch min-h-[500px]">
          {/* Conversation List Sidebar */}
          <div className={`border rounded-3xl p-4 sm:p-5 flex flex-col h-[350px] md:h-auto shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900/60 border-purple-500/20'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-3 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <h3 className={`font-bold text-xs flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Support Threads</span>
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
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
                        ? 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-950/40 dark:border-purple-500/50 dark:text-slate-100 font-bold'
                        : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold block truncate text-xs">{c.subject}</span>
                    <div className="flex justify-between items-center text-[10px] mt-1.5">
                      <span className="text-purple-700 dark:text-purple-400 font-mono bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/40 font-bold">
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
          <div className={`md:col-span-2 border rounded-3xl p-4 sm:p-6 flex flex-col h-[480px] md:h-auto shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900/60 border-purple-500/20'
          }`}>
            <div className={`border-b pb-3 mb-4 flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>PalOption Specialist Desk</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Average response time: &lt; 15 minutes</p>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-full font-bold hidden sm:inline-block">
                Agents Online
              </span>
            </div>

            <div className={`flex-1 p-3 overflow-y-auto space-y-3 text-xs rounded-2xl border mb-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/60'
            }`}>
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 p-3.5 rounded-2xl text-purple-900 dark:text-purple-200 max-w-md space-y-1">
                <div className="flex items-center justify-between text-[10px] text-purple-700 dark:text-purple-300 font-bold mb-1">
                  <span>PalOption System Support</span>
                  <span>System Bot</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  Hello! Welcome to PalOption support. How can our compliance or trading desk assist you today?
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
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-600 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' : 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-500'
                  }`}
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message to support..."
                  className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-600 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' : 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder-slate-500'
                  }`}
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
