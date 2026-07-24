import type {
  CheckInMeta,
  RestCountdownConfig,
  TabataConfig,
  TimerResult,
  TimerSession,
  WorkoutCheckInPayload,
} from './types';
import { effectiveDurationMs } from './session';

export function buildWorkoutCheckInPayload(
  session: TimerSession,
  meta: CheckInMeta,
): TimerResult<WorkoutCheckInPayload> {
  if (session.status !== 'completed') {
    return { ok: false, message: '仅已完成的会话可打卡', code: 'NOT_COMPLETED' };
  }
  if (session.startedAtMs == null || session.completedAtMs == null) {
    return { ok: false, message: '缺少开始或完成时间', code: 'MISSING_TIMES' };
  }

  const payload: WorkoutCheckInPayload = {
    schemaVersion: 1,
    mode: session.mode,
    config: { ...session.config } as RestCountdownConfig | TabataConfig | Record<string, never>,
    startedAtMs: session.startedAtMs,
    completedAtMs: session.completedAtMs,
    durationMs: effectiveDurationMs(session),
    source: meta.source,
  };
  if (meta.launchParams) {
    payload.launchParams = meta.launchParams;
  }
  return { ok: true, value: payload };
}
