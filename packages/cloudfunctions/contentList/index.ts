import {
  BODYWEIGHT_EQUIPMENT_ID,
  contentErr,
  contentOk,
  encodeActionListCursor,
  validateActionListQuery,
  validateListQuery,
  type ActionSummary,
  type ContentEnvelope,
} from '@peakmeet/shared';

type DbRecord = Record<string, unknown>;
type QueryResult = { data?: DbRecord[] };
type CountResult = { total?: number };
type Query = {
  where: (condition: unknown) => Query;
  orderBy: (field: string, order: 'asc' | 'desc') => Query;
  skip: (offset: number) => Query;
  limit: (limit: number) => Query;
  field: (projection: Record<string, boolean>) => Query;
  get: () => Promise<QueryResult>;
  count: () => Promise<CountResult>;
};
type Command = {
  and: (conditions: unknown[]) => unknown;
  or: (conditions: unknown[]) => unknown;
  gt: (value: string) => unknown;
  size: (value: number) => unknown;
};
type Database = {
  collection: (name: string) => Query;
  command: Command;
  RegExp: (options: { regexp: string; options?: string }) => unknown;
};

declare const require: (id: string) => {
  init: (opts?: object) => void;
  database: () => Database;
};

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

type ListData = {
  items: unknown[];
  total?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
};

const ACTION_SUMMARY_PROJECTION: Record<keyof ActionSummary, boolean> = {
  _id: true,
  name: true,
  aliases: true,
  difficulty: true,
  goals: true,
  primaryMuscles: true,
  equipment: true,
  cover: true,
  coverJpg: true,
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function actionConditions(
  query: ReturnType<typeof validateActionListQuery> & { ok: true },
): unknown[] {
  const conditions: unknown[] = [];
  const { taxonomy, search, cursor } = query.value;

  if (taxonomy.primaryMuscle) {
    conditions.push({ primaryMuscles: taxonomy.primaryMuscle });
  }
  if (taxonomy.equipmentId === BODYWEIGHT_EQUIPMENT_ID) {
    conditions.push({ equipment: db.command.size(0) });
  } else if (taxonomy.equipmentId) {
    conditions.push({ equipment: taxonomy.equipmentId });
  }
  if (taxonomy.difficulty) {
    conditions.push({ difficulty: taxonomy.difficulty });
  }
  if (taxonomy.goal) {
    conditions.push({ goals: taxonomy.goal });
  }
  if (search) {
    const expression = db.RegExp({
      regexp: escapeRegExp(search),
      options: 'i',
    });
    conditions.push(
      db.command.or([{ name: expression }, { aliases: expression }]),
    );
  }
  if (cursor) {
    conditions.push({ _id: db.command.gt(cursor) });
  }
  return conditions;
}

function withConditions(query: Query, conditions: unknown[]): Query {
  if (conditions.length === 0) return query;
  return query.where(
    conditions.length === 1 ? conditions[0] : db.command.and(conditions),
  );
}

function asActionSummary(record: DbRecord): ActionSummary {
  return record as unknown as ActionSummary;
}

async function listActions(event: Record<string, unknown>): Promise<ListData | null> {
  const parsed = validateActionListQuery({
    limit: event.limit,
    offset: event.offset ?? event.skip,
    cursor: event.cursor,
    search: event.search,
    taxonomy: event.taxonomy,
  });
  if (!parsed.ok) return null;

  const conditions = actionConditions(parsed);
  const base = withConditions(db.collection('actions'), conditions);
  const countResult = await base.count();
  const total = countResult.total ?? 0;
  const result = await base
    .orderBy('_id', 'asc')
    .skip(parsed.value.offset)
    .limit(parsed.value.limit)
    .field(ACTION_SUMMARY_PROJECTION)
    .get();
  const items = (result.data ?? []).map(asActionSummary);
  const last = items[items.length - 1];
  const hasMore = parsed.value.cursor
    ? items.length === parsed.value.limit
    : parsed.value.offset + items.length < total;

  return {
    items,
    total,
    hasMore,
    nextCursor:
      hasMore && last ? encodeActionListCursor(last._id) || null : null,
  };
}

export async function main(
  event: Record<string, unknown> = {},
): Promise<ContentEnvelope<ListData>> {
  try {
    const isActionCatalogQuery =
      event.collection === 'actions' &&
      (event.offset !== undefined ||
        event.cursor !== undefined ||
        event.search !== undefined ||
        event.taxonomy !== undefined);
    if (isActionCatalogQuery) {
      const data = await listActions(event);
      if (!data) {
        const invalid = validateActionListQuery({
          limit: event.limit,
          offset: event.offset ?? event.skip,
          cursor: event.cursor,
          search: event.search,
          taxonomy: event.taxonomy,
        });
        if (!invalid.ok) return contentErr(invalid.code, invalid.message);
        return contentErr('INTERNAL', '动作查询解析失败');
      }
      return contentOk(data);
    }

    const parsed = validateListQuery({
      collection: event.collection,
      limit: event.limit,
      skip: event.skip,
      filter: event.filter,
    });
    if (!parsed.ok) {
      return contentErr(parsed.code, parsed.message);
    }

    const { collection, limit, skip, filter } = parsed.value;
    let query: Query = db.collection(collection);
    if (Object.keys(filter).length > 0) {
      query = query.where(filter);
    }

    const res = await query
      .orderBy('sortWeight', 'desc')
      .orderBy('_id', 'asc')
      .skip(skip)
      .limit(limit)
      .get();

    return contentOk({ items: res.data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : '内部错误';
    return contentErr('INTERNAL', message);
  }
}
