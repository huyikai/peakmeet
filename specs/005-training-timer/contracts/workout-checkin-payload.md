# Contract: Workout Check-In Payload

**Schema version**: `1`  
**Producer**: 计时器摘要页用户点击「打卡」  
**Consumer**: 后续训练打卡记录模块（本功能不持久化）

## JSON shape

```json
{
  "schemaVersion": 1,
  "mode": "rest",
  "config": { "restSec": 90 },
  "startedAtMs": 0,
  "completedAtMs": 0,
  "durationMs": 90000,
  "source": "standalone"
}
```

### Tabata example

```json
{
  "schemaVersion": 1,
  "mode": "tabata",
  "config": { "workSec": 20, "restSec": 10, "rounds": 8 },
  "startedAtMs": 0,
  "completedAtMs": 0,
  "durationMs": 480000,
  "source": "launch",
  "launchParams": { "mode": "tabata", "workSec": 20, "restSec": 10, "rounds": 8 }
}
```

### Stopwatch example

```json
{
  "schemaVersion": 1,
  "mode": "stopwatch",
  "config": {},
  "startedAtMs": 0,
  "completedAtMs": 0,
  "durationMs": 615000,
  "source": "standalone"
}
```

## Rules

- 仅 `status=completed` 可 build；否则失败
- 用户跳过打卡 → 不调用 build
- `durationMs`：有效计时（暂停不计入）
- 本版本验收：字段存在且类型正确即可（页面可短暂展示 JSON 或留在内存供调试）

## Non-goals

- CloudBase 集合写入
- 「我的」打卡列表 UI
