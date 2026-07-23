import { describe, expect, it } from 'vitest';
import { estimateOneRm } from '../src/index';

describe('estimateOneRm', () => {
  it('Epley 100×5 → 117', () => {
    const r = estimateOneRm({ weight: 100, reps: 5 });
    expect(r.ok && r.data.oneRm).toBe(117);
    expect(r.ok && r.data.formula).toBe('epley');
  });

  it('accepts reps 1 and 12', () => {
    expect(estimateOneRm({ weight: 100, reps: 1 }).ok).toBe(true);
    expect(estimateOneRm({ weight: 100, reps: 12 }).ok).toBe(true);
  });

  it('rejects invalid load/reps', () => {
    const load = estimateOneRm({ weight: 0, reps: 5 });
    expect(load.ok).toBe(false);
    if (!load.ok) expect(load.error.code).toBe('INVALID_LOAD');

    for (const reps of [0, 13, 5.5]) {
      const r = estimateOneRm({ weight: 100, reps });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe('INVALID_REPS');
    }
  });
});
