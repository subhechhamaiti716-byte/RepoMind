import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  HeartPulse,
  AlertOctagon,
  Network,
  ShieldCheck,
  Package,
  BotMessageSquare,
  Wrench,
  FileText,
  Settings,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const Sidebar: React.FC = () => {
  const { currentProject } = useProject();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white font-semibold shadow-lg shadow-indigo-600/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-60 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] bg-slate-950/80 border-r border-slate-800/80 p-3.5 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Core Navigation */}
        <div className="space-y-1">
          <NavLink to="/dashboard" className={navClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/add-project" className={navClass}>
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Project</span>
          </NavLink>
        </div>

        {/* Codebase Analysis Group */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Analysis
          </p>
          <NavLink to="/health" className={navClass}>
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Codebase Health</span>
          </NavLink>
          <NavLink to="/issues" className={navClass}>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Issues & Findings</span>
          </NavLink>
          <NavLink to="/architecture" className={navClass}>
            <Network className="w-4 h-4 text-sky-400" />
            <span>Architecture View</span>
          </NavLink>
          <NavLink to="/security" className={navClass}>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Security Audit</span>
          </NavLink>
          <NavLink to="/dependencies" className={navClass}>
            <Package className="w-4 h-4 text-purple-400" />
            <span>Dependencies</span>
          </NavLink>
        </div>

        {/* AI & Automation Group */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            AI Doctor & Tools
          </p>
          <NavLink to="/chat" className={navClass}>
            <BotMessageSquare className="w-4 h-4 text-indigo-400" />
            <span>AI Codebase Chat</span>
          </NavLink>
          <NavLink to="/fix-center" className={navClass}>
            <Wrench className="w-4 h-4 text-pink-400" />
            <span>Fix Center</span>
          </NavLink>
          <NavLink to="/reports" className={navClass}>
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Audit Reports</span>
          </NavLink>
        </div>

        {/* Settings */}
        <div className="space-y-1">
          <NavLink to="/settings" className={navClass}>
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>

      {/* Footer / Active Repo status */}
      {currentProject ? (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Target Repo</span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>
          <p className="font-semibold text-xs text-white truncate">{currentProject.name}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Health Score:</span>
            <span className="font-bold text-indigo-400">{Math.round(currentProject.health_score || 0)}/100</span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-medium">No Active Repository</p>
          <NavLink
            to="/add-project"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>+ Connect Repo</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};
