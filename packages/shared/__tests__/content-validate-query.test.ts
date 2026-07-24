import { describe, expect, it } from 'vitest';
import {
  validateGetByIdQuery,
  validateListQuery,
} from '../src/content/index';

describe('validateListQuery', () => {
  it('accepts whitelist collection with defaults', () => {
    const r = validateListQuery({ collection: 'actions' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.limit).toBe(20);
      expect(r.value.skip).toBe(0);
      expect(r.value.filter).toEqual({});
    }
  });

  it('rejects non-whitelist collection', () => {
    const r = validateListQuery({ collection: 'user_collect' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('INVALID_COLLECTION');
  });

  it('accepts limit 1–100 and skip ≥0', () => {
    expect(validateListQuery({ collection: 'foods', limit: 1, skip: 0 }).ok).toBe(
      true,
    );
    expect(validateListQuery({ collection: 'foods', limit: 100 }).ok).toBe(true);
  });

  it('rejects invalid pagination', () => {
    expect(validateListQuery({ collection: 'foods', limit: 0 }).ok).toBe(false);
    expect(validateListQuery({ collection: 'foods', limit: 101 }).ok).toBe(false);
    expect(validateListQuery({ collection: 'foods', skip: -1 }).ok).toBe(false);
    const bad = validateListQuery({ collection: 'foods', limit: 0 });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.code).toBe('INVALID_PAGINATION');
  });

  it('accepts whitelist equality filters', () => {
    const r = validateListQuery({
      collection: 'actions',
      filter: { difficulty: 'beginner', primaryScene: 'home' },
    });
    expect(r.ok).toBe(true);
  });

  it('rejects illegal filter keys', () => {
    const r = validateListQuery({
      collection: 'actions',
      filter: { name: 'x' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('INVALID_FILTER');
  });

  it('rejects non-object filter and bad value types', () => {
    expect(validateListQuery({ collection: 'foods', filter: [] }).ok).toBe(false);
    expect(
      validateListQuery({ collection: 'foods', filter: { category: { x: 1 } } }).ok,
    ).toBe(false);
  });

  it('accepts boolean filter for hot on plans', () => {
    const r = validateListQuery({
      collection: 'training_plans',
      filter: { hot: true },
    });
    expect(r.ok).toBe(true);
  });
});

describe('validateGetByIdQuery', () => {
  it('accepts valid collection + id', () => {
    const r = validateGetByIdQuery({
      collection: 'equipment',
      id: 'equip_dumbbell',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.id).toBe('equip_dumbbell');
  });

  it('rejects empty id', () => {
    const r = validateGetByIdQuery({ collection: 'equipment', id: '  ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('INVALID_ID');
  });

  it('rejects invalid collection', () => {
    const r = validateGetByIdQuery({ collection: 'nope', id: 'a' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('INVALID_COLLECTION');
  });
});
