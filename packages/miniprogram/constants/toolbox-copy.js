"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_TIP = void 0;
exports.parseRequiredNumber = parseRequiredNumber;
exports.EMPTY_TIP = '请完整填写后再计算';
function parseRequiredNumber(raw) {
    const t = raw.trim();
    if (!t)
        return null;
    const n = Number(t);
    if (!Number.isFinite(n))
        return null;
    return n;
}
