# Contract: Shared Timer Engine API

**Package**: `packages/shared`  
**Module**: `src/timer/`  
**Consumers**: `packages/miniprogram` (via synced utils/shared)

## Result shape

与 calc 类似，推荐：

```ts
type TimerResult<T> = { ok: true; value: T } | { ok: false; message: string; code?: string };
```

非法配置 MUST 返回 `ok: false` 与中文 `message`（或可映射文案的 code）。

## Exports（逻辑契约）

| Symbol | Behavior |
| ------ | -------- |
| `validateRestConfig(input)` | 1–3600；失败中文原因 |
| `validateTabataConfig(input)` | work/rest 1–3600；rounds 1–50 |
| `createSession(mode, config, nowMs)` | status=`idle`，display 初值 |
| `startSession(session, nowMs)` | → `running`；设置 deadline / runningSince |
| `pauseSession(session, nowMs)` | → `paused`；冻结剩余或累计 |
| `resumeSession(session, nowMs)` | → `running`；重算 deadline |
| `cancelSession(session, nowMs)` | → `cancelled` |
| `endStopwatch(session, nowMs)` | stopwatch → `completed` |
| `tickSession(session, nowMs)` | 返回 `{ session, events: TimerTickEvent[] }`；权威墙钟推算 |
| `restartRestSameConfig(session, nowMs)` | 同 rest 配置新会话并 `start`（再用同时长） |
| `buildWorkoutCheckInPayload(session, meta)` | 仅 completed 合法；否则失败 |

## Invariants

- MUST NOT import `wx` / DOM
- Tabata 完成条件：`2 * rounds` 段均结束（末组 rest 不跳过）
- `tick` 在后台长时间后一次调用可跨越多段：MUST 推进到正确阶段或直接 `completed`（测试覆盖「跳跃」）
- 时间单位：内部 ms；对外配置 sec

## Tests

`packages/shared/__tests__/timer-*.test.ts` — 正常、边界（1/3600/50）、非法、暂停恢复、Tabata 2 组 4 段、墙钟跳跃完成。
