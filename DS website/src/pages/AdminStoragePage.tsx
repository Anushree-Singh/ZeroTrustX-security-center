import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Trash2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { fetchRawFiles, seedDemoDataInC, clearAllDataInC } from '../api';

interface AdminStoragePageProps {
  onRefreshAll: () => Promise<void>;
  refreshing: boolean;
}

export const AdminStoragePage: React.FC<AdminStoragePageProps> = ({ onRefreshAll, refreshing }) => {
  const [filesData, setFilesData] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('users.txt');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await fetchRawFiles();
      setFilesData(data.files || {});
    } catch (err) {
      console.error('Failed to load raw storage files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm('Clear all data in C backend? (This will reset users.txt, resources.txt, logs.txt to blank)')) {
      return;
    }
    try {
      await clearAllDataInC();
      await loadFiles();
      await onRefreshAll();
    } catch (err) {
      console.error('Failed to clear database:', err);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemoDataInC();
      await loadFiles();
      await onRefreshAll();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    }
  };

  const copyBuildCommand = () => {
    navigator.clipboard.writeText(
      'gcc main.c user.c resource.c queue.c log.c session.c security.c storage.c -o zerotrustx'
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const availableFiles = ['users.txt', 'resources.txt', 'logs.txt', 'sessions.txt', 'queue.txt'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>POSIX File Storage</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              (storage.c · *.txt)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real on-disk persistence used by C backend. No external databases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-500/20 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear to Blank</span>
          </button>
          <button
            onClick={handleSeedDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* Raw File Storage Viewer */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 text-xs font-mono">
            {availableFiles.map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`px-2.5 py-1 rounded text-[11px] transition ${
                  selectedFile === file
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          <button
            onClick={loadFiles}
            disabled={loadingFiles}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
            title="Reload from disk"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="rounded bg-black/40 border border-white/[0.06] p-3 font-mono text-xs text-slate-300 overflow-x-auto min-h-[140px]">
          <div className="text-[10px] text-slate-600 pb-1 mb-2 border-b border-white/[0.04]">
            c-backend/{selectedFile}
          </div>
          <pre className="text-cyan-300/80 whitespace-pre leading-relaxed">
            {filesData[selectedFile] || '(File is empty)'}
          </pre>
        </div>
      </div>

      {/* C CLI Build Commands */}
      <div className="p-4 rounded-lg bg-[#0b0e14] border border-white/[0.06] space-y-2">
        <div className="text-xs font-semibold text-slate-200">Terminal Compilation Command</div>
        <div className="p-2.5 rounded bg-black/30 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300 select-all">
            gcc main.c user.c resource.c queue.c log.c session.c security.c storage.c -o zerotrustx
          </span>
          <button
            onClick={copyBuildCommand}
            className="p-1 text-slate-400 hover:text-white transition"
            title="Copy command"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
