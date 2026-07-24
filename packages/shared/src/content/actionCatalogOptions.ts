import type { Difficulty } from './types';

export const BODYWEIGHT_EQUIPMENT_ID = '__bodyweight__' as const;

export type ActionCatalogOption = {
  id: string;
  labelZh: string;
};

export const ACTION_PRIMARY_MUSCLE_OPTIONS: readonly ActionCatalogOption[] = [
  { id: 'chest', labelZh: '胸' },
  { id: 'back', labelZh: '背' },
  { id: 'shoulders', labelZh: '肩' },
  { id: 'biceps', labelZh: '肱二头' },
  { id: 'triceps', labelZh: '肱三头' },
  { id: 'core', labelZh: '核心' },
  { id: 'quads', labelZh: '股四头' },
  { id: 'hamstrings', labelZh: '腘绳' },
  { id: 'glutes', labelZh: '臀' },
  { id: 'calves', labelZh: '小腿' },
] as const;

export const ACTION_GOAL_OPTIONS: readonly ActionCatalogOption[] = [
  { id: 'strength', labelZh: '力量' },
  { id: 'hypertrophy', labelZh: '增肌' },
  { id: 'conditioning', labelZh: '体能' },
  { id: 'mobility', labelZh: '灵活' },
] as const;

export const ACTION_DIFFICULTY_OPTIONS: readonly {
  id: Difficulty;
  labelZh: string;
}[] = [
  { id: 'beginner', labelZh: '初级' },
  { id: 'intermediate', labelZh: '中级' },
  { id: 'advanced', labelZh: '高级' },
] as const;

export const BODYWEIGHT_EQUIPMENT_OPTION: ActionCatalogOption = {
  id: BODYWEIGHT_EQUIPMENT_ID,
  labelZh: '自重/无器械',
};

export function muscleLabelZh(id: string): string {
  return (
    ACTION_PRIMARY_MUSCLE_OPTIONS.find((o) => o.id === id)?.labelZh ?? id
  );
}

export function difficultyLabelZh(d: Difficulty): string {
  return (
    ACTION_DIFFICULTY_OPTIONS.find((o) => o.id === d)?.labelZh ?? d
  );
}

export function goalLabelZh(id: string): string {
  return ACTION_GOAL_OPTIONS.find((o) => o.id === id)?.labelZh ?? id;
}
