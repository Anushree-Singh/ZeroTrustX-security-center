import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import apiRouter from './apiRouter.js';
import { ensureCompiled } from './bridge.js';

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.resolve(process.cwd(), 'dist');

// Mount API router
app.use('/api', apiRouter);

// Serve built frontend assets if dist exists
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('ZeroTrustX C Backend Server is active. Run "npm run dev" to launch Vite frontend with hot reload.');
  });
}

// Compile C backend if needed and start server
ensureCompiled().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZeroTrustX] Server bridge running on port ${PORT}`);
  });
});
