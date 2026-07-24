import { describe, expect, it } from 'vitest';
import {
  ROUNDS_MAX,
  SEGMENT_SEC_MAX,
  validateRestConfig,
  validateTabataConfig,
} from '../src/index';

describe('validateRestConfig', () => {
  it('accepts bounds 1 and 3600', () => {
    expect(validateRestConfig({ restSec: 1 }).ok).toBe(true);
    expect(validateRestConfig({ restSec: SEGMENT_SEC_MAX }).ok).toBe(true);
    expect(validateRestConfig({ restSec: 90 }).ok).toBe(true);
  });

  it('rejects 0, negative, over max, non-int', () => {
    expect(validateRestConfig({ restSec: 0 }).ok).toBe(false);
    expect(validateRestConfig({ restSec: -1 }).ok).toBe(false);
    expect(validateRestConfig({ restSec: SEGMENT_SEC_MAX + 1 }).ok).toBe(false);
    expect(validateRestConfig({ restSec: 1.5 }).ok).toBe(false);
    const bad = validateRestConfig({ restSec: 0 });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.message).toContain('秒');
  });
});

describe('validateTabataConfig', () => {
  it('accepts valid work/rest/rounds', () => {
    const r = validateTabataConfig({ workSec: 20, restSec: 10, rounds: 8 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rounds).toBe(8);
  });

  it('rejects illegal rounds and seconds', () => {
    expect(validateTabataConfig({ workSec: 0, restSec: 10, rounds: 8 }).ok).toBe(false);
    expect(validateTabataConfig({ workSec: 20, restSec: 10, rounds: 0 }).ok).toBe(false);
    expect(
      validateTabataConfig({ workSec: 20, restSec: 10, rounds: ROUNDS_MAX + 1 }).ok,
    ).toBe(false);
  });
});
