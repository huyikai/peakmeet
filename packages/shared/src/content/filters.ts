import type { PublicCollection } from './types';

export const LIST_FILTER_KEYS = {
  actions: ['difficulty', 'primaryScene'] as const,
  equipment: ['type', 'primaryScene', 'difficulty'] as const,
  training_plans: ['goal', 'scene', 'difficulty', 'category', 'hot'] as const,
  foods: ['category', 'recommendGrade'] as const,
} as const satisfies Record<PublicCollection, readonly string[]>;

export function isAllowedFilterKey(
  collection: PublicCollection,
  key: string,
): boolean {
  return (LIST_FILTER_KEYS[collection] as readonly string[]).includes(key);
}
