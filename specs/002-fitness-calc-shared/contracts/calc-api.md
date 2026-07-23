# Contract: `@peakmeet/shared` Fitness Calc API

**Package**: `packages/shared`  
**Audience**: Vitest、后续小程序（sync CJS）、Web（workspace ESM）  
**Related**: [data-model.md](../data-model.md)、[research.md](../research.md)

## Package rules（延续 001）

- **Runtime dependencies**: none
- **Build**: `dist/`（ESM + `.d.ts`）+ `dist-cjs/`（CJS → sync）
- **Platform APIs**: forbidden
- **Exceptions**: 公开 calc API **MUST NOT** `throw`；失败用 `CalcResult`

## Smoke export（保留）

| Export | Signature | Notes |
| ------ | --------- | ----- |
| `getPeakMeetPing` | `() => string` | 既有冒烟，不得删除 |

## Result helpers

| Export | Signature | Notes |
| ------ | --------- | ----- |
| `CalcResult` / `CalcError` / `CalcErrorCode` | types | 稳定类型导出 |
| （可选）`isCalcOk` / `isCalcErr` | type guards | 实现期可加，非必须 |

## Disclaimer

| Export | Type | Value |
| ------ | ---- | ----- |
| `FITNESS_DISCLAIMER` | `string` | 见 research §12 |

## Public compute functions

全部返回 `CalcResult<…>`。

| Export | Input | Success data |
| ------ | ----- | ------------ |
| `calculateBmi` | `BmiInput` | `BmiResult` |
| `calculateBmr` | `BmrInput` | `BmrResult` |
| `calculateTdee` | `TdeeInput` | `TdeeResult` |
| `calculateTargetIntake` | `TargetIntakeInput` | `TargetIntakeResult` |
| `calculateMacroPlan` | `MacroPlanInput` | `MacroPlanResult` |
| `estimateOneRm` | `OneRmInput` | `OneRmResult` |
| `estimateBodyFat` | `BodyFatInput` | `BodyFatResult` |
| `calculateWhr` | `WhrInput` | `WhrResult` |

导出名 **MUST** 与上表一致（小程序 sync、Web、单测共用）。

## Enum string unions（导出）

建议同时导出类型与（如需要）只读数组，便于 UI 下拉：

- `Sex`, `ActivityLevel`, `NutritionGoal`
- 分类/风险联合类型：`BmiCategory`, `BodyFatCategory`, `WhrRiskLevel`

中文展示文案可由调用方映射，或由结果内 `label` 字段提供（优先用结果 `label`）。

## Error contract

失败时：

```ts
{ ok: false, error: { code: CalcErrorCode, message: string } }
```

- `code` 集合以 research §1 为准；新增码须同步本文件与测试
- `message` 中文、无医疗承诺用语
- 成功时 **不得** 附带未标注的非法数值冒充有效建议

## Rounding contract

| Quantity | Rule |
| -------- | ---- |
| kcal（BMR/TDEE/target/1RM） | `Math.round` → integer |
| BMI / BF% / WHR / macro grams | 1 decimal via `Math.round(x*10)/10` |

## Formula locks（验收用）

| Capability | Lock |
| ---------- | ---- |
| BMR | Mifflin-St Jeor |
| TDEE factors | 1.2 / 1.375 / 1.55 / 1.725 / 1.9 |
| Goal midpoints | −400 / −600 / +300 / 0 |
| Macros | protein midpoints + fat 0.9；train carb ×1.15 |
| 1RM | Epley；reps 1–12 |
| Body fat | `formulaId: 'pww-v1'`（research §10） |
| WHR tiers | research §11 |

## Tests

- Path: `packages/shared/__tests__/*.test.ts`
- 每个上表函数：正常 + 边界 + 非法入参
- 覆盖率：`src/calc/**` 100%
- 根 `pnpm test` 必须通过

## Out of scope（本契约）

- UI、云函数、HTTP API、持久化
- 调用方覆盖区间中点的参数
