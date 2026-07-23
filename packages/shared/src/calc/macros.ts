import {
  FAT_G_PER_KG,
  FAT_RANGE,
  PROTEIN_G_PER_KG,
  PROTEIN_RANGE,
  TRAIN_CARB_BOOST,
  TRAIN_CARB_BOOST_RANGE,
} from './constants';
import { ok, type CalcResult } from './result';
import { round1 } from './round';
import type { NumericRange, NutritionGoal } from './types';
import { requireGoal, requirePositive } from './validate';

export interface MacroPlanInput {
  targetKcal: number;
  weightKg: number;
  goal: NutritionGoal;
}

export interface MacroPlanResult {
  proteinG: number;
  fatG: number;
  carbRestG: number;
  carbTrainG: number;
  proteinGPerKg: number;
  fatGPerKg: number;
  proteinRange: NumericRange;
  fatRange: NumericRange;
  trainCarbBoost: number;
  trainCarbBoostRange: NumericRange;
  structureTight: boolean;
  carbRestRangeG: NumericRange;
  carbTrainRangeG: NumericRange;
}

function carbGramsFromRemain(targetKcal: number, proteinG: number, fatG: number): number {
  const remain = targetKcal - proteinG * 4 - fatG * 9;
  if (remain < 0) return 0;
  return round1(remain / 4);
}

function orderedRange(a: number, b: number): NumericRange {
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

export function calculateMacroPlan(
  input: MacroPlanInput,
): CalcResult<MacroPlanResult> {
  const target = requirePositive(input.targetKcal, 'INVALID_TARGET_KCAL');
  if (!target.ok) return target;
  const weight = requirePositive(input.weightKg, 'INVALID_WEIGHT');
  if (!weight.ok) return weight;
  const goal = requireGoal(input.goal);
  if (!goal.ok) return goal;

  const proteinGPerKg = PROTEIN_G_PER_KG[goal.data];
  const proteinRange = { ...PROTEIN_RANGE[goal.data] };
  const fatRange = { ...FAT_RANGE };
  const proteinG = round1(weight.data * proteinGPerKg);
  const fatG = round1(weight.data * FAT_G_PER_KG);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const remainKcal = target.data - proteinKcal - fatKcal;

  let carbRestG: number;
  let structureTight: boolean;
  if (remainKcal < 0) {
    carbRestG = 0;
    structureTight = true;
  } else {
    carbRestG = round1(remainKcal / 4);
    structureTight = false;
  }
  const carbTrainG = round1(carbRestG * TRAIN_CARB_BOOST);

  let carbRestRangeG: NumericRange;
  let carbTrainRangeG: NumericRange;
  if (structureTight) {
    carbRestRangeG = { min: 0, max: 0 };
    carbTrainRangeG = { min: 0, max: 0 };
  } else {
    const protMaxG = weight.data * proteinRange.max;
    const protMinG = weight.data * proteinRange.min;
    const fatMaxG = weight.data * fatRange.max;
    const fatMinG = weight.data * fatRange.min;
    // Max protein+fat → lower remaining carbs; min protein+fat → higher carbs
    const restLow = carbGramsFromRemain(target.data, protMaxG, fatMaxG);
    const restHigh = carbGramsFromRemain(target.data, protMinG, fatMinG);
    carbRestRangeG = orderedRange(restLow, restHigh);
    carbTrainRangeG = orderedRange(
      round1(carbRestRangeG.min * (1 + TRAIN_CARB_BOOST_RANGE.min)),
      round1(carbRestRangeG.max * (1 + TRAIN_CARB_BOOST_RANGE.max)),
    );
  }

  return ok({
    proteinG,
    fatG,
    carbRestG,
    carbTrainG,
    proteinGPerKg,
    fatGPerKg: FAT_G_PER_KG,
    proteinRange,
    fatRange,
    trainCarbBoost: TRAIN_CARB_BOOST,
    trainCarbBoostRange: { ...TRAIN_CARB_BOOST_RANGE },
    structureTight,
    carbRestRangeG,
    carbTrainRangeG,
  });
}
