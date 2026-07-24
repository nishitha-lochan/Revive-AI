'use client';

import React, { useState } from 'react';
import { Bot, User, Send, Sparkles, Code2, CornerDownLeft } from 'lucide-react';
import { sendRepoChat } from '@/lib/api';

interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  references?: Array<{ file: string; lines: string }>;
  timestamp?: string;
}

export const RepoChatTab: React.FC<{ projectId: number; initialChats?: ChatMessage[] }> = ({
  projectId,
  initialChats = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialChats.length > 0
      ? initialChats
      : [
          {
            sender: 'assistant',
            message:
              'Hello! I am your Revive AI Codebase Assistant. Ask me anything about file locations, architecture, database schemas, or authentication logic in this repository.',
            references: [],
          },
        ]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'What does auth do?',
    'Explain payment flow.',
    'Where is login implemented?',
    'How to add notifications?',
    'Explain database models.',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', message: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendRepoChat(projectId, query);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message: res.reply,
          references: res.references,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          message: 'Sorry, I encountered an error answering your question. Please check backend connection.',
          references: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Repository AI Assistant
        </h3>
        <p className="text-xs text-slate-400">
          Chat with the codebase using vector RAG indexing and LangGraph agent reasoning.
        </p>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card rounded-2xl p-6 min-h-[400px] max-h-[550px] overflow-y-auto space-y-4 border border-white/10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.message}</div>
              {msg.references && msg.references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> Relevant File References
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.references.map((ref, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-cyan-300"
                      >
                        {ref.file} <span className="text-slate-400">({ref.lines})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-600/30 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-purple-400 animate-pulse font-mono">
            <Bot className="w-4 h-4" /> Analyzing codebase context & generating response...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="glass-card rounded-2xl p-2 border border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about this repository codebase..."
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-md shadow-purple-600/30"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
};
