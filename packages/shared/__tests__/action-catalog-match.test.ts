import { describe, expect, it } from 'vitest';
import {
  filterActions,
  matchAction,
  type ActionCatalogFilters,
} from '../src/content/actionCatalog';
import { BODYWEIGHT_EQUIPMENT_ID } from '../src/content/actionCatalogOptions';
import type { Action } from '../src/content/types';

function base(over: Partial<Action> = {}): Action {
  return {
    _id: 'action_1',
    name: '杠铃深蹲',
    difficulty: 'beginner',
    goals: ['strength'],
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
    equipment: ['equip_002'],
    scenes: ['gym'],
    primaryScene: 'gym',
    steps: ['站立'],
    sortWeight: 10,
    ...over,
  };
}

const empty: ActionCatalogFilters = {
  primaryMuscle: null,
  equipmentId: null,
  difficulty: null,
  goal: null,
  keyword: '',
};

describe('matchAction / filterActions', () => {
  it('matches when all filters null', () => {
    expect(matchAction(base(), empty)).toBe(true);
  });

  it('matches primaryMuscle containment', () => {
    expect(
      matchAction(base(), { ...empty, primaryMuscle: 'quads' }),
    ).toBe(true);
    expect(
      matchAction(base(), { ...empty, primaryMuscle: 'chest' }),
    ).toBe(false);
  });

  it('matches equipment id and bodyweight sentinel', () => {
    expect(
      matchAction(base(), { ...empty, equipmentId: 'equip_002' }),
    ).toBe(true);
    expect(
      matchAction(base({ equipment: [] }), {
        ...empty,
        equipmentId: BODYWEIGHT_EQUIPMENT_ID,
      }),
    ).toBe(true);
    expect(
      matchAction(base({ equipment: undefined }), {
        ...empty,
        equipmentId: BODYWEIGHT_EQUIPMENT_ID,
      }),
    ).toBe(true);
    expect(
      matchAction(base(), { ...empty, equipmentId: BODYWEIGHT_EQUIPMENT_ID }),
    ).toBe(false);
  });

  it('matches difficulty and goal', () => {
    expect(
      matchAction(base(), { ...empty, difficulty: 'beginner' }),
    ).toBe(true);
    expect(
      matchAction(base(), { ...empty, difficulty: 'advanced' }),
    ).toBe(false);
    expect(matchAction(base(), { ...empty, goal: 'strength' })).toBe(true);
    expect(matchAction(base(), { ...empty, goal: 'hypertrophy' })).toBe(
      false,
    );
  });

  it('ANDs multiple dimensions', () => {
    const f: ActionCatalogFilters = {
      primaryMuscle: 'quads',
      equipmentId: 'equip_002',
      difficulty: 'beginner',
      goal: 'strength',
      keyword: '',
    };
    expect(matchAction(base(), f)).toBe(true);
    expect(matchAction(base({ difficulty: 'advanced' }), f)).toBe(false);
  });

  it('filterActions preserves order', () => {
    const a = base({ _id: 'a', sortWeight: 2, primaryMuscles: ['chest'] });
    const b = base({ _id: 'b', sortWeight: 1, primaryMuscles: ['quads'] });
    const c = base({ _id: 'c', sortWeight: 0, primaryMuscles: ['quads'] });
    const out = filterActions([a, b, c], {
      ...empty,
      primaryMuscle: 'quads',
    });
    expect(out.map((x) => x._id)).toEqual(['b', 'c']);
  });
});
