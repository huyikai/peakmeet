# Contract: Action Catalog — Shared Matchers & Filters

**Feature**: 007-actions-catalog  
**Package**: `packages/shared`  
**Consumers**: miniprogram actions list/detail；Vitest

## Types

```ts
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

type ActionCatalogFilters = {
  primaryMuscle: string | null
  equipmentId: string | null // Equipment._id | '__bodyweight__'
  difficulty: Difficulty | null
  goal: string | null
  keyword: string
}

const BODYWEIGHT_EQUIPMENT_ID = '__bodyweight__'
```

## `normalizeActionCatalogFilters(input: unknown): ActionCatalogFilters`

- 非法/缺省维度 → `null`
- `keyword` → string trim；非字符串 → `''`
- 每维至多保留一个标量；不接受数组多选

## `matchAction(action: Action, filters: ActionCatalogFilters): boolean`

| 条件 | 行为 |
| ---- | ---- |
| `primaryMuscle` | `action.primaryMuscles.includes(value)` |
| `equipmentId === BODYWEIGHT_EQUIPMENT_ID` | `!equipment?.length` |
| `equipmentId` 其它 | `equipment?.includes(id)` |
| `difficulty` | 等值 |
| `goal` | `goals.includes(value)` |
| `keyword` 非空 | `name` 或任一 `aliases` 包含关键词（大小写不敏感） |

全部已设条件需同时满足（AND）。

## `filterActions(actions: Action[], filters: ActionCatalogFilters): Action[]`

保持输入相对顺序（调用方先按 `sortWeight` desc, `_id` asc 排好）。

## `pickRandomAction(actions: Action[], random?: () => number): Action | null`

- `actions` 为空 → `null`
- `random` 默认 `Math.random`；返回 `[0,1)`；索引 `floor(r * length)`
- **不**接收 filters（全库抽样由调用方传入全量数组）

## Catalogs（导出常量）

- `ACTION_PRIMARY_MUSCLE_OPTIONS: readonly { id: string; labelZh: string }[]`
- `ACTION_GOAL_OPTIONS: readonly { id: string; labelZh: string }[]`
- 难度标签映射（beginner/intermediate/advanced → 中文）

## Non-goals

- 不包含 `wx` / 云 SDK
- 不写库；不实现 OpenID
