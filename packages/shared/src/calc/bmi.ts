import { AGE_REFERENCE_NOTE } from './constants';
import { ok, type CalcResult } from './result';
import { round1 } from './round';
import type { BmiCategory } from './types';
import { requirePositive } from './validate';

export interface BmiInput {
  heightCm: number;
  weightKg: number;
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  label: string;
  interpretation: string;
}

function classifyBmi(bmi: number): { category: BmiCategory; label: string } {
  if (bmi < 18.5) return { category: 'underweight', label: '偏瘦' };
  if (bmi < 24) return { category: 'normal', label: '标准' };
  if (bmi < 28) return { category: 'overweight', label: '超重' };
  return { category: 'obese', label: '肥胖' };
}

export function calculateBmi(input: BmiInput): CalcResult<BmiResult> {
  const height = requirePositive(input.heightCm, 'INVALID_HEIGHT');
  if (!height.ok) return height;
  const weight = requirePositive(input.weightKg, 'INVALID_WEIGHT');
  if (!weight.ok) return weight;

  const heightM = height.data / 100;
  const bmi = round1(weight.data / (heightM * heightM));
  const { category, label } = classifyBmi(bmi);

  return ok({
    bmi,
    category,
    label,
    interpretation: `BMI 为 ${bmi}，属于「${label}」范围。${AGE_REFERENCE_NOTE}。`,
  });
}
