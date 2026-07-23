import {
  estimateBodyFat,
  FITNESS_DISCLAIMER,
} from '../../../../utils/shared/index';
import { EMPTY_TIP, parseRequiredNumber } from '../../../../constants/toolbox-copy';

function blank() {
  return {
    sex: 'male' as 'male' | 'female',
    age: '',
    weightKg: '',
    waistCm: '',
    errorTip: '',
    result: null as null | {
      bodyFatPct: number;
      label: string;
      interpretation: string;
      formulaId: string;
    },
    disclaimer: FITNESS_DISCLAIMER,
    limitation:
      '非专业测量（如皮褶/DEXA），围度与体重估算存在误差，请勿当作医学诊断。',
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
  onField(e: { currentTarget: { dataset: { field?: string } }; detail: { value: string } }) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    this.setData({ [field]: e.detail.value, result: null, errorTip: '' });
  },
  onCalculate() {
    const data = this.data as ReturnType<typeof blank>;
    const ageYears = parseRequiredNumber(data.age);
    const weightKg = parseRequiredNumber(data.weightKg);
    const waistCm = parseRequiredNumber(data.waistCm);
    if (ageYears === null || weightKg === null || waistCm === null) {
      this.setData({ errorTip: EMPTY_TIP, result: null });
      return;
    }
    const res = estimateBodyFat({
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
