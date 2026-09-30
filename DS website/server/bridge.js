import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Resolve path to C backend directory
const projectRoot = process.cwd();
const cBackendDir = path.resolve(projectRoot, 'c-backend');

// Binary names for Linux/macOS and Windows
const isWindows = process.platform === 'win32';
const apiBinaryName = isWindows ? 'zerotrustx_api.exe' : 'zerotrustx_api';
const apiBinaryPath = path.resolve(cBackendDir, apiBinaryName);

/**
 * Ensures the C backend binary is compiled.
 */
export async function ensureCompiled() {
  if (fs.existsSync(apiBinaryPath)) {
    return true;
  }

  // Attempt compilation with gcc if not already built
  const compiler = isWindows ? 'gcc' : 'gcc';
  const sourceFiles = [
    'api_cli.c',
    'user.c',
    'resource.c',
    'queue.c',
    'log.c',
    'session.c',
    'security.c',
    'storage.c',
  ];

  try {
    await execFileAsync(compiler, [...sourceFiles, '-o', apiBinaryName], {
      cwd: cBackendDir,
    });
    return true;
  } catch (err) {
    console.error('Failed to compile C backend:', err);
    return false;
  }
}

/**
 * Runs a command against the C backend executable and returns parsed JSON.
 */
export async function runCCommand(args = []) {
  try {
    await ensureCompiled();

    if (!fs.existsSync(apiBinaryPath)) {
      throw new Error(`C executable not found at ${apiBinaryPath}. Please compile c-backend.`);
    }

    const { stdout, stderr } = await execFileAsync(apiBinaryPath, args, {
      cwd: cBackendDir,
      timeout: 10000,
    });

    if (stderr && stderr.trim().length > 0) {
      console.warn('C executable stderr:', stderr);
    }

    const trimmed = stdout.trim();
    if (!trimmed) {
      return { success: false, error: 'Empty output from C backend' };
    }

    try {
      const parsed = JSON.parse(trimmed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse C backend output:', trimmed);
      return { success: false, error: 'Malformed JSON from C backend', raw: trimmed };
    }
  } catch (err) {
    console.error('Error invoking C backend:', err);
    return {
      success: false,
      error: err.message || 'C backend execution failed',
      cBackendUnavailable: true,
    };
  }
}
