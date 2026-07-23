import { describe, expect, it } from 'vitest';
import {
  CALC_ERROR_CODES,
  calculateBmi,
  calculateBmr,
  calculateMacroPlan,
  calculateTargetIntake,
  calculateTdee,
  calculateWhr,
  err,
  estimateBodyFat,
  estimateOneRm,
  isCalcErr,
  isCalcOk,
  ok,
} from '../src/index';

describe('CalcResult helpers', () => {
  it('ok/err discriminants and type guards', () => {
    const success = ok({ n: 1 });
    const failure = err('INVALID_HEIGHT', 'bad');
    expect(isCalcOk(success)).toBe(true);
    expect(isCalcErr(failure)).toBe(true);
    expect(isCalcOk(failure)).toBe(false);
    expect(isCalcErr(success)).toBe(false);
  });

  it('exposes all locked CalcErrorCode values', () => {
    expect(CALC_ERROR_CODES).toEqual([
      'INVALID_HEIGHT',
      'INVALID_WEIGHT',
      'INVALID_AGE',
      'INVALID_SEX',
      'INVALID_ACTIVITY',
      'INVALID_GOAL',
      'INVALID_LOAD',
      'INVALID_REPS',
      'INVALID_WAIST',
      'INVALID_HIP',
      'INVALID_BMR',
      'INVALID_TDEE',
      'INVALID_TARGET_KCAL',
    ]);
  });

  it('never throws on illegal inputs across public calc APIs', () => {
    const calls = [
      () => calculateBmi({ heightCm: NaN, weightKg: -1 }),
      () =>
        calculateBmr({
          sex: 'other' as 'male',
          ageYears: 0,
          heightCm: 0,
          weightKg: 0,
        }),
      () => calculateTdee({ bmrKcal: -1, activityLevel: 'x' as 'sedentary' }),
      () =>
        calculateTargetIntake({
          tdeeKcal: NaN,
          bmrKcal: Infinity,
          goal: 'x' as 'maintain',
        }),
      () =>
        calculateMacroPlan({
          targetKcal: 0,
          weightKg: -5,
          goal: 'nope' as 'bulk',
        }),
      () => estimateOneRm({ weight: 0, reps: 99 }),
      () =>
        estimateBodyFat({
          sex: 'x' as 'female',
          ageYears: 1.5,
          waistCm: -1,
          weightKg: 0,
        }),
      () => calculateWhr({ sex: 'male', waistCm: 0, hipCm: -1 }),
    ];
    for (const call of calls) {
      expect(() => call()).not.toThrow();
      expect(call().ok).toBe(false);
    }
  });

  it('rejects non-string enums and non-number reps', () => {
    expect(
      calculateTdee({
        bmrKcal: 1600,
        activityLevel: 1 as unknown as 'sedentary',
      }).ok,
    ).toBe(false);
    expect(
      calculateTargetIntake({
        tdeeKcal: 2000,
        bmrKcal: 1500,
        goal: 1 as unknown as 'maintain',
      }).ok,
    ).toBe(false);
    expect(
      estimateOneRm({ weight: 100, reps: '5' as unknown as number }).ok,
    ).toBe(false);
    expect(
      calculateBmr({
        sex: 1 as unknown as 'male',
        ageYears: 30,
        heightCm: 175,
        weightKg: 70,
      }).ok,
    ).toBe(false);
  });

  it('clamps body fat to minimum 3.0', () => {
    const r = estimateBodyFat({
      sex: 'male',
      ageYears: 1,
      waistCm: 1,
      weightKg: 200,
    });
    expect(r.ok && r.data.bodyFatPct).toBe(3);
  });

  it('covers cutAggressive macro protein midpoint', () => {
    const r = calculateMacroPlan({
      targetKcal: 2000,
      weightKg: 70,
      goal: 'cutAggressive',
    });
    expect(r.ok && r.data.proteinGPerKg).toBe(2);
  });
});
