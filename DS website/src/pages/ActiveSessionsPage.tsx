import React, { useState } from 'react';
import { SessionItem } from '../types';

interface ActiveSessionsPageProps {
  sessions: SessionItem[];
  onRevokeSession: (sessionID: number) => Promise<void>;
  onRevalidateSession: (sessionID: number, currentDevice: string) => Promise<any>;
  refreshing: boolean;
}

export const ActiveSessionsPage: React.FC<ActiveSessionsPageProps> = ({
  sessions,
  onRevokeSession,
  onRevalidateSession,
  refreshing,
}) => {
  const [revalidateModalSession, setRevalidateModalSession] = useState<SessionItem | null>(null);
  const [testDeviceID, setTestDeviceID] = useState('');
  const [revalidationResult, setRevalidationResult] = useState<any | null>(null);
  const [revalidating, setRevalidating] = useState(false);

  const openRevalidateModal = (session: SessionItem) => {
    setRevalidateModalSession(session);
    setTestDeviceID(session.deviceID);
    setRevalidationResult(null);
  };

  const handleExecuteRevalidation = async () => {
    if (!revalidateModalSession || !testDeviceID.trim()) return;

    setRevalidating(true);
    setRevalidationResult(null);
    try {
      const res = await onRevalidateSession(revalidateModalSession.sessionID, testDeviceID.trim());
      setRevalidationResult(res);
    } catch (err: any) {
      setRevalidationResult({
        success: false,
        error: err.message || 'C session revalidation failed',
      });
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Active Sessions</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (Session sessions[100] · Continuous Trust)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Sessions are validated continuously against the authorized hardware device fingerprint in C
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Active Leases:{' '}
          <span className="text-emerald-400 font-bold">
            {sessions.filter((s) => s.active === 1).length}
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">Session ID</th>
                <th className="py-2 px-2.5">User</th>
                <th className="py-2 px-2.5">Resource</th>
                <th className="py-2 px-2.5">Bound Device ID</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-mono">
                    No active sessions found. When an access request passes zero trust checks (risk &lt; 30), a session is created.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const isActive = session.active === 1;
                  return (
                    <tr key={session.sessionID} className="hover:bg-white/[0.02] transition font-mono">
                      <td className="py-2.5 px-2.5 text-slate-200">SID #{session.sessionID}</td>
                      <td className="py-2.5 px-2.5 text-slate-300">UID: {session.userID}</td>
                      <td className="py-2.5 px-2.5 text-slate-300">RES: {session.resourceID}</td>
                      <td className="py-2.5 px-2.5 text-slate-400">{session.deviceID}</td>
                      <td className="py-2.5 px-2.5">
                        <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                          {isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right space-x-3">
                        {isActive && (
                          <>
                            <button
                              onClick={() => openRevalidateModal(session)}
                              className="text-cyan-400 hover:underline"
                            >
                              Revalidate
                            </button>
                            <button
                              onClick={() => onRevokeSession(session.sessionID)}
                              disabled={refreshing}
                              className="text-rose-400 hover:underline disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revalidate Modal */}
      {revalidateModalSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg bg-[#0e121a] border border-white/[0.1] shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-100 font-mono">
                Continuous Trust Revalidation
              </h3>
              <button
                onClick={() => setRevalidateModalSession(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              The C backend validates if the current device matches the session hardware fingerprint.
            </p>

            <div className="p-2.5 rounded bg-black/30 border border-white/[0.06] text-xs font-mono space-y-1">
              <div>Session: SID #{revalidateModalSession.sessionID}</div>
              <div className="text-slate-400">Authorized: {revalidateModalSession.deviceID}</div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Current Device ID
              </label>
              <input
                type="text"
                value={testDeviceID}
                onChange={(e) => setTestDeviceID(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setTestDeviceID(revalidateModalSession.deviceID)}
                  className="text-cyan-400 hover:underline"
                >
                  Matching Device
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() => setTestDeviceID('DEV-SPOOF-ATTACKER')}
                  className="text-rose-400 hover:underline"
                >
                  Simulate Spoofing
                </button>
              </div>
            </div>

            {revalidationResult && (
              <div
                className={`p-2.5 rounded text-xs font-mono ${
                  revalidationResult.result === 1
                    ? 'bg-emerald-950/30 text-emerald-300'
                    : 'bg-rose-950/30 text-rose-300'
                }`}
              >
                <div className="font-bold">C Status: {revalidationResult.status}</div>
                <div className="mt-0.5 text-[11px]">{revalidationResult.message}</div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setRevalidateModalSession(null)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteRevalidation}
                disabled={revalidating}
                className="px-3.5 py-1 rounded text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50"
              >
                {revalidating ? 'Verifying...' : 'Revalidate in C'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
