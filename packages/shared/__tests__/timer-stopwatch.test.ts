import { describe, expect, it } from 'vitest';
import {
  createSession,
  endStopwatch,
  pauseSession,
  resumeSession,
  startSession,
  tickSession,
} from '../src/index';

describe('stopwatch session', () => {
  it('accumulates; pause freezes; end yields duration', () => {
    const t0 = 10_000_000;
    const created = createSession('stopwatch', {}, t0);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;

    const mid = tickSession(started.value, t0 + 3500);
    expect(mid.session.displaySec).toBe(3);

    const paused = pauseSession(mid.session, t0 + 3500);
    if (!paused.ok) return;
    const still = tickSession(paused.value, t0 + 8000);
    expect(still.session.displaySec).toBe(3);

    const resumed = resumeSession(paused.value, t0 + 8000);
    if (!resumed.ok) return;
    const later = tickSession(resumed.value, t0 + 10_500);
    expect(later.session.displaySec).toBe(6);

    const ended = endStopwatch(later.session, t0 + 10_500);
    expect(ended.ok).toBe(true);
    if (!ended.ok) return;
    expect(ended.value.status).toBe('completed');
    expect(ended.value.displaySec).toBe(6);
    expect(ended.value.accumulatedMs).toBe(6000);
  });
});
