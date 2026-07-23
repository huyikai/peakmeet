export type CalcErrorCode =
  | 'INVALID_HEIGHT'
  | 'INVALID_WEIGHT'
  | 'INVALID_AGE'
  | 'INVALID_SEX'
  | 'INVALID_ACTIVITY'
  | 'INVALID_GOAL'
  | 'INVALID_LOAD'
  | 'INVALID_REPS'
  | 'INVALID_WAIST'
  | 'INVALID_HIP'
  | 'INVALID_BMR'
  | 'INVALID_TDEE'
  | 'INVALID_TARGET_KCAL';

export const CALC_ERROR_CODES: readonly CalcErrorCode[] = [
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
] as const;

export interface CalcError {
  code: CalcErrorCode;
  message: string;
}

export type CalcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CalcError };

export function ok<T>(data: T): CalcResult<T> {
  return { ok: true, data };
}

export function err<T = never>(code: CalcErrorCode, message: string): CalcResult<T> {
  return { ok: false, error: { code, message } };
}

export function isCalcOk<T>(result: CalcResult<T>): result is { ok: true; data: T } {
  return result.ok === true;
}

export function isCalcErr<T>(
  result: CalcResult<T>,
): result is { ok: false; error: CalcError } {
  return result.ok === false;
}
