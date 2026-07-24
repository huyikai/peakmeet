import type { Action, Difficulty } from './types';
import { BODYWEIGHT_EQUIPMENT_ID } from './actionCatalogOptions';

export type ActionCatalogFilters = {
  primaryMuscle: string | null;
  equipmentId: string | null;
  difficulty: Difficulty | null;
  goal: string | null;
  keyword: string;
};

const DIFFICULTIES: readonly Difficulty[] = [
  'beginner',
  'intermediate',
  'advanced',
];

function emptyFilters(): ActionCatalogFilters {
  return {
    primaryMuscle: null,
    equipmentId: null,
    difficulty: null,
    goal: null,
    keyword: '',
  };
}

function asSingleString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t ? t : null;
}

function asDifficulty(value: unknown): Difficulty | null {
  if (typeof value !== 'string') return null;
  return (DIFFICULTIES as readonly string[]).includes(value)
    ? (value as Difficulty)
    : null;
}

export function normalizeActionCatalogFilters(
  input: unknown,
): ActionCatalogFilters {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return emptyFilters();
  }
  const o = input as Record<string, unknown>;
  const keywordRaw = o.keyword;
  return {
    primaryMuscle: asSingleString(o.primaryMuscle),
    equipmentId: asSingleString(o.equipmentId),
    difficulty: asDifficulty(o.difficulty),
    goal: asSingleString(o.goal),
    keyword:
      typeof keywordRaw === 'string' ? keywordRaw.trim() : '',
  };
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function matchAction(
  action: Action,
  filters: ActionCatalogFilters,
): boolean {
  if (
    filters.primaryMuscle &&
    !action.primaryMuscles.includes(filters.primaryMuscle)
  ) {
    return false;
  }

  if (filters.equipmentId) {
    if (filters.equipmentId === BODYWEIGHT_EQUIPMENT_ID) {
      if (action.equipment && action.equipment.length > 0) return false;
    } else if (!action.equipment?.includes(filters.equipmentId)) {
      return false;
    }
  }

  if (filters.difficulty && action.difficulty !== filters.difficulty) {
    return false;
  }

  if (filters.goal && !action.goals.includes(filters.goal)) {
    return false;
  }

  if (filters.keyword) {
    const kw = filters.keyword;
    const inName = includesInsensitive(action.name, kw);
    const inAlias = (action.aliases ?? []).some((a) =>
      includesInsensitive(a, kw),
    );
    if (!inName && !inAlias) return false;
  }

  return true;
}

export function filterActions(
  actions: Action[],
  filters: ActionCatalogFilters,
): Action[] {
  return actions.filter((a) => matchAction(a, filters));
}

export function pickRandomAction(
  actions: Action[],
  random: () => number = Math.random,
): Action | null {
  if (actions.length === 0) return null;
  let r = random();
  if (!Number.isFinite(r) || r < 0) r = 0;
  if (r >= 1) r = 0.999999999;
  const idx = Math.min(
    actions.length - 1,
    Math.floor(r * actions.length),
  );
  return actions[idx] ?? null;
}
