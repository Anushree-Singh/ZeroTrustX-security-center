import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { runCCommand } from './bridge.js';

const router = express.Router();
router.use(express.json());

// Path to C backend storage files
const cBackendDir = path.resolve(process.cwd(), 'c-backend');

// 1. Get full system state from C Backend
router.get('/status', async (req, res) => {
  const result = await runCCommand(['get-all']);
  if (result.cBackendUnavailable) {
    return res.status(503).json(result);
  }
  res.json(result);
});

// 2. Calculate risk strictly using C backend's calculateRisk()
router.post('/requests/calculate-risk', async (req, res) => {
  const { unknownDevice, unusualTime, unusualLocation } = req.body;
  const result = await runCCommand([
    'calculate-risk',
    unknownDevice ? '1' : '0',
    unusualTime ? '1' : '0',
    unusualLocation ? '1' : '0',
  ]);
  res.json(result);
});

// 3. Register a user in C Hash Table
router.post('/users', async (req, res) => {
  const { userID, name, role, deviceID } = req.body;
  if (!userID || !name || !role || !deviceID) {
    return res.status(400).json({ success: false, error: 'All fields (userID, name, role, deviceID) are required' });
  }

  const result = await runCCommand([
    'add-user',
    String(userID),
    name.replace(/\s+/g, ' ').trim(),
    role.trim(),
    deviceID.trim(),
  ]);
  res.json(result);
});

// 4. Block a user via C backend
router.post('/users/:id/block', async (req, res) => {
  const { id } = req.params;
  const result = await runCCommand(['block-user', String(id)]);
  res.json(result);
});

// 5. Unblock a user via C backend
router.post('/users/:id/unblock', async (req, res) => {
  const { id } = req.params;
  const result = await runCCommand(['unblock-user', String(id)]);
  res.json(result);
});

// 6. Add cloud resource to C array
router.post('/resources', async (req, res) => {
  const { resourceID, name, requiredRole } = req.body;
  if (!resourceID || !name || !requiredRole) {
    return res.status(400).json({ success: false, error: 'All fields (resourceID, name, requiredRole) are required' });
  }

  const result = await runCCommand([
    'add-resource',
    String(resourceID),
    name.trim(),
    requiredRole.trim(),
  ]);
  res.json(result);
});

// 7. Submit access request to C backend
// Options: enqueue only OR immediately process through C zero trust engine
router.post('/requests', async (req, res) => {
  const { userID, resourceID, deviceID, unknownDevice, unusualTime, unusualLocation, autoProcess } = req.body;
  if (!userID || !resourceID || !deviceID) {
    return res.status(400).json({ success: false, error: 'Missing required request parameters' });
  }

  const result = await runCCommand([
    'submit-request',
    String(userID),
    String(resourceID),
    deviceID.trim(),
    unknownDevice ? '1' : '0',
    unusualTime ? '1' : '0',
    unusualLocation ? '1' : '0',
    autoProcess ? '1' : '0',
  ]);
  res.json(result);
});

// 8. Process next request from C Circular Queue
router.post('/queue/process', async (req, res) => {
  const result = await runCCommand(['process-request']);
  res.json(result);
});

// 9. Revoke session via C backend
router.post('/sessions/:id/revoke', async (req, res) => {
  const { id } = req.params;
  const result = await runCCommand(['revoke-session', String(id)]);
  res.json(result);
});

// 10. Revalidate session with continuous device validation via C backend
router.post('/sessions/:id/revalidate', async (req, res) => {
  const { id } = req.params;
  const { currentDevice } = req.body;
  if (!currentDevice) {
    return res.status(400).json({ success: false, error: 'currentDevice parameter is required' });
  }

  const result = await runCCommand(['revalidate-session', String(id), currentDevice.trim()]);
  res.json(result);
});

// 11. Reset or Seed demo data
router.post('/demo/seed', async (req, res) => {
  const result = await runCCommand(['seed-demo']);
  res.json(result);
});

// Clear all data to blank state
router.post('/clear', async (req, res) => {
  const result = await runCCommand(['clear-all']);
  res.json(result);
});

// 12. Read raw C text files (users.txt, resources.txt, logs.txt, sessions.txt, queue.txt)
router.get('/files', (req, res) => {
  const fileNames = ['users.txt', 'resources.txt', 'logs.txt', 'sessions.txt', 'queue.txt'];
  const data = {};

  for (const f of fileNames) {
    const fullPath = path.resolve(cBackendDir, f);
    if (fs.existsSync(fullPath)) {
      data[f] = fs.readFileSync(fullPath, 'utf8');
    } else {
      data[f] = '';
    }
  }

  res.json({ files: data });
});

export default router;
