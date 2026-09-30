import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { LogItem } from '../types';

interface AccessLogsPageProps {
  logs: LogItem[];
  refreshing: boolean;
}

export const AccessLogsPage: React.FC<AccessLogsPageProps> = ({ logs, refreshing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'GRANTED' | 'DENIED' | 'REVIEW'>('ALL');
  const [showNodeGraph, setShowNodeGraph] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (decisionFilter !== 'ALL' && log.decision !== decisionFilter) return false;

    const q = searchTerm.toLowerCase();
    return (
      String(log.requestID).includes(q) ||
      String(log.userID).includes(q) ||
      String(log.resourceID).includes(q) ||
      log.reason.toLowerCase().includes(q) ||
      log.decision.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Zero Trust Access Logs</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (Singly Linked List · LogNode* head)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Dynamically allocated nodes prepended to head in O(1) time. Stored in logs.txt.
          </p>
        </div>

        <button
          onClick={() => setShowNodeGraph(!showNodeGraph)}
          className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
        >
          {showNodeGraph ? 'Hide Node Diagram' : 'Show Linked List Diagram'}
        </button>
      </div>

      {/* Linked List Node Diagram */}
      {showNodeGraph && (
        <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-2">
          <div className="text-xs font-mono text-slate-400">
            Linked List Pointer Chain (Head ➔ ... ➔ NULL)
          </div>
          <div className="overflow-x-auto py-2">
            <div className="flex items-center gap-2 min-w-max text-xs font-mono">
              <span className="px-2 py-1 rounded bg-white/[0.08] text-white">head*</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              {logs.slice(0, 7).map((l) => (
                <React.Fragment key={l.requestID}>
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                    <div>Req #{l.requestID}</div>
                    <div className="text-[10px] text-slate-500">{l.decision}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </React.Fragment>
              ))}
              <span className="px-2 py-1 rounded bg-black/40 text-slate-600">NULL</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 text-xs font-mono">
            {(['ALL', 'GRANTED', 'DENIED', 'REVIEW'] as const).map((dec) => (
              <button
                key={dec}
                onClick={() => setDecisionFilter(dec)}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  decisionFilter === dec
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {dec}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">Request ID</th>
                <th className="py-2 px-2.5">User</th>
                <th className="py-2 px-2.5">Resource</th>
                <th className="py-2 px-2.5">Risk Score</th>
                <th className="py-2 px-2.5">Decision</th>
                <th className="py-2 px-2.5">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-mono">
                    No access logs recorded in C linked list.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.requestID} className="hover:bg-white/[0.02] transition font-mono">
                    <td className="py-2.5 px-2.5 text-slate-400">#{log.requestID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">UID: {log.userID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">RES: {log.resourceID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">{log.riskScore}</td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={
                          log.decision === 'GRANTED'
                            ? 'text-emerald-400'
                            : log.decision === 'DENIED'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 font-sans text-slate-400">{log.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
