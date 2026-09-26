import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArchitectureGraph as IArchitectureGraph } from '../types';
import { Layers, Database, Server, Monitor, AlertTriangle } from 'lucide-react';

interface Props {
  data: IArchitectureGraph;
  onSelectNode?: (nodeId: string) => void;
}

// Custom Module Node Component
const CustomModuleNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'frontend':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'api':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getBorderColor = () => {
    if (data.details?.isCircular) return 'border-rose-500 shadow-rose-500/20';
    switch (data.type) {
      case 'frontend':
        return 'border-sky-500/50 shadow-sky-500/10';
      case 'api':
        return 'border-emerald-500/50 shadow-emerald-500/10';
      case 'database':
        return 'border-purple-500/50 shadow-purple-500/10';
      default:
        return 'border-indigo-500/50 shadow-indigo-500/10';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-xl bg-slate-900/95 border-2 shadow-xl ${getBorderColor()} min-w-[170px] text-left transition hover:scale-105`}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-indigo-400 border-2 border-slate-900" />
      
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {data.type}
          </span>
        </div>
        {data.details?.isCircular && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5" /> Cycle
          </span>
        )}
      </div>

      <p className="font-semibold text-xs text-white truncate">{data.label}</p>

      {data.details && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>{data.details.loc || 0} LOC</span>
          <span className="text-indigo-300">deps: {(data.details.inDegree || 0) + (data.details.outDegree || 0)}</span>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-indigo-400 border-2 border-slate-900" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomModuleNode,
};

export const ArchitectureGraph: React.FC<Props> = ({ data, onSelectNode }) => {
  const nodes: Node[] = useMemo(() => {
    return data.nodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position || { x: 100, y: 100 },
      data: {
        label: n.label,
        type: n.type,
        details: n.details,
      },
    }));
  }, [data.nodes]);

  const edges: Edge[] = useMemo(() => {
    return data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: {
        stroke: e.is_circular ? '#f43f5e' : '#6366f1',
        strokeWidth: e.is_circular ? 2.5 : 1.5,
        strokeDasharray: e.is_circular ? '5,5' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.is_circular ? '#f43f5e' : '#6366f1',
      },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
    }));
  }, [data.edges]);

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectNode && onSelectNode(node.id)}
        fitView
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-900 border-slate-700 text-slate-200 fill-slate-200" />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.details?.isCircular) return '#f43f5e';
            if (n.data?.type === 'database') return '#a855f7';
            if (n.data?.type === 'frontend') return '#38bdf8';
            if (n.data?.type === 'api') return '#10b981';
            return '#6366f1';
          }}
          className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
