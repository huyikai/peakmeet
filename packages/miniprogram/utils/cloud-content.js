"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentListActions = contentListActions;
exports.contentRandomAction = contentRandomAction;
exports.contentListEquipment = contentListEquipment;
exports.contentGetActionById = contentGetActionById;
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
async function contentListActions(request = {}) {
    var _a, _b, _c, _d, _e;
    if (!wx.cloud) {
        return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
    }
    try {
        const res = await wx.cloud.callFunction({
            name: 'contentList',
            data: {
                collection: 'actions',
                limit: (_a = request.limit) !== null && _a !== void 0 ? _a : 24,
                offset: (_b = request.offset) !== null && _b !== void 0 ? _b : 0,
                cursor: (_c = request.cursor) !== null && _c !== void 0 ? _c : null,
                search: (_d = request.search) !== null && _d !== void 0 ? _d : '',
                taxonomy: (_e = request.taxonomy) !== null && _e !== void 0 ? _e : {},
            },
        });
        return asEnvelope(res.result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : '网络错误';
        return { ok: false, code: 'INTERNAL', message };
    }
}
async function contentRandomAction(total) {
    if (!Number.isSafeInteger(total) || total < 1) {
        return { ok: false, code: 'NOT_FOUND', message: '暂无可用动作' };
    }
    const offset = Math.floor(Math.random() * total);
    const result = await contentListActions({ limit: 1, offset });
    if (!result.ok)
        return result;
    const item = result.data.items[0];
    if (!item)
        return { ok: false, code: 'NOT_FOUND', message: '暂无可用动作' };
    return { ok: true, data: { item } };
}
async function contentListEquipment(limit = 100) {
    if (!wx.cloud) {
        return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
    }
    try {
        const res = await wx.cloud.callFunction({
            name: 'contentList',
            data: { collection: 'equipment', limit, skip: 0 },
        });
        return asEnvelope(res.result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : '网络错误';
        return { ok: false, code: 'INTERNAL', message };
    }
}
async function contentGetActionById(id) {
    if (!wx.cloud) {
        return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
    }
    try {
        const res = await wx.cloud.callFunction({
            name: 'contentGetById',
            data: { collection: 'actions', id },
        });
        return asEnvelope(res.result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : '网络错误';
        return { ok: false, code: 'INTERNAL', message };
    }
}
