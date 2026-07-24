import { describe, expect, it } from 'vitest';
import {
  buildWorkoutCheckInPayload,
  cancelSession,
  createSession,
  effectiveDurationMs,
  endStopwatch,
  pauseSession,
  restartRestSameConfig,
  resumeSession,
  startSession,
  tickSession,
  validateTabataConfig,
} from '../src/index';

describe('timer edge coverage', () => {
  it('rejects start when already running; pause/resume/cancel guards', () => {
    const t0 = 20_000_000;
    const created = createSession('rest', { restSec: 30 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    expect(startSession(started.value, t0).ok).toBe(false);
    expect(pauseSession(created.value, t0).ok).toBe(false);
    expect(resumeSession(started.value, t0).ok).toBe(false);
    const paused = pauseSession(started.value, t0 + 1000);
    expect(paused.ok).toBe(true);
    if (!paused.ok) return;
    expect(cancelSession(paused.value, t0 + 2000).ok).toBe(true);
    const again = createSession('rest', { restSec: 10 }, t0);
    if (!again.ok) return;
    const run = startSession(again.value, t0);
    if (!run.ok) return;
    const done = tickSession(run.value, t0 + 10_000).session;
    expect(cancelSession(done, t0).ok).toBe(false);
  });

  it('endStopwatch rejects non-stopwatch and idle', () => {
    const t0 = 21_000_000;
    const rest = createSession('rest', { restSec: 10 }, t0);
    if (!rest.ok) return;
    expect(endStopwatch(rest.value, t0).ok).toBe(false);
    const sw = createSession('stopwatch', {}, t0);
    if (!sw.ok) return;
    expect(endStopwatch(sw.value, t0).ok).toBe(false);
  });

  it('restartRestSameConfig rejects tabata; check-in needs times', () => {
    const t0 = 22_000_000;
    const tabata = createSession('tabata', { workSec: 3, restSec: 2, rounds: 1 }, t0);
    if (!tabata.ok) return;
    expect(restartRestSameConfig(tabata.value, t0).ok).toBe(false);

    const rest = createSession('rest', { restSec: 5 }, t0);
    if (!rest.ok) return;
    const started = startSession(rest.value, t0);
    if (!started.ok) return;
    const done = tickSession(started.value, t0 + 5000).session;
    const broken = { ...done, startedAtMs: undefined };
    expect(buildWorkoutCheckInPayload(broken, { source: 'standalone' }).ok).toBe(false);
  });

  it('effectiveDurationMs for tabata and stopwatch', () => {
    const t0 = 23_000_000;
    const tabata = createSession('tabata', { workSec: 3, restSec: 2, rounds: 2 }, t0);
    if (!tabata.ok) return;
    const started = startSession(tabata.value, t0);
    if (!started.ok) return;
    const done = tickSession(started.value, t0 + 10_000).session;
    expect(effectiveDurationMs(done)).toBe(10_000);

    const sw = createSession('stopwatch', {}, t0);
    if (!sw.ok) return;
    const swStart = startSession(sw.value, t0);
    if (!swStart.ok) return;
    const ended = endStopwatch(swStart.value, t0 + 4000);
    if (!ended.ok) return;
    expect(effectiveDurationMs(ended.value)).toBe(4000);
  });

  it('tick paused stopwatch and tabata rounds non-integer', () => {
    const t0 = 24_000_000;
    const sw = createSession('stopwatch', {}, t0);
    if (!sw.ok) return;
    const started = startSession(sw.value, t0);
    if (!started.ok) return;
    const paused = pauseSession(started.value, t0 + 2000);
    if (!paused.ok) return;
    const ticked = tickSession(paused.value, t0 + 9000);
    expect(ticked.session.displaySec).toBe(2);

    expect(validateTabataConfig({ workSec: 20, restSec: 10, rounds: 1.5 }).ok).toBe(
      false,
    );
    expect(validateTabataConfig({ workSec: 20, restSec: 10 }).ok).toBe(false);
  });

  it('start after cancel works for rest', () => {
    const t0 = 25_000_000;
    const created = createSession('rest', { restSec: 8 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const cancelled = cancelSession(started.value, t0 + 100);
    if (!cancelled.ok) return;
    const again = startSession(cancelled.value, t0 + 200);
    expect(again.ok).toBe(true);
  });

  it('covers defensive branches via mutated sessions', () => {
    const t0 = 26_000_000;
    const rest = createSession('rest', { restSec: 5 }, t0);
    expect(rest.ok).toBe(true);
    if (!rest.ok) return;
    const mismatched = {
      ...rest.value,
      config: { workSec: 1, restSec: 1, rounds: 1 },
    };
    expect(restartRestSameConfig(mismatched, t0).ok).toBe(false);
    expect(
      restartRestSameConfig(
        { ...rest.value, config: { restSec: 0 } },
        t0,
      ).ok,
    ).toBe(false);
    expect(createSession('tabata', { workSec: 0, restSec: 10, rounds: 8 }, t0).ok).toBe(
      false,
    );

    const tabata = createSession('tabata', { workSec: 1, restSec: 1, rounds: 1 }, t0);
    if (!tabata.ok) return;
    const started = startSession(tabata.value, t0);
    if (!started.ok) return;
    const afterWork = tickSession(started.value, t0 + 1000).session;
    expect(afterWork.phase).toBe('rest');
    const noRound = { ...afterWork, roundIndex: undefined };
    const finished = tickSession(noRound, t0 + 2000).session;
    expect(finished.status).toBe('completed');

    expect(
      effectiveDurationMs({
        ...finished,
        startedAtMs: undefined,
        completedAtMs: undefined,
      }),
    ).toBe(0);
    const restOnly = {
      ...finished,
      mode: 'tabata' as const,
      config: { restSec: 5 },
      startedAtMs: t0,
      completedAtMs: t0 + 1000,
    };
    expect(effectiveDurationMs(restOnly)).toBe(1000);

    const pausedNoEnd = pauseSession(
      { ...started.value, phaseEndsAtMs: undefined },
      t0 + 500,
    );
    expect(pausedNoEnd.ok).toBe(true);

    expect(validateTabataConfig({ workSec: 20, restSec: 0, rounds: 8 }).ok).toBe(
      false,
    );

    const sw = createSession('stopwatch', {}, t0);
    if (!sw.ok) return;
    const swStart = startSession(sw.value, t0);
    if (!swStart.ok) return;
    const noSince = { ...swStart.value, runningSinceMs: undefined };
    expect(pauseSession(noSince, t0 + 1000).ok).toBe(true);

    const rest2 = createSession('rest', { restSec: 10 }, t0);
    if (!rest2.ok) return;
    const run2 = startSession(rest2.value, t0);
    if (!run2.ok) return;
    const pausedRest = pauseSession(run2.value, t0 + 2000);
    if (!pausedRest.ok) return;
    const cleared = { ...pausedRest.value, remainingMs: undefined };
    expect(resumeSession(cleared, t0 + 3000).ok).toBe(true);

    const badConfig = { ...started.value, config: { restSec: 5 } };
    expect(tickSession(badConfig, t0 + 500).session.status).toBe('running');
  });
});
