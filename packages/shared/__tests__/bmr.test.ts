import { describe, expect, it } from 'vitest';
import { calculateBmr } from '../src/index';

describe('calculateBmr', () => {
  it('male Mifflin-St Jeor fixture → 1649', () => {
    const a = calculateBmr({
      sex: 'male',
      ageYears: 30,
      heightCm: 175,
      weightKg: 70,
    });
    const b = calculateBmr({
      sex: 'male',
      ageYears: 30,
      heightCm: 175,
      weightKg: 70,
    });
    expect(a).toEqual(b);
    expect(a.ok && a.data.bmrKcal).toBe(1649);
  });

  it('female formula differs from male', () => {
    const female = calculateBmr({
      sex: 'female',
      ageYears: 30,
      heightCm: 175,
      weightKg: 70,
    });
    expect(female.ok && female.data.bmrKcal).toBe(1483);
  });

  it('rejects invalid sex/age/height/weight', () => {
    const sex = calculateBmr({
      sex: 'x' as 'male',
      ageYears: 30,
      heightCm: 175,
      weightKg: 70,
    });
    expect(sex.ok).toBe(false);
    if (!sex.ok) expect(sex.error.code).toBe('INVALID_SEX');

    const age = calculateBmr({
      sex: 'male',
      ageYears: 0,
      heightCm: 175,
      weightKg: 70,
    });
    expect(age.ok).toBe(false);
    if (!age.ok) expect(age.error.code).toBe('INVALID_AGE');

    const ageNaN = calculateBmr({
      sex: 'male',
      ageYears: Number.NaN,
      heightCm: 175,
      weightKg: 70,
    });
    expect(ageNaN.ok).toBe(false);

    const ageInf = calculateBmr({
      sex: 'male',
      ageYears: Number.POSITIVE_INFINITY,
      heightCm: 175,
      weightKg: 70,
    });
    expect(ageInf.ok).toBe(false);

    const ageStr = calculateBmr({
      sex: 'male',
      ageYears: '30' as unknown as number,
      heightCm: 175,
      weightKg: 70,
    });
    expect(ageStr.ok).toBe(false);

    expect(
      calculateBmr({
        sex: 'male',
        ageYears: 30,
        heightCm: -1,
        weightKg: 70,
      }).ok,
    ).toBe(false);
    expect(
      calculateBmr({
        sex: 'male',
        ageYears: 30,
        heightCm: 175,
        weightKg: 0,
      }).ok,
    ).toBe(false);
  });

  it('allows age > 120 with reference note', () => {
    const r = calculateBmr({
      sex: 'male',
      ageYears: 121,
      heightCm: 175,
      weightKg: 70,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.referenceNote).toContain('仅供参考');
  });
});
