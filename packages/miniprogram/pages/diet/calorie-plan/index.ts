import {
  BMR_FLOOR_HINT,
  calculateBmr,
  calculateMacroPlan,
  calculateTargetIntake,
  calculateTdee,
  FITNESS_DISCLAIMER,
  type ActivityLevel,
  type NutritionGoal,
} from '../../../utils/shared/index';
import {
  ACTIVITY_OPTIONS,
  AGGRESSIVE_RISK_TIP,
  BODY_FAT_TIP,
  BODY_FAT_UNUSED_NOTE,
  EMPTY_TIP,
  GOAL_OPTIONS,
  goalDeltaNote,
  SELECT_ACTIVITY_TIP,
  SELECT_GOAL_TIP,
  SELECT_SEX_TIP,
  splitMeals,
  tipsForGoal,
  TRAINING_DAYS_TIP,
  trainingCarbHint,
} from '../../../constants/calorie-plan-copy';

type Sex = 'male' | 'female' | '';

interface ResultView {
  targetKcal: number;
  bmrKcal: number;
  tdeeKcal: number;
  goalNote: string;
  showAggressiveRisk: boolean;
  aggressiveRiskTip: string;
  bmrFloorTip: string;
  reportedBodyFatPct: number | null;
  showBodyFat: boolean;
  bodyFatNote: string;
  proteinG: number;
  fatG: number;
  carbRestG: number;
  carbTrainG: number;
  carbRestRangeLabel: string;
  carbTrainRangeLabel: string;
  structureTightNote: string;
  trainingCarbHint: string;
  meals: ReturnType<typeof splitMeals>;
  tips: string[];
  disclaimer: string;
}

function blank() {
  return {
    sex: '' as Sex,
    ageYears: '',
    heightCm: '',
    weightKg: '',
    bodyFatPct: '',
    activityLevel: '' as ActivityLevel | '',
    activityIndex: -1,
    activityLabel: '请选择',
    trainingDaysPerWeek: '',
    goal: '' as NutritionGoal | '',
    goalIndex: -1,
    goalLabel: '请选择',
    activityOptions: ACTIVITY_OPTIONS.map((o) => o.label),
    goalOptions: GOAL_OPTIONS.map((o) => o.label),
    errorTip: '',
    resultView: null as ResultView | null,
  };
}

function parseRequiredNumber(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

Page({
  data: blank(),

  onLoad() {
    this.setData(blank());
  },

  onShow() {
    // Keep form across brief hide; full blank only onLoad per toolbox pattern.
    // Spec: each enter blank — reset onShow as well.
    this.setData(blank());
  },

  clearResult() {
    this.setData({ resultView: null, errorTip: '' });
  },

  setSex(e: { currentTarget: { dataset: { sex?: string } } }) {
    const sex = e.currentTarget.dataset.sex;
    if (sex !== 'male' && sex !== 'female') return;
    this.setData({ sex, resultView: null, errorTip: '' });
  },

  onAge(e: { detail: { value: string } }) {
    this.setData({ ageYears: e.detail.value, resultView: null, errorTip: '' });
  },
  onHeight(e: { detail: { value: string } }) {
    this.setData({ heightCm: e.detail.value, resultView: null, errorTip: '' });
  },
  onWeight(e: { detail: { value: string } }) {
    this.setData({ weightKg: e.detail.value, resultView: null, errorTip: '' });
  },
  onBodyFat(e: { detail: { value: string } }) {
    this.setData({ bodyFatPct: e.detail.value, resultView: null, errorTip: '' });
  },
  onTrainingDays(e: { detail: { value: string } }) {
    this.setData({
      trainingDaysPerWeek: e.detail.value,
      resultView: null,
      errorTip: '',
    });
  },

  onActivityPick(e: { detail: { value: string } }) {
    const idx = Number(e.detail.value);
    const opt = ACTIVITY_OPTIONS[idx];
    if (!opt) return;
    this.setData({
      activityIndex: idx,
      activityLevel: opt.value,
      activityLabel: opt.label,
      resultView: null,
      errorTip: '',
    });
  },

  onGoalPick(e: { detail: { value: string } }) {
    // No blocking confirm for cutAggressive — result-only risk tip.
    const idx = Number(e.detail.value);
    const opt = GOAL_OPTIONS[idx];
    if (!opt) return;
    this.setData({
      goalIndex: idx,
      goal: opt.value,
      goalLabel: opt.label,
      resultView: null,
      errorTip: '',
    });
  },

  onCalculate() {
    const d = this.data as ReturnType<typeof blank>;

    if (d.sex !== 'male' && d.sex !== 'female') {
      this.setData({ errorTip: SELECT_SEX_TIP, resultView: null });
      return;
    }
    const ageYears = parseRequiredNumber(d.ageYears);
    const heightCm = parseRequiredNumber(d.heightCm);
    const weightKg = parseRequiredNumber(d.weightKg);
    if (ageYears === null || heightCm === null || weightKg === null) {
      this.setData({ errorTip: EMPTY_TIP, resultView: null });
      return;
    }
    if (ageYears <= 0 || heightCm <= 0 || weightKg <= 0) {
      this.setData({ errorTip: EMPTY_TIP, resultView: null });
      return;
    }
    if (!d.activityLevel) {
      this.setData({ errorTip: SELECT_ACTIVITY_TIP, resultView: null });
      return;
    }
    if (!d.goal) {
      this.setData({ errorTip: SELECT_GOAL_TIP, resultView: null });
      return;
    }

    const daysRaw = d.trainingDaysPerWeek.trim();
    if (!daysRaw) {
      this.setData({ errorTip: TRAINING_DAYS_TIP, resultView: null });
      return;
    }
    const trainingDays = Number(daysRaw);
    if (
      !Number.isInteger(trainingDays) ||
      trainingDays < 0 ||
      trainingDays > 7
    ) {
      this.setData({ errorTip: TRAINING_DAYS_TIP, resultView: null });
      return;
    }

    let reportedBodyFatPct: number | null = null;
    const bfRaw = d.bodyFatPct.trim();
    if (bfRaw) {
      const bf = Number(bfRaw);
      if (!Number.isFinite(bf) || bf < 1 || bf > 60) {
        this.setData({ errorTip: BODY_FAT_TIP, resultView: null });
        return;
      }
      reportedBodyFatPct = bf;
    }

    const bmrRes = calculateBmr({
      sex: d.sex,
      ageYears: Math.trunc(ageYears),
      heightCm,
      weightKg,
    });
    if (!bmrRes.ok) {
      this.setData({ errorTip: bmrRes.error.message, resultView: null });
      return;
    }

    const tdeeRes = calculateTdee({
      bmrKcal: bmrRes.data.bmrKcal,
      activityLevel: d.activityLevel,
    });
    if (!tdeeRes.ok) {
      this.setData({ errorTip: tdeeRes.error.message, resultView: null });
      return;
    }

    const intakeRes = calculateTargetIntake({
      tdeeKcal: tdeeRes.data.tdeeKcal,
      bmrKcal: bmrRes.data.bmrKcal,
      goal: d.goal,
    });
    if (!intakeRes.ok) {
      this.setData({ errorTip: intakeRes.error.message, resultView: null });
      return;
    }

    const macroRes = calculateMacroPlan({
      targetKcal: intakeRes.data.targetKcal,
      weightKg,
      goal: d.goal,
    });
    if (!macroRes.ok) {
      this.setData({ errorTip: macroRes.error.message, resultView: null });
      return;
    }

    const intake = intakeRes.data;
    const macro = macroRes.data;
    const resultView: ResultView = {
      targetKcal: intake.targetKcal,
      bmrKcal: bmrRes.data.bmrKcal,
      tdeeKcal: tdeeRes.data.tdeeKcal,
      goalNote: goalDeltaNote(
        d.goal,
        intake.deltaKcal,
        intake.deltaRange.min,
        intake.deltaRange.max,
      ),
      showAggressiveRisk: d.goal === 'cutAggressive',
      aggressiveRiskTip: AGGRESSIVE_RISK_TIP,
      bmrFloorTip: intake.bmrFloorApplied
        ? (intake.hint ?? BMR_FLOOR_HINT)
        : '',
      reportedBodyFatPct,
      showBodyFat: reportedBodyFatPct !== null,
      bodyFatNote: reportedBodyFatPct !== null ? BODY_FAT_UNUSED_NOTE : '',
      proteinG: macro.proteinG,
      fatG: macro.fatG,
      carbRestG: macro.carbRestG,
      carbTrainG: macro.carbTrainG,
      carbRestRangeLabel: `${macro.carbRestRangeG.min}–${macro.carbRestRangeG.max} g`,
      carbTrainRangeLabel: `${macro.carbTrainRangeG.min}–${macro.carbTrainRangeG.max} g`,
      structureTightNote: macro.structureTight
        ? '当前目标热量下蛋白与脂肪占比已较高，碳水参考接近 0，请优先保证基础代谢与执行可持续。'
        : '',
      trainingCarbHint: trainingCarbHint(trainingDays),
      meals: splitMeals(intake.targetKcal),
      tips: tipsForGoal(d.goal, intake.bmrFloorApplied),
      disclaimer: FITNESS_DISCLAIMER,
    };

    this.setData({ errorTip: '', resultView });
  },
});
