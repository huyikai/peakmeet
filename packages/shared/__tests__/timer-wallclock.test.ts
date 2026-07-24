import { describe, expect, it } from 'vitest';
import { createSession, startSession, tickSession } from '../src/index';

describe('wall-clock jumps', () => {
  it('rest advances by real elapsed time after 10s+', () => {
    const t0 = 8_000_000;
    const created = createSession('rest', { restSec: 30 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const after = tickSession(started.value, t0 + 12_000);
    expect(after.session.status).toBe('running');
    expect(after.session.displaySec).toBe(18);
  });

  it('rest overdue while backgrounded completes on tick', () => {
    const t0 = 9_000_000;
    const created = createSession('rest', { restSec: 15 }, t0);
    if (!created.ok) return;
    const started = startSession(created.value, t0);
    if (!started.ok) return;
    const after = tickSession(started.value, t0 + 20_000);
    expect(after.session.status).toBe('completed');
  });
});
