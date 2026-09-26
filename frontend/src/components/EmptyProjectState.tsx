import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Sparkles,
  ShieldCheck,
  Network,
  Wrench,
  ArrowRight,
  GitBranch,
  BotMessageSquare
} from 'lucide-react';

interface Props {
  featureTitle?: string;
  description?: string;
}

export const EmptyProjectState: React.FC<Props> = ({
  featureTitle = 'Analysis Findings',
  description = 'Connect a GitHub repository to start scanning and diagnosing your codebase architecture, security vulnerabilities, and code quality.'
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fadeIn text-center">
      {/* Hero Badge & Icon */}
      <div className="relative inline-block mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/10">
          <FolderGit2 className="w-10 h-10 text-indigo-400" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          No Repository Connected for {featureTitle}
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate('/add-project')}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Your GitHub Repository</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => navigate('/add-project')}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Or Test with Sample Codebase</span>
        </button>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Security & AST Audit</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Detects hardcoded secrets, SQL injection vulnerabilities, and cyclomatic complexity hotspots.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
            <Network className="w-4 h-4" />
            <span>Architecture & Cycles</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Generates interactive dependency graphs and identifies circular imports between service modules.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold">
            <Wrench className="w-4 h-4" />
            <span>AI Automated Fixes</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Produces side-by-side refactoring diffs. Approve with 1 click to automatically resolve issues.
          </p>
        </div>
      </div>
    </div>
  );
};
