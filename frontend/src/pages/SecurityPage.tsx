import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { analyticsApi, issuesApi } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyProjectState } from '../components/EmptyProjectState';
import { Issue } from '../types';

export const SecurityPage: React.FC = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();

  const [securityIssues, setSecurityIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setSecurityIssues([]);
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await issuesApi.list(currentProject.project_id, { category: 'security', limit: 50 });
        setSecurityIssues(res.issues || []);
      } catch (err) {
        console.error('Failed to load security issues', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Vulnerability & Secret Audit"
        description="Connect a GitHub repository to scan for hardcoded credentials, SQL injection risks, and insecure token storage."
      />
    );
  }

  const criticals = securityIssues.filter((i) => i.severity === 'critical');
  const highs = securityIssues.filter((i) => i.severity === 'high');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Vulnerability & Secret Audit</span>
          </div>
          <h1 className="text-2xl font-black text-white">Security Findings</h1>
          <p className="text-xs text-slate-400">
            Scanning for hardcoded credentials, SQL injection, and insecure token storage in <strong className="text-white">{currentProject.name}</strong>.
          </p>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Security Findings</span>
          <p className="text-3xl font-black text-white mt-1">{securityIssues.length}</p>
        </div>
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-rose-400">Critical Exposures</span>
          <p className="text-3xl font-black text-rose-400 mt-1">{criticals.length}</p>
          <span className="text-[10px] text-slate-400">Direct SQLi or API Key Leaks</span>
        </div>
        <div className="p-5 glass-card rounded-2xl border-slate-800">
          <span className="text-xs font-semibold text-amber-400">High Risk Vulnerabilities</span>
          <p className="text-3xl font-black text-amber-400 mt-1">{highs.length}</p>
          <span className="text-[10px] text-slate-400">Insecure Token Storage</span>
        </div>
      </div>

      {/* Security Findings List */}
      <div className="space-y-3">
        {securityIssues.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-3xl border border-dashed border-slate-800">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Security Vulnerabilities Detected</h3>
            <p className="text-xs text-slate-400 mt-1">Your codebase passed all hardcoded secret and SQL injection pattern tests.</p>
          </div>
        ) : (
          securityIssues.map((iss) => (
            <div
              key={iss.issue_id}
              onClick={() => navigate(`/issues/${iss.issue_id}`)}
              className="p-5 glass-card glass-card-hover rounded-2xl cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800/80 text-left"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={iss.severity} />
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                    iss.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {iss.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-white">{iss.title}</span>
                </div>
                <p className="text-xs text-slate-300">{iss.description}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-300 pt-1">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{iss.file_path}</span>
                  <span>(Line {iss.line_start || 1})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/fix-center?issueId=${iss.issue_id}`);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition ${
                    iss.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{iss.status === 'resolved' ? 'Resolved ✅' : 'Fix Vulnerability'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
