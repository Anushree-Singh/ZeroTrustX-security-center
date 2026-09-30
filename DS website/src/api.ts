import { FullStatus } from './types';

export async function fetchStatus(): Promise<FullStatus> {
  const res = await fetch('/api/status');
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`C Backend unreachable (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function calculateRiskFromC(
  unknownDevice: boolean,
  unusualTime: boolean,
  unusualLocation: boolean
): Promise<number> {
  const res = await fetch('/api/requests/calculate-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unknownDevice, unusualTime, unusualLocation }),
  });
  if (!res.ok) throw new Error('Risk calculation failed in C backend');
  const data = await res.json();
  return data.riskScore ?? 0;
}

export async function submitAccessRequest(payload: {
  userID: number;
  resourceID: number;
  deviceID: string;
  unknownDevice: boolean;
  unusualTime: boolean;
  unusualLocation: boolean;
  autoProcess?: boolean;
}) {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function processNextInQueue() {
  const res = await fetch('/api/queue/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function blockUserInC(userID: number) {
  const res = await fetch(`/api/users/${userID}/block`, {
    method: 'POST',
  });
  return res.json();
}

export async function unblockUserInC(userID: number) {
  const res = await fetch(`/api/users/${userID}/unblock`, {
    method: 'POST',
  });
  return res.json();
}

export async function createUserInC(payload: {
  userID: number;
  name: string;
  role: string;
  deviceID: string;
}) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function createResourceInC(payload: {
  resourceID: number;
  name: string;
  requiredRole: string;
}) {
  const res = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function revokeSessionInC(sessionID: number) {
  const res = await fetch(`/api/sessions/${sessionID}/revoke`, {
    method: 'POST',
  });
  return res.json();
}

export async function revalidateSessionInC(sessionID: number, currentDevice: string) {
  const res = await fetch(`/api/sessions/${sessionID}/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentDevice }),
  });
  return res.json();
}

export async function seedDemoDataInC() {
  const res = await fetch('/api/demo/seed', {
    method: 'POST',
  });
  return res.json();
}

export async function clearAllDataInC() {
  const res = await fetch('/api/clear', {
    method: 'POST',
  });
  return res.json();
}

export async function fetchRawFiles(): Promise<{ files: Record<string, string> }> {
  const res = await fetch('/api/files');
  if (!res.ok) throw new Error('Failed to read C storage files');
  return res.json();
}
