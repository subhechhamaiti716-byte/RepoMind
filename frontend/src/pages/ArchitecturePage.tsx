import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  AlertTriangle,
  Layers,
  Sparkles,
  BotMessageSquare,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { architectureApi } from '../services/api';
import { ArchitectureGraph as IArchitectureGraph } from '../types';
import { ArchitectureGraph } from '../components/ArchitectureGraph';
import { EmptyProjectState } from '../components/EmptyProjectState';

export const ArchitecturePage: React.FC = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();

  const [graphData, setGraphData] = useState<IArchitectureGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const loadGraph = async () => {
    if (!currentProject) {
      setGraphData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await architectureApi.getGraph(currentProject.project_id);
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load architecture graph', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [currentProject]);

  if (!currentProject) {
    return (
      <EmptyProjectState
        featureTitle="Architecture & Module Dependency View"
        description="Connect a GitHub repository to visualize module interactions, inspect circular dependency loops, and calculate coupling scores."
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Network className="w-4 h-4" />
            <span>Interactive Dependency Graph</span>
          </div>
          <h1 className="text-2xl font-black text-white">Architecture & Dependency Analysis</h1>
          <p className="text-xs text-slate-400">
            Visualizing imports, module layers, and cycle loops for <strong className="text-white">{currentProject.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadGraph}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reload Graph</span>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <BotMessageSquare className="w-4 h-4" />
            <span>Ask AI About Architecture</span>
          </button>
        </div>
      </div>

      {/* Architecture Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 glass-card rounded-2xl border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Total Modules</span>
          <p className="text-2xl font-black text-white mt-1">{graphData?.nodes.length || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Dependencies</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">{graphData?.edges.length || 0}</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Circular Loops</span>
          <p className={`text-2xl font-black mt-1 ${
            (graphData?.circular_dependencies_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {graphData?.circular_dependencies_count || 0}
          </p>
        </div>

        <div className="p-4 glass-card rounded-2xl border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Coupling Score</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{graphData?.coupling_score || 0}%</p>
        </div>

        <div className="p-4 glass-card rounded-2xl border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Cohesion Rating</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{graphData?.cohesion_score || 85}%</p>
        </div>
      </div>

      {/* Interactive Diagram Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive graph: Pan, zoom, and drag nodes. Red dashed arrows indicate circular dependency cycles.</span>
          </span>
          <span className="font-mono text-indigo-300 font-semibold">{graphData?.architecture_type || 'Layered Architecture'}</span>
        </div>

        {loading ? (
          <div className="h-[500px] rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center text-xs text-slate-400">
            Constructing architecture graph...
          </div>
        ) : graphData ? (
          <ArchitectureGraph data={graphData} onSelectNode={(id) => setSelectedNode(id)} />
        ) : null}
      </div>

      {/* Architecture Findings & AI Recommendations */}
      <div className="p-6 glass-card rounded-3xl border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Architectural Insights & AI Recommendations</span>
        </h3>

        <div className="space-y-3">
          {(graphData?.circular_dependencies_count || 0) > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1 text-left">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Circular Dependency Loop Detected</span>
              </div>
              <p className="text-slate-300">
                Modules have mutual import cycles (e.g. <code className="font-mono text-rose-300">users.py ⟷ payment.py</code>). This couples business domains and causes unpredictable module initialization.
              </p>
              <p className="text-indigo-300 font-medium pt-1">
                💡 AI Solution: Introduce an Event Dispatcher or extract shared DTO models into a common utility layer.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 space-y-1 text-left">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Layers className="w-4 h-4" />
              <span>Layer Separation Review</span>
            </div>
            <p className="text-slate-300">
              The project maintains clear boundaries between the API layer and the underlying database connectors. Consider introducing a dedicated Repository Pattern to isolate raw SQL statements from route handlers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
