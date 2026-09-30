import React, { useState } from 'react';
import { RotateCw, Play } from 'lucide-react';
import { QueueState } from '../types';

interface QueueVisualizerPageProps {
  queue: QueueState;
  onProcessNext: () => Promise<any>;
  processingQueue: boolean;
}

export const QueueVisualizerPage: React.FC<QueueVisualizerPageProps> = ({
  queue,
  onProcessNext,
  processingQueue,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [lastProcessed, setLastProcessed] = useState<any | null>(null);

  const handleProcess = async () => {
    try {
      const res = await onProcessNext();
      setLastProcessed(res);
    } catch (err: any) {
      setLastProcessed({ success: false, error: err.message });
    }
  };

  const VISUAL_SLOTS = 16;
  const radius = 120;
  const centerX = 140;
  const centerY = 140;

  const slotMap: { [slotIdx: number]: any } = {};
  queue.items.forEach((item) => {
    const visualSlot = item.slot % VISUAL_SLOTS;
    slotMap[visualSlot] = item;
  });

  const frontVisual = queue.front % VISUAL_SLOTS;
  const rearVisual = queue.rear % VISUAL_SLOTS;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Circular Queue Buffer</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (queue.c · items[100])
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Modulo arithmetic (index + 1) % 100 provides O(1) FIFO enqueue and dequeue with zero element shifting
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={processingQueue || queue.count === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition disabled:opacity-40"
        >
          <Play className={`w-3 h-3 ${processingQueue ? 'animate-spin' : ''}`} />
          <span>{processingQueue ? 'Processing...' : `Process Next Request (${queue.count})`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Circular Queue Ring Visualizer */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Circular Buffer Ring (16 Visible Slots)</span>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-cyan-400">FRONT: {queue.front}</span>
              <span className="text-amber-400">REAR: {queue.rear}</span>
              <span>Count: {queue.count}</span>
            </div>
          </div>

          {/* SVG Circular Dial */}
          <div className="relative w-72 h-72 flex items-center justify-center my-3">
            {/* Center Hub */}
            <div className="w-28 h-28 rounded-full bg-[#0e121a] border border-white/[0.08] flex flex-col items-center justify-center text-center p-2 z-10 font-mono">
              <span className="text-[10px] text-slate-500">PENDING</span>
              <div className="text-2xl font-bold text-slate-100">{queue.count}</div>
              <span className="text-[9px] text-slate-500">of 100 max</span>
            </div>

            {/* Circular Ring Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>

            {/* Render 16 Slots around the circumference */}
            {Array.from({ length: VISUAL_SLOTS }).map((_, slotIdx) => {
              const angle = (slotIdx / VISUAL_SLOTS) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);

              const item = slotMap[slotIdx];
              const isFront = frontVisual === slotIdx;
              const isRear = rearVisual === slotIdx;
              const isOccupied = !!item;
              const isSelected = selectedSlot === slotIdx;

              return (
                <div
                  key={slotIdx}
                  onClick={() => setSelectedSlot(slotIdx)}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded border flex flex-col items-center justify-center cursor-pointer transition select-none font-mono ${
                    isSelected ? 'ring-1 ring-cyan-400 z-20 scale-105' : ''
                  } ${
                    isOccupied
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                      : 'bg-black/40 border-white/[0.06] text-slate-600'
                  }`}
                  title={item ? `Slot ${slotIdx}: Req #${item.requestID}` : `Slot ${slotIdx}: Empty`}
                >
                  <span className="text-[8px] leading-none text-slate-500">#{slotIdx}</span>
                  <span className="text-[9px] font-bold leading-none mt-0.5">
                    {isOccupied ? `R${item.requestID}` : '·'}
                  </span>

                  {isFront && (
                    <span className="absolute -top-2.5 px-1 rounded text-[7px] font-bold bg-cyan-400 text-black uppercase">
                      F
                    </span>
                  )}
                  {isRear && (
                    <span className="absolute -bottom-2.5 px-1 rounded text-[7px] font-bold bg-amber-400 text-black uppercase">
                      R
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/[0.04]">
            <span>F = Dequeue Read Pointer</span>
            <span>R = Enqueue Write Pointer</span>
          </div>
        </div>

        {/* Slot Inspector & Last Decision */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-2">
            <div className="text-xs font-semibold text-slate-200">Slot Inspector</div>
            {selectedSlot !== null ? (
              slotMap[selectedSlot] ? (
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono space-y-1">
                  <div className="text-cyan-400 font-bold">Slot #{selectedSlot}</div>
                  <div className="text-slate-300">Request: #{slotMap[selectedSlot].requestID}</div>
                  <div className="text-slate-400">User: {slotMap[selectedSlot].userID}</div>
                  <div className="text-slate-400">Resource: {slotMap[selectedSlot].resourceID}</div>
                  <div className="text-slate-400">Device: {slotMap[selectedSlot].deviceID}</div>
                  <div className="text-amber-400">Risk Score: {slotMap[selectedSlot].riskScore}</div>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-500">Slot #{selectedSlot} is empty.</div>
              )
            ) : (
              <div className="text-[11px] font-mono text-slate-500">
                Click any slot dot on the ring to inspect stored request payload.
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-2">
            <div className="text-xs font-semibold text-slate-200">Last Dequeued Decision</div>
            {lastProcessed ? (
              lastProcessed.success ? (
                <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Req #{lastProcessed.requestID}</span>
                    <span
                      className={
                        lastProcessed.decision === 'GRANTED'
                          ? 'text-emerald-400'
                          : lastProcessed.decision === 'DENIED'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }
                    >
                      {lastProcessed.decision}
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans">{lastProcessed.reason}</div>
                  <div className="text-slate-500 text-[10px]">Queue Remaining: {lastProcessed.queueRemaining}</div>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-rose-400">{lastProcessed.error}</div>
              )
            ) : (
              <div className="text-[11px] font-mono text-slate-500">No requests processed yet this session.</div>
            )}
          </div>
        </div>
      </div>

      {/* FIFO Queue Table */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="text-xs font-semibold text-slate-200">Pending FIFO Request Sequence</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">Queue Pos</th>
                <th className="py-2 px-2.5">Slot #</th>
                <th className="py-2 px-2.5">Req #</th>
                <th className="py-2 px-2.5">User</th>
                <th className="py-2 px-2.5">Resource</th>
                <th className="py-2 px-2.5">Device</th>
                <th className="py-2 px-2.5">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {queue.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-mono">
                    Circular Queue is empty. Submit a request from "Access Requests" to populate.
                  </td>
                </tr>
              ) : (
                queue.items.map((item, idx) => (
                  <tr key={item.requestID} className="hover:bg-white/[0.02] transition font-mono">
                    <td className="py-2.5 px-2.5 text-cyan-400">{idx === 0 ? '0 (FRONT)' : idx}</td>
                    <td className="py-2.5 px-2.5 text-slate-500">Slot #{item.slot}</td>
                    <td className="py-2.5 px-2.5 text-slate-200">#{item.requestID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">UID: {item.userID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">RES: {item.resourceID}</td>
                    <td className="py-2.5 px-2.5 text-slate-400">{item.deviceID}</td>
                    <td className="py-2.5 px-2.5 text-slate-300">{item.riskScore}</td>
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
