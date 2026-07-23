export const EMPTY_TIP = '请完整填写后再计算';
export const SELECT_ACTIVITY_TIP = '请选择日常活动水平';
export const SELECT_GOAL_TIP = '请选择训练目标';
export const SELECT_SEX_TIP = '请选择性别';
export const TRAINING_DAYS_TIP = '每周训练频率请填写 0–7 的整数';
export const BODY_FAT_TIP = '体脂率请填写 1–60 之间的数字，或不填';
export const BODY_FAT_UNUSED_NOTE =
  '未参与本次核心热量计算（BMR 采用 Mifflin-St Jeor）';

export const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '久坐少动' },
  { value: 'light', label: '轻度活动' },
  { value: 'moderate', label: '中度活动' },
  { value: 'active', label: '较高活动' },
  { value: 'veryActive', label: '非常活跃' },
] as const;

export const GOAL_OPTIONS = [
  { value: 'cutMild', label: '温和减脂' },
  { value: 'cutAggressive', label: '快速减脂' },
  { value: 'bulk', label: '增肌' },
  { value: 'maintain', label: '维持体重' },
] as const;

export type GoalValue = (typeof GOAL_OPTIONS)[number]['value'];

export const AGGRESSIVE_RISK_TIP =
  '快速减脂缺口更大，更易疲劳、掉肌肉与反弹。若出现明显不适请及时提高摄入并放缓节奏，不建议长期极端节食。';

export const MEAL_RATIOS = {
  breakfast: 0.3,
  lunch: 0.4,
  dinner: 0.3,
} as const;

export type MealKey = keyof typeof MEAL_RATIOS;

export function splitMeals(targetKcal: number): {
  key: MealKey;
  label: string;
  ratioLabel: string;
  kcal: number;
  exampleZh: string;
}[] {
  const breakfast = Math.round(targetKcal * MEAL_RATIOS.breakfast);
  const dinner = Math.round(targetKcal * MEAL_RATIOS.dinner);
  const lunch = targetKcal - breakfast - dinner;
  return [
    {
      key: 'breakfast',
      label: '早餐',
      ratioLabel: '30%',
      kcal: breakfast,
      exampleZh: '鸡蛋/牛奶 + 全谷物 + 水果（示意，非处方）',
    },
    {
      key: 'lunch',
      label: '午餐',
      ratioLabel: '40%',
      kcal: lunch,
      exampleZh: '瘦肉/豆制品 + 主食 + 大量蔬菜（示意）',
    },
    {
      key: 'dinner',
      label: '晚餐',
      ratioLabel: '30%',
      kcal: dinner,
      exampleZh: '优质蛋白 + 适量主食 + 蔬菜（示意）',
    },
  ];
}

export function trainingCarbHint(days: number): string {
  if (days <= 0) {
    return '本周训练频率为 0：多数日子可参考「休息日碳水」。';
  }
  if (days >= 7) {
    return '本周几乎每天训练：多数日子可参考「训练日碳水」，仍需结合恢复感受调整。';
  }
  return `本周约训练 ${days} 天：建议约 ${days} 个训练日参考「训练日碳水」，其余日子参考「休息日碳水」。`;
}

export function tipsForGoal(goal: GoalValue, bmrFloorApplied: boolean): string[] {
  const floor = '不建议长期将摄入压到低于基础代谢（BMR），请量力而行。';
  let tips: string[];
  if (goal === 'cutMild' || goal === 'cutAggressive') {
    tips = [
      '合理减重速度参考：大约每周减重不超过体重的 0.5%–1%（个体差异大，仅供参考）。',
      '若进入平台期：先检查睡眠与蛋白摄入，再温和微调活动量或热量，避免大幅加码节食。',
      floor,
    ];
  } else if (goal === 'bulk') {
    tips = [
      '增肌宜渐进：优先保证训练质量与蛋白，盈余保持温和，避免无训练支撑的暴饮暴食。',
      '体重上涨过快时可略降盈余，关注围度与力量进步而非仅看秤。',
      floor,
    ];
  } else {
    tips = [
      '维持体重：定期观察体重与围度，活动量变化时可小幅微调摄入。',
      '保持蛋白与蔬果摄入稳定，有助于长期执行。',
      floor,
    ];
  }
  if (bmrFloorApplied) {
    // ensure floor tip is present (already in all branches)
    void bmrFloorApplied;
  }
  return tips;
}

export function goalDeltaNote(
  goal: GoalValue,
  deltaKcal: number,
  deltaMin: number,
  deltaMax: number,
): string {
  if (goal === 'cutMild') {
    return `温和减脂：相对每日总消耗约缺口 ${Math.abs(deltaKcal)} 千卡（参考区间 ${Math.abs(deltaMax)}–${Math.abs(deltaMin)}）。`;
  }
  if (goal === 'cutAggressive') {
    return `快速减脂：相对每日总消耗约缺口 ${Math.abs(deltaKcal)} 千卡（参考区间 ${Math.abs(deltaMax)}–${Math.abs(deltaMin)}），请注意风险提示。`;
  }
  if (goal === 'bulk') {
    return `增肌：相对每日总消耗约盈余 ${deltaKcal} 千卡（参考区间 ${deltaMin}–${deltaMax}）。`;
  }
  return '维持体重：目标摄入接近每日总消耗，按感受微调即可。';
}
