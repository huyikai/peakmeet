import { describe, expect, it } from 'vitest';
import { pickRandomAction } from '../src/content/actionCatalog';
import type { Action } from '../src/content/types';

function act(id: string): Action {
  return {
    _id: id,
    name: id,
    difficulty: 'beginner',
    goals: ['strength'],
    primaryMuscles: ['core'],
    scenes: ['bodyweight'],
    primaryScene: 'bodyweight',
    steps: ['a'],
    sortWeight: 1,
  };
}

describe('pickRandomAction', () => {
  it('returns null for empty list', () => {
    expect(pickRandomAction([])).toBeNull();
  });

  it('uses injectable random for index', () => {
    const list = [act('a'), act('b'), act('c')];
    expect(pickRandomAction(list, () => 0)?._id).toBe('a');
    expect(pickRandomAction(list, () => 0.5)?._id).toBe('b');
    expect(pickRandomAction(list, () => 0.999)?._id).toBe('c');
  });

  it('clamps random >= 1 to last index safely', () => {
    const list = [act('a'), act('b')];
    expect(pickRandomAction(list, () => 1)?._id).toBe('b');
  });
});
