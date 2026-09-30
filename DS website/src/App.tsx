import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AccessRequestPage } from './pages/AccessRequestPage';
import { QueueVisualizerPage } from './pages/QueueVisualizerPage';
import { ThreatMonitoringPage } from './pages/ThreatMonitoringPage';
import { AccessLogsPage } from './pages/AccessLogsPage';
import { ActiveSessionsPage } from './pages/ActiveSessionsPage';
import { DataStructuresLabPage } from './pages/DataStructuresLabPage';
import { AdminStoragePage } from './pages/AdminStoragePage';
import { FullStatus, PageId } from './types';
import {
  fetchStatus,
  blockUserInC,
  unblockUserInC,
  createUserInC,
  createResourceInC,
  submitAccessRequest,
  processNextInQueue,
  revokeSessionInC,
  revalidateSessionInC,
  seedDemoDataInC,
  clearAllDataInC,
} from './api';
import { AlertCircle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

const initialDefaultStatus: FullStatus = {
  users: [],
  resources: [],
  queue: { front: 0, rear: 0, count: 0, capacity: 100, items: [] },
  logs: [],
  sessions: [],
  threats: [],
  stats: {
    totalUsers: 0,
    totalResources: 0,
    pendingRequests: 0,
    totalLogs: 0,
    highRiskLogs: 0,
    activeSessions: 0,
    grantedCount: 0,
    deniedCount: 0,
    reviewCount: 0,
  },
};

// React Error Boundary to catch any unforeseen rendering errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ZeroTrustX UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-slate-100">ZeroTrustX Interface Alert</h2>
            <p className="text-xs text-slate-300">
              An error occurred while rendering the dashboard. Click below to reload.
            </p>
            <div className="p-3 rounded bg-slate-900 text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-32">
              {String(this.state.error?.message || this.state.error)}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [status, setStatus] = useState<FullStatus>(initialDefaultStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadBackendStatus = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const data = await fetchStatus();
      if (data && data.stats) {
        setStatus(data);
      }
    } catch (err: any) {
      console.error('Failed to communicate with C backend:', err);
      setError(err.message || 'Cannot connect to C backend binary');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendStatus(true);
  }, [loadBackendStatus]);

  // Handler: Block User in C Hash Table
  const handleBlockUser = async (userID: number) => {
    try {
      const res = await blockUserInC(userID);
      if (res.success) {
        showToast(`User #${userID} successfully BLOCKED in C hash table`);
        await loadBackendStatus();
      } else {
        showToast(res.error || 'Failed to block user', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Unblock User in C Hash Table
  const handleUnblockUser = async (userID: number) => {
    try {
      const res = await unblockUserInC(userID);
      if (res.success) {
        showToast(`User #${userID} UNBLOCKED in C hash table`);
        await loadBackendStatus();
      } else {
        showToast(res.error || 'Failed to unblock user', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Register User
  const handleCreateUser = async (payload: { userID: number; name: string; role: string; deviceID: string }) => {
    const res = await createUserInC(payload);
    if (res.success) {
      showToast(`User "${payload.name}" inserted into C hash table bucket #${payload.userID % 31}`);
      await loadBackendStatus();
    }
    return res;
  };

  // Handler: Add Resource
  const handleCreateResource = async (payload: { resourceID: number; name: string; requiredRole: string }) => {
    const res = await createResourceInC(payload);
    if (res.success) {
      showToast(`Resource "${payload.name}" added to C resources array`);
      await loadBackendStatus();
    }
    return res;
  };

  // Handler: Submit Request
  const handleSubmitRequest = async (payload: {
    userID: number;
    resourceID: number;
    deviceID: string;
    unknownDevice: boolean;
    unusualTime: boolean;
    unusualLocation: boolean;
    autoProcess: boolean;
  }) => {
    const res = await submitAccessRequest(payload);
    if (res.success) {
      if (res.autoProcessed) {
        showToast(`Zero Trust Decision: ${res.decision} (${res.reason})`);
      } else {
        showToast(`Request #${res.requestID} enqueued into Circular Queue`);
      }
      await loadBackendStatus();
    }
    return res;
  };

  // Handler: Process Next in Circular Queue
  const handleProcessNextQueue = async () => {
    setProcessingQueue(true);
    try {
      const res = await processNextInQueue();
      if (res.success) {
        showToast(`Dequeued Req #${res.requestID} ➔ ${res.decision}: ${res.reason}`);
        await loadBackendStatus();
      } else {
        showToast(res.error || 'Queue is empty', 'info');
      }
      return res;
    } catch (err: any) {
      showToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setProcessingQueue(false);
    }
  };

  // Handler: Revoke Session
  const handleRevokeSession = async (sessionID: number) => {
    try {
      const res = await revokeSessionInC(sessionID);
      if (res.success) {
        showToast(`Session SID #${sessionID} revoked in C memory & sessions.txt`);
        await loadBackendStatus();
      } else {
        showToast(res.error || 'Failed to revoke session', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Revalidate Session (Continuous Validation)
  const handleRevalidateSession = async (sessionID: number, currentDevice: string) => {
    const res = await revalidateSessionInC(sessionID, currentDevice);
    await loadBackendStatus();
    return res;
  };

  // Handler: Seed Demo Data
  const handleSeedDemo = async () => {
    try {
      await seedDemoDataInC();
      showToast('Realistic demo data seeded into C backend files');
      await loadBackendStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Clear All Data to Blank Slate
  const handleClearAll = async () => {
    if (!window.confirm('Clear all data to blank slate in C backend?')) return;
    try {
      await clearAllDataInC();
      showToast('All C data cleared to blank state', 'info');
      await loadBackendStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#090c10] text-slate-100 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded bg-[#161b22] border border-white/[0.1] shadow-xl text-xs font-mono">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
          <span className="text-slate-200">{toastMessage.text}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pendingCount={status.stats.pendingRequests ?? 0}
        threatCount={status.threats.length ?? 0}
        activeSessionCount={status.stats.activeSessions ?? 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          stats={status.stats}
          loading={loading}
          onRefresh={() => loadBackendStatus(false)}
          onClearAll={handleClearAll}
          cBackendStatus={error ? 'offline' : 'online'}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">C Backend Connection Alert:</span> {error}. Displaying buffered state.
                </div>
              </div>
              <button
                onClick={() => loadBackendStatus(true)}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              status={status}
              setCurrentPage={setCurrentPage}
              onProcessNext={handleProcessNextQueue}
              processingQueue={processingQueue}
            />
          )}

          {currentPage === 'users' && (
            <UsersPage
              users={status.users}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              onCreateUser={handleCreateUser}
              refreshing={loading}
            />
          )}

          {currentPage === 'resources' && (
            <ResourcesPage
              resources={status.resources}
              onCreateResource={handleCreateResource}
              refreshing={loading}
            />
          )}

          {currentPage === 'access-requests' && (
            <AccessRequestPage
              users={status.users}
              resources={status.resources}
              onSubmitRequest={handleSubmitRequest}
              refreshing={loading}
            />
          )}

          {currentPage === 'queue' && (
            <QueueVisualizerPage
              queue={status.queue}
              onProcessNext={handleProcessNextQueue}
              processingQueue={processingQueue}
            />
          )}

          {currentPage === 'threats' && (
            <ThreatMonitoringPage
              threats={status.threats}
              logs={status.logs}
              onBlockUser={handleBlockUser}
              refreshing={loading}
            />
          )}

          {currentPage === 'logs' && (
            <AccessLogsPage
              logs={status.logs}
              refreshing={loading}
            />
          )}

          {currentPage === 'sessions' && (
            <ActiveSessionsPage
              sessions={status.sessions}
              onRevokeSession={handleRevokeSession}
              onRevalidateSession={handleRevalidateSession}
              refreshing={loading}
            />
          )}

          {currentPage === 'data-structures' && (
            <DataStructuresLabPage status={status} />
          )}

          {currentPage === 'admin' && (
            <AdminStoragePage
              onRefreshAll={() => loadBackendStatus(false)}
              refreshing={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
