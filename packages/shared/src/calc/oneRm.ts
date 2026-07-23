import { ok, type CalcResult } from './result';
import { roundKcal } from './round';
import { requirePositive, requireReps } from './validate';

export interface OneRmInput {
  weight: number;
  reps: number;
}

export interface OneRmResult {
  oneRm: number;
  weight: number;
  reps: number;
  formula: 'epley';
}

export function estimateOneRm(input: OneRmInput): CalcResult<OneRmResult> {
  const weight = requirePositive(input.weight, 'INVALID_LOAD');
  if (!weight.ok) return weight;
  const reps = requireReps(input.reps);
  if (!reps.ok) return reps;

  const oneRm = roundKcal(weight.data * (1 + reps.data / 30));
  return ok({
    oneRm,
    weight: weight.data,
    reps: reps.data,
    formula: 'epley',
  });
}
