/**
 * Upsert PeakMeet public catalog into CloudBase.
 * Env: CLOUDBASE_ENV_ID, CLOUDBASE_SECRET_ID, CLOUDBASE_SECRET_KEY
 * Optional:
 *   DB_SYNC_SKIP_ASSETS=1
 *   DB_SYNC_DRY_RUN=1
 *   DB_SYNC_REPLACE=1  (replace actions/equipment orphans after backup)
 * Loads optional .env.local / .env
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
const dryRun = process.env.DB_SYNC_DRY_RUN === '1';
const replaceMode = process.env.DB_SYNC_REPLACE === '1';

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
const { database, storage } = app;

function loadAssetManifest() {
  const path = join(root, 'database', 'assets', 'content', 'manifest.json');
  if (!existsSync(path)) {
    throw new Error(`Missing content image manifest: ${path}`);
  }
  const entries = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(entries) || entries.length < 2648) {
    throw new Error(`${path} must contain at least 2648 image entries`);
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

function loadSourceLock() {
  const path = join(root, 'database/vendor/exercises-dataset/source.lock.json');
  if (!existsSync(path)) throw new Error(`Missing source lock: ${path}`);
  const lock = JSON.parse(readFileSync(path, 'utf8'));
  if (lock.commit !== '7455efae41b330c265e7cd4b78dfa848e7ce5ebd') {
    throw new Error(`Unexpected source lock commit: ${lock.commit}`);
  }
  return lock;
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
  const skipUpload = process.env.DB_SYNC_SKIP_ASSETS === '1';
  console.log(
    `[db:sync] ${skipUpload ? 'resolving' : 'uploading'} ${entries.length} content images…`,
  );
  if (dryRun) {
    return new Map(entries.map((entry) => [entry.assetUri, `dry-run://${entry.cloudPath}`]));
  }
  const pairs = await runPool(entries, 8, async (entry, index) => {
    const localPath = join(root, entry.source);
    if (!skipUpload) {
      await storage.uploadFile({
        localPath,
        cloudPath: entry.cloudPath,
        retryCount: 2,
        retryInterval: 500,
      });
    }
    const metadata = await storage.getUploadMetadata(entry.cloudPath);
    if (!metadata?.fileId) {
      throw new Error(`No cloud file ID returned for ${entry.cloudPath}`);
    }
    if ((index + 1) % 100 === 0 || index + 1 === entries.length) {
      console.log(`[db:sync] assets ${index + 1}/${entries.length}`);
    }
    return [entry.assetUri, metadata.fileId];
  });
  return new Map(pairs);
}

function rewriteMediaFields(doc, assetFileIds) {
  const fields = ['cover', 'coverJpg', 'demoGif'];
  for (const field of fields) {
    const value = doc[field];
    if (typeof value === 'string' && (value.startsWith('asset://') || value.startsWith('vendor://'))) {
      const fileId = assetFileIds.get(value);
      if (!fileId) throw new Error(`${doc._id} references unknown asset: ${value}`);
      doc[field] = fileId;
    }
  }
  if (doc.media && typeof doc.media === 'object') {
    for (const field of ['cover', 'coverJpg', 'demoGif', 'thumbnailUri', 'gifUri']) {
      const value = doc.media[field];
      if (typeof value === 'string' && (value.startsWith('asset://') || value.startsWith('vendor://'))) {
        const fileId = assetFileIds.get(value);
        if (!fileId) throw new Error(`${doc._id}.media references unknown asset: ${value}`);
        doc.media[field] = fileId;
      }
    }
  }
}

function loadCatalog(name, assetFileIds) {
  const path = join(root, 'database', 'catalog', `${name}.json`);
  if (!existsSync(path)) throw new Error(`Missing catalog file: ${path}`);
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`Invalid JSON in ${path}: ${e.message}`);
  }
  if (!Array.isArray(data)) throw new Error(`${path} must be a JSON array`);
  for (const doc of data) {
    if (!doc || typeof doc._id !== 'string' || !doc._id) {
      throw new Error(`${path} contains a document without _id`);
    }
    rewriteMediaFields(doc, assetFileIds);
    for (const field of ['cover', 'coverJpg', 'demoGif']) {
      const value = doc[field];
      if (typeof value === 'string' && (value.startsWith('asset://') || /github\.com/i.test(value))) {
        throw new Error(`${path}/${doc._id} still has forbidden ${field}`);
      }
    }
  }
  return data;
}

async function upsertCollectionViaSdk(name, docs) {
  const tcb = (await import('@cloudbase/node-sdk')).default;
  const appSdk = tcb.init({
    env: envId,
    secretId,
    secretKey,
  });
  const db = appSdk.database();
  let success = 0;
  let fail = 0;
  await runPool(docs, 8, async (doc, index) => {
    const id = doc._id;
    const { _id: _omit, ...fields } = doc;
    try {
      if (!dryRun) {
        await db.collection(name).doc(id).set(fields);
      }
      success += 1;
    } catch (e) {
      fail += 1;
      console.error(
        `[db:sync] ${name}/${id} set failed:`,
        e instanceof Error ? e.message : e,
      );
    }
    if ((index + 1) % 100 === 0 || index + 1 === docs.length) {
      console.log(`[db:sync] ${name} docs ${index + 1}/${docs.length}`);
    }
  });
  return { total: docs.length, success, fail };
}

async function upsertCollection(name, docs) {
  if (!dryRun) await database.createCollectionIfNotExists(name);
  return upsertCollectionViaSdk(name, docs);
}

async function listAllIds(db, name) {
  const ids = [];
  const pageSize = 100;
  let skip = 0;
  for (;;) {
    const res = await db.collection(name).field({ _id: true }).skip(skip).limit(pageSize).get();
    const batch = res.data ?? [];
    for (const doc of batch) {
      if (doc?._id) ids.push(String(doc._id));
    }
    if (batch.length < pageSize) break;
    skip += batch.length;
  }
  return ids;
}

async function removeOrphans(name, keepIds) {
  const tcb = (await import('@cloudbase/node-sdk')).default;
  const appSdk = tcb.init({
    env: envId,
    secretId,
    secretKey,
  });
  const db = appSdk.database();
  const keep = new Set(keepIds);
  const existing = await listAllIds(db, name);
  const orphans = existing.filter((id) => !keep.has(id));
  console.log(`[db:sync] ${name} orphan scan: cloud=${existing.length} keep=${keep.size} orphan=${orphans.length}`);
  if (orphans.length === 0) return { deleted: 0, failed: 0, orphans };

  if (dryRun) {
    console.log(`[db:sync] dry-run would delete ${orphans.length} orphan ${name} docs`);
    return { deleted: 0, failed: 0, orphans };
  }

  let deleted = 0;
  let failed = 0;
  await runPool(orphans, 8, async (id, index) => {
    try {
      await db.collection(name).doc(id).remove();
      deleted += 1;
    } catch (e) {
      failed += 1;
      console.error(
        `[db:sync] ${name}/${id} remove failed:`,
        e instanceof Error ? e.message : e,
      );
    }
    if ((index + 1) % 50 === 0 || index + 1 === orphans.length) {
      console.log(`[db:sync] ${name} orphans ${index + 1}/${orphans.length}`);
    }
  });
  return { deleted, failed, orphans };
}

function writeBackup(name, docs) {
  const dir = join(root, 'database/backups');
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(dir, `${name}-${stamp}.json`);
  writeFileSync(path, `${JSON.stringify(docs, null, 2)}\n`);
  return path;
}

console.log(`[db:sync] env=${envId} dryRun=${dryRun} replace=${replaceMode}`);
const lock = loadSourceLock();
console.log(`[db:sync] source lock ${lock.commit} aggregate=${lock.aggregateSha256.slice(0, 12)}…`);

const assetEntries = loadAssetManifest();
let assetFileIds;
try {
  assetFileIds = await uploadContentAssets(assetEntries);
} catch (e) {
  console.error('[db:sync] content image upload failed:', e.message || e);
  process.exit(1);
}

let exitCode = 0;
const loaded = {};
for (const name of COLLECTIONS) {
  const docs = loadCatalog(name, assetFileIds);
  loaded[name] = docs;
  const backupPath = writeBackup(name, docs);
  console.log(`[db:sync] backup ${name} -> ${backupPath}`);
  console.log(`[db:sync] importing ${name} (${docs.length})…`);
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

if (replaceMode && exitCode === 0) {
  for (const name of ['actions', 'equipment']) {
    try {
      const result = await removeOrphans(
        name,
        loaded[name].map((doc) => doc._id),
      );
      const reportPath = join(
        root,
        'database/reports',
        `${name}-orphan-cleanup.json`,
      );
      mkdirSync(dirname(reportPath), { recursive: true });
      writeFileSync(
        reportPath,
        `${JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            dryRun,
            deleted: result.deleted,
            failed: result.failed,
            orphans: result.orphans,
          },
          null,
          2,
        )}\n`,
      );
      console.log(
        `[db:sync] ${name} orphan cleanup deleted=${result.deleted} failed=${result.failed} report=${reportPath}`,
      );
      if (result.failed > 0) exitCode = 1;
    } catch (e) {
      exitCode = 1;
      console.error(`[db:sync] ${name} orphan cleanup failed:`, e.message || e);
    }
  }
}

if (exitCode !== 0) {
  console.error('[db:sync] completed with errors');
  process.exit(exitCode);
}
console.log(
  dryRun
    ? '[db:sync] dry-run done (no cloud writes)'
    : replaceMode
      ? '[db:sync] done (catalog upsert + actions/equipment orphan cleanup)'
      : '[db:sync] done (catalog upsert; set DB_SYNC_REPLACE=1 to remove cloud orphans)',
);
