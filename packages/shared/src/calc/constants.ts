import type { CalcErrorCode } from './result';
import type { ActivityLevel, NutritionGoal } from './types';

export const FITNESS_DISCLAIMER =
  '仅供参考，不构成专业健身指导，请根据自身身体状况量力而行';

export const BMR_FLOOR_HINT =
  '建议摄入已调整至不低于基础代谢（BMR），请量力而行。';

export const AGE_REFERENCE_NOTE = '仅供参考、非医疗建议';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const GOAL_DELTA_KCAL: Record<NutritionGoal, number> = {
  cutMild: -400,
  cutAggressive: -600,
  bulk: 300,
  maintain: 0,
};

export const GOAL_DELTA_RANGE: Record<
  NutritionGoal,
  { min: number; max: number }
> = {
  cutMild: { min: -500, max: -300 },
  cutAggressive: { min: -700, max: -500 },
  bulk: { min: 200, max: 400 },
  maintain: { min: 0, max: 0 },
};

export const PROTEIN_G_PER_KG: Record<NutritionGoal, number> = {
  cutMild: 2.0,
  cutAggressive: 2.0,
  bulk: 2.2,
  maintain: 2.0,
};

export const PROTEIN_RANGE: Record<
  NutritionGoal,
  { min: number; max: number }
> = {
  cutMild: { min: 1.8, max: 2.2 },
  cutAggressive: { min: 1.8, max: 2.2 },
  bulk: { min: 2.0, max: 2.4 },
  maintain: { min: 1.8, max: 2.2 },
};

export const FAT_G_PER_KG = 0.9;
export const FAT_RANGE = { min: 0.8, max: 1.0 } as const;

export const TRAIN_CARB_BOOST = 1.15;
export const TRAIN_CARB_BOOST_RANGE = { min: 0.1, max: 0.2 } as const;

export const ERROR_MESSAGES: Record<CalcErrorCode, string> = {
  INVALID_HEIGHT: '请输入有效的身高（厘米，须大于 0）。',
  INVALID_WEIGHT: '请输入有效的体重（千克，须大于 0）。',
  INVALID_AGE: '请输入有效的年龄（正整数，至少 1 岁）。',
  INVALID_SEX: '请选择有效的性别。',
  INVALID_ACTIVITY: '请选择有效的活动水平。',
  INVALID_GOAL: '请选择有效的训练目标。',
  INVALID_LOAD: '请输入有效的训练重量（须大于 0）。',
  INVALID_REPS: '次数须为 1–12 的整数。',
  INVALID_WAIST: '请输入有效的腰围（厘米，须大于 0）。',
  INVALID_HIP: '请输入有效的臀围（厘米，须大于 0）。',
  INVALID_BMR: '请输入有效的基础代谢热量（须大于 0）。',
  INVALID_TDEE: '请输入有效的每日总消耗热量（须大于 0）。',
  INVALID_TARGET_KCAL: '请输入有效的目标摄入热量（须大于 0）。',
};
