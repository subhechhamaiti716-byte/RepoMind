import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  ShieldAlert,
  Network,
  Code2,
  Package,
  Wrench,
  BotMessageSquare,
  FileText,
  Play,
  TrendingUp,
  Download,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useProject } from '../context/ProjectContext';
import { healthApi, analyticsApi } from '../services/api';
import { HealthGauge } from '../components/HealthGauge';
import { EmptyProjectState } from '../components/EmptyProjectState';
import { HealthScore } from '../types';

export const HealthDashboardPage: React.FC = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();

  const [health, setHealth] = useState<HealthScore | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) return;

    const loadHealth = async () => {
      setLoading(true);
      try {
        const [hData, hHist, sData] = await Promise.all([
          healthApi.get(currentProject.project_id),
          healthApi.getHistory(currentProject.project_id),
          analyticsApi.getSummary(currentProject.project_id),
        ]);
        setHealth(hData);
        setHistory(hHist);
        setSummary(sData);
      } catch (err) {
        console.error('Failed to load health stats', err);
      } finally {
        setLoading(false);
      }
    };

    loadHealth();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Codebase Health Scoring"
        description="Connect a GitHub repository to evaluate maintainability index, vulnerability densities, architectural cohesion, and composite health ratings."
      />
    );
  }

  const score = health?.overall_score || currentProject.health_score || 82.0;

  const categoryScores = [
    { label: 'Code Quality', score: health?.code_quality_score || 86, icon: Code2, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { label: 'Architecture & Coupling', score: health?.architecture_score || 78, icon: Network, color: 'text-sky-400', bar: 'bg-sky-500' },
    { label: 'Security & Secrets', score: health?.security_score || 91, icon: ShieldAlert, color: 'text-rose-400', bar: 'bg-rose-500' },
    { label: 'Dependencies', score: health?.dependency_score || 74, icon: Package, color: 'text-purple-400', bar: 'bg-purple-500' },
    { label: 'Maintainability Index', score: health?.maintainability_score || 83, icon: Wrench, color: 'text-emerald-400', bar: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Repository Health Assessment</span>
          </div>
          <h1 className="text-2xl font-black text-white">{currentProject.name}</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{currentProject.repository_url}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/analysis-progress?projectId=${currentProject.project_id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Re-Analyze</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Big Circular Score */}
        <div className="lg:col-span-5 p-8 glass-card rounded-3xl border-slate-800 flex flex-col items-center justify-center text-center">
          <HealthGauge score={score} size={220} strokeWidth={16} label="Overall Codebase Health" />
          
          <div className="mt-6 w-full pt-6 border-t border-slate-800/80 flex items-center justify-around text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Critical</span>
              <span className="text-lg font-black text-rose-400">{summary?.critical_issues || 2}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">High</span>
              <span className="text-lg font-black text-amber-400">{summary?.high_issues || 4}</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total Issues</span>
              <span className="text-lg font-black text-white">{summary?.total_issues || 14}</span>
            </div>
          </div>
        </div>

        {/* Right: Category Breakdown Bars */}
        <div className="lg:col-span-7 p-8 glass-card rounded-3xl border-slate-800 flex flex-col justify-between space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Category Health Breakdown</span>
          </h3>

          <div className="space-y-4">
            {categoryScores.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="font-semibold text-slate-200">{cat.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{Math.round(cat.score)}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${cat.bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            Scores are synthesized continuously through AST analysis, dependency CVE matching, and AI architecture reasoning.
          </p>
        </div>
      </div>

      {/* Codebase Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Files</span>
          <p className="text-xl font-black text-white mt-1">{summary?.total_files || 18}</p>
        </div>
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total LOC</span>
          <p className="text-xl font-black text-white mt-1">{summary?.total_lines || 2450}</p>
        </div>
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Critical Issues</span>
          <p className="text-xl font-black text-rose-400 mt-1">{summary?.critical_issues || 2}</p>
        </div>
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security Risks</span>
          <p className="text-xl font-black text-amber-400 mt-1">{summary?.security_issues || 3}</p>
        </div>
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arch Findings</span>
          <p className="text-xl font-black text-sky-400 mt-1">{summary?.architecture_issues || 2}</p>
        </div>
        <div className="p-4 glass-card rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dependencies</span>
          <p className="text-xl font-black text-purple-400 mt-1">{summary?.dependencies_count || 8}</p>
        </div>
      </div>

      {/* Historical Score Progression Chart */}
      <div className="p-6 glass-card rounded-3xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Health Score Progression History</h3>
          </div>
          <span className="text-xs text-slate-400">Score over analyses</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.length > 0 ? history : [
              { date: 'Sep 10', score: 64 },
              { date: 'Sep 18', score: 71 },
              { date: 'Sep 26', score: 82 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis domain={[40, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#818cf8' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/issues')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-left transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-amber-400 font-bold block">Inspect Debt</span>
            <p className="text-sm font-bold text-white mt-0.5">View Issues</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
        </button>

        <button
          onClick={() => navigate('/architecture')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 text-left transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-sky-400 font-bold block">Interactive Map</span>
            <p className="text-sm font-bold text-white mt-0.5">Architecture</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-left transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-indigo-400 font-bold block">Ask Questions</span>
            <p className="text-sm font-bold text-white mt-0.5">AI Doctor Chat</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
        </button>

        <button
          onClick={() => navigate('/fix-center')}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-pink-500/40 text-left transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-pink-400 font-bold block">Refactor Diffs</span>
            <p className="text-sm font-bold text-white mt-0.5">Fix Center</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
        </button>
      </div>
    </div>
  );
};
