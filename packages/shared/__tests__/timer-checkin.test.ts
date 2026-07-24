import { describe, expect, it } from 'vitest';
import {
  buildWorkoutCheckInPayload,
  createSession,
  startSession,
  tickSession,
} from '../src/index';

describe('buildWorkoutCheckInPayload', () => {
  it('builds payload only for completed sessions', () => {
    const t0 = 11_000_000;
    const created = createSession('rest', { restSec: 5 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;

    const early = buildWorkoutCheckInPayload(started.value, { source: 'standalone' });
    expect(early.ok).toBe(false);

    const done = tickSession(started.value, t0 + 5000).session;
    const payload = buildWorkoutCheckInPayload(done, {
      source: 'launch',
      launchParams: { mode: 'rest', restSec: 5 },
    });
    expect(payload.ok).toBe(true);
    if (!payload.ok) return;
    expect(payload.value.schemaVersion).toBe(1);
    expect(payload.value.mode).toBe('rest');
    expect(payload.value.source).toBe('launch');
    expect(payload.value.durationMs).toBe(5000);
    expect(payload.value.startedAtMs).toBe(t0);
    expect(payload.value.completedAtMs).toBeDefined();
    expect(payload.value.launchParams).toEqual({ mode: 'rest', restSec: 5 });
  });
});
