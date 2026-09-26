import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Search,
  Filter,
  FileCode,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { issuesApi } from '../services/api';
import { Issue } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const IssuesPage: React.FC = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadIssues = async () => {
    if (!currentProject) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await issuesApi.list(currentProject.project_id, {
        severity: severityFilter,
        category: categoryFilter,
        status: statusFilter,
        limit: 50
      });
      setIssues(res.issues || []);
    } catch (err) {
      console.error('Failed to load issues', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [currentProject, severityFilter, categoryFilter, statusFilter]);

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Issues & Technical Debt"
        description="Connect a GitHub repository to automatically detect circular imports, maintainability bottlenecks, AST code smells, and security risks."
      />
    );
  }

  const filteredIssues = issues.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.file_path.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  });

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const lowCount = issues.filter((i) => i.severity === 'low').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>Codebase Findings & Technical Debt</span>
          </div>
          <h1 className="text-2xl font-black text-white">Issues & Findings</h1>
          <p className="text-xs text-slate-400">
            Detected {issues.length} technical findings across {currentProject?.name || 'project'}.
          </p>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-2xl border text-left transition ${
            severityFilter === 'critical'
              ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/20'
              : 'glass-card border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <span className="text-xs font-semibold text-rose-400">Critical Issues</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-slate-400">Vulnerabilities & RCE</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
          className={`p-4 rounded-2xl border text-left transition ${
            severityFilter === 'high'
              ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
              : 'glass-card border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <span className="text-xs font-semibold text-amber-400">High Severity</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{highCount}</p>
          <span className="text-[10px] text-slate-400">Cycles & Logic Flaws</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}
          className={`p-4 rounded-2xl border text-left transition ${
            severityFilter === 'medium'
              ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
              : 'glass-card border-slate-800 hover:border-yellow-500/40'
          }`}
        >
          <span className="text-xs font-semibold text-yellow-300">Medium Severity</span>
          <p className="text-2xl font-black text-yellow-300 mt-1">{mediumCount}</p>
          <span className="text-[10px] text-slate-400">Complexity & Smells</span>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border text-left transition ${
            severityFilter === 'low'
              ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
              : 'glass-card border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <span className="text-xs font-semibold text-blue-400">Low / Minor</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{lowCount}</p>
          <span className="text-[10px] text-slate-400">Linters & Warnings</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 glass-card rounded-2xl border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, file path or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="security">Security</option>
              <option value="architecture">Architecture</option>
              <option value="code_quality">Code Quality</option>
              <option value="dependency">Dependency</option>
              <option value="bug_risk">Bug Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading issues...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-dashed border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No matching issues found</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the filters or running a new scan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.issue_id}
              onClick={() => navigate(`/issues/${issue.issue_id}`)}
              className="p-4 sm:p-5 glass-card glass-card-hover rounded-2xl cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800/80 text-left"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={issue.severity} />
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {issue.category.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                    issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {issue.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white hover:text-indigo-300 transition">{issue.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{issue.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{issue.file_path}</span>
                  </span>
                  <span>•</span>
                  <span>Lines: {issue.line_start || 1}-{issue.line_end || 1}</span>
                  <span>•</span>
                  <span className="text-slate-500">via {issue.detected_by || 'RepoMind'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/fix-center?issueId=${issue.issue_id}`);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fix</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/issues/${issue.issue_id}`);
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1 transition"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
