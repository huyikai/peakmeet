"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../../utils/shared/index");
const toolbox_copy_1 = require("../../../../constants/toolbox-copy");
function blank() {
    return {
        sex: 'male',
        age: '',
        weightKg: '',
        waistCm: '',
        errorTip: '',
        result: null,
        disclaimer: index_1.FITNESS_DISCLAIMER,
        limitation: '非专业测量（如皮褶/DEXA），围度与体重估算存在误差，请勿当作医学诊断。',
    };
}
Page({
    data: blank(),
    onLoad() {
        this.setData(blank());
    },
    setSex(e) {
        const sex = e.currentTarget.dataset.sex;
        if (sex !== 'male' && sex !== 'female')
            return;
        this.setData({ sex, result: null, errorTip: '' });
    },
    onField(e) {
        const field = e.currentTarget.dataset.field;
        if (!field)
            return;
        this.setData({ [field]: e.detail.value, result: null, errorTip: '' });
    },
    onCalculate() {
        const data = this.data;
        const ageYears = (0, toolbox_copy_1.parseRequiredNumber)(data.age);
        const weightKg = (0, toolbox_copy_1.parseRequiredNumber)(data.weightKg);
        const waistCm = (0, toolbox_copy_1.parseRequiredNumber)(data.waistCm);
        if (ageYears === null || weightKg === null || waistCm === null) {
            this.setData({ errorTip: toolbox_copy_1.EMPTY_TIP, result: null });
            return;
        }
        const res = (0, index_1.estimateBodyFat)({
            sex: data.sex,
            ageYears: Math.trunc(ageYears),
            weightKg,
            waistCm,
        });
        if (!res.ok) {
            this.setData({ errorTip: res.error.message, result: null });
            return;
        }
        this.setData({
            errorTip: '',
            result: {
                bodyFatPct: res.data.bodyFatPct,
                label: res.data.label,
                interpretation: res.data.interpretation,
                formulaId: res.data.formulaId,
            },
        });
    },
});
