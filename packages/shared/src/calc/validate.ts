import { ERROR_MESSAGES } from './constants';
import { err, type CalcErrorCode, type CalcResult } from './result';
import type { ActivityLevel, NutritionGoal, Sex } from './types';

const SEXES: readonly Sex[] = ['male', 'female'];
const ACTIVITIES: readonly ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'veryActive',
];
const GOALS: readonly NutritionGoal[] = [
  'cutMild',
  'cutAggressive',
  'bulk',
  'maintain',
];

export function fail<T>(code: CalcErrorCode): CalcResult<T> {
  return err(code, ERROR_MESSAGES[code]);
}

export function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function requirePositive(
  value: unknown,
  code: CalcErrorCode,
): CalcResult<number> {
  if (!isFinitePositive(value)) {
    return fail(code);
  }
  return { ok: true, data: value };
}

/** Positive integer age ≥ 1; non-integer or < 1 fails. Age > 120 still allowed. */
export function requireAgeYears(value: unknown): CalcResult<number> {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fail('INVALID_AGE');
  }
  if (!Number.isInteger(value) || value < 1) {
    return fail('INVALID_AGE');
  }
  return { ok: true, data: value };
}

export function requireSex(value: unknown): CalcResult<Sex> {
  if (typeof value !== 'string' || !SEXES.includes(value as Sex)) {
    return fail('INVALID_SEX');
  }
  return { ok: true, data: value as Sex };
}

export function requireActivityLevel(
  value: unknown,
): CalcResult<ActivityLevel> {
  if (typeof value !== 'string' || !ACTIVITIES.includes(value as ActivityLevel)) {
    return fail('INVALID_ACTIVITY');
  }
  return { ok: true, data: value as ActivityLevel };
}

export function requireGoal(value: unknown): CalcResult<NutritionGoal> {
  if (typeof value !== 'string' || !GOALS.includes(value as NutritionGoal)) {
    return fail('INVALID_GOAL');
  }
  return { ok: true, data: value as NutritionGoal };
}

export function requireReps(value: unknown): CalcResult<number> {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 12) {
    return fail('INVALID_REPS');
  }
  return { ok: true, data: value };
}
