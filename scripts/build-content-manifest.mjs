/**
 * Build database/assets/content/manifest.json from vendor action media
 * plus first-party equipment/food assets when present.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(root, 'database/vendor/exercises-dataset');
const catalogDir = join(root, 'database/catalog');
const assetsDir = join(root, 'database/assets/content');

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const actions = JSON.parse(readFileSync(join(catalogDir, 'actions.json'), 'utf8'));
const foods = JSON.parse(readFileSync(join(catalogDir, 'foods.json'), 'utf8'));
const entries = [];

for (const action of actions) {
  const thumbRel = action.media.thumbnailPath;
  const gifRel = action.media.gifPath;
  const thumbAbs = join(vendorDir, thumbRel);
  const gifAbs = join(vendorDir, gifRel);
  if (!existsSync(thumbAbs) || !existsSync(gifAbs)) {
    throw new Error(`Missing media for ${action._id}`);
  }
  entries.push({
    collection: 'actions',
    id: action._id,
    kind: 'jpg',
    source: `database/vendor/exercises-dataset/${thumbRel}`,
    cloudPath: `content/actions/${action._id}.jpg`,
    assetUri: action.media.coverJpg,
    sha256: sha256(thumbAbs),
  });
  entries.push({
    collection: 'actions',
    id: action._id,
    kind: 'gif',
    source: `database/vendor/exercises-dataset/${gifRel}`,
    cloudPath: `content/actions/${action._id}.gif`,
    assetUri: action.media.demoGif,
    sha256: sha256(gifAbs),
  });
}

const equipDir = join(assetsDir, 'equipment');
if (existsSync(equipDir)) {
  for (const name of readdirSync(equipDir).filter((n) => n.endsWith('.png'))) {
    const id = name.replace(/\.png$/, '');
    const source = `database/assets/content/equipment/${name}`;
    entries.push({
      collection: 'equipment',
      id,
      kind: 'png',
      source,
      cloudPath: `content/equipment/${name}`,
      assetUri: `asset://content/equipment/${name}`,
      sha256: sha256(join(root, source)),
    });
  }
}

for (const food of foods) {
  if (typeof food.cover === 'string' && food.cover.startsWith('asset://content/foods/')) {
    const fileName = food.cover.replace('asset://content/foods/', '');
    const source = `database/assets/content/foods/${fileName}`;
    if (!existsSync(join(root, source))) {
      throw new Error(`Missing food image: ${source}`);
    }
    entries.push({
      collection: 'foods',
      id: food._id,
      kind: 'png',
      source,
      cloudPath: `content/foods/${fileName}`,
      assetUri: food.cover,
      sha256: sha256(join(root, source)),
    });
  }
}

mkdirSync(assetsDir, { recursive: true });
writeFileSync(join(assetsDir, 'manifest.json'), `${JSON.stringify(entries, null, 2)}\n`);
console.log(`[manifest] entries=${entries.length}`);
