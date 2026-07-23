import { describe, expect, it } from 'vitest';
import { estimateBodyFat } from '../src/index';

describe('estimateBodyFat', () => {
  it('PWW-v1 male fixture → 18.5 normal', () => {
    const r = estimateBodyFat({
      sex: 'male',
      ageYears: 30,
      waistCm: 85,
      weightKg: 75,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.bodyFatPct).toBe(18.5);
    expect(r.data.category).toBe('normal');
    expect(r.data.formulaId).toBe('pww-v1');
  });

  it('PWW-v1 female fixture → 30.2 high', () => {
    const r = estimateBodyFat({
      sex: 'female',
      ageYears: 28,
      waistCm: 75,
      weightKg: 60,
    });
    expect(r.ok && r.data.bodyFatPct).toBe(30.2);
    expect(r.ok && r.data.category).toBe('high');
    expect(r.ok && r.data.label).toBe('偏高');
  });

  it('classifies low/veryHigh bands and clamps', () => {
    const lowM = estimateBodyFat({
      sex: 'male',
      ageYears: 20,
      waistCm: 60,
      weightKg: 90,
    });
    expect(lowM.ok && lowM.data.category).toBe('low');

    const highM = estimateBodyFat({
      sex: 'male',
      ageYears: 35,
      waistCm: 95,
      weightKg: 70,
    });
    expect(highM.ok && highM.data.bodyFatPct).toBe(24.3);
    expect(highM.ok && highM.data.category).toBe('high');

    const veryHighM = estimateBodyFat({
      sex: 'male',
      ageYears: 50,
      waistCm: 120,
      weightKg: 70,
    });
    expect(veryHighM.ok && veryHighM.data.category).toBe('veryHigh');

    const lowF = estimateBodyFat({
      sex: 'female',
      ageYears: 20,
      waistCm: 55,
      weightKg: 70,
    });
    expect(lowF.ok && lowF.data.category).toBe('low');

    const normalF = estimateBodyFat({
      sex: 'female',
      ageYears: 25,
      waistCm: 70,
      weightKg: 60,
    });
    expect(normalF.ok && normalF.data.category).toBe('normal');

    const veryHighF = estimateBodyFat({
      sex: 'female',
      ageYears: 40,
      waistCm: 110,
      weightKg: 55,
    });
    expect(veryHighF.ok && veryHighF.data.category).toBe('veryHigh');
    expect(veryHighF.ok && veryHighF.data.bodyFatPct).toBeLessThanOrEqual(60);
  });

  it('rejects invalid inputs and notes age > 120', () => {
    expect(
      estimateBodyFat({
        sex: 'x' as 'male',
        ageYears: 30,
        waistCm: 80,
        weightKg: 70,
      }).ok,
    ).toBe(false);
    expect(
      estimateBodyFat({
        sex: 'male',
        ageYears: 0,
        waistCm: 80,
        weightKg: 70,
      }).ok,
    ).toBe(false);
    const waist = estimateBodyFat({
      sex: 'male',
      ageYears: 30,
      waistCm: 0,
      weightKg: 70,
    });
    expect(waist.ok).toBe(false);
    if (!waist.ok) expect(waist.error.code).toBe('INVALID_WAIST');
    expect(
      estimateBodyFat({
        sex: 'male',
        ageYears: 30,
        waistCm: 80,
        weightKg: -1,
      }).ok,
    ).toBe(false);

    const old = estimateBodyFat({
      sex: 'female',
      ageYears: 121,
      waistCm: 75,
      weightKg: 60,
    });
    expect(old.ok && old.data.interpretation).toContain('仅供参考');
  });
});
