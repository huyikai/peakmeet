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

  return ok({
    proteinG,
    fatG,
    carbRestG,
    carbTrainG,
    proteinGPerKg,
    fatGPerKg: FAT_G_PER_KG,
    proteinRange: { ...PROTEIN_RANGE[goal.data] },
    fatRange: { ...FAT_RANGE },
    trainCarbBoost: TRAIN_CARB_BOOST,
    trainCarbBoostRange: { ...TRAIN_CARB_BOOST_RANGE },
    structureTight,
  });
}
