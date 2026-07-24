import type {
  RestCountdownConfig,
  TabataConfig,
  TimerResult,
} from './types';
import {
  ROUNDS_MAX,
  ROUNDS_MIN,
  SEGMENT_SEC_MAX,
  SEGMENT_SEC_MIN,
} from './types';

function isInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n);
}

function validateSegmentSec(n: unknown, label: string): TimerResult<number> {
  if (!isInt(n)) {
    return { ok: false, message: `${label}须为整数秒`, code: 'INVALID_SEC' };
  }
  if (n < SEGMENT_SEC_MIN || n > SEGMENT_SEC_MAX) {
    return {
      ok: false,
      message: `${label}须在 ${SEGMENT_SEC_MIN}–${SEGMENT_SEC_MAX} 秒之间`,
      code: 'INVALID_SEC',
    };
  }
  return { ok: true, value: n };
}

export function validateRestConfig(input: unknown): TimerResult<RestCountdownConfig> {
  const raw = input as { restSec?: unknown };
  const rest = validateSegmentSec(raw?.restSec, '休息时长');
  if (!rest.ok) return rest;
  return { ok: true, value: { restSec: rest.value } };
}

export function validateTabataConfig(input: unknown): TimerResult<TabataConfig> {
  const raw = input as { workSec?: unknown; restSec?: unknown; rounds?: unknown };
  const work = validateSegmentSec(raw?.workSec, '训练时长');
  if (!work.ok) return work;
  const rest = validateSegmentSec(raw?.restSec, '休息时长');
  if (!rest.ok) return rest;
  if (!isInt(raw?.rounds)) {
    return { ok: false, message: '循环组数须为整数', code: 'INVALID_ROUNDS' };
  }
  if (raw.rounds < ROUNDS_MIN || raw.rounds > ROUNDS_MAX) {
    return {
      ok: false,
      message: `循环组数须在 ${ROUNDS_MIN}–${ROUNDS_MAX} 之间`,
      code: 'INVALID_ROUNDS',
    };
  }
  return {
    ok: true,
    value: { workSec: work.value, restSec: rest.value, rounds: raw.rounds },
  };
}
