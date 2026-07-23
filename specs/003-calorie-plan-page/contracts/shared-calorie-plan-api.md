# Contract: `@peakmeet/shared` Calorie Plan Calc Surface

**Package**: `packages/shared`  
**Audience**: Vitest、小程序（sync CJS）  
**Related**: [data-model.md](../data-model.md)、[research.md](../research.md)  
**Baseline**: 延续 `002-fitness-calc-shared` 的 `CalcResult`、舍入与免责声明契约

## Package rules

- Runtime dependencies: none；无平台 API
- 公开 calc **MUST NOT** `throw`；失败用 `CalcResult`
- 本功能**复用**既有导出；**新增**宏量结果上的碳水克数区间字段

## Required existing exports（调用方必须使用）

| Export | Role |
| ------ | ---- |
| `calculateBmr` | 步骤 1 |
| `calculateTdee` | 步骤 2 |
| `calculateTargetIntake` | 步骤 3 |
| `calculateMacroPlan` | 步骤 4 |
| `FITNESS_DISCLAIMER` | 页脚免责 |
| `BMR_FLOOR_HINT` | 与 `hint` 语义一致时可复用 |
| Types: `Sex`, `ActivityLevel`, `NutritionGoal`, `BmrInput`, `TdeeInput`, `TargetIntakeInput`, `MacroPlanInput`, `MacroPlanResult`, `NumericRange`, `CalcResult` | 页面类型标注 |

可选展示：`GOAL_DELTA_KCAL`（若需在说明中展示中点；`deltaRange` 已在结果内）。

## MacroPlanResult extension（本功能 MUST）

成功时 `data` **MUST** 包含：

| Field | Type | Contract |
| ----- | ---- | -------- |
| `carbRestG` / `carbTrainG` | number | 既有主推荐（1 位小数） |
| `carbRestRangeG` | `{ min: number; max: number }` | 休息日碳水参考区间（克）；`min≥0`，`min≤max` |
| `carbTrainRangeG` | `{ min: number; max: number }` | 训练日碳水参考区间（克）；同上 |

区间算法锁定见 [research.md](./research.md) R2（蛋白/脂肪 g/kg 边界推剩余碳水；训练日再乘加成边界）。

既有字段（`proteinG`、`fatG`、`structureTight`、ranges、boost 等）**MUST** 保持兼容，不得破坏 `002` 既有测试语义。

## Pipeline contract（调用顺序）

```text
BMR → TDEE → TargetIntake → MacroPlan
```

- 任一步失败：停止后续调用；向上返回该步错误
- `TargetIntakeResult.bmrFloorApplied === true` 时，UI MUST 展示不低于 BMR 提示
- `goal === 'cutAggressive'` 的风险文案由 **UI** 提供；shared 不返回医疗/恐吓文案，只返回数值与通用 `hint`

## Rounding

| Quantity | Rule |
| -------- | ---- |
| kcal | `Math.round` → integer |
| macro grams / range bounds | 1 decimal |

## Tests

- Path: `packages/shared/__tests__/macros.test.ts`（及回归 tdee/targetIntake/bmr）
- 新增：区间存在、`min≤max`、下限非负、与主数字关系合理（主数字落在区间内或结构过紧时的约定在测试中写明）
- `pnpm --filter @peakmeet/shared test` 全绿；calc 覆盖率 100%

## Out of scope

- 三餐比例、训练频率文案、目标分化温馨提示（属 UI 契约）
- HTTP / 云函数 / 持久化
