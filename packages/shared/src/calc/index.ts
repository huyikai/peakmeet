export type {
  ActivityLevel,
  BmiCategory,
  BodyFatCategory,
  NumericRange,
  NutritionGoal,
  Sex,
  WhrRiskLevel,
} from './types';

export {
  CALC_ERROR_CODES,
  err,
  isCalcErr,
  isCalcOk,
  ok,
  type CalcError,
  type CalcErrorCode,
  type CalcResult,
} from './result';

export {
  ACTIVITY_FACTORS,
  BMR_FLOOR_HINT,
  FITNESS_DISCLAIMER,
  GOAL_DELTA_KCAL,
} from './constants';

export { calculateBmi, type BmiInput, type BmiResult } from './bmi';
export { calculateBmr, type BmrInput, type BmrResult } from './bmr';
export { calculateTdee, type TdeeInput, type TdeeResult } from './tdee';
export {
  calculateTargetIntake,
  type TargetIntakeInput,
  type TargetIntakeResult,
} from './targetIntake';
export {
  calculateMacroPlan,
  type MacroPlanInput,
  type MacroPlanResult,
} from './macros';
export { estimateOneRm, type OneRmInput, type OneRmResult } from './oneRm';
export {
  estimateBodyFat,
  type BodyFatInput,
  type BodyFatResult,
} from './bodyFat';
export { calculateWhr, type WhrInput, type WhrResult } from './whr';
