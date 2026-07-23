"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../utils/shared/index");
const calorie_plan_copy_1 = require("../../../constants/calorie-plan-copy");
function blank() {
    return {
        sex: '',
        ageYears: '',
        heightCm: '',
        weightKg: '',
        bodyFatPct: '',
        activityLevel: '',
        activityIndex: -1,
        activityLabel: '请选择',
        trainingDaysPerWeek: '',
        goal: '',
        goalIndex: -1,
        goalLabel: '请选择',
        activityOptions: calorie_plan_copy_1.ACTIVITY_OPTIONS.map((o) => o.label),
        goalOptions: calorie_plan_copy_1.GOAL_OPTIONS.map((o) => o.label),
        errorTip: '',
        resultView: null,
    };
}
function parseRequiredNumber(raw) {
    const t = raw.trim();
    if (!t)
        return null;
    const n = Number(t);
    if (!Number.isFinite(n))
        return null;
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
    setSex(e) {
        const sex = e.currentTarget.dataset.sex;
        if (sex !== 'male' && sex !== 'female')
            return;
        this.setData({ sex, resultView: null, errorTip: '' });
    },
    onAge(e) {
        this.setData({ ageYears: e.detail.value, resultView: null, errorTip: '' });
    },
    onHeight(e) {
        this.setData({ heightCm: e.detail.value, resultView: null, errorTip: '' });
    },
    onWeight(e) {
        this.setData({ weightKg: e.detail.value, resultView: null, errorTip: '' });
    },
    onBodyFat(e) {
        this.setData({ bodyFatPct: e.detail.value, resultView: null, errorTip: '' });
    },
    onTrainingDays(e) {
        this.setData({
            trainingDaysPerWeek: e.detail.value,
            resultView: null,
            errorTip: '',
        });
    },
    onActivityPick(e) {
        const idx = Number(e.detail.value);
        const opt = calorie_plan_copy_1.ACTIVITY_OPTIONS[idx];
        if (!opt)
            return;
        this.setData({
            activityIndex: idx,
            activityLevel: opt.value,
            activityLabel: opt.label,
            resultView: null,
            errorTip: '',
        });
    },
    onGoalPick(e) {
        // No blocking confirm for cutAggressive — result-only risk tip.
        const idx = Number(e.detail.value);
        const opt = calorie_plan_copy_1.GOAL_OPTIONS[idx];
        if (!opt)
            return;
        this.setData({
            goalIndex: idx,
            goal: opt.value,
            goalLabel: opt.label,
            resultView: null,
            errorTip: '',
        });
    },
    onCalculate() {
        var _a, _b, _c, _d;
        const d = this.data;
        if (d.sex !== 'male' && d.sex !== 'female') {
            this.setData({ errorTip: calorie_plan_copy_1.SELECT_SEX_TIP, resultView: null });
            return;
        }
        const ageYears = parseRequiredNumber(d.ageYears);
        const heightCm = parseRequiredNumber(d.heightCm);
        const weightKg = parseRequiredNumber(d.weightKg);
        if (ageYears === null || heightCm === null || weightKg === null) {
            this.setData({ errorTip: calorie_plan_copy_1.EMPTY_TIP, resultView: null });
            return;
        }
        if (ageYears <= 0 || heightCm <= 0 || weightKg <= 0) {
            this.setData({ errorTip: calorie_plan_copy_1.EMPTY_TIP, resultView: null });
            return;
        }
        if (!d.activityLevel) {
            this.setData({ errorTip: calorie_plan_copy_1.SELECT_ACTIVITY_TIP, resultView: null });
            return;
        }
        if (!d.goal) {
            this.setData({ errorTip: calorie_plan_copy_1.SELECT_GOAL_TIP, resultView: null });
            return;
        }
        const daysRaw = d.trainingDaysPerWeek.trim();
        if (!daysRaw) {
            this.setData({ errorTip: calorie_plan_copy_1.TRAINING_DAYS_TIP, resultView: null });
            return;
        }
        const trainingDays = Number(daysRaw);
        if (!Number.isInteger(trainingDays) ||
            trainingDays < 0 ||
            trainingDays > 7) {
            this.setData({ errorTip: calorie_plan_copy_1.TRAINING_DAYS_TIP, resultView: null });
            return;
        }
        let reportedBodyFatPct = null;
        const bfRaw = d.bodyFatPct.trim();
        if (bfRaw) {
            const bf = Number(bfRaw);
            if (!Number.isFinite(bf) || bf < 1 || bf > 60) {
                this.setData({ errorTip: calorie_plan_copy_1.BODY_FAT_TIP, resultView: null });
                return;
            }
            reportedBodyFatPct = bf;
        }
        const bmrRes = (0, index_1.calculateBmr)({
            sex: d.sex,
            ageYears: Math.trunc(ageYears),
            heightCm,
            weightKg,
        });
        if (!bmrRes.ok) {
            this.setData({ errorTip: bmrRes.error.message, resultView: null });
            return;
        }
        const tdeeRes = (0, index_1.calculateTdee)({
            bmrKcal: bmrRes.data.bmrKcal,
            activityLevel: d.activityLevel,
        });
        if (!tdeeRes.ok) {
            this.setData({ errorTip: tdeeRes.error.message, resultView: null });
            return;
        }
        const intakeRes = (0, index_1.calculateTargetIntake)({
            tdeeKcal: tdeeRes.data.tdeeKcal,
            bmrKcal: bmrRes.data.bmrKcal,
            goal: d.goal,
        });
        if (!intakeRes.ok) {
            this.setData({ errorTip: intakeRes.error.message, resultView: null });
            return;
        }
        const macroRes = (0, index_1.calculateMacroPlan)({
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
        const deltaRange = (_a = intake.deltaRange) !== null && _a !== void 0 ? _a : {
            min: intake.deltaKcal,
            max: intake.deltaKcal,
        };
        const carbRestRangeG = (_b = macro.carbRestRangeG) !== null && _b !== void 0 ? _b : {
            min: macro.carbRestG,
            max: macro.carbRestG,
        };
        const carbTrainRangeG = (_c = macro.carbTrainRangeG) !== null && _c !== void 0 ? _c : {
            min: macro.carbTrainG,
            max: macro.carbTrainG,
        };
        const resultView = {
            targetKcal: intake.targetKcal,
            bmrKcal: bmrRes.data.bmrKcal,
            tdeeKcal: tdeeRes.data.tdeeKcal,
            goalNote: (0, calorie_plan_copy_1.goalDeltaNote)(d.goal, intake.deltaKcal, deltaRange.min, deltaRange.max),
            showAggressiveRisk: d.goal === 'cutAggressive',
            aggressiveRiskTip: calorie_plan_copy_1.AGGRESSIVE_RISK_TIP,
            bmrFloorTip: intake.bmrFloorApplied
                ? ((_d = intake.hint) !== null && _d !== void 0 ? _d : index_1.BMR_FLOOR_HINT)
                : '',
            reportedBodyFatPct,
            showBodyFat: reportedBodyFatPct !== null,
            bodyFatNote: reportedBodyFatPct !== null ? calorie_plan_copy_1.BODY_FAT_UNUSED_NOTE : '',
            proteinG: macro.proteinG,
            fatG: macro.fatG,
            carbRestG: macro.carbRestG,
            carbTrainG: macro.carbTrainG,
            carbRestRangeLabel: `${carbRestRangeG.min}–${carbRestRangeG.max} g`,
            carbTrainRangeLabel: `${carbTrainRangeG.min}–${carbTrainRangeG.max} g`,
            structureTightNote: macro.structureTight
                ? '当前目标热量下蛋白与脂肪占比已较高，碳水参考接近 0，请优先保证基础代谢与执行可持续。'
                : '',
            trainingCarbHint: (0, calorie_plan_copy_1.trainingCarbHint)(trainingDays),
            meals: (0, calorie_plan_copy_1.splitMeals)(intake.targetKcal),
            tips: (0, calorie_plan_copy_1.tipsForGoal)(d.goal, intake.bmrFloorApplied),
            disclaimer: index_1.FITNESS_DISCLAIMER,
        };
        this.setData({ errorTip: '', resultView });
    },
});
