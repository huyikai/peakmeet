import { describe, expect, it } from 'vitest';
import { calculateTdee } from '../src/index';

describe('calculateTdee', () => {
  it('1649 × sedentary → 1979', () => {
    const a = calculateTdee({ bmrKcal: 1649, activityLevel: 'sedentary' });
    const b = calculateTdee({ bmrKcal: 1649, activityLevel: 'sedentary' });
    expect(a).toEqual(b);
    expect(a.ok && a.data.tdeeKcal).toBe(1979);
    expect(a.ok && a.data.activityFactor).toBe(1.2);
  });

  it('applies all five activity factors', () => {
    expect(
      calculateTdee({ bmrKcal: 1000, activityLevel: 'light' }).ok &&
        calculateTdee({ bmrKcal: 1000, activityLevel: 'light' }).ok &&
        (
          calculateTdee({ bmrKcal: 1000, activityLevel: 'light' }) as {
            ok: true;
            data: { tdeeKcal: number };
          }
        ).data.tdeeKcal,
    ).toBe(1375);
    expect(
      (
        calculateTdee({ bmrKcal: 1000, activityLevel: 'moderate' }) as {
          ok: true;
          data: { tdeeKcal: number };
        }
      ).data.tdeeKcal,
    ).toBe(1550);
    expect(
      (
        calculateTdee({ bmrKcal: 1000, activityLevel: 'active' }) as {
          ok: true;
          data: { tdeeKcal: number };
        }
      ).data.tdeeKcal,
    ).toBe(1725);
    expect(
      (
        calculateTdee({ bmrKcal: 1000, activityLevel: 'veryActive' }) as {
          ok: true;
          data: { tdeeKcal: number };
        }
      ).data.tdeeKcal,
    ).toBe(1900);
  });

  it('rejects invalid bmr/activity', () => {
    const bmr = calculateTdee({ bmrKcal: 0, activityLevel: 'sedentary' });
    expect(bmr.ok).toBe(false);
    if (!bmr.ok) expect(bmr.error.code).toBe('INVALID_BMR');
    const act = calculateTdee({
      bmrKcal: 1600,
      activityLevel: 'zzz' as 'light',
    });
    expect(act.ok).toBe(false);
    if (!act.ok) expect(act.error.code).toBe('INVALID_ACTIVITY');
  });
});
