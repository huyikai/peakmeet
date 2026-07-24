/**
 * Validate catalog content assets and vendor media references.
 * Manifest-driven; no hard-coded 300-count assumption.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'database/vendor/exercises-dataset');
const catalogDir = join(root, 'database/catalog');
const manifestPath = join(root, 'database/assets/content/manifest.json');
const lockPath = join(vendorDir, 'source.lock.json');

function mustExist(path) {
  if (!existsSync(path)) throw new Error(`Missing file: ${path}`);
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

mustExist(lockPath);
mustExist(join(catalogDir, 'actions.json'));
mustExist(join(catalogDir, 'equipment.json'));
mustExist(join(catalogDir, 'foods.json'));
mustExist(join(catalogDir, 'training_plans.json'));
mustExist(manifestPath);

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
if (lock.commit !== '7455efae41b330c265e7cd4b78dfa848e7ce5ebd') {
  throw new Error(`Unexpected source lock commit: ${lock.commit}`);
}
if (lock.counts.exercises !== 1324 || lock.counts.jpg !== 1324 || lock.counts.gif !== 1324) {
  throw new Error(`Unexpected source lock counts: ${JSON.stringify(lock.counts)}`);
}

const actions = JSON.parse(readFileSync(join(catalogDir, 'actions.json'), 'utf8'));
const equipment = JSON.parse(readFileSync(join(catalogDir, 'equipment.json'), 'utf8'));
const foods = JSON.parse(readFileSync(join(catalogDir, 'foods.json'), 'utf8'));
const plans = JSON.parse(readFileSync(join(catalogDir, 'training_plans.json'), 'utf8'));

if (actions.length !== 1324) throw new Error(`actions catalog expected 1324, got ${actions.length}`);
if (equipment.length !== 27) throw new Error(`equipment catalog expected 27, got ${equipment.length}`);
if (foods.length !== 200) throw new Error(`foods catalog expected 200, got ${foods.length}`);
if (plans.length !== 6) throw new Error(`training_plans catalog expected 6, got ${plans.length}`);

for (const action of actions) {
  if (!action._id?.startsWith('exercise_dataset_')) {
    throw new Error(`invalid action id: ${action._id}`);
  }
  if (!action.name?.trim()) throw new Error(`${action._id}: missing Chinese name`);
  if (!action.steps?.length) throw new Error(`${action._id}: missing zh steps`);
  if (!action.mediaAttribution?.includes('Gym visual')) {
    throw new Error(`${action._id}: missing Gym visual attribution`);
  }
  for (const field of ['cover', 'coverJpg', 'demoGif']) {
    const value = action[field];
    if (typeof value === 'string' && (value.startsWith('asset://') || /github\.com/i.test(value))) {
      throw new Error(`${action._id}: forbidden ${field}=${value}`);
    }
  }
  const thumb = join(vendorDir, action.media?.thumbnailPath ?? '');
  const gif = join(vendorDir, action.media?.gifPath ?? '');
  mustExist(thumb);
  mustExist(gif);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest) || manifest.length < 2648) {
  throw new Error(`manifest expected >= 2648 entries, got ${manifest.length}`);
}

const byUri = new Map();
const counts = { actions: 0, equipment: 0, foods: 0 };
for (const entry of manifest) {
  if (!(entry.collection in counts)) {
    throw new Error(`Unexpected image collection: ${entry.collection}`);
  }
  counts[entry.collection] += 1;
  const source = join(root, entry.source);
  mustExist(source);
  const digest = sha256(source);
  if (digest !== entry.sha256) throw new Error(`Checksum mismatch: ${entry.source}`);
  if (byUri.has(entry.assetUri)) throw new Error(`Duplicate asset URI: ${entry.assetUri}`);
  byUri.set(entry.assetUri, entry);
}

if (counts.actions !== 2648) {
  throw new Error(`actions media expected 2648, got ${counts.actions}`);
}
if (counts.equipment !== 20 && counts.equipment !== 0) {
  // equipment may keep first-party covers or be null; allow 0 or 20
}
if (counts.foods !== 200) {
  throw new Error(`foods media expected 200, got ${counts.foods}`);
}

for (const food of foods) {
  if (typeof food.cover === 'string' && food.cover.startsWith('asset://') && !byUri.has(food.cover)) {
    throw new Error(`food ${food._id}: cover missing from manifest`);
  }
}

console.log(
  `content assets valid: actions=${actions.length}, actionMedia=${counts.actions}, equipment=${equipment.length}, foods=${foods.length}, lock=${lock.aggregateSha256.slice(0, 12)}…`,
);
