import type {
  RestCountdownConfig,
  TabataConfig,
  TimerMode,
  TimerResult,
  TimerSession,
  TimerTickEvent,
} from './types';
import { validateRestConfig, validateTabataConfig } from './validate';

function cloneSession(s: TimerSession): TimerSession {
  return {
    ...s,
    config: { ...s.config } as TimerSession['config'],
  };
}

function newId(nowMs: number): string {
  return `t_${nowMs}_${Math.random().toString(36).slice(2, 9)}`;
}

function displayFromRemainingMs(remainingMs: number): number {
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

function isRestConfig(c: TimerSession['config']): c is RestCountdownConfig {
  return 'restSec' in c && !('workSec' in c);
}

function isTabataConfig(c: TimerSession['config']): c is TabataConfig {
  return 'workSec' in c && 'rounds' in c;
}

export function createSession(
  mode: TimerMode,
  config: unknown,
  _nowMs: number,
): TimerResult<TimerSession> {
  if (mode === 'rest') {
    const v = validateRestConfig(config);
    if (!v.ok) return v;
    return {
      ok: true,
      value: {
        id: newId(_nowMs),
        mode: 'rest',
        status: 'idle',
        config: v.value,
        phase: 'countdown',
        accumulatedMs: 0,
        displaySec: v.value.restSec,
      },
    };
  }
  if (mode === 'tabata') {
    const v = validateTabataConfig(config);
    if (!v.ok) return v;
    return {
      ok: true,
      value: {
        id: newId(_nowMs),
        mode: 'tabata',
        status: 'idle',
        config: v.value,
        phase: 'work',
        roundIndex: 1,
        accumulatedMs: 0,
        displaySec: v.value.workSec,
      },
    };
  }
  return {
    ok: true,
    value: {
      id: newId(_nowMs),
      mode: 'stopwatch',
      status: 'idle',
      config: {},
      phase: 'elapsed',
      accumulatedMs: 0,
      displaySec: 0,
    },
  };
}

export function startSession(session: TimerSession, nowMs: number): TimerResult<TimerSession> {
  if (session.status !== 'idle' && session.status !== 'cancelled') {
    return { ok: false, message: '当前状态无法开始', code: 'INVALID_STATE' };
  }
  const s = cloneSession(session);
  s.status = 'running';
  s.startedAtMs = nowMs;
  s.completedAtMs = undefined;
  s.accumulatedMs = 0;

  if (s.mode === 'rest' && isRestConfig(s.config)) {
    s.phase = 'countdown';
    s.remainingMs = undefined;
    s.phaseEndsAtMs = nowMs + s.config.restSec * 1000;
    s.displaySec = s.config.restSec;
    return { ok: true, value: s };
  }
  if (s.mode === 'tabata' && isTabataConfig(s.config)) {
    s.phase = 'work';
    s.roundIndex = 1;
    s.remainingMs = undefined;
    s.phaseEndsAtMs = nowMs + s.config.workSec * 1000;
    s.displaySec = s.config.workSec;
    return { ok: true, value: s };
  }
  // stopwatch
  s.phase = 'elapsed';
  s.runningSinceMs = nowMs;
  s.phaseEndsAtMs = undefined;
  s.displaySec = 0;
  return { ok: true, value: s };
}

export function pauseSession(session: TimerSession, nowMs: number): TimerResult<TimerSession> {
  if (session.status !== 'running') {
    return { ok: false, message: '仅进行中可暂停', code: 'INVALID_STATE' };
  }
  const s = cloneSession(session);
  if (s.mode === 'stopwatch') {
    const since = s.runningSinceMs ?? nowMs;
    s.accumulatedMs += Math.max(0, nowMs - since);
    s.runningSinceMs = undefined;
    s.displaySec = Math.floor(s.accumulatedMs / 1000);
    s.status = 'paused';
    return { ok: true, value: s };
  }
  const end = s.phaseEndsAtMs ?? nowMs;
  s.remainingMs = Math.max(0, end - nowMs);
  s.phaseEndsAtMs = undefined;
  s.displaySec = displayFromRemainingMs(s.remainingMs);
  s.status = 'paused';
  return { ok: true, value: s };
}

export function resumeSession(session: TimerSession, nowMs: number): TimerResult<TimerSession> {
  if (session.status !== 'paused') {
    return { ok: false, message: '仅暂停中可继续', code: 'INVALID_STATE' };
  }
  const s = cloneSession(session);
  if (s.mode === 'stopwatch') {
    s.runningSinceMs = nowMs;
    s.status = 'running';
    s.displaySec = Math.floor(s.accumulatedMs / 1000);
    return { ok: true, value: s };
  }
  const rem = s.remainingMs ?? 0;
  s.phaseEndsAtMs = nowMs + rem;
  s.remainingMs = undefined;
  s.status = 'running';
  s.displaySec = displayFromRemainingMs(rem);
  return { ok: true, value: s };
}

export function cancelSession(session: TimerSession, nowMs: number): TimerResult<TimerSession> {
  if (session.status === 'completed' || session.status === 'cancelled') {
    return { ok: false, message: '会话已结束', code: 'INVALID_STATE' };
  }
  const s = cloneSession(session);
  s.status = 'cancelled';
  s.phaseEndsAtMs = undefined;
  s.runningSinceMs = undefined;
  s.completedAtMs = nowMs;
  return { ok: true, value: s };
}

export function endStopwatch(session: TimerSession, nowMs: number): TimerResult<TimerSession> {
  if (session.mode !== 'stopwatch') {
    return { ok: false, message: '仅正计时可结束', code: 'INVALID_MODE' };
  }
  if (session.status !== 'running' && session.status !== 'paused') {
    return { ok: false, message: '正计时未在进行中', code: 'INVALID_STATE' };
  }
  const s = cloneSession(session);
  if (s.status === 'running' && s.runningSinceMs != null) {
    s.accumulatedMs += Math.max(0, nowMs - s.runningSinceMs);
    s.runningSinceMs = undefined;
  }
  s.status = 'completed';
  s.completedAtMs = nowMs;
  s.displaySec = Math.floor(s.accumulatedMs / 1000);
  return { ok: true, value: s };
}

function updateCountdownDisplay(s: TimerSession, nowMs: number): void {
  if (s.status === 'paused' && s.remainingMs != null) {
    s.displaySec = displayFromRemainingMs(s.remainingMs);
    return;
  }
  if (s.phaseEndsAtMs != null) {
    s.displaySec = displayFromRemainingMs(s.phaseEndsAtMs - nowMs);
  }
}

function completeSession(s: TimerSession, atMs: number): TimerTickEvent {
  s.status = 'completed';
  s.completedAtMs = atMs;
  s.phaseEndsAtMs = undefined;
  s.remainingMs = undefined;
  s.displaySec = 0;
  return { type: 'session_complete', session: cloneSession(s), alert: 'complete' };
}

function advanceTabata(s: TimerSession, nowMs: number, events: TimerTickEvent[]): void {
  if (!isTabataConfig(s.config)) return;
  const { workSec, restSec, rounds } = s.config;

  while (
    s.status === 'running' &&
    s.phaseEndsAtMs != null &&
    nowMs >= s.phaseEndsAtMs
  ) {
    const endedAt = s.phaseEndsAtMs;
    if (s.phase === 'work') {
      events.push({
        type: 'phase_complete',
        session: cloneSession(s),
        alert: 'phase',
      });
      s.phase = 'rest';
      s.phaseEndsAtMs = endedAt + restSec * 1000;
    } else {
      // rest of current round finished
      events.push({
        type: 'phase_complete',
        session: cloneSession(s),
        alert: 'phase',
      });
      const round = s.roundIndex ?? 1;
      if (round >= rounds) {
        events.push(completeSession(s, endedAt));
        return;
      }
      s.roundIndex = round + 1;
      s.phase = 'work';
      s.phaseEndsAtMs = endedAt + workSec * 1000;
    }
  }
  updateCountdownDisplay(s, nowMs);
}

function advanceRest(s: TimerSession, nowMs: number, events: TimerTickEvent[]): void {
  if (s.phaseEndsAtMs != null && nowMs >= s.phaseEndsAtMs) {
    events.push(completeSession(s, s.phaseEndsAtMs));
    return;
  }
  updateCountdownDisplay(s, nowMs);
}

function tickStopwatch(s: TimerSession, nowMs: number): void {
  let total = s.accumulatedMs;
  if (s.status === 'running' && s.runningSinceMs != null) {
    total += Math.max(0, nowMs - s.runningSinceMs);
  }
  s.displaySec = Math.floor(total / 1000);
}

export function tickSession(
  session: TimerSession,
  nowMs: number,
): { session: TimerSession; events: TimerTickEvent[] } {
  const s = cloneSession(session);
  const events: TimerTickEvent[] = [];

  if (s.status === 'running') {
    if (s.mode === 'rest') {
      advanceRest(s, nowMs, events);
    } else if (s.mode === 'tabata') {
      advanceTabata(s, nowMs, events);
    } else {
      tickStopwatch(s, nowMs);
    }
  } else if (s.status === 'paused') {
    updateCountdownDisplay(s, nowMs);
    if (s.mode === 'stopwatch') tickStopwatch(s, nowMs);
  }

  events.push({ type: 'tick', session: cloneSession(s), alert: null });
  return { session: s, events };
}

export function restartRestSameConfig(
  session: TimerSession,
  nowMs: number,
): TimerResult<TimerSession> {
  if (session.mode !== 'rest' || !isRestConfig(session.config)) {
    return { ok: false, message: '仅组间休息支持再用同时长', code: 'INVALID_MODE' };
  }
  const created = createSession('rest', session.config, nowMs);
  if (!created.ok) return created;
  return startSession(created.value, nowMs);
}

export function effectiveDurationMs(session: TimerSession): number {
  if (session.mode === 'stopwatch') {
    return session.accumulatedMs;
  }
  if (session.startedAtMs != null && session.completedAtMs != null) {
    // wall span minus rough pauses is hard; use config nominal for rest/tabata completed
    if (session.mode === 'rest' && isRestConfig(session.config)) {
      return session.config.restSec * 1000;
    }
    if (session.mode === 'tabata' && isTabataConfig(session.config)) {
      const { workSec, restSec, rounds } = session.config;
      return (workSec + restSec) * rounds * 1000;
    }
  }
  return Math.max(0, (session.completedAtMs ?? 0) - (session.startedAtMs ?? 0));
}

export { cloneSession };
