import React from 'react';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showStatus?: boolean;
}

export const HealthGauge: React.FC<Props> = ({
  score,
  size = 180,
  strokeWidth = 14,
  label = 'Health Score',
  showStatus = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let statusText = 'Excellent';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (score < 50) {
    colorClass = 'text-rose-500';
    statusText = 'Critical Risk';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (score < 75) {
    colorClass = 'text-amber-500';
    statusText = 'Needs Review';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (score < 85) {
    colorClass = 'text-indigo-400';
    statusText = 'Good Health';
    statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-white">
            {Math.round(score)}
          </span>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {label && <p className="mt-3 text-sm font-semibold text-slate-300">{label}</p>}

      {showStatus && (
        <span className={`mt-2 px-3 py-0.5 text-xs font-semibold rounded-full border ${statusColor}`}>
          {statusText}
        </span>
      )}
    </div>
  );
};
