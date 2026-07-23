import { describe, expect, it } from 'vitest';
import { getPeakMeetPing } from '../src/index';

describe('getPeakMeetPing', () => {
  it('returns the stable peakmeet smoke token', () => {
    expect(getPeakMeetPing()).toBe('peakmeet');
  });

  it('returns a non-empty string', () => {
    expect(getPeakMeetPing().length).toBeGreaterThan(0);
  });
});
