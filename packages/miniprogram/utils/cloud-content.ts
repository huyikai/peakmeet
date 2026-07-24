import type { Action, ContentEnvelope, Equipment } from './shared/index';

type ListData<T> = { items: T[]; total?: number };
type ItemData<T> = { item: T };

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
  limit = 100,
): Promise<ContentEnvelope<ListData<Action>>> {
  if (!wx.cloud) {
    return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
  }
  try {
    const res = await wx.cloud.callFunction({
      name: 'contentList',
      data: { collection: 'actions', limit, skip: 0 },
    });
    return asEnvelope<ListData<Action>>(res.result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '网络错误';
    return { ok: false, code: 'INTERNAL', message };
  }
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
