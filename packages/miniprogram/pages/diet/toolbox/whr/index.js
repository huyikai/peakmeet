"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../../utils/shared/index");
const toolbox_copy_1 = require("../../../../constants/toolbox-copy");
function blank() {
    return {
        sex: 'male',
        waistCm: '',
        hipCm: '',
        errorTip: '',
        result: null,
        disclaimer: index_1.FITNESS_DISCLAIMER,
        notes: '腰臀比只是体型相关参考，不能诊断疾病；测量时尽量在相同条件下进行。',
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
    onWaist(e) {
        this.setData({ waistCm: e.detail.value, result: null, errorTip: '' });
    },
    onHip(e) {
        this.setData({ hipCm: e.detail.value, result: null, errorTip: '' });
    },
    onCalculate() {
        const data = this.data;
        const waistCm = (0, toolbox_copy_1.parseRequiredNumber)(data.waistCm);
        const hipCm = (0, toolbox_copy_1.parseRequiredNumber)(data.hipCm);
        if (waistCm === null || hipCm === null) {
            this.setData({ errorTip: toolbox_copy_1.EMPTY_TIP, result: null });
            return;
        }
        const res = (0, index_1.calculateWhr)({ sex: data.sex, waistCm, hipCm });
        if (!res.ok) {
            this.setData({ errorTip: res.error.message, result: null });
            return;
        }
        this.setData({
            errorTip: '',
            result: { whr: res.data.whr, label: res.data.label },
        });
    },
});
