export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'veryActive';

export type NutritionGoal =
  | 'cutMild'
  | 'cutAggressive'
  | 'bulk'
  | 'maintain';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export type BodyFatCategory = 'low' | 'normal' | 'high' | 'veryHigh';

export type WhrRiskLevel = 'low' | 'moderate' | 'high';

export interface NumericRange {
  min: number;
  max: number;
}
