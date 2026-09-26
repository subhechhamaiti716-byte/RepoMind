import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  BrainCircuit,
  FolderGit2,
  Play,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between">
      {/* Left: Brand & Project Selector */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
              RepoMind
            </span>
            <span className="text-[10px] text-indigo-400 font-medium -mt-1 tracking-wider uppercase">
              AI Codebase Doctor
            </span>
          </div>
        </Link>

        {/* Project Selector Dropdown */}
        {projects.length > 0 && (
          <div className="relative hidden md:block">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={currentProject?.project_id || ''}
                onChange={(e) => {
                  const p = projects.find((x) => x.project_id === e.target.value);
                  if (p) setCurrentProject(p);
                }}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer pr-2"
              >
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id} className="bg-slate-900 text-slate-200">
                    {p.name} ({p.language || 'TypeScript'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions, Health pill, User Profile */}
      <div className="flex items-center gap-3">
        {currentProject ? (
          <>
            <button
              onClick={() => navigate('/add-project')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs rounded-xl border border-slate-700/60 transition"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Repo</span>
            </button>
            <button
              onClick={() => navigate(`/analysis-progress?projectId=${currentProject.project_id}`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition hover:scale-102"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Analysis</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/add-project')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Project</span>
          </button>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.name || 'Subhechha Maiti'}
            </span>
            <span className="text-[10px] text-slate-400 leading-none">
              {user?.email || 'demo@repomind.io'}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
