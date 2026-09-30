import React from 'react';
import {
  LayoutDashboard,
  Users,
  Server,
  KeyRound,
  RotateCw,
  ShieldAlert,
  FileText,
  Radio,
  Binary,
  Database,
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  pendingCount: number;
  threatCount: number;
  activeSessionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  pendingCount,
  threatCount,
  activeSessionCount,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'resources', label: 'Cloud Resources', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'access-requests', label: 'Access Requests', icon: <KeyRound className="w-3.5 h-3.5" /> },
    {
      id: 'queue',
      label: 'Request Queue',
      icon: <RotateCw className="w-3.5 h-3.5" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      id: 'threats',
      label: 'Threat Monitoring',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      badge: threatCount > 0 ? threatCount : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    { id: 'logs', label: 'Access Logs', icon: <FileText className="w-3.5 h-3.5" /> },
    {
      id: 'sessions',
      label: 'Active Sessions',
      icon: <Radio className="w-3.5 h-3.5" />,
      badge: activeSessionCount > 0 ? activeSessionCount : undefined,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    { id: 'data-structures', label: 'Data Structures Lab', icon: <Binary className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Storage & System', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="w-60 bg-[#0b0e14] border-r border-white/[0.06] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center border border-white/10 text-white font-mono text-xs font-bold">
            Z
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-100 flex items-center gap-1">
              <span>ZeroTrust</span>
              <span className="text-cyan-400 font-mono">X</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 tracking-tight">C99 Engine</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-white/[0.07] text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Minimal Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-black/20 text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>C Data Structures:</span>
        <span className="text-slate-400">POSIX Flat Files</span>
      </div>
    </aside>
  );
};
