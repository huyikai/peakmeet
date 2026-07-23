import { ok, type CalcResult } from './result';
import { round1 } from './round';
import type { Sex, WhrRiskLevel } from './types';
import { requirePositive, requireSex } from './validate';

export interface WhrInput {
  sex: Sex;
  waistCm: number;
  hipCm: number;
}

export interface WhrResult {
  whr: number;
  riskLevel: WhrRiskLevel;
  label: string;
}

function classifyWhr(
  sex: Sex,
  whr: number,
): { riskLevel: WhrRiskLevel; label: string } {
  if (sex === 'male') {
    if (whr < 0.9) return { riskLevel: 'low', label: '较低风险' };
    if (whr < 1.0) return { riskLevel: 'moderate', label: '中等风险' };
    return { riskLevel: 'high', label: '较高风险' };
  }
  if (whr < 0.8) return { riskLevel: 'low', label: '较低风险' };
  if (whr < 0.85) return { riskLevel: 'moderate', label: '中等风险' };
  return { riskLevel: 'high', label: '较高风险' };
}

export function calculateWhr(input: WhrInput): CalcResult<WhrResult> {
  const sex = requireSex(input.sex);
  if (!sex.ok) return sex;
  const waist = requirePositive(input.waistCm, 'INVALID_WAIST');
  if (!waist.ok) return waist;
  const hip = requirePositive(input.hipCm, 'INVALID_HIP');
  if (!hip.ok) return hip;

  const whr = round1(waist.data / hip.data);
  const { riskLevel, label } = classifyWhr(sex.data, whr);
  return ok({ whr, riskLevel, label });
}
