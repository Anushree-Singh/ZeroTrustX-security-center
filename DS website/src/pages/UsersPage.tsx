import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { User } from '../types';

interface UsersPageProps {
  users: User[];
  onBlockUser: (userID: number) => Promise<void>;
  onUnblockUser: (userID: number) => Promise<void>;
  onCreateUser: (user: { userID: number; name: string; role: string; deviceID: string }) => Promise<{ success: boolean; error?: string }>;
  refreshing: boolean;
}

export const UsersPage: React.FC<UsersPageProps> = ({
  users,
  onBlockUser,
  onUnblockUser,
  onCreateUser,
  refreshing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHashBuckets, setShowHashBuckets] = useState(false);

  // Form state
  const [newUserID, setNewUserID] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Developer');
  const [newDeviceID, setNewDeviceID] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.deviceID.toLowerCase().includes(q) ||
      String(u.userID).includes(q)
    );
  });

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const uid = parseInt(newUserID, 10);
    if (isNaN(uid) || uid <= 0) {
      setFormError('Please enter a valid positive numeric User ID.');
      return;
    }
    if (!newName.trim() || !newDeviceID.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onCreateUser({
        userID: uid,
        name: newName.trim(),
        role: newRole.trim(),
        deviceID: newDeviceID.trim(),
      });
      if (res.success) {
        setShowAddModal(false);
        setNewUserID('');
        setNewName('');
        setNewDeviceID('');
      } else {
        setFormError(res.error || 'Failed to add user to C backend.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with C backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group users into 31 Hash Buckets for the Hash Table visualization
  const buckets: { [bucketIdx: number]: User[] } = {};
  for (let i = 0; i < 31; i++) buckets[i] = [];
  users.forEach((u) => {
    const b = u.userID % 31;
    buckets[b].push(u);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>User Identities</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (Hash Table · table[31])
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Stored in C hash table with separate chaining for O(1) identity verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHashBuckets(!showHashBuckets)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>{showHashBuckets ? 'Hide Buckets' : 'Inspect Hash Buckets'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register User</span>
          </button>
        </div>
      </div>

      {/* Collapsible Hash Buckets Inspection */}
      {showHashBuckets && (
        <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Hash Table Buckets (0..30)</span>
            <span className="font-mono text-slate-500">hash(id) = id % 31</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 31 }).map((_, bucketIdx) => {
              const chain = buckets[bucketIdx] || [];
              const hasUsers = chain.length > 0;
              return (
                <div
                  key={bucketIdx}
                  className={`p-2 rounded border font-mono text-[10px] ${
                    hasUsers
                      ? 'bg-white/[0.04] border-cyan-500/30 text-slate-200'
                      : 'bg-transparent border-white/[0.03] text-slate-600'
                  }`}
                >
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>B[{bucketIdx}]</span>
                    <span>{chain.length}</span>
                  </div>
                  {chain.map((u) => (
                    <div key={u.userID} className="text-cyan-300 truncate">
                      #{u.userID} {u.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {filteredUsers.length} of {users.length} users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">User ID</th>
                <th className="py-2 px-2.5">Name</th>
                <th className="py-2 px-2.5">Role</th>
                <th className="py-2 px-2.5">Device ID</th>
                <th className="py-2 px-2.5">Bucket</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs font-mono">
                    {users.length === 0
                      ? 'No users in C hash table. Click "Register User" above to add your first user.'
                      : 'No users matching your filter.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBlocked = u.blocked === 1;
                  return (
                    <tr key={u.userID} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-2.5 font-mono text-slate-300">UID: {u.userID}</td>
                      <td className="py-2.5 px-2.5 font-medium text-slate-200">{u.name}</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-400">{u.role}</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-400">{u.deviceID}</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-500">#{u.userID % 31}</td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`text-[10px] font-mono font-medium ${
                            isBlocked ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        {isBlocked ? (
                          <button
                            onClick={() => onUnblockUser(u.userID)}
                            disabled={refreshing}
                            className="text-[11px] font-mono text-emerald-400 hover:underline disabled:opacity-50"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => onBlockUser(u.userID)}
                            disabled={refreshing}
                            className="text-[11px] font-mono text-rose-400 hover:underline disabled:opacity-50"
                          >
                            Block
                          </button>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg bg-[#0e121a] border border-white/[0.1] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-100 font-mono">
                Register User into C Hash Table
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-3 mt-3">
              {formError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  User ID (Positive integer)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 101"
                  value={newUserID}
                  onChange={(e) => setNewUserID(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="SecOps">SecOps</option>
                  <option value="Developer">Developer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Authorized Device ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEV-01"
                  value={newDeviceID}
                  onChange={(e) => setNewDeviceID(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1 rounded text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
