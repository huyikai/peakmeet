"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureOpenId = ensureOpenId;
exports.listActionCollectTargetIds = listActionCollectTargetIds;
exports.findActionCollect = findActionCollect;
exports.addActionCollect = addActionCollect;
exports.removeActionCollect = removeActionCollect;
exports.toggleActionCollect = toggleActionCollect;
const OPENID_KEY = 'pm_openid';
function asEnvelope(raw) {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, code: 'INTERNAL', message: '无效响应' };
    }
    const o = raw;
    if (o.ok === true && 'data' in o)
        return o;
    if (o.ok === false && typeof o.code === 'string')
        return o;
    return { ok: false, code: 'INTERNAL', message: '无效响应' };
}
async function ensureOpenId() {
    try {
        const cached = wx.getStorageSync(OPENID_KEY);
        if (typeof cached === 'string' && cached) {
            return { ok: true, data: { openid: cached } };
        }
        if (!wx.cloud) {
            return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
        }
        const res = await wx.cloud.callFunction({ name: 'getOpenId', data: {} });
        const env = asEnvelope(res.result);
        if (env.ok && env.data.openid) {
            wx.setStorageSync(OPENID_KEY, env.data.openid);
        }
        return env;
    }
    catch (e) {
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
async function listActionCollectTargetIds(openid) {
    var _a;
    const db = dbOrThrow();
    const res = await db
        .collection('user_collect')
        .where({ openid, type: 'action' })
        .limit(100)
        .get();
    const rows = ((_a = res.data) !== null && _a !== void 0 ? _a : []);
    return rows.map((r) => r.targetId).filter(Boolean);
}
async function findActionCollect(openid, targetId) {
    var _a;
    const db = dbOrThrow();
    const res = await db
        .collection('user_collect')
        .where({ openid, type: 'action', targetId })
        .limit(1)
        .get();
    const row = ((_a = res.data) !== null && _a !== void 0 ? _a : [])[0];
    return row !== null && row !== void 0 ? row : null;
}
async function addActionCollect(openid, targetId) {
    const existing = await findActionCollect(openid, targetId);
    if (existing)
        return;
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
async function removeActionCollect(openid, targetId) {
    const existing = await findActionCollect(openid, targetId);
    if (!(existing === null || existing === void 0 ? void 0 : existing._id))
        return;
    const db = dbOrThrow();
    await db.collection('user_collect').doc(existing._id).remove();
}
async function toggleActionCollect(targetId) {
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
