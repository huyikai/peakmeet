import { AGE_REFERENCE_NOTE } from './constants';
import { ok, type CalcResult } from './result';
import { clamp, round1 } from './round';
import type { BodyFatCategory, Sex } from './types';
import {
  requireAgeYears,
  requirePositive,
  requireSex,
} from './validate';

export interface BodyFatInput {
  sex: Sex;
  ageYears: number;
  waistCm: number;
  weightKg: number;
}

export interface BodyFatResult {
  bodyFatPct: number;
  category: BodyFatCategory;
  label: string;
  interpretation: string;
  formulaId: 'pww-v1';
}

function classifyBodyFat(
  sex: Sex,
  pct: number,
): { category: BodyFatCategory; label: string } {
  if (sex === 'male') {
    if (pct < 14) return { category: 'low', label: '偏低' };
    if (pct <= 20) return { category: 'normal', label: '标准' };
    if (pct <= 25) return { category: 'high', label: '偏高' };
    return { category: 'veryHigh', label: '过高' };
  }
  if (pct < 21) return { category: 'low', label: '偏低' };
  if (pct <= 29) return { category: 'normal', label: '标准' };
  if (pct <= 35) return { category: 'high', label: '偏高' };
  return { category: 'veryHigh', label: '过高' };
}

export function estimateBodyFat(input: BodyFatInput): CalcResult<BodyFatResult> {
  const sex = requireSex(input.sex);
  if (!sex.ok) return sex;
  const age = requireAgeYears(input.ageYears);
  if (!age.ok) return age;
  const waist = requirePositive(input.waistCm, 'INVALID_WAIST');
  if (!waist.ok) return waist;
  const weight = requirePositive(input.weightKg, 'INVALID_WEIGHT');
  if (!weight.ok) return weight;

  const sexAdj = sex.data === 'male' ? -5 : 8;
  const raw =
    0.4 * waist.data + 0.15 * age.data - 0.2 * weight.data + sexAdj;
  const bodyFatPct = clamp(round1(raw), 3.0, 60.0);
  const { category, label } = classifyBodyFat(sex.data, bodyFatPct);

  const note = age.data > 120 ? AGE_REFERENCE_NOTE : '仅供参考、非医疗建议';
  return ok({
    bodyFatPct,
    category,
    label,
    interpretation: `体脂率估算约 ${bodyFatPct}%，属于「${label}」。${note}。`,
    formulaId: 'pww-v1',
  });
}
