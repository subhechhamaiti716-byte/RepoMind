import React, { useState } from 'react';
import { Copy, Check, Sparkles, FileCode } from 'lucide-react';

interface Props {
  originalCode: string;
  suggestedCode: string;
  filePath: string;
  description?: string;
  onApply?: () => void;
  isApplied?: boolean;
}

export const DiffViewer: React.FC<Props> = ({
  originalCode,
  suggestedCode,
  filePath,
  description,
  onApply,
  isApplied = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const origLines = originalCode.split('\n');
  const suggLines = suggestedCode.split('\n');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-indigo-300">{filePath}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'split' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'unified' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Unified
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>

          {onApply && (
            <button
              onClick={onApply}
              disabled={isApplied}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition ${
                isApplied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isApplied ? 'Fix Applied' : 'Apply Fix'}
            </button>
          )}
        </div>
      </div>

      {description && (
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-xs text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{description}</span>
        </div>
      )}

      {/* Diff Content */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 font-mono text-xs overflow-x-auto">
          {/* Before Column */}
          <div className="bg-rose-950/10">
            <div className="px-4 py-1.5 bg-rose-950/30 text-rose-400 border-b border-rose-900/30 text-[11px] font-semibold tracking-wider uppercase flex items-center justify-between">
              <span>Original (Before)</span>
              <span className="text-rose-500/70">Vulnerable / Smelly</span>
            </div>
            <div className="p-4 space-y-1">
              {origLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-rose-500/10 -mx-2 px-2 py-0.5 rounded text-rose-300">
                  <span className="w-6 text-right select-none text-slate-500 text-[11px]">{idx + 1}</span>
                  <span className="text-rose-400 font-bold select-none">-</span>
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After Column */}
          <div className="bg-emerald-950/10">
            <div className="px-4 py-1.5 bg-emerald-950/30 text-emerald-400 border-b border-emerald-900/30 text-[11px] font-semibold tracking-wider uppercase flex items-center justify-between">
              <span>Suggested Fix (After)</span>
              <span className="text-emerald-500/70">AI Refactored</span>
            </div>
            <div className="p-4 space-y-1">
              {suggLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-emerald-500/10 -mx-2 px-2 py-0.5 rounded text-emerald-300">
                  <span className="w-6 text-right select-none text-slate-500 text-[11px]">{idx + 1}</span>
                  <span className="text-emerald-400 font-bold select-none">+</span>
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="font-mono text-xs p-4 bg-slate-950 space-y-1 overflow-x-auto">
          {origLines.map((line, idx) => (
            <div key={`orig-${idx}`} className="flex items-start gap-3 bg-rose-500/10 px-2 py-0.5 rounded text-rose-300">
              <span className="w-6 text-right select-none text-slate-500">{idx + 1}</span>
              <span className="text-rose-400 font-bold select-none">-</span>
              <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
            </div>
          ))}
          {suggLines.map((line, idx) => (
            <div key={`sugg-${idx}`} className="flex items-start gap-3 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300">
              <span className="w-6 text-right select-none text-slate-500">{idx + 1}</span>
              <span className="text-emerald-400 font-bold select-none">+</span>
              <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
