import type { UserCollect } from './shared/index';

const OPENID_KEY = 'pm_openid';

type Envelope<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

function asEnvelope<T>(raw: unknown): Envelope<T> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, code: 'INTERNAL', message: '无效响应' };
  }
  const o = raw as Envelope<T>;
  if (o.ok === true && 'data' in o) return o;
  if (o.ok === false && typeof o.code === 'string') return o;
  return { ok: false, code: 'INTERNAL', message: '无效响应' };
}

export async function ensureOpenId(): Promise<Envelope<{ openid: string }>> {
  try {
    const cached = wx.getStorageSync(OPENID_KEY);
    if (typeof cached === 'string' && cached) {
      return { ok: true, data: { openid: cached } };
    }
    if (!wx.cloud) {
      return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
    }
    const res = await wx.cloud.callFunction({ name: 'getOpenId', data: {} });
    const env = asEnvelope<{ openid: string }>(res.result);
    if (env.ok && env.data.openid) {
      wx.setStorageSync(OPENID_KEY, env.data.openid);
    }
    return env;
  } catch (e) {
    const message = e instanceof Error ? e.message : '获取身份失败';
    return { ok: false, code: 'INTERNAL', message };
  }
}

function dbOrThrow() {
  if (!wx.cloud) {
    throw new Error('云能力不可用');
  }
  return wx.cloud.database();
}

export async function listActionCollectTargetIds(
  openid: string,
): Promise<string[]> {
  const db = dbOrThrow();
  const res = await db
    .collection('user_collect')
    .where({ openid, type: 'action' })
    .limit(100)
    .get();
  const rows = (res.data ?? []) as UserCollect[];
  return rows.map((r) => r.targetId).filter(Boolean);
}

export async function findActionCollect(
  openid: string,
  targetId: string,
): Promise<UserCollect | null> {
  const db = dbOrThrow();
  const res = await db
    .collection('user_collect')
    .where({ openid, type: 'action', targetId })
    .limit(1)
    .get();
  const row = (res.data ?? [])[0] as UserCollect | undefined;
  return row ?? null;
}

export async function addActionCollect(
  openid: string,
  targetId: string,
): Promise<void> {
  const existing = await findActionCollect(openid, targetId);
  if (existing) return;
  const db = dbOrThrow();
  await db.collection('user_collect').add({
    data: {
      openid,
      type: 'action',
      targetId,
      createdAt: new Date().toISOString(),
    },
  });
}

export async function removeActionCollect(
  openid: string,
  targetId: string,
): Promise<void> {
  const existing = await findActionCollect(openid, targetId);
  if (!existing?._id) return;
  const db = dbOrThrow();
  await db.collection('user_collect').doc(existing._id).remove();
}

export async function toggleActionCollect(
  targetId: string,
): Promise<{ collected: boolean }> {
  const idRes = await ensureOpenId();
  if (!idRes.ok) {
    throw new Error(idRes.message || '请先登录');
  }
  const { openid } = idRes.data;
  const existing = await findActionCollect(openid, targetId);
  if (existing) {
    await removeActionCollect(openid, targetId);
    return { collected: false };
  }
  await addActionCollect(openid, targetId);
  return { collected: true };
}
