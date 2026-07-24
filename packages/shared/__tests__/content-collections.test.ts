import { describe, expect, it } from 'vitest';
import {
  LIST_FILTER_KEYS,
  PUBLIC_COLLECTIONS,
  isAllowedFilterKey,
  isPublicCollection,
} from '../src/content/index';

describe('collections and filters', () => {
  it('lists four public collections', () => {
    expect(PUBLIC_COLLECTIONS).toHaveLength(4);
    expect(isPublicCollection('actions')).toBe(true);
    expect(isPublicCollection('nope')).toBe(false);
  });

  it('whitelist keys per collection', () => {
    expect(isAllowedFilterKey('foods', 'category')).toBe(true);
    expect(isAllowedFilterKey('foods', 'difficulty')).toBe(false);
    expect(LIST_FILTER_KEYS.actions).toContain('primaryScene');
  });
});
