import { describe, expect, it } from 'vitest';
import {
  createSession,
  pauseSession,
  resumeSession,
  startSession,
  tickSession,
} from '../src/index';

describe('tabata session', () => {
  it('2 rounds = 4 segments then complete', () => {
    const t0 = 5_000_000;
    const created = createSession(
      'tabata',
      { workSec: 3, restSec: 2, rounds: 2 },
      t0,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    let s = startSession(created.value, t0);
    expect(s.ok).toBe(true);
    if (!s.ok) return;

    // end work1 at t0+3s
    let r = tickSession(s.value, t0 + 3000);
    expect(r.events.some((e) => e.type === 'phase_complete')).toBe(true);
    expect(r.session.phase).toBe('rest');
    expect(r.session.roundIndex).toBe(1);

    // end rest1 at t0+5s
    r = tickSession(r.session, t0 + 5000);
    expect(r.session.phase).toBe('work');
    expect(r.session.roundIndex).toBe(2);

    // end work2 at t0+8s
    r = tickSession(r.session, t0 + 8000);
    expect(r.session.phase).toBe('rest');

    // end rest2 at t0+10s
    r = tickSession(r.session, t0 + 10_000);
    expect(r.session.status).toBe('completed');
    expect(r.events.some((e) => e.type === 'session_complete')).toBe(true);
  });

  it('pause mid-phase then resume', () => {
    const t0 = 6_000_000;
    const created = createSession(
      'tabata',
      { workSec: 10, restSec: 5, rounds: 1 },
      t0,
    );
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const paused = pauseSession(started.value, t0 + 4000);
    if (!paused.ok) return;
    expect(paused.value.displaySec).toBe(6);
    const resumed = resumeSession(paused.value, t0 + 9000);
    if (!resumed.ok) return;
    const after = tickSession(resumed.value, t0 + 12_000);
    expect(after.session.displaySec).toBe(3);
  });

  it('wall-clock jump across multiple segments completes', () => {
    const t0 = 7_000_000;
    const created = createSession(
      'tabata',
      { workSec: 3, restSec: 2, rounds: 2 },
      t0,
    );
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    // total 10s for 2 rounds
    const jumped = tickSession(started.value, t0 + 10_000);
    expect(jumped.session.status).toBe('completed');
    const phases = jumped.events.filter((e) => e.type === 'phase_complete');
    expect(phases.length).toBeGreaterThanOrEqual(3);
  });
});
