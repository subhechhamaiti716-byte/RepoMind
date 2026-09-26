import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  History
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { fixesApi, issuesApi } from '../services/api';
import { FixSuggestion, Issue } from '../types';
import { DiffViewer } from '../components/DiffViewer';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const FixCenterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const issueIdParam = searchParams.get('issueId');
  const { currentProject, refreshProjects } = useProject();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [currentFix, setCurrentFix] = useState<FixSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (!currentProject) {
      setIssues([]);
      setSelectedIssue(null);
      setCurrentFix(null);
      return;
    }

    const loadData = async () => {
      try {
        const res = await issuesApi.list(currentProject.project_id, { limit: 50 });
        const list = res.issues || [];
        setIssues(list);

        if (issueIdParam) {
          const target = list.find((i) => i.issue_id === issueIdParam);
          if (target) {
            setSelectedIssue(target);
            generateOrLoadFix(target.issue_id);
            return;
          }
        }

        if (list.length > 0) {
          setSelectedIssue(list[0]);
          generateOrLoadFix(list[0].issue_id);
        }
      } catch (err) {
        console.error('Failed to load issues for Fix Center', err);
      }
    };

    loadData();
  }, [currentProject, issueIdParam]);

  const generateOrLoadFix = async (issueId: string) => {
    setLoading(true);
    setIsApplied(false);
    setAppliedSuccess(false);
    try {
      const fix = await fixesApi.generate(issueId);
      setCurrentFix(fix);
      if (fix.status === 'accepted') setIsApplied(true);
    } catch (err) {
      console.error('Failed to generate fix', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    generateOrLoadFix(issue.issue_id);
  };

  const handleApplyFix = async () => {
    if (!currentFix || !selectedIssue) return;
    try {
      await fixesApi.accept(currentFix.fix_id);
      setIsApplied(true);
      setAppliedSuccess(true);
      setSelectedIssue(prev => prev ? { ...prev, status: 'resolved' } : null);
      setIssues(prev => prev.map(i => i.issue_id === selectedIssue.issue_id ? { ...i, status: 'resolved' } : i));
      await refreshProjects();
    } catch (err) {
      console.error('Failed to accept fix', err);
    }
  };

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="AI Fix Center"
        description="Connect a GitHub repository to review side-by-side AI refactoring diffs and apply automated fixes with 1 click."
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 mb-1">
            <Wrench className="w-4 h-4" />
            <span>AI Automated Refactoring & Patch Generator</span>
          </div>
          <h1 className="text-2xl font-black text-white">Fix Center</h1>
          <p className="text-xs text-slate-400">
            Inspect side-by-side AI refactoring code diffs and approve safe patches for <strong className="text-white">{currentProject.name}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issue Selector Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Select Finding</span>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold">{issues.length} available</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {issues.map((iss) => (
              <div
                key={iss.issue_id}
                onClick={() => handleSelectIssue(iss)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                  selectedIssue?.issue_id === iss.issue_id
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10'
                    : 'glass-card border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <SeverityBadge severity={iss.severity} />
                    {iss.status === 'resolved' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Resolved
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{iss.file_path}</span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">{iss.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diff & Fix Actions Column */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIssue ? (
            <>
              {/* Success Banner when Applied */}
              {appliedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Fix applied successfully! The issue is marked as <strong>Resolved</strong> and codebase health score has been updated.</span>
                  </div>
                  <button
                    onClick={() => navigate('/issues')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                  >
                    View All Issues
                  </button>
                </div>
              )}

              {/* Selected Finding Summary */}
              <div className="p-5 glass-card rounded-2xl border-slate-800 space-y-2 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-300">Selected Target</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedIssue.file_path} (Lines {selectedIssue.line_start || 1}–{selectedIssue.line_end || 1})
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">{selectedIssue.title}</h2>
                <p className="text-xs text-slate-300">{selectedIssue.description}</p>
              </div>

              {/* Diff Viewer */}
              {loading ? (
                <div className="h-64 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400 mr-2" />
                  <span>Synthesizing AI refactoring patch...</span>
                </div>
              ) : currentFix ? (
                <DiffViewer
                  originalCode={currentFix.original_code}
                  suggestedCode={currentFix.suggested_code}
                  filePath={currentFix.file_path}
                  description={currentFix.description}
                  onApply={handleApplyFix}
                  isApplied={isApplied}
                />
              ) : null}

              {/* Fix Lifecycle Steps */}
              <div className="p-5 glass-card rounded-2xl border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. AI Patch Generated</span>
                </div>
                <div className="w-12 h-px bg-slate-700" />
                <div className="flex items-center gap-2 text-indigo-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Reviewed Diff</span>
                </div>
                <div className="w-12 h-px bg-slate-700" />
                <div className={`flex items-center gap-2 font-medium ${isApplied ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Fix Approved</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 glass-card rounded-2xl">
              Select a finding on the left to inspect the AI refactoring diff.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
