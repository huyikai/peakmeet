import { AGE_REFERENCE_NOTE } from './constants';
import { ok, type CalcResult } from './result';
import { roundKcal } from './round';
import type { Sex } from './types';
import {
  requireAgeYears,
  requirePositive,
  requireSex,
} from './validate';

export interface BmrInput {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
}

export interface BmrResult {
  bmrKcal: number;
  referenceNote?: string;
}

export function calculateBmr(input: BmrInput): CalcResult<BmrResult> {
  const sex = requireSex(input.sex);
  if (!sex.ok) return sex;
  const age = requireAgeYears(input.ageYears);
  if (!age.ok) return age;
  const height = requirePositive(input.heightCm, 'INVALID_HEIGHT');
  if (!height.ok) return height;
  const weight = requirePositive(input.weightKg, 'INVALID_WEIGHT');
  if (!weight.ok) return weight;

  const base =
    10 * weight.data + 6.25 * height.data - 5 * age.data;
  const raw = sex.data === 'male' ? base + 5 : base - 161;
  const bmrKcal = roundKcal(raw);

  const result: BmrResult = { bmrKcal };
  if (age.data > 120) {
    result.referenceNote = AGE_REFERENCE_NOTE;
  }
  return ok(result);
}
