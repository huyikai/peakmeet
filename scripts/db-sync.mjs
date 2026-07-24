/**
 * Upsert PeakMeet public seeds into CloudBase via manager-node DatabaseMigrateImport.
 * Env: CLOUDBASE_ENV_ID, CLOUDBASE_SECRET_ID, CLOUDBASE_SECRET_KEY
 * Loads optional .env.local / .env
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(join(root, '.env.local'));
loadEnvFile(join(root, '.env'));

const COLLECTIONS = ['actions', 'equipment', 'training_plans', 'foods'];
const envId = process.env.CLOUDBASE_ENV_ID || 'cloud1-d8ghafmni1c847e3f';
const secretId = process.env.CLOUDBASE_SECRET_ID;
const secretKey = process.env.CLOUDBASE_SECRET_KEY;

if (!secretId || !secretKey) {
  console.error(
    '[db:sync] Missing CLOUDBASE_SECRET_ID / CLOUDBASE_SECRET_KEY. See .env.example and database/README.md',
  );
  process.exit(1);
}

const CloudBase = (await import('@cloudbase/manager-node')).default;
const app = CloudBase.init({
  secretId,
  secretKey,
  envId,
});
const { database } = app;
const { storage } = app;

function loadAssetManifest() {
  const path = join(root, 'database', 'assets', 'content', 'manifest.json');
  if (!existsSync(path)) {
    throw new Error(`Missing content image manifest: ${path}`);
  }
  const entries = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(entries) || entries.length !== 300) {
    throw new Error(`${path} must contain exactly 300 image entries`);
  }
  for (const entry of entries) {
    const localPath = join(root, entry.source);
    if (!existsSync(localPath)) {
      throw new Error(`Missing content image: ${localPath}`);
    }
    const digest = createHash('sha256').update(readFileSync(localPath)).digest('hex');
    if (digest !== entry.sha256) {
      throw new Error(`Content image checksum mismatch: ${entry.source}`);
    }
  }
  return entries;
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => run()));
  return results;
}

async function uploadContentAssets(entries) {
  console.log(`[db:sync] uploading ${entries.length} content images…`);
  const pairs = await runPool(entries, 8, async (entry, index) => {
    const localPath = join(root, entry.source);
    await storage.uploadFile({
      localPath,
      cloudPath: entry.cloudPath,
      retryCount: 2,
      retryInterval: 500,
    });
    // manager-node attaches this cloud file ID as upload metadata. Store this
    // portable runtime value in CloudBase documents, never asset:// source URI.
    const metadata = await storage.getUploadMetadata(entry.cloudPath);
    if (!metadata?.cosFileId) {
      throw new Error(`No cloud file ID returned for ${entry.cloudPath}`);
    }
    if ((index + 1) % 25 === 0 || index + 1 === entries.length) {
      console.log(`[db:sync] assets ${index + 1}/${entries.length}`);
    }
    return [entry.assetUri, metadata.cosFileId];
  });
  return new Map(pairs);
}

function loadSeed(name, assetFileIds) {
  const path = join(root, 'database', 'seeds', `${name}.json`);
  if (!existsSync(path)) {
    throw new Error(`Missing seed file: ${path}`);
  }
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`Invalid JSON in ${path}: ${e.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error(`${path} must be a JSON array`);
  }
  for (const doc of data) {
    if (!doc || typeof doc._id !== 'string' || !doc._id) {
      throw new Error(`${path} contains a document without _id`);
    }
    if (typeof doc.cover === 'string' && doc.cover.startsWith('asset://')) {
      const fileId = assetFileIds.get(doc.cover);
      if (!fileId) {
        throw new Error(`${path} references unknown asset: ${doc.cover}`);
      }
      doc.cover = fileId;
    }
  }
  return data;
}

function toNdjson(docs) {
  return docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
}

async function waitJob(jobId) {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await database.migrateStatus(jobId);
    const s = status.Status || status.status;
    if (s === 'success' || s === 'Success') {
      return status;
    }
    if (s === 'fail' || s === 'Fail' || s === 'failed') {
      throw new Error(status.ErrorMsg || status.errorMsg || `import job ${jobId} failed`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`import job ${jobId} timed out`);
}

async function upsertCollection(name, docs) {
  await database.createCollectionIfNotExists(name);

  const dir = join(tmpdir(), 'peakmeet-db-sync');
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${name}.json`);
  // CloudBase import expects JSON Lines (one doc per line)
  writeFileSync(filePath, toNdjson(docs), 'utf8');

  try {
    // ConflictMode must be string for manager-node: "2" = Upsert by _id ("1" = Insert)
    const res = await database.import(
      name,
      { FilePath: filePath, FileType: 'json' },
      { ConflictMode: '2' },
    );
    const jobId = res.JobId ?? res.jobId;
    if (jobId == null) {
      throw new Error(`No JobId returned for ${name}: ${JSON.stringify(res)}`);
    }
    const finalStatus = await waitJob(jobId);
    return {
      total: docs.length,
      success: finalStatus.RecordSuccess ?? finalStatus.recordSuccess,
      fail: finalStatus.RecordFail ?? finalStatus.recordFail ?? 0,
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }
}

console.log(`[db:sync] env=${envId}`);
const assetEntries = loadAssetManifest();
let assetFileIds;
try {
  assetFileIds = await uploadContentAssets(assetEntries);
} catch (e) {
  console.error('[db:sync] content image upload failed:', e.message || e);
  process.exit(1);
}

let exitCode = 0;
for (const name of COLLECTIONS) {
  const docs = loadSeed(name, assetFileIds);
  console.log(`[db:sync] importing ${name} (${docs.length}) with ConflictMode=Upsert…`);
  try {
    const summary = await upsertCollection(name, docs);
    console.log(
      `[db:sync] ${name}: total=${summary.total} success=${summary.success ?? '?'} fail=${summary.fail ?? 0}`,
    );
    if (summary.fail && summary.fail > 0) exitCode = 1;
  } catch (e) {
    exitCode = 1;
    console.error(`[db:sync] ${name} failed:`, e.message || e);
  }
}

if (exitCode !== 0) {
  console.error('[db:sync] completed with errors');
  console.error(
    '[db:sync] Fallback: console import of database/seeds/*.json with Upsert. See database/README.md',
  );
  process.exit(exitCode);
}
console.log('[db:sync] done (upsert only; orphans not deleted)');
