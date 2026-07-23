import { describe, expect, it } from 'vitest';
import { BMR_FLOOR_HINT, calculateTargetIntake } from '../src/index';

describe('calculateTargetIntake', () => {
  it('four goal midpoints without floor', () => {
    const base = { tdeeKcal: 2000, bmrKcal: 1500 };
    const maintain = calculateTargetIntake({ ...base, goal: 'maintain' });
    expect(maintain.ok && maintain.data.targetKcal).toBe(2000);
    expect(maintain.ok && maintain.data.deltaKcal).toBe(0);

    const mild = calculateTargetIntake({ ...base, goal: 'cutMild' });
    expect(mild.ok && mild.data.targetKcal).toBe(1600);
    expect(mild.ok && mild.data.deltaKcal).toBe(-400);
    expect(mild.ok && mild.data.deltaRange).toEqual({ min: -500, max: -300 });

    const agg = calculateTargetIntake({
      tdeeKcal: 2200,
      bmrKcal: 1500,
      goal: 'cutAggressive',
    });
    expect(agg.ok && agg.data.targetKcal).toBe(1600);
    expect(agg.ok && agg.data.bmrFloorApplied).toBe(false);

    const bulk = calculateTargetIntake({ ...base, goal: 'bulk' });
    expect(bulk.ok && bulk.data.targetKcal).toBe(2300);
    expect(bulk.ok && bulk.data.deltaKcal).toBe(300);
  });

  it('applies BMR floor with hint', () => {
    const r = calculateTargetIntake({
      tdeeKcal: 1800,
      bmrKcal: 1600,
      goal: 'cutAggressive',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.targetKcal).toBe(1600);
    expect(r.data.bmrFloorApplied).toBe(true);
    expect(r.data.hint).toBe(BMR_FLOOR_HINT);
  });

  it('rejects invalid tdee/bmr/goal', () => {
    const tdee = calculateTargetIntake({
      tdeeKcal: -1,
      bmrKcal: 1500,
      goal: 'maintain',
    });
    expect(tdee.ok).toBe(false);
    if (!tdee.ok) expect(tdee.error.code).toBe('INVALID_TDEE');

    const bmr = calculateTargetIntake({
      tdeeKcal: 2000,
      bmrKcal: 0,
      goal: 'maintain',
    });
    expect(bmr.ok).toBe(false);
    if (!bmr.ok) expect(bmr.error.code).toBe('INVALID_BMR');

    const goal = calculateTargetIntake({
      tdeeKcal: 2000,
      bmrKcal: 1500,
      goal: 'x' as 'maintain',
    });
    expect(goal.ok).toBe(false);
    if (!goal.ok) expect(goal.error.code).toBe('INVALID_GOAL');
  });
});
