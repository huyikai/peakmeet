/**
 * Refresh the vendor snapshot from an explicit local checkout/archive path.
 * Usage:
 *   node scripts/refresh-exercises-dataset.mjs --from /path/to/local/checkout
 * Never downloads from the network by itself.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'database/vendor/exercises-dataset');
const FIXED_COMMIT = '7455efae41b330c265e7cd4b78dfa848e7ce5ebd';

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

const from = argValue('--from');
if (!from) {
  console.error(
    'Usage: node scripts/refresh-exercises-dataset.mjs --from /absolute/path/to/checkout-or-extracted-archive',
  );
  process.exit(1);
}
if (!existsSync(from)) {
  console.error(`Source path not found: ${from}`);
  process.exit(1);
}

const required = [
  'LICENSE',
  'NOTICE.md',
  'data/exercises.json',
  'data/exercises.schema.json',
  'images',
  'videos',
];
for (const rel of required) {
  if (!existsSync(join(from, rel))) {
    console.error(`Source is missing ${rel}`);
    process.exit(1);
  }
}

rmSync(vendorDir, { recursive: true, force: true });
mkdirSync(vendorDir, { recursive: true });
for (const rel of ['LICENSE', 'NOTICE.md', 'README.md', 'data', 'images', 'videos']) {
  const src = join(from, rel);
  if (!existsSync(src)) continue;
  cpSync(src, join(vendorDir, rel), { recursive: true });
}

const lock = spawnSync(process.execPath, [join(root, 'scripts/build-source-lock.mjs')], {
  cwd: root,
  stdio: 'inherit',
});
if (lock.status !== 0) process.exit(lock.status ?? 1);

console.log(
  `[refresh] vendor refreshed from local path for commit ${FIXED_COMMIT}. Re-run catalog build afterwards.`,
);
