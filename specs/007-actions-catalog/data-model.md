# Data Model: 007-actions-catalog

**Date**: 2026-07-24  
**Depends on**: [spec.md](./spec.md), [research.md](./research.md), 006 Action / UserCollect

本 feature **不修改**云库 schema；消费既有 `actions` / `user_collect` /（选项展示）`equipment`。下列为页面与 shared 契约视角的实体。

## Action（云库 `actions`，只读）

与 `packages/shared` `Action` 对齐。动作大全消费字段：

| Field | Type | List | Detail | Notes |
| ----- | ---- | ---- | ------ | ----- |
| `_id` | string | ✓ | ✓ | slug |
| `name` | string | ✓ | ✓ | 搜索主字段 |
| `aliases` | string[]? | | | 搜索可选匹配 |
| `difficulty` | `beginner` \| `intermediate` \| `advanced` | ✓ | ✓ | 筛维度 |
| `goals` | string[] | | ✓ | 筛：单值 ∈ 数组 |
| `primaryMuscles` | string[] | ✓（展示主部位） | ✓ | 筛：单值 ∈ 数组 |
| `secondaryMuscles` | string[]? | | ✓ | 协同肌 |
| `equipment` | string[]? | | ✓ | 器材 id；筛含 `__bodyweight__` |
| `scenes` | Scene[] | | ✓ | 适用场景 |
| `primaryScene` | Scene | | ✓ | |
| `cover` | string \| null? | ✓ | ✓ | → `resolveContentCover` |
| `steps` | string[] | | ✓ | 分点步骤文案 |
| `cues` | string[]? | | ✓ | 发力要点 |
| `mistakes` | string[]? | | ✓ | 避坑（含危害语义文案） |
| `substituteIds` | string[]? | | ✓ | 替代跳转，无关系类型 |
| `sortWeight` | number | ✓ | | 列表排序 |

**Validation / display rules**:
- 步骤/避坑条数异常：原样展示，不崩溃
- 无效 `substituteIds`：过滤或点击友好提示
- 文案不得含医疗承诺词（内容侧已约束；UI 不二次审查）

## ActionCatalogFilters（页面 / shared）

| Field | Type | Rule |
| ----- | ---- | ---- |
| `primaryMuscle` | string \| null | 单选；null = 不限 |
| `equipmentId` | string \| null | 器材 `_id` 或 `__bodyweight__`；null = 不限 |
| `difficulty` | Difficulty \| null | 单选 |
| `goal` | string \| null | 单选 |
| `keyword` | string | trim 后空 = 无搜索 |

多维 AND；与澄清一致。

## ActionListItem（视图模型）

由 `Action` + 收藏态投影，不落库：

| Field | Type |
| ----- | ---- |
| `_id` | string |
| `name` | string |
| `coverSrc` | string |
| `primaryMuscleLabel` | string |
| `difficulty` | Difficulty |
| `collected` | boolean |

## UserCollect（云库 `user_collect`）

| Field | Type | Notes |
| ----- | ---- | ----- |
| `_id` | string | 云自动或自建 |
| `openid` | string | 必须 = 当前用户 |
| `type` | `'action'` | 本模块固定 |
| `targetId` | string | Action `_id` |
| `createdAt` | string | ISO |

**Transitions**:
- 未收藏 → 详情收藏 → `add` 一条
- 已收藏 → 详情取消 → `remove` 对应文档（按 openid+type+targetId 查询）
- 未登录 / 无 openid → 不写；引导登录

**Privacy**: 仅本人可读写（既有安全规则）。

## Filter option catalogs（shared 常量 + 运行时器材名）

| Catalog | Source |
| ------- | ------ |
| 部位 | shared 枚举/常量（与种子 `primaryMuscles` 对齐：chest, back, …） |
| 目标 | shared（conditioning, hypertrophy, mobility, strength） |
| 难度 | `Difficulty` |
| 器材 | 读 `equipment` 列表得 `_id`→`name`；另加「自重/无器械」→ `__bodyweight__` |

## 关系

```text
Action.substituteIds[] ---> Action._id
Action.equipment[] ------> Equipment._id
UserCollect.targetId ----> Action._id (when type=action)
ActionCatalogFilters ----> match over Action[] (in-memory)
```

## 非本版模型

- 替代关系类型（降级/升级/器材）字段
- 训练计划编排 / 动作加入计划的关联表
- Web 端动作实体
