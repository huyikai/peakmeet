import { isPublicCollection } from './collections';
import { isAllowedFilterKey } from './filters';
import type {
  ContentQueryResult,
  GetByIdQueryInput,
  ListFilterValue,
  ListQueryInput,
  NormalizedGetByIdQuery,
  NormalizedListQuery,
} from './types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function isFilterValue(v: unknown): v is ListFilterValue {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

export function validateListQuery(
  input: ListQueryInput,
): ContentQueryResult<NormalizedListQuery> {
  if (!isPublicCollection(input.collection)) {
    return {
      ok: false,
      code: 'INVALID_COLLECTION',
      message: '集合不在白名单',
    };
  }

  let limit = DEFAULT_LIMIT;
  if (input.limit !== undefined && input.limit !== null) {
    if (
      typeof input.limit !== 'number' ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > MAX_LIMIT
    ) {
      return {
        ok: false,
        code: 'INVALID_PAGINATION',
        message: `limit 须为 1–${MAX_LIMIT} 的整数`,
      };
    }
    limit = input.limit;
  }

  let skip = 0;
  if (input.skip !== undefined && input.skip !== null) {
    if (
      typeof input.skip !== 'number' ||
      !Number.isInteger(input.skip) ||
      input.skip < 0
    ) {
      return {
        ok: false,
        code: 'INVALID_PAGINATION',
        message: 'skip 须为 ≥0 的整数',
      };
    }
    skip = input.skip;
  }

  const filter: Record<string, ListFilterValue> = {};
  if (input.filter !== undefined && input.filter !== null) {
    if (typeof input.filter !== 'object' || Array.isArray(input.filter)) {
      return {
        ok: false,
        code: 'INVALID_FILTER',
        message: 'filter 须为对象',
      };
    }
    for (const [key, value] of Object.entries(input.filter)) {
      if (!isAllowedFilterKey(input.collection, key)) {
        return {
          ok: false,
          code: 'INVALID_FILTER',
          message: `不允许的过滤字段: ${key}`,
        };
      }
      if (!isFilterValue(value)) {
        return {
          ok: false,
          code: 'INVALID_FILTER',
          message: `过滤值类型非法: ${key}`,
        };
      }
      filter[key] = value;
    }
  }

  return {
    ok: true,
    value: {
      collection: input.collection,
      limit,
      skip,
      filter,
    },
  };
}

export function validateGetByIdQuery(
  input: GetByIdQueryInput,
): ContentQueryResult<NormalizedGetByIdQuery> {
  if (!isPublicCollection(input.collection)) {
    return {
      ok: false,
      code: 'INVALID_COLLECTION',
      message: '集合不在白名单',
    };
  }
  if (typeof input.id !== 'string' || input.id.trim() === '') {
    return {
      ok: false,
      code: 'INVALID_ID',
      message: 'id 不能为空',
    };
  }
  return {
    ok: true,
    value: {
      collection: input.collection,
      id: input.id.trim(),
    },
  };
}
