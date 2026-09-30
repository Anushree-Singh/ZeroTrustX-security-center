import React, { useState } from 'react';
import { ShieldAlert, Search } from 'lucide-react';
import { ThreatItem, LogItem } from '../types';

interface ThreatMonitoringPageProps {
  threats: ThreatItem[];
  logs: LogItem[];
  onBlockUser: (userID: number) => Promise<void>;
  refreshing: boolean;
}

export const ThreatMonitoringPage: React.FC<ThreatMonitoringPageProps> = ({
  threats,
  logs,
  onBlockUser,
  refreshing,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ANOMALY' | 'BRUTE_FORCE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredThreats = threats.filter((t) => {
    if (filterType === 'ANOMALY' && t.threatType === 'REPEATED_DENIAL_BRUTE_FORCE') return false;
    if (filterType === 'BRUTE_FORCE' && t.threatType === 'HIGH_RISK_ANOMALY') return false;

    const q = searchTerm.toLowerCase();
    return (
      String(t.userID).includes(q) ||
      String(t.requestID).includes(q) ||
      t.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Threat Monitoring</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (security.c · monitorThreats())
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Heuristic detection for high-risk access anomalies (risk &ge; 60) and repeated denials (&ge; 3)
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Active Flags: <span className="text-rose-400 font-bold">{threats.length}</span>
        </div>
      </div>

      {/* Main List */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 text-xs font-mono">
            {(['ALL', 'ANOMALY', 'BRUTE_FORCE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  filterType === type
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {type === 'ALL' ? 'All Alerts' : type === 'ANOMALY' ? 'High Risk' : 'Repeated Denials'}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search threat events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredThreats.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No threat alerts detected by ZeroTrustX. The system is operating normally.
            </div>
          ) : (
            filteredThreats.map((threat, index) => {
              const isRepeated = threat.deniedCount >= 3;
              return (
                <div
                  key={index}
                  className="p-3 rounded border border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-slate-200">
                        {isRepeated ? 'Repeated Denial Alert' : 'High Risk Context Anomaly'}
                      </span>
                      <span className="text-slate-500">Req #{threat.requestID}</span>
                      <span
                        className={`text-[10px] ${
                          threat.decision === 'DENIED' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {threat.decision}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      User: <span className="font-mono text-slate-300">UID #{threat.userID}</span> · Resource:{' '}
                      <span className="font-mono text-slate-300">RES #{threat.resourceID}</span> · Reason:{' '}
                      <span className="text-slate-300">{threat.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-rose-400 font-bold">{threat.riskScore} pts</span>
                    <button
                      onClick={() => onBlockUser(threat.userID)}
                      disabled={refreshing}
                      className="px-2.5 py-1 rounded text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-500/20 transition disabled:opacity-50"
                    >
                      Block User #{threat.userID}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
