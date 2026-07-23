import {
  calculateBmr,
  FITNESS_DISCLAIMER,
} from '../../../../utils/shared/index';
import { EMPTY_TIP, parseRequiredNumber } from '../../../../constants/toolbox-copy';

function blank() {
  return {
    sex: 'male' as 'male' | 'female',
    age: '',
    heightCm: '',
    weightKg: '',
    errorTip: '',
    result: null as null | { bmrKcal: number; note: string },
    disclaimer: FITNESS_DISCLAIMER,
    notes:
      '个体差异大，受肌肉量与测量误差影响；减脂时一般不建议长期摄入显著低于基础代谢。',
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
  onAge(e: { detail: { value: string } }) {
    this.setData({ age: e.detail.value, result: null, errorTip: '' });
  },
  onHeight(e: { detail: { value: string } }) {
    this.setData({ heightCm: e.detail.value, result: null, errorTip: '' });
  },
  onWeight(e: { detail: { value: string } }) {
    this.setData({ weightKg: e.detail.value, result: null, errorTip: '' });
  },
  onCalculate() {
    const data = this.data as ReturnType<typeof blank>;
    const ageYears = parseRequiredNumber(data.age);
    const heightCm = parseRequiredNumber(data.heightCm);
    const weightKg = parseRequiredNumber(data.weightKg);
    if (ageYears === null || heightCm === null || weightKg === null) {
      this.setData({ errorTip: EMPTY_TIP, result: null });
      return;
    }
    const res = calculateBmr({
      sex: data.sex,
      ageYears: Math.trunc(ageYears),
      heightCm,
      weightKg,
    });
    if (!res.ok) {
      this.setData({ errorTip: res.error.message, result: null });
      return;
    }
    this.setData({
      errorTip: '',
      result: {
        bmrKcal: res.data.bmrKcal,
        note:
          res.data.referenceNote ??
          `估算基础代谢约 ${res.data.bmrKcal} 千卡/日，这是维持基本生命活动的大致热量，不等于全天消耗。`,
      },
    });
  },
});
