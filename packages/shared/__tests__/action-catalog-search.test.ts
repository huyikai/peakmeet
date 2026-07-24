import { describe, expect, it } from 'vitest';
import { matchAction, type ActionCatalogFilters } from '../src/content/actionCatalog';
import type { Action } from '../src/content/types';

function base(over: Partial<Action> = {}): Action {
  return {
    _id: 'action_1',
    name: '杠铃深蹲',
    aliases: ['Squat', '后蹲'],
    difficulty: 'beginner',
    goals: ['strength'],
    primaryMuscles: ['quads'],
    scenes: ['gym'],
    primaryScene: 'gym',
    steps: ['站立'],
    sortWeight: 1,
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

describe('action catalog keyword search', () => {
  it('matches name substring case-insensitively', () => {
    expect(matchAction(base(), { ...empty, keyword: '深蹲' })).toBe(true);
    expect(matchAction(base({ name: 'Bench Press' }), { ...empty, keyword: 'bench' })).toBe(
      true,
    );
  });

  it('matches aliases', () => {
    expect(matchAction(base(), { ...empty, keyword: 'squat' })).toBe(true);
    expect(matchAction(base(), { ...empty, keyword: '后蹲' })).toBe(true);
  });

  it('empty keyword is no-op', () => {
    expect(matchAction(base(), { ...empty, keyword: '' })).toBe(true);
  });

  it('ANDs keyword with other dims', () => {
    expect(
      matchAction(base(), {
        ...empty,
        keyword: '深蹲',
        difficulty: 'beginner',
      }),
    ).toBe(true);
    expect(
      matchAction(base(), {
        ...empty,
        keyword: '深蹲',
        difficulty: 'advanced',
      }),
    ).toBe(false);
  });
});
