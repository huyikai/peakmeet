import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages/shared/dist-cjs');
const dtsSource = join(root, 'packages/shared/dist');
const target = join(root, 'packages/miniprogram/utils/shared');

if (!existsSync(source)) {
  console.error('[sync:shared] Missing packages/shared/dist-cjs. Run shared build first.');
  process.exit(1);
}

if (!existsSync(dtsSource)) {
  console.error('[sync:shared] Missing packages/shared/dist (declarations). Run shared build first.');
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

/** Copy only .d.ts / .d.ts.map from ESM dist into the CJS sync target. */
function copyDeclarations(fromDir, toDir) {
  for (const name of readdirSync(fromDir)) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyDeclarations(from, to);
      continue;
    }
    if (name.endsWith('.d.ts') || name.endsWith('.d.ts.map')) {
      cpSync(from, to);
    }
  }
}

copyDeclarations(dtsSource, target);

const indexDts = join(target, 'index.d.ts');
if (!existsSync(indexDts)) {
  console.error('[sync:shared] Missing index.d.ts after copy.');
  process.exit(1);
}

writeFileSync(
  join(target, 'README.md'),
  '# Synced from packages/shared (dist-cjs + dist *.d.ts) via `pnpm sync:shared`.\n# Do not edit by hand.\n',
);

const indexJs = readFileSync(join(target, 'index.js'), 'utf8');
if (!indexJs.includes('getPeakMeetPing') || indexJs.includes('export {')) {
  console.error('[sync:shared] Unexpected index.js (expect CJS with getPeakMeetPing).');
  process.exit(1);
}

console.log(`[sync:shared] Copied ${source} + declarations from ${dtsSource} -> ${target}`);
