import React from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  stats?: SystemStats;
  loading: boolean;
  onRefresh: () => void;
  onClearAll: () => void;
  cBackendStatus: 'online' | 'offline' | 'loading';
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  loading,
  onRefresh,
  onClearAll,
  cBackendStatus,
}) => {
  const highRiskCount = stats?.highRiskLogs ?? 0;
  const deniedCount = stats?.deniedCount ?? 0;
  const isHigh = highRiskCount >= 2 || deniedCount >= 5;
  const isElevated = highRiskCount > 0 || deniedCount >= 3;

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#090c10] px-5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-semibold text-slate-200">
          Security Command Center
        </h1>
        <span className="text-slate-600">/</span>
        <span className="text-[11px] font-mono text-slate-400">
          Data Structures Zero Trust Core
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              cBackendStatus === 'online' ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <span>C Backend: {cBackendStatus === 'online' ? 'Active' : 'Offline'}</span>
        </div>

        {/* Security Posture Status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span
            className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider ${
              isHigh
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : isElevated
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isHigh ? 'High Risk' : isElevated ? 'Elevated' : 'Nominal'}
          </span>
        </div>

        <div className="h-4 w-px bg-white/[0.08]" />

        {/* Clear to Blank button */}
        <button
          onClick={onClearAll}
          title="Clear all data to a blank slate (empty users, resources, logs)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 transition"
        >
          <Trash2 className="w-3 h-3 text-slate-500" />
          <span>Clear to Blank</span>
        </button>

        {/* Refresh Sync */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition disabled:opacity-50"
          title="Sync with C Backend"
        >
          <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
};
