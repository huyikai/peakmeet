import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EQUIPMENT_CATALOG,
  MEDIA_ATTRIBUTION,
  localizeExerciseName,
  stableExerciseId,
  transformUpstreamExercise,
  transformUpstreamExercises,
  type UpstreamExercise,
} from '../src/content/index';

const vendorPath = join(
  process.cwd(),
  '../../database/vendor/exercises-dataset/data/exercises.json',
);

function loadVendor(): UpstreamExercise[] {
  return JSON.parse(readFileSync(vendorPath, 'utf8')) as UpstreamExercise[];
}

describe('exercise dataset transform', () => {
  it('builds stable ids and keeps source/localized/enrichment layers', () => {
    const sample = loadVendor()[0];
    const action = transformUpstreamExercise(sample);
    expect(action._id).toBe(stableExerciseId(sample.id));
    expect(action.source?.sourceId).toBe(sample.id);
    expect(action.source?.nameEn).toBe(sample.name);
    expect(action.localized?.status).toBe('pending_review');
    expect(action.steps.length).toBeGreaterThan(0);
    expect(action.steps).toEqual(sample.instruction_steps.zh);
    expect(action.media?.licenseStatus).toBe('provisional_third_party');
    expect(action.mediaAttribution).toContain('Gym visual');
    expect(action.enrichment?.status).toBe('pending_review');
    expect(action.aliases?.[0]).toBe(sample.name);
  });

  it('localizes names without pretending they are upstream translations', () => {
    const localized = localizeExerciseName('Barbell squat');
    expect(localized.nameZh.length).toBeGreaterThan(0);
    expect(localized.status).toBe('pending_review');
    expect(localized.aliases).toEqual(['Barbell squat']);
  });

  it('transforms all 1324 vendor records with unique ids and media slots', () => {
    const records = loadVendor();
    expect(records).toHaveLength(1324);
    const actions = transformUpstreamExercises(records);
    expect(actions).toHaveLength(1324);
    expect(new Set(actions.map((a) => a._id)).size).toBe(1324);
    expect(actions.every((a) => a.steps.length > 0)).toBe(true);
    expect(actions.every((a) => a.name.trim().length > 0)).toBe(true);
    expect(
      actions.every((a) => a.mediaAttribution === MEDIA_ATTRIBUTION || Boolean(a.mediaAttribution)),
    ).toBe(true);
    expect(EQUIPMENT_CATALOG).toHaveLength(28);
    expect(
      actions.every(
        (a) =>
          a.media?.coverJpg?.startsWith('vendor://exercises-dataset/images/') &&
          a.media?.demoGif?.startsWith('vendor://exercises-dataset/videos/'),
      ),
    ).toBe(true);
  });
});
