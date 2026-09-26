import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCode,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Wrench,
  Copy,
  Check
} from 'lucide-react';
import { issuesApi } from '../services/api';
import { Issue } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const IssueDetailPage: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!issueId) return;
    const loadIssue = async () => {
      setLoading(true);
      try {
        const data = await issuesApi.get(issueId);
        setIssue(data);
      } catch (err) {
        console.error('Failed to load issue details', err);
      } finally {
        setLoading(false);
      }
    };
    loadIssue();
  }, [issueId]);

  const handleToggleStatus = async () => {
    if (!issue) return;
    const nextStatus = issue.status === 'resolved' ? 'open' : 'resolved';
    try {
      await issuesApi.updateStatus(issue.issue_id, nextStatus);
      setIssue({ ...issue, status: nextStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCopySnippet = () => {
    if (issue?.code_snippet) {
      navigator.clipboard.writeText(issue.code_snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading issue details...</div>;
  }

  if (!issue) {
    return (
      <div className="p-12 text-center glass-card rounded-3xl">
        <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Issue Not Found</h3>
        <button
          onClick={() => navigate('/issues')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Issues
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate('/issues')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Findings List</span>
      </button>

      {/* Main Issue Header Card */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {issue.category.replace('_', ' ')}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
              issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              Status: {issue.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                issue.status === 'resolved'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {issue.status === 'resolved' ? 'Reopen Issue' : 'Mark as Resolved'}
            </button>

            <button
              onClick={() => navigate(`/fix-center?issueId=${issue.issue_id}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Fix</span>
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white">{issue.title}</h1>

        <div className="flex items-center gap-3 text-xs text-slate-300 font-mono pt-1">
          <FileCode className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-300">{issue.file_path}</span>
          <span>•</span>
          <span>Line {issue.line_start || 1}–{issue.line_end || 1}</span>
          <span>•</span>
          <span className="text-slate-500">Detected by {issue.detected_by || 'RepoMind Static AST Engine'}</span>
        </div>
      </div>

      {/* Problem Description */}
      <div className="p-6 glass-card rounded-3xl border-slate-800 space-y-2 text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Description</h3>
        <p className="text-sm text-slate-200 leading-relaxed">{issue.description}</p>
      </div>

      {/* Code Evidence Snippet */}
      {issue.code_snippet && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-left shadow-xl">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-300">Code Snippet Evidence</span>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-rose-300 bg-rose-950/10 overflow-x-auto leading-relaxed">
            {issue.code_snippet}
          </pre>
        </div>
      )}

      {/* AI Explanation: Why It Matters */}
      <div className="p-6 glass-card rounded-3xl border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 space-y-3 text-left">
        <div className="flex items-center gap-2 text-indigo-400">
          <Lightbulb className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">AI Doctor Diagnostic: Why This Matters</h3>
        </div>
        <p className="text-sm text-indigo-200 leading-relaxed font-normal">
          {issue.why_it_matters || 'This issue impairs codebase maintainability, scalability, or introduces critical security exposure if left unaddressed in production.'}
        </p>
      </div>

      {/* Suggested Fix Action Card */}
      <div className="p-6 glass-card rounded-3xl border-slate-800 space-y-3 text-left">
        <div className="flex items-center gap-2 text-emerald-400">
          <Wrench className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Recommended Remediation</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {issue.recommendation || 'Refactor the target lines according to clean architecture and secure coding standards.'}
        </p>

        <div className="pt-4 flex items-center justify-end">
          <button
            onClick={() => navigate(`/fix-center?issueId=${issue.issue_id}`)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Open in Fix Center & Inspect Diff</span>
          </button>
        </div>
      </div>
    </div>
  );
};
