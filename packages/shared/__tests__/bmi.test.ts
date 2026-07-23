import { describe, expect, it } from 'vitest';
import { calculateBmi } from '../src/index';

describe('calculateBmi', () => {
  it('golden fixture 175cm/70kg → 22.9 normal', () => {
    const a = calculateBmi({ heightCm: 175, weightKg: 70 });
    const b = calculateBmi({ heightCm: 175, weightKg: 70 });
    expect(a).toEqual(b);
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    expect(a.data.bmi).toBe(22.9);
    expect(a.data.category).toBe('normal');
    expect(a.data.label).toBe('标准');
    expect(a.data.interpretation).toContain('标准');
  });

  it('classifies underweight/overweight/obese bands', () => {
    const thin = calculateBmi({ heightCm: 170, weightKg: 45 });
    expect(thin.ok && thin.data.category).toBe('underweight');
    const over = calculateBmi({ heightCm: 170, weightKg: 75 });
    expect(over.ok && over.data.category).toBe('overweight');
    const obese = calculateBmi({ heightCm: 170, weightKg: 90 });
    expect(obese.ok && obese.data.category).toBe('obese');
  });

  it('rejects invalid height/weight', () => {
    expect(calculateBmi({ heightCm: 0, weightKg: 70 }).ok).toBe(false);
    const badH = calculateBmi({ heightCm: -1, weightKg: 70 });
    expect(badH.ok).toBe(false);
    if (!badH.ok) expect(badH.error.code).toBe('INVALID_HEIGHT');
    const badW = calculateBmi({ heightCm: 175, weightKg: NaN });
    expect(badW.ok).toBe(false);
    if (!badW.ok) expect(badW.error.code).toBe('INVALID_WEIGHT');
  });
});
