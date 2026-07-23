import { describe, expect, it } from 'vitest';
import { calculateWhr } from '../src/index';

describe('calculateWhr', () => {
  it('male 90/100 → 0.9 moderate', () => {
    const r = calculateWhr({ sex: 'male', waistCm: 90, hipCm: 100 });
    expect(r.ok && r.data.whr).toBe(0.9);
    expect(r.ok && r.data.riskLevel).toBe('moderate');
    expect(r.ok && r.data.label).toBe('中等风险');
  });

  it('covers male/female risk tiers', () => {
    expect(
      calculateWhr({ sex: 'male', waistCm: 80, hipCm: 100 }).ok &&
        (
          calculateWhr({ sex: 'male', waistCm: 80, hipCm: 100 }) as {
            ok: true;
            data: { riskLevel: string };
          }
        ).data.riskLevel,
    ).toBe('low');
    expect(
      (
        calculateWhr({ sex: 'male', waistCm: 100, hipCm: 100 }) as {
          ok: true;
          data: { riskLevel: string };
        }
      ).data.riskLevel,
    ).toBe('high');
    expect(
      (
        calculateWhr({ sex: 'female', waistCm: 70, hipCm: 100 }) as {
          ok: true;
          data: { riskLevel: string };
        }
      ).data.riskLevel,
    ).toBe('low');
    expect(
      (
        calculateWhr({ sex: 'female', waistCm: 82, hipCm: 100 }) as {
          ok: true;
          data: { riskLevel: string };
        }
      ).data.riskLevel,
    ).toBe('moderate');
    expect(
      (
        calculateWhr({ sex: 'female', waistCm: 85, hipCm: 100 }) as {
          ok: true;
          data: { riskLevel: string };
        }
      ).data.riskLevel,
    ).toBe('high');
  });

  it('rejects invalid sex/waist/hip', () => {
    expect(
      calculateWhr({ sex: 'x' as 'male', waistCm: 80, hipCm: 100 }).ok,
    ).toBe(false);
    const waist = calculateWhr({ sex: 'male', waistCm: 0, hipCm: 100 });
    expect(waist.ok).toBe(false);
    if (!waist.ok) expect(waist.error.code).toBe('INVALID_WAIST');
    const hip = calculateWhr({ sex: 'male', waistCm: 80, hipCm: -1 });
    expect(hip.ok).toBe(false);
    if (!hip.ok) expect(hip.error.code).toBe('INVALID_HIP');
  });
});
