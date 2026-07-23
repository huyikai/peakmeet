#!/usr/bin/env node
/**
 * WeChat DevTools preprocess hook.
 * Usage:
 *   node scripts/miniprogram-prebuild.mjs           # full: sync shared + tsc pages
 *   node scripts/miniprogram-prebuild.mjs --sync-only # shared → utils/shared only (faster, for beforeCompile)
 *
 * Invoked from packages/miniprogram via project.config.json `scripts`.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncOnly = process.argv.includes('--sync-only');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const marker = join(root, 'pnpm-workspace.yaml');

if (!existsSync(marker)) {
  console.error(
    '[miniprogram-prebuild] Cannot find monorepo root (pnpm-workspace.yaml).',
  );
  process.exit(1);
}

const env = {
  ...process.env,
  PATH: [
    process.env.PATH ?? '',
    `${process.env.HOME ?? ''}/.local/share/pnpm`,
    `${process.env.HOME ?? ''}/Library/pnpm`,
    '/opt/homebrew/bin',
    '/usr/local/bin',
  ].join(':'),
};

const cmd = syncOnly ? 'pnpm sync:shared' : 'pnpm build:miniprogram';
console.log(`[miniprogram-prebuild] Running ${cmd} …`);

try {
  execSync(cmd, {
    cwd: root,
    stdio: 'inherit',
    env,
    shell: true,
  });
  console.log('[miniprogram-prebuild] Done.');
} catch (err) {
  console.error(
    '[miniprogram-prebuild] Failed. Fix the error, or run manually:',
    cmd,
  );
  process.exit(typeof err?.status === 'number' ? err.status : 1);
}
