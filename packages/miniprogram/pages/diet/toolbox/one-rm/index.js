"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../../utils/shared/index");
const toolbox_copy_1 = require("../../../../constants/toolbox-copy");
function blank() {
    return {
        weightKg: '',
        reps: '',
        errorTip: '',
        result: null,
        disclaimer: index_1.FITNESS_DISCLAIMER,
        notes: '请量力而行，优先保证动作质量与安全；感到不适请立即停止，不要盲目冲击极限重量。',
    };
}
Page({
    data: blank(),
    onLoad() {
        this.setData(blank());
    },
    onWeight(e) {
        this.setData({ weightKg: e.detail.value, result: null, errorTip: '' });
    },
    onReps(e) {
        this.setData({ reps: e.detail.value, result: null, errorTip: '' });
    },
    onCalculate() {
        const data = this.data;
        const weight = (0, toolbox_copy_1.parseRequiredNumber)(data.weightKg);
        const reps = (0, toolbox_copy_1.parseRequiredNumber)(data.reps);
        if (weight === null || reps === null) {
            this.setData({ errorTip: toolbox_copy_1.EMPTY_TIP, result: null });
            return;
        }
        const res = (0, index_1.estimateOneRm)({ weight, reps: Math.trunc(reps) });
        if (!res.ok) {
            this.setData({ errorTip: res.error.message, result: null });
            return;
        }
        this.setData({
            errorTip: '',
            result: {
                oneRm: res.data.oneRm,
                formula: res.data.formula,
                tip: `估算 1RM 约 ${res.data.oneRm} kg（${res.data.formula}）。可作为循序渐进的训练参考，而非必须达到的目标。`,
            },
        });
    },
});
