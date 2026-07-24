import { describe, expect, it } from 'vitest';
import {
  cancelSession,
  createSession,
  pauseSession,
  restartRestSameConfig,
  resumeSession,
  startSession,
  tickSession,
} from '../src/index';

describe('rest session', () => {
  it('counts down and completes at deadline', () => {
    const t0 = 1_000_000;
    const created = createSession('rest', { restSec: 5 }, t0);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.value.status).toBe('running');
    expect(started.value.displaySec).toBe(5);

    const mid = tickSession(started.value, t0 + 2000);
    expect(mid.session.displaySec).toBe(3);
    expect(mid.session.status).toBe('running');

    const done = tickSession(mid.session, t0 + 5000);
    expect(done.session.status).toBe('completed');
    expect(done.events.some((e) => e.type === 'session_complete')).toBe(true);
    expect(done.events.some((e) => e.alert === 'complete')).toBe(true);
  });

  it('pause freezes remaining; resume continues wall-clock', () => {
    const t0 = 2_000_000;
    const created = createSession('rest', { restSec: 10 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const paused = pauseSession(started.value, t0 + 3000);
    expect(paused.ok).toBe(true);
    if (!paused.ok) return;
    expect(paused.value.status).toBe('paused');
    expect(paused.value.displaySec).toBe(7);

    const still = tickSession(paused.value, t0 + 8000);
    expect(still.session.displaySec).toBe(7);

    const resumed = resumeSession(paused.value, t0 + 8000);
    if (!resumed.ok) return;
    const after = tickSession(resumed.value, t0 + 10000);
    expect(after.session.displaySec).toBe(5);
  });

  it('cancel ends session; restartRestSameConfig starts new run', () => {
    const t0 = 3_000_000;
    const created = createSession('rest', { restSec: 90 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const cancelled = cancelSession(started.value, t0 + 1000);
    expect(cancelled.ok && cancelled.value.status).toBe('cancelled');

    const done = startSession(created.value, t0);
    if (!done.ok) return;
    const finished = tickSession(done.value, t0 + 90_000).session;
    expect(finished.status).toBe('completed');
    const again = restartRestSameConfig(finished, t0 + 91_000);
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.value.status).toBe('running');
    expect(again.value.displaySec).toBe(90);
  });

  it('tick jump past end completes', () => {
    const t0 = 4_000_000;
    const created = createSession('rest', { restSec: 10 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const jumped = tickSession(started.value, t0 + 15_000);
    expect(jumped.session.status).toBe('completed');
  });

  it('rejects invalid config on create', () => {
    expect(createSession('rest', { restSec: 0 }, 0).ok).toBe(false);
  });
});
