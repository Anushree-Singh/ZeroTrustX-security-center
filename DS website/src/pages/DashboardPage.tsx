import React from 'react';
import {
  Users,
  Server,
  RotateCw,
  Radio,
  FileText,
  AlertOctagon,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { FullStatus, PageId } from '../types';

interface DashboardPageProps {
  status: FullStatus;
  setCurrentPage: (page: PageId) => void;
  onProcessNext: () => void;
  processingQueue: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  status,
  setCurrentPage,
  onProcessNext,
  processingQueue,
}) => {
  const { stats, logs, queue } = status;

  const totalDecisions = (stats.grantedCount || 0) + (stats.deniedCount || 0) + (stats.reviewCount || 0);
  const grantedPct = totalDecisions ? Math.round((stats.grantedCount / totalDecisions) * 100) : 0;
  const deniedPct = totalDecisions ? Math.round((stats.deniedCount / totalDecisions) * 100) : 0;
  const reviewPct = totalDecisions ? Math.round((stats.reviewCount / totalDecisions) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Overview</h2>
          <p className="text-xs text-slate-400">
            Real-time access control telemetry and data structure state from C engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('users')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition"
          >
            <Plus className="w-3 h-3 text-slate-400" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setCurrentPage('resources')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition"
          >
            <Plus className="w-3 h-3 text-slate-400" />
            <span>Add Resource</span>
          </button>
          <button
            onClick={() => setCurrentPage('access-requests')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition"
          >
            <span>New Request</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {queue.count > 0 && (
            <button
              onClick={onProcessNext}
              disabled={processingQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3 h-3 ${processingQueue ? 'animate-spin' : ''}`} />
              <span>Process Queue ({queue.count})</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setCurrentPage('users')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Users</span>
            <Users className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-semibold font-mono text-slate-100 mt-2">{stats.totalUsers}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Hash Table (31)</div>
        </div>

        <div
          onClick={() => setCurrentPage('resources')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Resources</span>
            <Server className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-semibold font-mono text-slate-100 mt-2">{stats.totalResources}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Array (Cap 100)</div>
        </div>

        <div
          onClick={() => setCurrentPage('queue')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Pending Queue</span>
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-semibold font-mono text-cyan-400 mt-2">{stats.pendingRequests}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Circular Buffer</div>
        </div>

        <div
          onClick={() => setCurrentPage('sessions')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Active Sessions</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-semibold font-mono text-emerald-400 mt-2">{stats.activeSessions}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Valid Leases</div>
        </div>

        <div
          onClick={() => setCurrentPage('logs')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">Access Logs</span>
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-semibold font-mono text-slate-100 mt-2">{stats.totalLogs}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Linked List</div>
        </div>

        <div
          onClick={() => setCurrentPage('threats')}
          className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.12] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono">High Risk</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-semibold font-mono text-rose-400 mt-2">{stats.highRiskLogs}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Score &ge; 60</div>
        </div>
      </div>

      {/* Decision Summary and Risk Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Zero Trust Decision Summary */}
        <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Decisions Breakdown</span>
            <span className="font-mono text-slate-500">{totalDecisions} evaluations</span>
          </div>

          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex">
            <div style={{ width: `${grantedPct}%` }} className="bg-emerald-400" title={`Granted: ${stats.grantedCount}`} />
            <div style={{ width: `${reviewPct}%` }} className="bg-amber-400" title={`Review: ${stats.reviewCount}`} />
            <div style={{ width: `${deniedPct}%` }} className="bg-rose-400" title={`Denied: ${stats.deniedCount}`} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">GRANTED</div>
              <div className="text-base font-semibold text-emerald-400 mt-0.5">{stats.grantedCount}</div>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">REVIEW</div>
              <div className="text-base font-semibold text-amber-400 mt-0.5">{stats.reviewCount}</div>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] text-slate-400">DENIED</div>
              <div className="text-base font-semibold text-rose-400 mt-0.5">{stats.deniedCount}</div>
            </div>
          </div>
        </div>

        {/* C Risk Rules Quick Reference */}
        <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">C Security Scoring Reference</span>
            <span className="font-mono text-[10px] text-slate-500">security.c</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <span className="text-slate-400 block text-[10px]">Unknown Device</span>
              <span className="text-rose-400 font-bold">+30 pts</span>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <span className="text-slate-400 block text-[10px]">Unusual Location</span>
              <span className="text-amber-400 font-bold">+25 pts</span>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
              <span className="text-slate-400 block text-[10px]">Unusual Time</span>
              <span className="text-cyan-400 font-bold">+20 pts</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>&lt;30 ➔ GRANTED</span>
            <span>30-59 ➔ REVIEW</span>
            <span>&ge;60 ➔ REVIEW (Anomaly)</span>
          </div>
        </div>
      </div>

      {/* Recent Access Activity */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200">Recent Access Activity</div>
          <button
            onClick={() => setCurrentPage('logs')}
            className="text-[11px] font-mono text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">Req #</th>
                <th className="py-2 px-2.5">User</th>
                <th className="py-2 px-2.5">Resource</th>
                <th className="py-2 px-2.5">Risk Score</th>
                <th className="py-2 px-2.5">Decision</th>
                <th className="py-2 px-2.5">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-mono">
                    No access requests evaluated yet. Go to "Access Requests" to submit your first request.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 5).map((log) => (
                  <tr key={log.requestID} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-2.5 font-mono text-slate-400">#{log.requestID}</td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-300">UID: {log.userID}</td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-300">RES: {log.resourceID}</td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-400">{log.riskScore}</td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={`text-[10px] font-mono font-medium ${
                          log.decision === 'GRANTED'
                            ? 'text-emerald-400'
                            : log.decision === 'DENIED'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400 max-w-xs truncate">{log.reason}</td>
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
