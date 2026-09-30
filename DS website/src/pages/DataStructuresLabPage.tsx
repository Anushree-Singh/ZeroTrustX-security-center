import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FullStatus } from '../types';

interface DataStructuresLabPageProps {
  status: FullStatus;
}

export const DataStructuresLabPage: React.FC<DataStructuresLabPageProps> = ({ status }) => {
  const [activeTab, setActiveTab] = useState<'hashtable' | 'queue' | 'linkedlist' | 'arrays' | 'viva'>('hashtable');
  const [expandedViva, setExpandedViva] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'Why was a Hash Table with Separate Chaining chosen for User lookup instead of a simple Array or Linked List?',
      a: 'In Zero Trust, every access request requires instantaneous user identity verification. A linear search over an array or list requires O(N) operations. The Hash Table with prime size 31 achieves O(1) average lookup time. Separate chaining cleanly accommodates collisions with linked lists without primary clustering.',
      code: 'int hashID(int id) { if (id < 0) id = -id; return id % HASH_SIZE; }\n\nUser *getUser(int userID) {\n    UserNode *p = table[hashID(userID)];\n    while (p != NULL) {\n        if (p->data.userID == userID) return &p->data;\n        p = p->next;\n    }\n    return NULL;\n}',
    },
    {
      q: 'Why use a Circular Queue for pending access requests instead of a standard linear array queue?',
      a: 'A standard linear queue either requires shifting all remaining elements left upon every dequeue (taking O(N) time) or suffers memory fragmentation. A Circular Queue wraps around using modulo arithmetic: `rear = (rear + 1) % QUEUE_SIZE` and `front = (front + 1) % QUEUE_SIZE`. This yields strictly O(1) enqueue and dequeue with zero memory waste.',
      code: 'int enqueue(AccessRequest request) {\n    if (count == QUEUE_SIZE) return 0;\n    items[rear] = request;\n    rear = (rear + 1) % QUEUE_SIZE;\n    count++;\n    return 1;\n}\n\nint dequeue(AccessRequest *request) {\n    if (count == 0) return 0;\n    *request = items[front];\n    front = (front + 1) % QUEUE_SIZE;\n    count--;\n    return 1;\n}',
    },
    {
      q: 'How does the Singly Linked List for access logs ensure chronological order and O(1) logging time?',
      a: 'In log.c, each new log entry is dynamically allocated using malloc() and prepended directly to the head pointer (`node->next = head; head = node;`). Prepending takes O(1) constant time without traversing to the end. Iterating from head naturally yields reverse-chronological order (newest logs first).',
      code: 'void addLog(int requestID, int userID, int resourceID, int riskScore,\n            const char *decision, const char *reason) {\n    LogNode *node = (LogNode *)malloc(sizeof(LogNode));\n    if (node == NULL) return;\n    node->next = head;\n    head = node;\n    logs++;\n}',
    },
    {
      q: 'How are memory leaks prevented when the C program terminates?',
      a: 'ZeroTrustX implements explicit cleanup routines: freeLogs() frees each LogNode in the linked list using a temporary pointer, and clearUsers() traverses every bucket from 0 to HASH_SIZE - 1 to free each UserNode. All files are safely flushed and closed with fclose().',
      code: 'void freeLogs(void) {\n    LogNode *p = head, *next;\n    while (p != NULL) {\n        next = p->next;\n        free(p);\n        p = next;\n    }\n    head = NULL;\n    logs = 0;\n}',
    },
    {
      q: 'Why are contiguous arrays suitable for Cloud Resources and Active Sessions?',
      a: 'Cloud resources and active sessions have bounded maximum sizes (100) and benefit from contiguous memory cache locality. Looking up an active session or iterating through resources has predictable memory footprint with zero pointer dereferencing overhead.',
      code: 'static Session sessions[MAX_SESSIONS];\nstatic Resource resources[100];',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Data Structures Lab</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (Academic Viva Reference)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Theoretical foundation, time complexities, and architectural decisions of ZeroTrustX
          </p>
        </div>

        <div className="flex gap-1 text-xs font-mono">
          {[
            { id: 'hashtable', label: 'Hash Table' },
            { id: 'queue', label: 'Circular Queue' },
            { id: 'linkedlist', label: 'Linked List' },
            { id: 'arrays', label: 'Arrays' },
            { id: 'viva', label: 'Viva Q&A' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                activeTab === tab.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Hash Table */}
      {activeTab === 'hashtable' && (
        <div className="p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Hash Table with Separate Chaining (user.c)</span>
            <span className="font-mono text-cyan-400">HASH_SIZE = 31 (Prime)</span>
          </div>
          <p className="text-xs text-slate-400">
            Users are stored using a hash table with separate chaining. The hash function computes <span className="font-mono text-slate-300">hash(id) = abs(id) % 31</span> to locate the bucket. Collisions are resolved by chaining nodes in a singly linked list.
          </p>

          <div className="p-3.5 rounded bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="leading-relaxed">
{`Hash Table
│
├── Bucket 0  ──> NULL
├── Bucket 1  ──> [ User ] ──> [ User ] ──> NULL
├── Bucket 2  ──> NULL
├── Bucket 3  ──> [ User ] ──> NULL
└── ...`}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/[0.06]">
            <div>
              <span className="text-slate-500 block text-[10px]">Average Lookup:</span>
              <span className="text-emerald-400 font-bold">O(1) Constant Time</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Collision Strategy:</span>
              <span className="text-slate-200">Separate Chaining with Linked Lists</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Circular Queue */}
      {activeTab === 'queue' && (
        <div className="p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Circular Queue (queue.c)</span>
            <span className="font-mono text-cyan-400">Capacity = 100</span>
          </div>
          <p className="text-xs text-slate-400">
            Pending access requests move through a ring buffer:
          </p>

          <div className="p-3.5 rounded bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="leading-relaxed">
{`FRONT → [Request] → [Request] → [Request] → REAR
  ↑                                            ↓
  └────────────────── (i + 1) % 100 ───────────┘`}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/[0.06]">
            <div>
              <span className="text-slate-500 block text-[10px]">Enqueue / Dequeue:</span>
              <span className="text-emerald-400 font-bold">O(1) Constant Time</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Memory Shifting:</span>
              <span className="text-slate-200">Zero Shifting Required</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Singly Linked List */}
      {activeTab === 'linkedlist' && (
        <div className="p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Singly Linked List (log.c)</span>
            <span className="font-mono text-cyan-400">Dynamic Allocation</span>
          </div>
          <p className="text-xs text-slate-400">
            Access logs are stored as connected nodes prepended to the head pointer:
          </p>

          <div className="p-3.5 rounded bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="leading-relaxed">
{`[Log] → [Log] → [Log] → [Log] → NULL`}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/[0.06]">
            <div>
              <span className="text-slate-500 block text-[10px]">Prepend to Head:</span>
              <span className="text-emerald-400 font-bold">O(1) Constant Time</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Traversal:</span>
              <span className="text-slate-200">Reverse-Chronological (Newest First)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Arrays */}
      {activeTab === 'arrays' && (
        <div className="p-5 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Contiguous Arrays (resource.c &amp; session.c)</span>
            <span className="font-mono text-cyan-400">Bounded Fixed Sizes</span>
          </div>
          <p className="text-xs text-slate-400">
            Resources and active sessions are stored using contiguous C arrays for cache efficiency:
          </p>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded bg-black/30 border border-white/[0.06]">
              <div className="text-slate-200 font-bold">Resource resources[100];</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct indexing for cloud RBAC checks.</div>
            </div>
            <div className="p-3 rounded bg-black/30 border border-white/[0.06]">
              <div className="text-slate-200 font-bold">Session sessions[100];</div>
              <div className="text-[11px] text-slate-400 mt-1">Active session leases with device binding.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Viva Cheat-Sheet */}
      {activeTab === 'viva' && (
        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isExpanded = expandedViva === idx;
            return (
              <div
                key={idx}
                className="rounded-lg bg-[#0b0e14] border border-white/[0.06] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedViva(isExpanded ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-white/[0.02] transition"
                >
                  <span className="text-xs font-semibold text-slate-200">
                    Q{idx + 1}: {item.q}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-white/[0.04] space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">{item.a}</p>
                    <div className="p-2.5 rounded bg-black/40 border border-white/[0.06] font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                      {item.code}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
