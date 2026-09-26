import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  GitFork,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Upload,
  Code2,
  Zap
} from 'lucide-react';
import { projectsApi, githubApi } from '../services/api';
import { useProject } from '../context/ProjectContext';

export const AddProjectPage: React.FC = () => {
  const [tab, setTab] = useState<'url' | 'github' | 'sample'>('sample');
  const [repoUrl, setRepoUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);

  const { refreshProjects, setCurrentProject } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGithub = async () => {
      try {
        const repos = await githubApi.getRepositories();
        setGithubRepos(repos || []);
      } catch {}
    };
    loadGithub();
  }, []);

  const handleCreate = async (url: string, name?: string, br = 'main') => {
    setError(null);
    setLoading(true);

    try {
      const project = await projectsApi.create(url, name, br);
      await refreshProjects();
      setCurrentProject(project);
      navigate(`/analysis-progress?projectId=${project.project_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add project. Please verify the URL.');
    } finally {
      setLoading(false);
    }
  };

  const sampleRepositories = [
    {
      id: 'campus',
      name: 'Campus Management System',
      url: 'https://github.com/subhechha-dev/campus-management',
      lang: 'Python + TypeScript',
      desc: 'Real-world project with SQL injection in users.py, circular dependencies, and hardcoded DB password.',
      badge: 'Vulnerable & Coupled (Best for Testing)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'careerpilot',
      name: 'CareerPilot AI Dashboard',
      url: 'https://github.com/subhechha-dev/career-pilot-ai',
      lang: 'TypeScript (React)',
      desc: 'Modern full-stack web application with modular routes, state stores, and token authentication.',
      badge: 'Standard Codebase',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      id: 'fintech',
      name: 'FinTech Payment Microservice',
      url: 'https://github.com/subhechha-dev/microservices-fintech',
      lang: 'Python (FastAPI)',
      desc: 'Transactional microservices architecture with high coupling between payment and ledger services.',
      badge: 'High Coupling Audit',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
          Add New Repository
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Import a GitHub repository URL, connect via GitHub OAuth, or test immediately with curated sample codebases.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setTab('sample')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            tab === 'sample' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>1-Click Sample Repos (Recommended)</span>
        </button>

        <button
          onClick={() => setTab('url')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            tab === 'url' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Repository URL</span>
        </button>

        <button
          onClick={() => setTab('github')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
            tab === 'github' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>GitHub Account</span>
        </button>
      </div>

      {/* Tab 1: 1-Click Sample Repos */}
      {tab === 'sample' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Select any test project below to instantly start full AST static analysis, architecture graph construction, and security auditing!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sampleRepositories.map((repo) => (
              <div
                key={repo.id}
                className="p-6 glass-card glass-card-hover rounded-2xl flex flex-col justify-between border-slate-800"
              >
                <div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${repo.badgeColor} inline-block mb-3`}>
                    {repo.badge}
                  </span>
                  <h3 className="font-bold text-sm text-white">{repo.name}</h3>
                  <span className="text-[11px] font-mono text-indigo-400 block mt-0.5">{repo.lang}</span>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{repo.desc}</p>
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleCreate(repo.url, repo.name, 'main')}
                  className="mt-6 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition hover:scale-102"
                >
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>{loading ? 'Initiating...' : 'Analyze This Repo'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Repository URL */}
      {tab === 'url' && (
        <div className="p-8 glass-card rounded-3xl border-slate-800 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              GitHub / Git Repository URL
            </label>
            <div className="relative">
              <FolderGit2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Accepts any public GitHub repository or internal git URL.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Project Name (Optional)</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Application"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Branch</label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading || !repoUrl.trim()}
            onClick={() => handleCreate(repoUrl, projectName || undefined, branch)}
            className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>{loading ? 'Scanning Repository...' : 'Connect & Start Full Analysis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 3: GitHub Integration */}
      {tab === 'github' && (
        <div className="p-8 glass-card rounded-3xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">GitHub Connected</p>
                <p className="text-xs text-slate-400">Account: <span className="text-indigo-400 font-mono">subhechha-dev</span></p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active OAuth
            </span>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Available Repositories</h3>
            <div className="space-y-2">
              {githubRepos.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between transition"
                >
                  <div>
                    <p className="font-bold text-xs text-white">{r.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{r.language} • {r.default_branch}</p>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => handleCreate(`https://github.com/${r.full_name}`, r.name, r.default_branch)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    Select & Scan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
