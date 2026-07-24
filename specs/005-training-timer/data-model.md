# Data Model: 005-training-timer

**Date**: 2026-07-24  
**Related**: [spec.md](./spec.md)、[contracts/](./contracts/)

## TimerMode

| Value | Meaning |
| ----- | ------- |
| `rest` | 组间休息倒计时 |
| `tabata` | Tabata：每组 work+rest，共 `2N` 段 |
| `stopwatch` | 正计时 |

## SessionStatus

| Value | Meaning |
| ----- | ------- |
| `idle` | 已配置或默认，未开始 |
| `running` | 进行中 |
| `paused` | 暂停（剩余/累计已冻结） |
| `completed` | 正常完成 |
| `cancelled` | 用户取消 |

**Transitions**（概要）:

```text
idle → running (start)
running → paused (pause)
paused → running (resume)
running|paused → cancelled (cancel)
running → completed (tick 判定到期 / stopwatch end)
completed → running (rest: 再用同时长 — 新建会话等价于 idle→running)
```

## RestCountdownConfig

| Field | Type | Rules |
| ----- | ---- | ----- |
| restSec | number (int) | 1–3600 |

Default: `90`

## TabataConfig

| Field | Type | Rules |
| ----- | ---- | ----- |
| workSec | number (int) | 1–3600 |
| restSec | number (int) | 1–3600 |
| rounds | number (int) | 1–50 |

Default: `workSec=20`, `restSec=10`, `rounds=8`  
Total segments = `2 * rounds`（含末组 rest）

## StopwatchConfig

| Field | Type | Rules |
| ----- | ---- | ----- |
| (none required) | — | 从 0 起 |

## TimerSession

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | string | 会话标识（uuid 或单调 id） |
| mode | TimerMode | |
| status | SessionStatus | |
| config | RestCountdownConfig \| TabataConfig \| StopwatchConfig | 按 mode |
| phase | `work` \| `rest` \| `countdown` \| `elapsed` | 展示用 |
| roundIndex | number? | Tabata 1…N |
| phaseEndsAtMs | number? | 倒计时类墙钟截止 |
| remainingMs | number? | 暂停时冻结 |
| accumulatedMs | number | 正计时已累计 |
| runningSinceMs | number? | 正计时当前段起点 |
| startedAtMs | number? | 会话开始 |
| completedAtMs | number? | 完成时间 |
| displaySec | number | UI 主数字（剩余或已用秒，ceil） |

## TimerTickEvent

| Field | Type | Notes |
| ----- | ---- | ----- |
| type | `tick` \| `phase_complete` \| `session_complete` | |
| session | TimerSession | 更新后快照 |
| alert | `phase` \| `complete` \| null | 供页面触发震动/音 |

## WorkoutCheckInPayload

| Field | Type | Required |
| ----- | ---- | -------- |
| schemaVersion | `1` | yes |
| mode | TimerMode | yes |
| config | object | yes（对应模式配置快照） |
| startedAtMs | number | yes |
| completedAtMs | number | yes |
| durationMs | number | yes（有效计时时长） |
| source | `standalone` \| `launch` | yes |
| launchParams | object? | 若 source=launch 可附带原始唤起 |

**Validation**: 仅用户点「打卡」时生成；字段齐全方可视为验收通过。

## TimerLaunchParams

| Field | Type | Rules |
| ----- | ---- | ----- |
| mode | `rest` \| `tabata` \| `stopwatch` | required for launch |
| restSec | number? | rest 或 tabata |
| workSec | number? | tabata |
| rounds | number? | tabata |
| source | `standalone` \| `launch` | 页面内部标记 |

非法/越界字段 → 回退该模式默认值并保持 idle（不自动开始）。

## Relationships

```text
TimerLaunchParams → (prefill) → TimerSession(idle)
User start → TimerSession(running)
tick(now) → TimerTickEvent[] → UI + alerts
complete → Summary → optional WorkoutCheckInPayload
rest summary →「再用同时长」→ new TimerSession(running)
```
