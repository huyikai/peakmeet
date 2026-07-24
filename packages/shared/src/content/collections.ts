import type { PublicCollection } from './types';

export const PUBLIC_COLLECTIONS = [
  'actions',
  'equipment',
  'training_plans',
  'foods',
] as const satisfies readonly PublicCollection[];

export function isPublicCollection(value: unknown): value is PublicCollection {
  return (
    typeof value === 'string' &&
    (PUBLIC_COLLECTIONS as readonly string[]).includes(value)
  );
}
