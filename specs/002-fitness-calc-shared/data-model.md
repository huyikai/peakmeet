# Data Model: 002-fitness-calc-shared

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

本功能无持久化实体；以下为 **内存入参/出参类型契约**（TypeScript 概念模型）。实现时用 `type` / `interface` / 字符串联合，禁止 `any`。

---

## Enumerations

### Sex

- `male` | `female`

### ActivityLevel

- `sedentary` | `light` | `moderate` | `active` | `veryActive`  
- 中文对照：久坐 / 轻度 / 中度 / 高度 / 极高

### NutritionGoal

- `cutMild` | `cutAggressive` | `bulk` | `maintain`  
- 中文对照：减脂温和 / 减脂快速 / 增肌 / 维持

### BmiCategory

- `underweight` | `normal` | `overweight` | `obese`

### BodyFatCategory

- `low` | `normal` | `high` | `veryHigh`

### WhrRiskLevel

- `low` | `moderate` | `high`

### CalcErrorCode

见 [research.md](./research.md) §1 表。

---

## Shared wrappers

### CalcError

| Field | Type | Notes |
| ----- | ---- | ----- |
| code | `CalcErrorCode` | 稳定，可供调用方 switch |
| message | `string` | 中文友好说明 |

### CalcResult\<T\>

| Variant | Fields |
| ------- | ------ |
| 成功 | `ok: true`, `data: T` |
| 失败 | `ok: false`, `error: CalcError` |

### NumericRange

| Field | Type | Notes |
| ----- | ---- | ----- |
| min | `number` | 区间下限 |
| max | `number` | 区间上限 |

---

## Inputs

### BmiInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| heightCm | `number` | 有限且 &gt; 0 |
| weightKg | `number` | 有限且 &gt; 0 |

### BmrInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | `Sex` | 枚举 |
| ageYears | `number` | 正整数 ≥ 1；&gt;120 仍算但解读提示参考 |
| heightCm | `number` | 有限且 &gt; 0 |
| weightKg | `number` | 有限且 &gt; 0 |

### TdeeInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| bmrKcal | `number` | 有限且 &gt; 0 |
| activityLevel | `ActivityLevel` | 枚举 |

### TargetIntakeInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| tdeeKcal | `number` | 有限且 &gt; 0 |
| bmrKcal | `number` | 有限且 &gt; 0 |
| goal | `NutritionGoal` | 枚举 |

### MacroPlanInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| targetKcal | `number` | 有限且 &gt; 0 |
| weightKg | `number` | 有限且 &gt; 0 |
| goal | `NutritionGoal` | 枚举 |

### OneRmInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| weight | `number` | 有限且 &gt; 0（默认 kg） |
| reps | `number` | 整数 1–12 |

### BodyFatInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | `Sex` | 枚举 |
| ageYears | `number` | 同 Bmr 年龄规则 |
| waistCm | `number` | 有限且 &gt; 0 |
| weightKg | `number` | 有限且 &gt; 0 |

### WhrInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | `Sex` | 枚举 |
| waistCm | `number` | 有限且 &gt; 0 |
| hipCm | `number` | 有限且 &gt; 0 |

---

## Outputs（成功 `data`）

### BmiResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| bmi | `number` | 1 位小数 |
| category | `BmiCategory` | |
| label | `string` | 偏瘦/标准/超重/肥胖 |
| interpretation | `string` | 通俗解读（无医疗承诺） |

### BmrResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| bmrKcal | `number` | 整数 |

### TdeeResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| tdeeKcal | `number` | 整数 |
| activityLevel | `ActivityLevel` | 回显 |
| activityFactor | `number` | 所用系数 |

### TargetIntakeResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| targetKcal | `number` | 整数；≥ bmrKcal |
| goal | `NutritionGoal` | |
| deltaKcal | `number` | 应用的中点缺口/盈余（兜底前） |
| deltaRange | `NumericRange` | 对应 Constitution 区间 |
| bmrFloorApplied | `boolean` | |
| hint | `string \| null` | 兜底时非空 |

### MacroPlanResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| proteinG | `number` | 1 位小数 |
| fatG | `number` | 1 位小数 |
| carbRestG | `number` | 1 位小数；≥ 0 |
| carbTrainG | `number` | 1 位小数；≥ carbRestG |
| proteinGPerKg | `number` | 所用中点 |
| fatGPerKg | `number` | 0.9 |
| proteinRange | `NumericRange` | |
| fatRange | `NumericRange` | |
| trainCarbBoost | `number` | 1.15 |
| trainCarbBoostRange | `NumericRange` | {0.10, 0.20} |
| structureTight | `boolean` | 剩余热量不足时 true |

### OneRmResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| oneRm | `number` | 整数 |
| weight | `number` | 入参回显 |
| reps | `number` | 入参回显 |
| formula | `'epley'` | 固定 |

### BodyFatResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| bodyFatPct | `number` | 1 位小数；钳制 3.0–60.0 |
| category | `BodyFatCategory` | |
| label | `string` | 偏低/标准/偏高/过高 |
| interpretation | `string` | 通俗解读 |
| formulaId | `'pww-v1'` | PeakMeet 四输入式 |

### WhrResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| whr | `number` | 1 位小数 |
| riskLevel | `WhrRiskLevel` | |
| label | `string` | 较低/中等/较高风险 |

---

## Constants（导出）

| Name | Semantics |
| ---- | --------- |
| `FITNESS_DISCLAIMER` | Constitution 免责声明全文 |
| 活动系数表 / 中点表 | 可作只读导出或仅内部；对外至少能通过结果字段观察到所用值 |

---

## Relationships（逻辑）

```text
BmrInput → BmrResult.bmrKcal
BmrResult + ActivityLevel → TdeeResult
TdeeResult + BmrResult + NutritionGoal → TargetIntakeResult
TargetIntakeResult + weight + goal → MacroPlanResult

BmiInput → BmiResult（独立）
OneRmInput → OneRmResult（独立）
BodyFatInput → BodyFatResult（独立）
WhrInput → WhrResult（独立）
```

无状态机；无 ID；无持久化生命周期。

---

## Validation summary

- 所有数值入参：拒绝 `NaN` / `±Infinity`
- 公开 API：失败走 `ok: false`，永不 throw
- 目标摄入成功保证 `targetKcal >= bmrKcal`
- 宏量碳水克数 ≥ 0
