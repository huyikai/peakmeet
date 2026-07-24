import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'database/assets/content/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const expected = { actions: 80, equipment: 20, foods: 200 };

if (!Array.isArray(manifest) || manifest.length !== 300) {
  throw new Error(`Expected 300 manifest entries, got ${manifest.length}`);
}

const byUri = new Map();
const counts = { actions: 0, equipment: 0, foods: 0 };
for (const entry of manifest) {
  if (!(entry.collection in counts)) {
    throw new Error(`Unexpected image collection: ${entry.collection}`);
  }
  counts[entry.collection] += 1;
  const source = join(root, entry.source);
  if (!existsSync(source)) throw new Error(`Missing image: ${entry.source}`);
  const digest = createHash('sha256').update(readFileSync(source)).digest('hex');
  if (digest !== entry.sha256) throw new Error(`Checksum mismatch: ${entry.source}`);
  if (byUri.has(entry.assetUri)) throw new Error(`Duplicate asset URI: ${entry.assetUri}`);
  byUri.set(entry.assetUri, entry);
}

for (const [collection, count] of Object.entries(expected)) {
  if (counts[collection] !== count) {
    throw new Error(`${collection}: expected ${count}, got ${counts[collection]}`);
  }
  const seedPath = join(root, 'database/seeds', `${collection}.json`);
  const docs = JSON.parse(readFileSync(seedPath, 'utf8'));
  if (docs.length !== count) {
    throw new Error(`${collection} seeds: expected ${count}, got ${docs.length}`);
  }
  for (const doc of docs) {
    if (!byUri.has(doc.cover)) {
      throw new Error(`${collection}/${doc._id}: cover has no manifest asset`);
    }
  }
}

const foodNames = JSON.parse(
  readFileSync(join(root, 'database/seeds/foods.json'), 'utf8'),
).map((food) => food.name);
if (new Set(foodNames).size !== 200) {
  throw new Error('Food seed names must be 200 unique entries');
}

console.log(
  `content assets valid: actions=${counts.actions}, equipment=${counts.equipment}, foods=${counts.foods}`,
);
