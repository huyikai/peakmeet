import { ACTIVITY_FACTORS } from './constants';
import { ok, type CalcResult } from './result';
import { roundKcal } from './round';
import type { ActivityLevel } from './types';
import { requireActivityLevel, requirePositive } from './validate';

export interface TdeeInput {
  bmrKcal: number;
  activityLevel: ActivityLevel;
}

export interface TdeeResult {
  tdeeKcal: number;
  activityLevel: ActivityLevel;
  activityFactor: number;
}

export function calculateTdee(input: TdeeInput): CalcResult<TdeeResult> {
  const bmr = requirePositive(input.bmrKcal, 'INVALID_BMR');
  if (!bmr.ok) return bmr;
  const activity = requireActivityLevel(input.activityLevel);
  if (!activity.ok) return activity;

  const activityFactor = ACTIVITY_FACTORS[activity.data];
  return ok({
    tdeeKcal: roundKcal(bmr.data * activityFactor),
    activityLevel: activity.data,
    activityFactor,
  });
}
