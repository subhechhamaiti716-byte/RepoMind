import React, { useEffect, useState, useRef } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  FileCode,
  User as UserIcon,
  Loader2,
  Trash2,
  RefreshCw,
  PlusCircle,
  Cpu
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { chatApi } from '../services/api';
import { ChatMessage, ChatSession } from '../types';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const AIChatPage: React.FC = () => {
  const { currentProject } = useProject();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How does authentication work in this project?',
    'Where are the security vulnerabilities and how do I fix them?',
    'Why is there architectural coupling between modules?',
    'Which files have the highest cyclomatic complexity?',
    'Provide a prioritized refactoring roadmap.'
  ];

  const initChat = async () => {
    if (!currentProject) return;
    try {
      const sessList = await chatApi.getSessions(currentProject.project_id);
      if (sessList && sessList.length > 0) {
        setSessions(sessList);
        setCurrentSessionId(sessList[0].session_id);
        const msgs = await chatApi.getMessages(sessList[0].session_id);
        setMessages(msgs || []);
      } else {
        const newSess = await chatApi.createSession(currentProject.project_id, 'Codebase Architecture Chat');
        setSessions([{ session_id: newSess.session_id, title: newSess.title, created_at: (newSess as any).created_at || new Date().toISOString() }]);
        setCurrentSessionId(newSess.session_id);
        const msgs = await chatApi.getMessages(newSess.session_id);
        setMessages(msgs || []);
      }
    } catch (err) {
      console.error('Failed to init chat', err);
    }
  };

  useEffect(() => {
    initChat();
  }, [currentProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || !currentSessionId || loading) return;

    setInputMessage('');
    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      message_id: 'temp-' + Date.now(),
      role: 'user',
      content: msg,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(currentSessionId, msg);
      setMessages((prev) => [...prev.filter((m) => m.message_id !== tempUserMsg.message_id), tempUserMsg, res]);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!currentProject) return;
    try {
      const newSess = await chatApi.createSession(currentProject.project_id, `Chat ${sessions.length + 1}`);
      setSessions((prev) => [newSess as any, ...prev]);
      setCurrentSessionId(newSess.session_id);
      const msgs = await chatApi.getMessages(newSess.session_id);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to create new session', err);
    }
  };

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="AI Codebase Doctor Chat"
        description="Connect a GitHub repository to have an interactive conversation with your codebase, ask about architecture patterns, and inquire about specific bugs."
      />
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>RepoMind AI Assistant</span>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                RAG Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Context active for <strong className="text-indigo-300 font-medium">{currentProject.name}</strong></p>
          </div>
        </div>

        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Suggested Questions Chip Bar */}
      <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 shrink-0 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
                <Cpu className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 text-left ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Source Citations */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-indigo-400" />
                    Sources Retrieved:
                  </span>
                  {m.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-indigo-300 border border-slate-800"
                    >
                      {src.file} ({src.lines})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>RepoMind AI is scanning indexed files and synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything about this codebase, architecture, dependencies, or security..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
