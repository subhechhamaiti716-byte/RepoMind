import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  ShieldCheck,
  Network,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Activity,
  CheckCircle2,
  Zap,
  FolderGit2,
  Lock,
  GitBranch
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchDemo = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="w-full glass-panel border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
              RepoMind
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              AI Codebase Assistant
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#architecture" className="hover:text-white transition">Architecture</a>
          <a href="#student-info" className="hover:text-white transition">About Project</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
          >
            Sign In
          </Link>
          <button
            onClick={handleLaunchDemo}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition hover:scale-105"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-20 lg:py-28 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-indigo-300 mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Agentic Codebase Intelligence & AST Diagnosis</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
          Understand Your Codebase.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Improve Your Architecture.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
          RepoMind combines deterministic <strong>Abstract Syntax Tree (AST) parsing</strong>, deep security audits, and <strong>RAG-powered AI Doctor reasoning</strong> to detect code smells, resolve circular dependencies, and recommend instant refactoring patches.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleLaunchDemo}
            className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/25 transition hover:scale-105"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Analyze Your Repository</span>
          </button>

          <Link
            to="/login"
            className="px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base rounded-2xl border border-slate-700/80 shadow-lg transition hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>

        {/* Live Preview Metric Banner */}
        <div className="mt-16 w-full max-w-4xl p-6 glass-card rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div>
            <p className="text-xs text-slate-400 font-medium">Detection Accuracy</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">98.4%</p>
            <span className="text-[11px] text-emerald-400 font-semibold">AST + Semantic Rules</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Architecture Analysis</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">&lt; 3 sec</p>
            <span className="text-[11px] text-indigo-400 font-semibold">NetworkX Cycles</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Security Audits</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">CWE / CVE</p>
            <span className="text-[11px] text-rose-400 font-semibold">Secrets & Injections</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">AI Fix Generation</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">1-Click</p>
            <span className="text-[11px] text-purple-400 font-semibold">Instant Diff Patches</span>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="px-6 lg:px-12 py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything Needed for Complete Codebase Health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🧠 AI Codebase Doctor</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Goes beyond raw linter output. Interprets complex contextual logic, assigns intelligent severities, and explains why technical debt matters.
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🏗️ Architecture & Dependency Graphs</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Visualizes module coupling in real-time React Flow diagrams, detects circular dependencies, and identifies tightly coupled service bottlenecks.
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🛡️ Security & Secret Hunter</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Detects hardcoded API keys, JWT secrets, database passwords, SQL injection vulnerabilities, and insecure token storage before deployment.
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🔍 AST Code Quality Analysis</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Calculates cyclomatic complexity, maintainability indexes, function/class metrics, and silent exception swallowing (`except: pass`).
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🛠️ Fix Center & Diff Viewer</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Generates AI-powered refactoring solutions with side-by-side before/after code diffs, unified patch previews, and 1-click accept actions.
              </p>
            </div>

            <div className="p-6 glass-card rounded-2xl glass-card-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">❤️ Health Score & PDF Reports</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Calculates balanced 0-100 codebase health scores across 5 dimensions and exports comprehensive audit reports in PDF, Markdown, and JSON.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section id="how-it-works" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Analysis Pipeline</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            How RepoMind Analyzes Your Code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 glass-card rounded-2xl text-left border-indigo-500/20">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
              1
            </div>
            <h4 className="font-bold text-base text-white mb-1">Connect Repository</h4>
            <p className="text-xs text-slate-400">Import via GitHub URL or test with pre-loaded realistic vulnerable sample repositories.</p>
          </div>

          <div className="p-6 glass-card rounded-2xl text-left border-purple-500/20">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-purple-600/30">
              2
            </div>
            <h4 className="font-bold text-base text-white mb-1">Scan & AST Parsing</h4>
            <p className="text-xs text-slate-400">Traverse files, compute cyclomatic complexity, audit dependencies, and locate hardcoded credentials.</p>
          </div>

          <div className="p-6 glass-card rounded-2xl text-left border-pink-500/20">
            <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-pink-600/30">
              3
            </div>
            <h4 className="font-bold text-base text-white mb-1">Architecture & RAG</h4>
            <p className="text-xs text-slate-400">Build graph models with NetworkX, detect circular imports, and run RAG-assisted contextual diagnosis.</p>
          </div>

          <div className="p-6 glass-card rounded-2xl text-left border-emerald-500/20">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
              4
            </div>
            <h4 className="font-bold text-base text-white mb-1">Actionable Fixes</h4>
            <p className="text-xs text-slate-400">Explore interactive React Flow graphs, chat with your codebase, review diffs, and download reports.</p>
          </div>
        </div>
      </section>

      {/* Student Project Information Footer */}
      <section id="student-info" className="px-6 lg:px-12 py-12 bg-slate-900/80 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-base font-bold text-white">RepoMind — OJT Project Design</h4>
              <p className="text-xs text-slate-400">
                Developed by <span className="text-indigo-300 font-semibold">Subhechha Maiti</span> | Roll No: <span className="text-indigo-300 font-semibold">251810700219</span> (1st Year)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition"
            >
              Launch Dashboard Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
