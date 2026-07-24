import { describe, expect, it } from 'vitest';
import { contentErr, contentOk } from '../src/content/index';

describe('content envelope', () => {
  it('wraps ok data', () => {
    expect(contentOk({ items: [] })).toEqual({ ok: true, data: { items: [] } });
  });

  it('maps known error codes', () => {
    expect(contentErr('INVALID_COLLECTION', '集合不在白名单').code).toBe(
      'INVALID_COLLECTION',
    );
    expect(contentErr('INVALID_FILTER', 'x').ok).toBe(false);
    expect(contentErr('NOT_FOUND', '未找到').message).toContain('未找到');
  });
});
