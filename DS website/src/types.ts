export interface User {
  userID: number;
  name: string;
  role: string;
  deviceID: string;
  blocked: number;
  bucket?: number;
}

export interface Resource {
  resourceID: number;
  name: string;
  requiredRole: string;
}

export interface QueueItem {
  queueIndex: number;
  slot: number;
  requestID: number;
  userID: number;
  resourceID: number;
  deviceID: string;
  unknownDevice: number;
  unusualTime: number;
  unusualLocation: number;
  riskScore: number;
}

export interface QueueState {
  front: number;
  rear: number;
  count: number;
  capacity: number;
  items: QueueItem[];
}

export interface LogItem {
  requestID: number;
  userID: number;
  resourceID: number;
  riskScore: number;
  decision: 'GRANTED' | 'DENIED' | 'REVIEW' | string;
  reason: string;
}

export interface SessionItem {
  sessionID: number;
  userID: number;
  resourceID: number;
  deviceID: string;
  active: number;
}

export interface ThreatItem {
  requestID: number;
  userID: number;
  resourceID: number;
  riskScore: number;
  threatType: 'HIGH_RISK_ANOMALY' | 'REPEATED_DENIAL_BRUTE_FORCE' | 'HIGH_RISK_AND_REPEATED_DENIAL' | string;
  deniedCount: number;
  decision: string;
  reason: string;
}

export interface SystemStats {
  totalUsers: number;
  totalResources: number;
  pendingRequests: number;
  totalLogs: number;
  highRiskLogs: number;
  activeSessions: number;
  grantedCount: number;
  deniedCount: number;
  reviewCount: number;
}

export interface FullStatus {
  users: User[];
  resources: Resource[];
  queue: QueueState;
  logs: LogItem[];
  sessions: SessionItem[];
  threats: ThreatItem[];
  stats: SystemStats;
  cBackendUnavailable?: boolean;
}

export type PageId =
  | 'dashboard'
  | 'users'
  | 'resources'
  | 'access-requests'
  | 'queue'
  | 'threats'
  | 'logs'
  | 'sessions'
  | 'data-structures'
  | 'admin';
