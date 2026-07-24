/** PeakMeet training timer — pure types (no platform APIs). */

export type TimerMode = 'rest' | 'tabata' | 'stopwatch';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export type TimerPhase = 'work' | 'rest' | 'countdown' | 'elapsed';

export interface RestCountdownConfig {
  restSec: number;
}

export interface TabataConfig {
  workSec: number;
  restSec: number;
  rounds: number;
}

export type StopwatchConfig = Record<string, never>;

export type TimerConfig = RestCountdownConfig | TabataConfig | StopwatchConfig;

export interface TimerSession {
  id: string;
  mode: TimerMode;
  status: SessionStatus;
  config: TimerConfig;
  phase: TimerPhase;
  roundIndex?: number;
  phaseEndsAtMs?: number;
  remainingMs?: number;
  accumulatedMs: number;
  runningSinceMs?: number;
  startedAtMs?: number;
  completedAtMs?: number;
  displaySec: number;
}

export type TimerAlertKind = 'phase' | 'complete' | null;

export interface TimerTickEvent {
  type: 'tick' | 'phase_complete' | 'session_complete';
  session: TimerSession;
  alert: TimerAlertKind;
}

export type TimerResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; code?: string };

export interface WorkoutCheckInPayload {
  schemaVersion: 1;
  mode: TimerMode;
  config: TimerConfig;
  startedAtMs: number;
  completedAtMs: number;
  durationMs: number;
  source: 'standalone' | 'launch';
  launchParams?: Record<string, unknown>;
}

export interface CheckInMeta {
  source: 'standalone' | 'launch';
  launchParams?: Record<string, unknown>;
}

export const REST_DEFAULT_SEC = 90;
export const TABATA_DEFAULT_WORK_SEC = 20;
export const TABATA_DEFAULT_REST_SEC = 10;
export const TABATA_DEFAULT_ROUNDS = 8;
export const SEGMENT_SEC_MIN = 1;
export const SEGMENT_SEC_MAX = 3600;
export const ROUNDS_MIN = 1;
export const ROUNDS_MAX = 50;
