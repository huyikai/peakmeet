import { describe, expect, it } from 'vitest';
import { normalizeActionCatalogFilters } from '../src/content/actionCatalog';

describe('normalizeActionCatalogFilters', () => {
  it('returns all-null empty filters for non-object', () => {
    expect(normalizeActionCatalogFilters(null)).toEqual({
      primaryMuscle: null,
      equipmentId: null,
      difficulty: null,
      goal: null,
      keyword: '',
    });
    expect(normalizeActionCatalogFilters('x')).toEqual({
      primaryMuscle: null,
      equipmentId: null,
      difficulty: null,
      goal: null,
      keyword: '',
    });
  });

  it('keeps single scalar dims and trims keyword', () => {
    expect(
      normalizeActionCatalogFilters({
        primaryMuscle: 'chest',
        equipmentId: 'equip_002',
        difficulty: 'beginner',
        goal: 'strength',
        keyword: '  深蹲  ',
      }),
    ).toEqual({
      primaryMuscle: 'chest',
      equipmentId: 'equip_002',
      difficulty: 'beginner',
      goal: 'strength',
      keyword: '深蹲',
    });
  });

  it('rejects array multi-select and invalid difficulty', () => {
    expect(
      normalizeActionCatalogFilters({
        primaryMuscle: ['chest', 'back'],
        difficulty: 'elite',
        keyword: 12,
      }),
    ).toEqual({
      primaryMuscle: null,
      equipmentId: null,
      difficulty: null,
      goal: null,
      keyword: '',
    });
  });

  it('treats empty string dims as null', () => {
    expect(
      normalizeActionCatalogFilters({
        primaryMuscle: '  ',
        equipmentId: '',
        goal: null,
      }),
    ).toEqual({
      primaryMuscle: null,
      equipmentId: null,
      difficulty: null,
      goal: null,
      keyword: '',
    });
  });
});
