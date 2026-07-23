import { describe, expect, it } from 'vitest';
import { calculateMacroPlan } from '../src/index';

describe('calculateMacroPlan', () => {
  it('cut/maintain protein 2.0 and fat 0.9 midpoints', () => {
    const cut = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: 70,
      goal: 'cutMild',
    });
    expect(cut.ok).toBe(true);
    if (!cut.ok) return;
    expect(cut.data.proteinG).toBe(140);
    expect(cut.data.fatG).toBe(63);
    expect(cut.data.proteinGPerKg).toBe(2);
    expect(cut.data.fatGPerKg).toBe(0.9);
    expect(cut.data.carbRestG).toBeGreaterThan(0);
    expect(cut.data.carbTrainG).toBe(
      Math.round(cut.data.carbRestG * 1.15 * 10) / 10,
    );
    expect(cut.data.structureTight).toBe(false);

    const maintain = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: 70,
      goal: 'maintain',
    });
    expect(maintain.ok && maintain.data.proteinGPerKg).toBe(2);
  });

  it('bulk uses protein 2.2', () => {
    const bulk = calculateMacroPlan({
      targetKcal: 2500,
      weightKg: 70,
      goal: 'bulk',
    });
    expect(bulk.ok && bulk.data.proteinG).toBe(154);
    expect(bulk.ok && bulk.data.proteinGPerKg).toBe(2.2);
  });

  it('sets structureTight when remain kcal negative', () => {
    const tight = calculateMacroPlan({
      targetKcal: 100,
      weightKg: 80,
      goal: 'cutAggressive',
    });
    expect(tight.ok).toBe(true);
    if (!tight.ok) return;
    expect(tight.data.carbRestG).toBe(0);
    expect(tight.data.carbTrainG).toBe(0);
    expect(tight.data.structureTight).toBe(true);
  });

  it('rejects invalid inputs', () => {
    const kcal = calculateMacroPlan({
      targetKcal: 0,
      weightKg: 70,
      goal: 'bulk',
    });
    expect(kcal.ok).toBe(false);
    if (!kcal.ok) expect(kcal.error.code).toBe('INVALID_TARGET_KCAL');

    const w = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: -1,
      goal: 'bulk',
    });
    expect(w.ok).toBe(false);
    if (!w.ok) expect(w.error.code).toBe('INVALID_WEIGHT');

    const g = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: 70,
      goal: 'x' as 'bulk',
    });
    expect(g.ok).toBe(false);
    if (!g.ok) expect(g.error.code).toBe('INVALID_GOAL');
  });

  it('returns carbRestRangeG / carbTrainRangeG with min≤max and non-negative', () => {
    const res = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: 70,
      goal: 'cutMild',
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const { carbRestG, carbTrainG, carbRestRangeG, carbTrainRangeG } = res.data;
    expect(carbRestRangeG.min).toBeGreaterThanOrEqual(0);
    expect(carbTrainRangeG.min).toBeGreaterThanOrEqual(0);
    expect(carbRestRangeG.min).toBeLessThanOrEqual(carbRestRangeG.max);
    expect(carbTrainRangeG.min).toBeLessThanOrEqual(carbTrainRangeG.max);
    expect(carbRestG).toBeGreaterThanOrEqual(carbRestRangeG.min);
    expect(carbRestG).toBeLessThanOrEqual(carbRestRangeG.max);
    expect(carbTrainG).toBeGreaterThanOrEqual(carbTrainRangeG.min);
    expect(carbTrainG).toBeLessThanOrEqual(carbTrainRangeG.max);
  });

  it('derives rest carb range from protein/fat g/kg bounds', () => {
    const weightKg = 70;
    const targetKcal = 2000;
    const res = calculateMacroPlan({
      targetKcal,
      weightKg,
      goal: 'cutMild',
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    // cutMild protein 1.8–2.2, fat 0.8–1.0
    const maxProtFatKcal = weightKg * 2.2 * 4 + weightKg * 1.0 * 9;
    const minProtFatKcal = weightKg * 1.8 * 4 + weightKg * 0.8 * 9;
    const expectedMin = Math.max(0, Math.round(((targetKcal - maxProtFatKcal) / 4) * 10) / 10);
    const expectedMax = Math.max(0, Math.round(((targetKcal - minProtFatKcal) / 4) * 10) / 10);
    expect(res.data.carbRestRangeG).toEqual({
      min: Math.min(expectedMin, expectedMax),
      max: Math.max(expectedMin, expectedMax),
    });
    expect(res.data.carbTrainRangeG.min).toBe(
      Math.round(res.data.carbRestRangeG.min * 1.1 * 10) / 10,
    );
    expect(res.data.carbTrainRangeG.max).toBe(
      Math.round(res.data.carbRestRangeG.max * 1.2 * 10) / 10,
    );
  });

  it('zeros carb ranges when structureTight', () => {
    const tight = calculateMacroPlan({
      targetKcal: 100,
      weightKg: 80,
      goal: 'cutAggressive',
    });
    expect(tight.ok).toBe(true);
    if (!tight.ok) return;
    expect(tight.data.structureTight).toBe(true);
    expect(tight.data.carbRestRangeG).toEqual({ min: 0, max: 0 });
    expect(tight.data.carbTrainRangeG).toEqual({ min: 0, max: 0 });
  });
});
