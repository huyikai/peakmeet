import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const entries = ['hello', 'contentList', 'contentGetById'];

async function buildOne(name) {
  const entry = join(root, name, 'index.ts');
  const outfile = join(root, name, 'index.js');
  mkdirSync(dirname(outfile), { recursive: true });
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    external: ['wx-server-sdk'],
    // hello has no shared import; content* will inline @peakmeet/shared
    logLevel: 'info',
  });
  console.log(`built ${name}/index.js`);
}

for (const name of entries) {
  await buildOne(name);
}
