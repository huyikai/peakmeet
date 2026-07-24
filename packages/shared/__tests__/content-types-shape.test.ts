import { describe, expect, it } from 'vitest';
import type {
  Action,
  Equipment,
  Food,
  TrainingPlan,
  UserBodyRecord,
  UserCollect,
  UserTrainRecord,
} from '../src/content/index';

describe('content entity shapes', () => {
  it('allows constructing public entities with required fields', () => {
    const action: Action = {
      _id: 'action_squat',
      name: '深蹲',
      difficulty: 'beginner',
      goals: ['strength'],
      primaryMuscles: ['quads'],
      scenes: ['gym'],
      primaryScene: 'gym',
      steps: ['站立'],
      sortWeight: 1,
    };
    const equipment: Equipment = {
      _id: 'equip_barbell',
      name: '杠铃',
      type: 'free_weight',
      scenes: ['gym'],
      primaryScene: 'gym',
      difficulty: 'beginner',
      intro: '自由重量',
      sortWeight: 1,
    };
    const plan: TrainingPlan = {
      _id: 'plan_func_1',
      title: '功能性入门',
      goal: 'conditioning',
      scene: 'gym',
      difficulty: 'intermediate',
      category: 'functional',
      cycleWeeks: 4,
      frequencyPerWeek: 3,
      intro: '综合训练',
      warmup: ['慢跑'],
      days: [
        {
          dayIndex: 1,
          title: '日1',
          items: [
            {
              actionId: 'action_squat',
              name: '深蹲',
              sets: 3,
              reps: '8-12',
              restSec: 90,
            },
          ],
        },
      ],
      stretch: ['拉伸'],
      hot: true,
      sortWeight: 10,
    };
    const food: Food = {
      _id: 'food_chicken_breast',
      name: '鸡胸肉',
      category: 'protein',
      per100g: { kcal: 133, protein: 26, carb: 0, fat: 3 },
      recommendGrade: 'S',
      sortWeight: 1,
    };
    expect(action._id && equipment._id && plan.category && food.per100g.kcal).toBeTruthy();
  });

  it('allows user private entity shapes', () => {
    const collect: UserCollect = {
      _id: 'c1',
      openid: 'o1',
      type: 'action',
      targetId: 'action_squat',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const body: UserBodyRecord = {
      _id: 'b1',
      openid: 'o1',
      date: '2026-01-01',
      weight: 70,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const train: UserTrainRecord = {
      _id: 't1',
      openid: 'o1',
      date: '2026-01-01',
      durationSec: 1800,
      planId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(collect.openid && body.date && train.durationSec).toBeTruthy();
  });
});
