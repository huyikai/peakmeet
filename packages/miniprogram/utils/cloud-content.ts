import type {
  Action,
  ActionSummary,
  ActionTaxonomyFilter,
  ContentEnvelope,
  Equipment,
} from './shared/index';

export type ListData<T> = {
  items: T[];
  total?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
};
type ItemData<T> = { item: T };
export type ActionListRequest = {
  limit?: number;
  offset?: number;
  cursor?: string | null;
  search?: string;
  taxonomy?: Partial<ActionTaxonomyFilter>;
};

function asEnvelope<T>(raw: unknown): ContentEnvelope<T> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, code: 'INTERNAL', message: '无效响应' };
  }
  const o = raw as ContentEnvelope<T>;
  if (o.ok === true && 'data' in o) return o;
  if (o.ok === false && typeof o.code === 'string') return o;
  return { ok: false, code: 'INTERNAL', message: '无效响应' };
}

export async function contentListActions(
  request: ActionListRequest = {},
): Promise<ContentEnvelope<ListData<ActionSummary>>> {
  if (!wx.cloud) {
    return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
  }
  try {
    const res = await wx.cloud.callFunction({
      name: 'contentList',
      data: {
        collection: 'actions',
        limit: request.limit ?? 24,
        offset: request.offset ?? 0,
        cursor: request.cursor ?? null,
        search: request.search ?? '',
        taxonomy: request.taxonomy ?? {},
      },
    });
    return asEnvelope<ListData<ActionSummary>>(res.result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '网络错误';
    return { ok: false, code: 'INTERNAL', message };
  }
}

export async function contentRandomAction(
  total: number,
): Promise<ContentEnvelope<ItemData<ActionSummary>>> {
  if (!Number.isSafeInteger(total) || total < 1) {
    return { ok: false, code: 'NOT_FOUND', message: '暂无可用动作' };
  }
  const offset = Math.floor(Math.random() * total);
  const result = await contentListActions({ limit: 1, offset });
  if (!result.ok) return result;
  const item = result.data.items[0];
  if (!item) return { ok: false, code: 'NOT_FOUND', message: '暂无可用动作' };
  return { ok: true, data: { item } };
}

export async function contentListEquipment(
  limit = 100,
): Promise<ContentEnvelope<ListData<Equipment>>> {
  if (!wx.cloud) {
    return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
  }
  try {
    const res = await wx.cloud.callFunction({
      name: 'contentList',
      data: { collection: 'equipment', limit, skip: 0 },
    });
    return asEnvelope<ListData<Equipment>>(res.result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '网络错误';
    return { ok: false, code: 'INTERNAL', message };
  }
}

export async function contentGetActionById(
  id: string,
): Promise<ContentEnvelope<ItemData<Action>>> {
  if (!wx.cloud) {
    return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
  }
  try {
    const res = await wx.cloud.callFunction({
      name: 'contentGetById',
      data: { collection: 'actions', id },
    });
    return asEnvelope<ItemData<Action>>(res.result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '网络错误';
    return { ok: false, code: 'INTERNAL', message };
  }
}
