import {
  calculateWhr,
  FITNESS_DISCLAIMER,
} from '../../../../utils/shared/index';
import { EMPTY_TIP, parseRequiredNumber } from '../../../../constants/toolbox-copy';

function blank() {
  return {
    sex: 'male' as 'male' | 'female',
    waistCm: '',
    hipCm: '',
    errorTip: '',
    result: null as null | { whr: number; label: string },
    disclaimer: FITNESS_DISCLAIMER,
    notes:
      '腰臀比只是体型相关参考，不能诊断疾病；测量时尽量在相同条件下进行。',
  };
}

Page({
  data: blank(),
  onLoad() {
    this.setData(blank());
  },
  setSex(e: { currentTarget: { dataset: { sex?: string } } }) {
    const sex = e.currentTarget.dataset.sex;
    if (sex !== 'male' && sex !== 'female') return;
    this.setData({ sex, result: null, errorTip: '' });
  },
  onWaist(e: { detail: { value: string } }) {
    this.setData({ waistCm: e.detail.value, result: null, errorTip: '' });
  },
  onHip(e: { detail: { value: string } }) {
    this.setData({ hipCm: e.detail.value, result: null, errorTip: '' });
  },
  onCalculate() {
    const data = this.data as ReturnType<typeof blank>;
    const waistCm = parseRequiredNumber(data.waistCm);
    const hipCm = parseRequiredNumber(data.hipCm);
    if (waistCm === null || hipCm === null) {
      this.setData({ errorTip: EMPTY_TIP, result: null });
      return;
    }
    const res = calculateWhr({ sex: data.sex, waistCm, hipCm });
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
