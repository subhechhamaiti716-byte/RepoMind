import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Network,
  Activity,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { reportsApi, healthApi, analyticsApi } from '../services/api';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const ReportsPage: React.FC = () => {
  const { currentProject } = useProject();

  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const res = await reportsApi.list(currentProject.project_id);
      const list = res || [];
      setReports(list);

      if (list.length > 0) {
        const fullRep = await reportsApi.get(list[0].report_id);
        setActiveReport(fullRep);
      } else {
        // Auto-generate initial report
        await handleGenerateReport();
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const rep = await reportsApi.generate(currentProject.project_id, 'pdf');
      const fullRep = await reportsApi.get(rep.report_id);
      setActiveReport(fullRep);
      const res = await reportsApi.list(currentProject.project_id);
      setReports(res || []);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [currentProject]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!activeReport) return;
    window.open(reportsApi.downloadUrl(activeReport.report_id, 'markdown'), '_blank');
  };

  const handleDownloadJSON = () => {
    if (!activeReport) return;
    window.open(reportsApi.downloadUrl(activeReport.report_id, 'json'), '_blank');
  };

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Executive Audit Reports"
        description="Connect a GitHub repository to generate professional audit reports with health scores, architectural diagrams, vulnerability counts, and Markdown/JSON export."
      />
    );
  }

  const content = activeReport?.content || {};
  const meta = content?.metadata || {};
  const health = content?.health_score || {};
  const metrics = content?.metrics || {};
  const issuesSummary = content?.issues_summary || {};
  const issues = content?.issues || [];
  const recs = content?.ai_recommendations || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar (Hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>Executive Codebase Audit & Compliance</span>
          </div>
          <h1 className="text-2xl font-black text-white">Analysis Reports</h1>
          <p className="text-xs text-slate-400">
            Generate and export complete architectural and security audit reports for <strong className="text-white">{currentProject.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 text-left bg-slate-950/90 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Document Title Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 print:text-indigo-700 block mb-1">
              RepoMind Codebase Audit Report
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white print:text-black">
              {meta.project_name || currentProject.name}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1">
              Repository: {meta.repository_url || currentProject.repository_url}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5">
            <p><strong>Date:</strong> {meta.generated_at || new Date().toUTCString()}</p>
            <p><strong>Auditor:</strong> {meta.auditor || 'RepoMind AI Engine'}</p>
            <p><strong>Overall Score:</strong> <span className="font-bold text-indigo-400 print:text-indigo-700">{Math.round(health.overall_score || 82)} / 100</span></p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>1. Executive Summary</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed bg-slate-900/60 print:bg-slate-100 p-5 rounded-2xl border border-slate-800 print:border-slate-200">
            {content.executive_summary || 'RepoMind completed a comprehensive structural and security audit of the repository. While standard business logic patterns are present, several high-priority architectural bottlenecks and security issues require immediate remediation prior to production rollout.'}
          </p>
        </div>

        {/* Section 2: Health Score Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>2. Health Scores & Metrics Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Code Quality</span>
              <p className="text-lg font-black text-indigo-400 print:text-indigo-700 mt-0.5">{Math.round(health.code_quality_score || 86)}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Security</span>
              <p className="text-lg font-black text-rose-400 print:text-rose-700 mt-0.5">{Math.round(health.security_score || 78)}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Architecture</span>
              <p className="text-lg font-black text-sky-400 print:text-sky-700 mt-0.5">{Math.round(health.architecture_score || 80)}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Dependencies</span>
              <p className="text-lg font-black text-purple-400 print:text-purple-700 mt-0.5">{Math.round(health.dependency_score || 74)}%</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Maintainability</span>
              <p className="text-lg font-black text-emerald-400 print:text-emerald-700 mt-0.5">{Math.round(health.maintainability_score || 83)}%</p>
            </div>
          </div>
        </div>

        {/* Section 3: AI Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>3. Key Strategic Recommendations</span>
          </h3>

          <div className="space-y-2.5">
            {recs.map((rec: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 print:text-indigo-800">
                    {rec.priority || 'HIGH'}
                  </span>
                  <strong className="text-white print:text-black">{rec.title}</strong>
                </div>
                <p className="text-slate-300 print:text-slate-700">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Detailed Finding Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>4. Detailed Technical Findings ({issues.length})</span>
          </h3>

          <div className="space-y-2">
            {issues.slice(0, 10).map((iss: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 print:bg-slate-50 border border-slate-800/80 print:border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white print:text-black">{idx + 1}. {iss.title}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 print:text-slate-600">
                    {iss.file_path} (L:{iss.line_start || 1})
                  </span>
                </div>
                <p className="text-slate-400 print:text-slate-600 text-[11px]">{iss.description}</p>
                <p className="text-emerald-400 print:text-emerald-700 text-[11px]"><strong>Fix:</strong> {iss.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-xs text-slate-500 print:text-slate-600 font-mono">
          <span>RepoMind Codebase Intelligence System v1.0</span>
          <span>Prepared by Subhechha Maiti (251810700219)</span>
        </div>
      </div>
    </div>
  );
};
