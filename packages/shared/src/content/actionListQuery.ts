import {
  ACTION_DIFFICULTY_OPTIONS,
  ACTION_GOAL_OPTIONS,
  ACTION_PRIMARY_MUSCLE_OPTIONS,
  BODYWEIGHT_EQUIPMENT_ID,
} from './actionCatalogOptions';
import type {
  ActionListQueryInput,
  ActionTaxonomyFilter,
  ContentQueryResult,
  Difficulty,
  NormalizedActionListQuery,
} from './types';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 80;
const CURSOR_PREFIX = 'action:';
const SAFE_TAXONOMY_ID = /^[\p{L}\p{N}_][\p{L}\p{N}_.:/ -]{0,63}$/u;
const SAFE_ACTION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

const MUSCLE_IDS = new Set(ACTION_PRIMARY_MUSCLE_OPTIONS.map(({ id }) => id));
const GOAL_IDS = new Set(ACTION_GOAL_OPTIONS.map(({ id }) => id));
const DIFFICULTIES = new Set<string>(
  ACTION_DIFFICULTY_OPTIONS.map(({ id }) => id),
);

function invalid(message: string): ContentQueryResult<never> {
  return { ok: false, code: 'INVALID_FILTER', message };
}

function nullableTaxonomyId(
  value: unknown,
  allowed: ReadonlySet<string> | null,
  label: string,
): ContentQueryResult<string | null> {
  if (value === undefined || value === null || value === '') {
    return { ok: true, value: null };
  }
  if (
    typeof value !== 'string' ||
    !SAFE_TAXONOMY_ID.test(value) ||
    (allowed && !allowed.has(value))
  ) {
    return invalid(`${label} 不在白名单`);
  }
  return { ok: true, value };
}

function normalizeTaxonomy(
  input: unknown,
): ContentQueryResult<ActionTaxonomyFilter> {
  if (input === undefined || input === null) {
    return {
      ok: true,
      value: {
        primaryMuscle: null,
        equipmentId: null,
        difficulty: null,
        goal: null,
      },
    };
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return invalid('taxonomy 须为对象');
  }

  const taxonomy = input as Record<string, unknown>;
  const allowedKeys = new Set([
    'primaryMuscle',
    'equipmentId',
    'difficulty',
    'goal',
  ]);
  const unknownKey = Object.keys(taxonomy).find((key) => !allowedKeys.has(key));
  if (unknownKey) return invalid(`不允许的 taxonomy 字段: ${unknownKey}`);

  const primaryMuscle = nullableTaxonomyId(
    taxonomy.primaryMuscle,
    MUSCLE_IDS,
    'primaryMuscle',
  );
  if (!primaryMuscle.ok) return primaryMuscle;
  const equipmentId = nullableTaxonomyId(
    taxonomy.equipmentId,
    null,
    'equipmentId',
  );
  if (!equipmentId.ok) return equipmentId;
  const difficulty = nullableTaxonomyId(
    taxonomy.difficulty,
    DIFFICULTIES,
    'difficulty',
  );
  if (!difficulty.ok) return difficulty;
  const goal = nullableTaxonomyId(taxonomy.goal, GOAL_IDS, 'goal');
  if (!goal.ok) return goal;

  return {
    ok: true,
    value: {
      primaryMuscle: primaryMuscle.value,
      equipmentId:
        equipmentId.value === BODYWEIGHT_EQUIPMENT_ID
          ? BODYWEIGHT_EQUIPMENT_ID
          : equipmentId.value,
      difficulty: difficulty.value as Difficulty | null,
      goal: goal.value,
    },
  };
}

export function encodeActionListCursor(id: string): string {
  if (!SAFE_ACTION_ID.test(id)) return '';
  return `${CURSOR_PREFIX}${encodeURIComponent(id)}`;
}

export function decodeActionListCursor(cursor: string): string | null {
  if (!cursor.startsWith(CURSOR_PREFIX)) return null;
  try {
    const id = decodeURIComponent(cursor.slice(CURSOR_PREFIX.length));
    return SAFE_ACTION_ID.test(id) && encodeActionListCursor(id) === cursor
      ? id
      : null;
  } catch {
    return null;
  }
}

export function validateActionListQuery(
  input: ActionListQueryInput,
): ContentQueryResult<NormalizedActionListQuery> {
  const limit = input.limit ?? DEFAULT_LIMIT;
  if (
    typeof limit !== 'number' ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    return {
      ok: false,
      code: 'INVALID_PAGINATION',
      message: `limit 须为 1–${MAX_LIMIT} 的整数`,
    };
  }

  const rawOffset = input.offset ?? 0;
  if (
    typeof rawOffset !== 'number' ||
    !Number.isSafeInteger(rawOffset) ||
    rawOffset < 0
  ) {
    return {
      ok: false,
      code: 'INVALID_PAGINATION',
      message: 'offset 须为非负安全整数',
    };
  }

  let cursor: string | null = null;
  if (input.cursor !== undefined && input.cursor !== null && input.cursor !== '') {
    if (typeof input.cursor !== 'string') {
      return {
        ok: false,
        code: 'INVALID_PAGINATION',
        message: 'cursor 格式非法',
      };
    }
    cursor = decodeActionListCursor(input.cursor);
    if (!cursor) {
      return {
        ok: false,
        code: 'INVALID_PAGINATION',
        message: 'cursor 格式非法',
      };
    }
  }

  const rawSearch = input.search ?? '';
  if (typeof rawSearch !== 'string') return invalid('search 须为字符串');
  const search = rawSearch.trim();
  if (search.length > MAX_SEARCH_LENGTH) return invalid('search 最长 80 个字符');

  const taxonomy = normalizeTaxonomy(input.taxonomy);
  if (!taxonomy.ok) return taxonomy;

  return {
    ok: true,
    value: {
      limit,
      offset: cursor ? 0 : rawOffset,
      cursor,
      search,
      taxonomy: taxonomy.value,
    },
  };
}
