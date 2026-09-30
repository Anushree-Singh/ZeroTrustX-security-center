import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Resource } from '../types';

interface ResourcesPageProps {
  resources: Resource[];
  onCreateResource: (res: { resourceID: number; name: string; requiredRole: string }) => Promise<{ success: boolean; error?: string }>;
  refreshing: boolean;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  resources,
  onCreateResource,
  refreshing,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newID, setNewID] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Developer');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const rid = parseInt(newID, 10);
    if (isNaN(rid) || rid <= 0) {
      setFormError('Please enter a valid positive numeric Resource ID.');
      return;
    }
    if (!newName.trim()) {
      setFormError('Please enter a resource name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await onCreateResource({
        resourceID: rid,
        name: newName.trim(),
        requiredRole: newRole.trim(),
      });
      if (res.success) {
        setShowAddModal(false);
        setNewID('');
        setNewName('');
      } else {
        setFormError(res.error || 'Failed to add resource in C backend.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error communicating with C backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Cloud Resources</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (Static Array · Resource resources[100])
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Protected cloud targets evaluated for Role-Based Access Control (RBAC) in C
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Registered Cloud Assets</span>
          <span className="font-mono text-slate-500">{resources.length} / 100 slots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[11px]">
                <th className="py-2 px-2.5">Slot</th>
                <th className="py-2 px-2.5">Resource ID</th>
                <th className="py-2 px-2.5">Resource Name</th>
                <th className="py-2 px-2.5">Required Role (RBAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500 text-xs font-mono">
                    No cloud resources in C array. Click "Add Resource" above to create one.
                  </td>
                </tr>
              ) : (
                resources.map((r, index) => (
                  <tr key={r.resourceID} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-2.5 font-mono text-slate-600">[{index}]</td>
                    <td className="py-2.5 px-2.5 font-mono text-slate-300">RES-{r.resourceID}</td>
                    <td className="py-2.5 px-2.5 font-medium text-slate-200">{r.name}</td>
                    <td className="py-2.5 px-2.5 font-mono text-cyan-400">{r.requiredRole}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg bg-[#0e121a] border border-white/[0.1] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-slate-100 font-mono">
                Add Resource into C Array
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              {formError && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Resource ID (Positive integer)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 201"
                  value={newID}
                  onChange={(e) => setNewID(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Production Cluster"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-black/30 border border-white/[0.1] text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Required Role
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
                  {submitting ? 'Saving...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
