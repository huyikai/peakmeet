"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentListActions = contentListActions;
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
async function contentListActions(limit = 100) {
    if (!wx.cloud) {
        return { ok: false, code: 'INTERNAL', message: '云能力不可用' };
    }
    try {
        const res = await wx.cloud.callFunction({
            name: 'contentList',
            data: { collection: 'actions', limit, skip: 0 },
        });
        return asEnvelope(res.result);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : '网络错误';
        return { ok: false, code: 'INTERNAL', message };
    }
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
