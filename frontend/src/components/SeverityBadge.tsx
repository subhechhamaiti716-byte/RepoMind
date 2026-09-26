import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface Props {
  severity: string;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  const s = severity.toLowerCase();

  switch (s) {
    case 'critical':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          CRITICAL
        </span>
      );
    case 'high':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          HIGH
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-yellow-300" />
          MEDIUM
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 ${className}`}>
          <Info className="w-3.5 h-3.5 text-blue-400" />
          LOW
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30 ${className}`}>
          <Info className="w-3.5 h-3.5 text-slate-300" />
          INFO
        </span>
      );
  }
};
