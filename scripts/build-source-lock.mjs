/**
 * Build source.lock.json for the local exercises-dataset vendor snapshot.
 * Never accesses the network.
 */
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'database/vendor/exercises-dataset');
const FIXED_COMMIT = '7455efae41b330c265e7cd4b78dfa848e7ce5ebd';
const FIXED_TREE = 'ac9b48a81b0a2b89a4186b70649694ebd3441063';

function sha256File(path) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

if (!existsSync(vendorDir)) {
  throw new Error(`Missing vendor directory: ${vendorDir}`);
}

const required = [
  'LICENSE',
  'NOTICE.md',
  'README.md',
  'data/exercises.json',
  'data/exercises.schema.json',
];
for (const rel of required) {
  if (!existsSync(join(vendorDir, rel))) {
    throw new Error(`Missing required vendor file: ${rel}`);
  }
}

const images = readdirSync(join(vendorDir, 'images')).filter((name) => name.endsWith('.jpg'));
const videos = readdirSync(join(vendorDir, 'videos')).filter((name) => name.endsWith('.gif'));
if (images.length !== 1324) throw new Error(`Expected 1324 jpg, got ${images.length}`);
if (videos.length !== 1324) throw new Error(`Expected 1324 gif, got ${videos.length}`);

const exercises = JSON.parse(
  readFileSync(join(vendorDir, 'data/exercises.json'), 'utf8'),
);
if (!Array.isArray(exercises) || exercises.length !== 1324) {
  throw new Error(`Expected 1324 exercises, got ${exercises?.length}`);
}

const files = [];
const aggregate = createHash('sha256');
const all = [
  ...required.map((rel) => join(vendorDir, rel)),
  ...images.map((name) => join(vendorDir, 'images', name)),
  ...videos.map((name) => join(vendorDir, 'videos', name)),
].sort();

for (const full of all) {
  const digest = await sha256File(full);
  const rel = relative(vendorDir, full).replaceAll('\\', '/');
  const bytes = statSync(full).size;
  files.push({ path: rel, sha256: digest, bytes });
  aggregate.update(`${rel}:${digest}:${bytes}\n`);
}

const lock = {
  repository: 'https://github.com/hasaneyldrm/exercises-dataset',
  commit: FIXED_COMMIT,
  tree: FIXED_TREE,
  lockedAt: new Date().toISOString(),
  counts: {
    exercises: 1324,
    jpg: 1324,
    gif: 1324,
    files: files.length,
  },
  licenseFiles: ['LICENSE', 'NOTICE.md'],
  aggregateSha256: aggregate.digest('hex'),
  files,
};

writeFileSync(join(vendorDir, 'source.lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
console.log(
  `[source-lock] commit=${FIXED_COMMIT} files=${files.length} aggregate=${lock.aggregateSha256}`,
);
