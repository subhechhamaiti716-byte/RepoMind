import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Play,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Trash2,
  Sparkles,
  GitBranch,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { projectsApi, analysisApi } from '../services/api';
import { HealthGauge } from '../components/HealthGauge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { projects, refreshProjects, setCurrentProject } = useProject();
  const [analysesHistory, setAnalysesHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshProjects();
      setLoading(false);
    };
    loadData();
  }, []);

  const totalProjects = projects.length;
  const healthyCount = projects.filter((p) => (p.health_score || 0) >= 80).length;
  const atRiskCount = projects.filter((p) => (p.health_score || 0) >= 50 && (p.health_score || 0) < 80).length;
  const criticalCount = projects.filter((p) => (p.health_score || 0) < 50 && p.health_score > 0).length;

  const handleSelectProject = (project: any, targetPath: string) => {
    setCurrentProject(project);
    navigate(targetPath);
  };

  const handleRunAnalysis = async (project: any) => {
    setCurrentProject(project);
    navigate(`/analysis-progress?projectId=${project.project_id}`);
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectsApi.delete(projectId);
      await refreshProjects();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Codebase Doctor & Architecture Assistant</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Subhechha'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor codebase health, diagnose architectural coupling, and automate refactoring fixes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/add-project')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 glass-card rounded-2xl border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{totalProjects}</p>
          <span className="text-[11px] text-indigo-300 font-medium mt-1 block">Active repositories</span>
        </div>

        <div className="p-5 glass-card rounded-2xl border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Healthy Projects</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{healthyCount}</p>
          <span className="text-[11px] text-emerald-300 font-medium mt-1 block">Score ≥ 80 / 100</span>
        </div>

        <div className="p-5 glass-card rounded-2xl border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Projects at Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{atRiskCount}</p>
          <span className="text-[11px] text-amber-300 font-medium mt-1 block">Score 50-79 / 100</span>
        </div>

        <div className="p-5 glass-card rounded-2xl border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Critical Projects</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">{criticalCount}</p>
          <span className="text-[11px] text-rose-300 font-medium mt-1 block">Needs immediate fix</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Your Repositories</h2>
            <p className="text-xs text-slate-400">Select a project to inspect architecture, issues, and health metrics.</p>
          </div>
          <button
            onClick={() => navigate('/add-project')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>Add New</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-3xl border border-dashed border-slate-800">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-white">No repositories connected yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Connect a GitHub repository or test with a preloaded sample repository in 1 click.
            </p>
            <button
              onClick={() => navigate('/add-project')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              + Add First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.project_id}
                onClick={() => handleSelectProject(project, '/health')}
                className="p-5 glass-card glass-card-hover rounded-2xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white truncate max-w-[160px]">{project.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{project.language || 'TypeScript'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><GitBranch className="w-2.5 h-2.5" /> {project.default_branch || 'main'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(project.project_id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Health gauge & metrics summary */}
                  <div className="my-4 py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Health Score</span>
                      <span className="text-xl font-black text-white">
                        {Math.round(project.health_score || 82)}
                        <span className="text-xs font-normal text-slate-500"> / 100</span>
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <span className="block text-emerald-400 font-medium">
                        {project.status === 'completed' ? 'Analyzed' : 'Ready'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {project.last_analysis ? 'Updated recently' : 'Ready to scan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunAnalysis(project);
                    }}
                    className="flex-1 py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Scan Now</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProject(project, '/health');
                    }}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1 transition"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Shortcuts */}
      <div className="p-6 glass-card rounded-3xl border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Quick Analysis Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
          <button
            onClick={() => navigate('/issues')}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-indigo-500/40 transition flex items-center gap-3"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <p className="font-bold text-white">Issues & Findings</p>
              <p className="text-[11px] text-slate-400">View code smells</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/architecture')}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-indigo-500/40 transition flex items-center gap-3"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <div>
              <p className="font-bold text-white">Architecture View</p>
              <p className="text-[11px] text-slate-400">Dependency graph</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-indigo-500/40 transition flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="font-bold text-white">AI Codebase Chat</p>
              <p className="text-[11px] text-slate-400">Ask questions</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/fix-center')}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-left border border-slate-800 hover:border-indigo-500/40 transition flex items-center gap-3"
          >
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <div>
              <p className="font-bold text-white">Fix Center</p>
              <p className="text-[11px] text-slate-400">Review AI diffs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
