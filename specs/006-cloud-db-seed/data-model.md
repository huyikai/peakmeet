# Data Model: 006-cloud-db-seed

**Date**: 2026-07-24  
**Related**: [spec.md](./spec.md)、[contracts/](./contracts/)

## Conventions

| Rule | Detail |
| ---- | ------ |
| Document `_id` | 公共内容 = 人类可读 **slug**（`[a-z0-9]+(?:_[a-z0-9]+)*`），集合内唯一 |
| Timestamps | 可选 `createdAt` / `updatedAt`（ISO string 或云 Date）；种子可写固定 ISO |
| Images | 仓库种子为 `asset://content/...`；同步后云库为 `cloud://...` fileID；空 → 客户端用统一缺省图 |
| Cross-refs | 存对方 **slug**（字符串或字符串数组），不存随机 ObjectId |
| User identity | 用户表字段名 `openid`（string）；安全规则与查询使用 `auth.openid` / `{openid}` |
| Disclaimer | 长文案类内容避免医疗承诺；全局产品免责声明由页面承载 |

---

## Public collections

### Action (`actions`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | slug，如 `action_goblet_squat` |
| `name` | string | yes | 展示名 |
| `aliases` | string[] | no | 别名/搜索辅助 |
| `difficulty` | `"beginner" \| "intermediate" \| "advanced"` | yes | |
| `goals` | string[] | yes | 如 `strength` / `hypertrophy` / `conditioning` / `mobility` |
| `primaryMuscles` | string[] | yes | |
| `secondaryMuscles` | string[] | no | |
| `equipment` | string[] | no | 器材 slug 或类型标签 |
| `scenes` | `("gym" \| "home" \| "bodyweight")[]` | yes | |
| `cover` | string \| null | no | 可空 |
| `steps` | string[] | yes | 步骤 |
| `cues` | string[] | no | 发力要点 |
| `mistakes` | string[] | no | 避坑 |
| `substituteIds` | string[] | no | 替代动作 slug |
| `sortWeight` | number | yes | 越大越靠前；默认 0 |
| `updatedAt` | string | no | ISO |

**list 白名单过滤字段**: `difficulty`, `scenes`（等值；多场景种子用单值过滤时匹配数组包含由实现用 `_.elemMatch` 或约定 scenes 存主场景——**实现约定**：`scenes` 过滤表示「数组包含该值」；若云函数等值 API 仅支持标量，则种子增加可选 `primaryScene` 标量供过滤，`scenes` 仍保留完整列表）。

**实现约定（锁定）**: 增加可选 `primaryScene`: `"gym" \| "home" \| "bodyweight"` 供等值过滤；`scenes` 保留完整数组。过滤白名单：`difficulty`, `primaryScene`, `goals`（goals 为数组时同理增加可选不强制——**简化**：过滤仅 `difficulty` | `primaryScene`）。

### Equipment (`equipment`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | slug |
| `name` | string | yes | |
| `type` | `"free_weight" \| "machine" \| "cardio" \| "accessory"` | yes | |
| `scenes` | array | yes | 同上 |
| `primaryScene` | enum | yes | 等值过滤用 |
| `difficulty` | enum | yes | beginner/intermediate/advanced |
| `intro` | string | yes | |
| `value` | string | no | 核心价值 |
| `cover` | string \| null | no | |
| `homeAlternatives` | string[] | no | 文案或器材 slug |
| `notes` | string | no | 选购避坑 |
| `relatedActionIds` | string[] | no | 动作 slug |
| `sortWeight` | number | yes | |
| `updatedAt` | string | no | |

**list 过滤白名单**: `type`, `primaryScene`, `difficulty`

### TrainingPlan (`training_plans`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | slug |
| `title` | string | yes | |
| `goal` | string | yes | 如 fat_loss / muscle / general |
| `scene` | `"gym" \| "home" \| "bodyweight"` | yes | |
| `difficulty` | enum | yes | |
| `category` | string | yes | 含 `functional`（功能性/Hyrox 类归此，**非专区**）；其它如 `strength`, `conditioning`, `beginner` |
| `cycleWeeks` | number | yes | 周期周数 |
| `frequencyPerWeek` | number | yes | |
| `intro` | string | yes | |
| `audience` | string | no | |
| `cover` | string \| null | no | |
| `warmup` | string[] | yes | |
| `days` | PlanDay[] | yes | 见下 |
| `stretch` | string[] | yes | |
| `hot` | boolean | yes | 热门标记 |
| `sortWeight` | number | yes | |
| `updatedAt` | string | no | |

**PlanDay**

| Field | Type | Notes |
| ----- | ---- | ----- |
| `dayIndex` | number | 1-based |
| `title` | string | |
| `items` | PlanItem[] | |

**PlanItem**

| Field | Type | Notes |
| ----- | ---- | ----- |
| `actionId` | string \| null | 可空（纯休息日文案） |
| `name` | string | 展示名（可冗余） |
| `sets` | number \| null | |
| `reps` | string \| null | 如 `"8-12"` 或 `"30s"` |
| `restSec` | number \| null | |

**list 过滤白名单**: `goal`, `scene`, `difficulty`, `category`, `hot`

**种子约束**: 恰好 6 条；至少 1 条 `category === "functional"`。

### Food (`foods`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | slug |
| `name` | string | yes | |
| `category` | string | yes | 如 staple / protein / veg / fruit / dairy / snack |
| `per100g` | MacroPer100g | yes | |
| `recommendGrade` | `"S" \| "A" \| "B" \| "C"` | yes | 科普推荐等级，非医疗 |
| `notes` | string | no | |
| `cover` | string \| null | no | |
| `sortWeight` | number | yes | |
| `updatedAt` | string | no | |

**MacroPer100g**

| Field | Type | Notes |
| ----- | ---- | ----- |
| `kcal` | number | ≥0 |
| `protein` | number | g |
| `carb` | number | g |
| `fat` | number | g |
| `fiber` | number \| null | g，可选 |

**list 过滤白名单**: `category`, `recommendGrade`

---

## Private collections（本版无种子、无写 CF）

### UserCollect (`user_collect`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | 云自动或客户端生成 |
| `openid` | string | yes | 所属用户 |
| `type` | `"action" \| "equipment" \| "plan"` | yes | |
| `targetId` | string | yes | 目标 slug |
| `createdAt` | string | yes | ISO |

### UserBodyRecord (`user_body_record`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | |
| `openid` | string | yes | |
| `date` | string | yes | `YYYY-MM-DD` |
| `weight` | number \| null | no | kg |
| `waist` | number \| null | no | cm |
| `hip` | number \| null | no | cm |
| `createdAt` | string | yes | |

### UserTrainRecord (`user_train_record`)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `_id` | string | yes | |
| `openid` | string | yes | |
| `date` | string | yes | `YYYY-MM-DD` |
| `durationSec` | number | yes | ≥0 |
| `planId` | string \| null | no | 计划 slug |
| `createdAt` | string | yes | |

---

## Security rules (logical)

| Collection | read | write |
| ---------- | ---- | ----- |
| `actions`, `equipment`, `training_plans`, `foods` | `true` | `false` |
| `user_collect`, `user_body_record`, `user_train_record` | `doc.openid == auth.openid` | `doc.openid == auth.openid`（create 时要求 `doc.openid == auth.openid`） |

管理端 / 同步脚本不受客户端规则限制。

---

## Relationships (logical)

```text
Equipment.relatedActionIds[] → Action._id
Action.substituteIds[]       → Action._id
Action.equipment[]           → Equipment._id 或类型标签（种子优先用 equipment slug）
TrainingPlan.days.items.actionId → Action._id
UserCollect.targetId         → Action|Equipment|TrainingPlan._id（由 type 区分）
UserTrainRecord.planId       → TrainingPlan._id
```

无级联删除；断链时客户端展示降级（缺详情）。

---

## Seed volume

| Collection | Min count |
| ---------- | --------- |
| actions | 80 |
| equipment | 20 |
| training_plans | 6 |
| foods | 200 |
| user_* | 0 |
