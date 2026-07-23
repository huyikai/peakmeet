"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../../utils/shared/index");
const toolbox_copy_1 = require("../../../../constants/toolbox-copy");
function blank() {
    return {
        heightCm: '',
        weightKg: '',
        errorTip: '',
        result: null,
        disclaimer: index_1.FITNESS_DISCLAIMER,
        limitation: 'BMI 不能区分肌肉与脂肪，运动员或老年人可能偏差较大；本页分级采用中国成人常用标准，仅作粗略参考。',
    };
}
Page({
    data: blank(),
    onLoad() {
        this.setData(blank());
    },
    onHeight(e) {
        this.setData({ heightCm: e.detail.value, result: null, errorTip: '' });
    },
    onWeight(e) {
        this.setData({ weightKg: e.detail.value, result: null, errorTip: '' });
    },
    onCalculate() {
        const data = this.data;
        const heightCm = (0, toolbox_copy_1.parseRequiredNumber)(data.heightCm);
        const weightKg = (0, toolbox_copy_1.parseRequiredNumber)(data.weightKg);
        if (heightCm === null || weightKg === null) {
            this.setData({ errorTip: toolbox_copy_1.EMPTY_TIP, result: null });
            return;
        }
        const res = (0, index_1.calculateBmi)({ heightCm, weightKg });
        if (!res.ok) {
            this.setData({ errorTip: res.error.message, result: null });
            return;
        }
        this.setData({
            errorTip: '',
            result: {
                bmi: res.data.bmi,
                label: res.data.label,
                interpretation: res.data.interpretation,
            },
        });
    },
});
