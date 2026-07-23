import {
  calculateBmi,
  FITNESS_DISCLAIMER,
} from '../../../../utils/shared/index';
import { EMPTY_TIP, parseRequiredNumber } from '../../../../constants/toolbox-copy';

function blank() {
  return {
    heightCm: '',
    weightKg: '',
    errorTip: '',
    result: null as null | {
      bmi: number;
      label: string;
      interpretation: string;
    },
    disclaimer: FITNESS_DISCLAIMER,
    limitation:
      'BMI 不能区分肌肉与脂肪，运动员或老年人可能偏差较大；本页分级采用中国成人常用标准，仅作粗略参考。',
  };
}

Page({
  data: blank(),
  onLoad() {
    this.setData(blank());
  },
  onHeight(e: { detail: { value: string } }) {
    this.setData({ heightCm: e.detail.value, result: null, errorTip: '' });
  },
  onWeight(e: { detail: { value: string } }) {
    this.setData({ weightKg: e.detail.value, result: null, errorTip: '' });
  },
  onCalculate() {
    const data = this.data as ReturnType<typeof blank>;
    const heightCm = parseRequiredNumber(data.heightCm);
    const weightKg = parseRequiredNumber(data.weightKg);
    if (heightCm === null || weightKg === null) {
      this.setData({ errorTip: EMPTY_TIP, result: null });
      return;
    }
    const res = calculateBmi({ heightCm, weightKg });
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
