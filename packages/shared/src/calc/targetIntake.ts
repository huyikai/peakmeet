import {
  BMR_FLOOR_HINT,
  GOAL_DELTA_KCAL,
  GOAL_DELTA_RANGE,
} from './constants';
import { ok, type CalcResult } from './result';
import { roundKcal } from './round';
import type { NumericRange, NutritionGoal } from './types';
import { requireGoal, requirePositive } from './validate';

export interface TargetIntakeInput {
  tdeeKcal: number;
  bmrKcal: number;
  goal: NutritionGoal;
}

export interface TargetIntakeResult {
  targetKcal: number;
  goal: NutritionGoal;
  deltaKcal: number;
  deltaRange: NumericRange;
  bmrFloorApplied: boolean;
  hint: string | null;
}

export function calculateTargetIntake(
  input: TargetIntakeInput,
): CalcResult<TargetIntakeResult> {
  const tdee = requirePositive(input.tdeeKcal, 'INVALID_TDEE');
  if (!tdee.ok) return tdee;
  const bmr = requirePositive(input.bmrKcal, 'INVALID_BMR');
  if (!bmr.ok) return bmr;
  const goal = requireGoal(input.goal);
  if (!goal.ok) return goal;

  const deltaKcal = GOAL_DELTA_KCAL[goal.data];
  const deltaRange = GOAL_DELTA_RANGE[goal.data];
  const raw = tdee.data + deltaKcal;

  if (raw < bmr.data) {
    return ok({
      targetKcal: roundKcal(bmr.data),
      goal: goal.data,
      deltaKcal,
      deltaRange: { ...deltaRange },
      bmrFloorApplied: true,
      hint: BMR_FLOOR_HINT,
    });
  }

  return ok({
    targetKcal: roundKcal(raw),
    goal: goal.data,
    deltaKcal,
    deltaRange: { ...deltaRange },
    bmrFloorApplied: false,
    hint: null,
  });
}
