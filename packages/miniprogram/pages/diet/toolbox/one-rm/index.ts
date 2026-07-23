import {
  estimateOneRm,
  FITNESS_DISCLAIMER,
} from '../../../../utils/shared/index';
import { EMPTY_TIP, parseRequiredNumber } from '../../../../constants/toolbox-copy';

function blank() {
  return {
    weightKg: '',
    reps: '',
    errorTip: '',
    result: null as null | {
      oneRm: number;
      formula: string;
      tip: string;
    },
    disclaimer: FITNESS_DISCLAIMER,
    notes:
      '请量力而行，优先保证动作质量与安全；感到不适请立即停止，不要盲目冲击极限重量。',
  };
}

Page({
  data: blank(),
  onLoad() {
    this.setData(blank());
  },
  onWeight(e: { detail: { value: string } }) {
    this.setData({ weightKg: e.detail.value, result: null, errorTip: '' });
  },
  onReps(e: { detail: { value: string } }) {
    this.setData({ reps: e.detail.value, result: null, errorTip: '' });
  },
  onCalculate() {
    const data = this.data as ReturnType<typeof blank>;
    const weight = parseRequiredNumber(data.weightKg);
    const reps = parseRequiredNumber(data.reps);
    if (weight === null || reps === null) {
      this.setData({ errorTip: EMPTY_TIP, result: null });
      return;
    }
    const res = estimateOneRm({ weight, reps: Math.trunc(reps) });
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
