import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { User, Resource } from '../types';
import { calculateRiskFromC } from '../api';

interface AccessRequestPageProps {
  users: User[];
  resources: Resource[];
  onSubmitRequest: (payload: {
    userID: number;
    resourceID: number;
    deviceID: string;
    unknownDevice: boolean;
    unusualTime: boolean;
    unusualLocation: boolean;
    autoProcess: boolean;
  }) => Promise<any>;
  refreshing: boolean;
}

export const AccessRequestPage: React.FC<AccessRequestPageProps> = ({
  users,
  resources,
  onSubmitRequest,
  refreshing,
}) => {
  const [userIDInput, setUserIDInput] = useState<string>(users[0]?.userID ? String(users[0].userID) : '');
  const [resourceIDInput, setResourceIDInput] = useState<string>(resources[0]?.resourceID ? String(resources[0].resourceID) : '');
  const [deviceID, setDeviceID] = useState<string>('');
  const [unknownDevice, setUnknownDevice] = useState(false);
  const [unusualTime, setUnusualTime] = useState(false);
  const [unusualLocation, setUnusualLocation] = useState(false);

  // Live Risk Score calculated exclusively by C backend
  const [liveRiskScore, setLiveRiskScore] = useState<number>(0);
  const [calculatingRisk, setCalculatingRisk] = useState(false);

  // Submission result from C backend
  const [result, setResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill registered device if matching user is found
  useEffect(() => {
    const num = parseInt(userIDInput, 10);
    const user = users.find((u) => u.userID === num);
    if (user && !unknownDevice) {
      setDeviceID(user.deviceID);
    }
  }, [userIDInput, users, unknownDevice]);

  // When unknownDevice is checked, simulate an unregistered device
  useEffect(() => {
    if (unknownDevice) {
      setDeviceID('DEV-UNKNOWN-' + Math.floor(100 + Math.random() * 900));
    } else {
      const num = parseInt(userIDInput, 10);
      const user = users.find((u) => u.userID === num);
      if (user) setDeviceID(user.deviceID);
    }
  }, [unknownDevice]);

  // Query C backend whenever risk flags change
  useEffect(() => {
    let isCancelled = false;
    const updateRisk = async () => {
      setCalculatingRisk(true);
      try {
        const score = await calculateRiskFromC(unknownDevice, unusualTime, unusualLocation);
        if (!isCancelled) {
          setLiveRiskScore(score);
        }
      } catch (err) {
        console.error('Failed to query C risk calculator:', err);
      } finally {
        if (!isCancelled) setCalculatingRisk(false);
      }
    };

    updateRisk();
    return () => {
      isCancelled = true;
    };
  }, [unknownDevice, unusualTime, unusualLocation]);

  const handleSubmit = async (autoProcess: boolean) => {
    const uid = parseInt(userIDInput, 10);
    const rid = parseInt(resourceIDInput, 10);
    if (isNaN(uid) || isNaN(rid) || !deviceID.trim()) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await onSubmitRequest({
        userID: uid,
        resourceID: rid,
        deviceID: deviceID.trim(),
        unknownDevice,
        unusualTime,
        unusualLocation,
        autoProcess,
      });
      setResult(res);
    } catch (err: any) {
      setResult({ success: false, error: err.message || 'C backend request failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find((u) => u.userID === parseInt(userIDInput, 10));
  const selectedResource = resources.find((r) => r.resourceID === parseInt(resourceIDInput, 10));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Access Request Center</span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">
            (Zero Trust Verification Pipeline)
          </span>
        </h2>
        <p className="text-xs text-slate-400">
          Identity authentication (Hash Table) ➔ RBAC check (Resource Array) ➔ Contextual Risk Assessment (C Engine)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Access Request Form */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target User ID
              </label>
              {users.length > 0 ? (
                <select
                  value={userIDInput}
                  onChange={(e) => setUserIDInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">Select a user...</option>
                  {users.map((u) => (
                    <option key={u.userID} value={u.userID}>
                      UID {u.userID} - {u.name} ({u.role}) {u.blocked ? '[BLOCKED]' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="Enter User ID (e.g. 101)"
                  value={userIDInput}
                  onChange={(e) => setUserIDInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              )}
              {selectedUser && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Role: <span className="text-slate-300">{selectedUser.role}</span> · Status:{' '}
                  <span className={selectedUser.blocked ? 'text-rose-400' : 'text-emerald-400'}>
                    {selectedUser.blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              )}
            </div>

            {/* Resource ID */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Cloud Resource ID
              </label>
              {resources.length > 0 ? (
                <select
                  value={resourceIDInput}
                  onChange={(e) => setResourceIDInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">Select a resource...</option>
                  {resources.map((r) => (
                    <option key={r.resourceID} value={r.resourceID}>
                      RES {r.resourceID} - {r.name} (Req: {r.requiredRole})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  placeholder="Enter Resource ID (e.g. 201)"
                  value={resourceIDInput}
                  onChange={(e) => setResourceIDInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              )}
              {selectedResource && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Required Role: <span className="text-cyan-400">{selectedResource.requiredRole}</span>
                </div>
              )}
            </div>
          </div>

          {/* Device ID */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Access Hardware Device ID
            </label>
            <input
              type="text"
              value={deviceID}
              onChange={(e) => setDeviceID(e.target.value)}
              placeholder="e.g. DEV-01"
              className="w-full px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Contextual Risk Indicators */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="text-[11px] font-mono text-slate-400">Contextual Risk Factors</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded border cursor-pointer transition text-xs flex items-center justify-between ${
                  unknownDevice
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unknownDevice}
                    onChange={(e) => setUnknownDevice(e.target.checked)}
                    className="rounded bg-black/40 border-white/[0.1] text-rose-500 focus:ring-0"
                  />
                  <span>Unknown Device</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">+30</span>
              </label>

              <label
                className={`p-2.5 rounded border cursor-pointer transition text-xs flex items-center justify-between ${
                  unusualLocation
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unusualLocation}
                    onChange={(e) => setUnusualLocation(e.target.checked)}
                    className="rounded bg-black/40 border-white/[0.1] text-amber-500 focus:ring-0"
                  />
                  <span>Unusual Location</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">+25</span>
              </label>

              <label
                className={`p-2.5 rounded border cursor-pointer transition text-xs flex items-center justify-between ${
                  unusualTime
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unusualTime}
                    onChange={(e) => setUnusualTime(e.target.checked)}
                    className="rounded bg-black/40 border-white/[0.1] text-cyan-500 focus:ring-0"
                  />
                  <span>Unusual Time</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">+20</span>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>C calculateRisk() Score:</span>
              <span className="font-bold text-white font-mono bg-white/[0.06] px-2 py-0.5 rounded">
                {calculatingRisk ? '...' : `${liveRiskScore} pts`}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting || !userIDInput || !resourceIDInput || !deviceID}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition disabled:opacity-40"
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enqueue into Queue</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting || !userIDInput || !resourceIDInput || !deviceID}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{submitting ? 'Evaluating...' : 'Evaluate Immediately'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-200">C Decision Output</div>

            {result ? (
              result.success ? (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded text-center border font-mono ${
                      result.decision === 'GRANTED'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : result.decision === 'DENIED'
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                        : 'bg-amber-950/20 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <div className="text-base font-bold">
                      {result.autoProcessed ? result.decision : 'ENQUEUED'}
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                      {result.autoProcessed ? result.reason : result.message}
                    </div>
                  </div>

                  <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Request ID:</span>
                      <span className="text-slate-300">#{result.requestID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Calculated Risk:</span>
                      <span className="text-slate-300 font-bold">{result.riskScore} pts</span>
                    </div>
                    {result.sessionID > 0 && (
                      <div className="flex justify-between text-emerald-400 pt-1 border-t border-white/[0.04]">
                        <span>Session Created:</span>
                        <span className="font-bold">SID #{result.sessionID}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                  {result.error}
                </div>
              )
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                Submit an access request to view C Zero Trust evaluation output.
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-600 pt-3 border-t border-white/[0.04]">
            Rule: Blocked ➔ DENIED | Role Mismatch ➔ DENIED | Risk &ge; 30 ➔ REVIEW | Risk &lt; 30 ➔ GRANTED
          </div>
        </div>
      </div>
    </div>
  );
};
