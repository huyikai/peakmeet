import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages/shared/dist-cjs');
const target = join(root, 'packages/miniprogram/utils/shared');

if (!existsSync(source)) {
  console.error('[sync:shared] Missing packages/shared/dist-cjs. Run shared build first.');
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
writeFileSync(
  join(target, 'README.md'),
  '# Synced from packages/shared/dist-cjs via `pnpm sync:shared`.\n# Do not edit by hand.\n',
);

console.log(`[sync:shared] Copied ${source} -> ${target}`);
