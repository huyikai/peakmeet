# Data Model: 003-calorie-plan-page

**Date**: 2026-07-23  
**Note**: 无持久化实体。下列为 shared 领域模型与小程序页面瞬时状态 / 展示模型。

## Shared Enums（复用）

### Sex

| Value    | Meaning |
| -------- | ------- |
| `male`   | 男      |
| `female` | 女      |

### ActivityLevel

| Value         | UI 文案建议（页面映射） |
| ------------- | ---------------------- |
| `sedentary`   | 久坐少动               |
| `light`       | 轻度活动               |
| `moderate`    | 中度活动               |
| `active`      | 较高活动               |
| `veryActive`  | 非常活跃               |

### NutritionGoal

| Value            | UI 文案     |
| ---------------- | ----------- |
| `cutMild`        | 温和减脂    |
| `cutAggressive`  | 快速减脂    |
| `bulk`           | 增肌        |
| `maintain`       | 维持体重    |

### CalcResult\<T\>

沿用 shared：`ok` + `data` / `error{ code, message }`。页面不得抛异常驱动主流程。

### Disclaimer

| Field | Rules |
| ----- | ----- |
| textZh | 使用 `FITNESS_DISCLAIMER`；结果区底部必须展示 |

---

## Shared: 计算流水线类型（复用 + 扩展）

### BmrInput / BmrResult

| 复用 | 字段要点 |
| ---- | -------- |
| Input | `sex`, `ageYears`, `heightCm`, `weightKg` |
| Result | `bmrKcal`；可选 `referenceNote` |

**本功能**: 不传入体脂。

### TdeeInput / TdeeResult

| 复用 | 字段要点 |
| ---- | -------- |
| Input | `bmrKcal`, `activity: ActivityLevel` |
| Result | `tdeeKcal` |

### TargetIntakeInput / TargetIntakeResult

| 复用 | 字段要点 |
| ---- | -------- |
| Input | `tdeeKcal`, `bmrKcal`, `goal` |
| Result | `targetKcal`, `goal`, `deltaKcal`, `deltaRange`, `bmrFloorApplied`, `hint` |

### MacroPlanInput / MacroPlanResult（扩展）

#### MacroPlanInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| targetKcal | number | `>0` |
| weightKg | number | `>0` |
| goal | NutritionGoal | 必填合法枚举 |

#### MacroPlanResult

| Field | Type | Notes |
| ----- | ---- | ----- |
| proteinG | number | 主推荐，1 位小数 |
| fatG | number | 主推荐，1 位小数 |
| carbRestG | number | 休息日主推荐 |
| carbTrainG | number | 训练日主推荐 |
| proteinGPerKg / fatGPerKg | number | 系数 |
| proteinRange / fatRange | NumericRange | g/kg |
| trainCarbBoost | number | 如 1.15 |
| trainCarbBoostRange | NumericRange | 加成幅度 |
| structureTight | boolean | 剩余热量为负时碳水托底 |
| **carbRestRangeG** | NumericRange | **本功能扩展**：休息日碳水参考区间（克） |
| **carbTrainRangeG** | NumericRange | **本功能扩展**：训练日碳水参考区间（克） |

**Transitions**: 无持久化；每次调用纯函数。

**区间规则**: 见 [research.md](./research.md) R2；下限 ≥ 0；展示时 `min ≤ max`。

---

## Page: FormState（瞬时）

| Field | Type | Required | Validation |
| ----- | ---- | -------- | ---------- |
| sex | Sex \| '' | 是 | 须选择 |
| ageYears | string | 是 | 解析为正整数；建议 1–120 |
| heightCm | string | 是 | 解析为有限数 `>0` |
| weightKg | string | 是 | 解析为有限数 `>0` |
| bodyFatPct | string | 否 | 空=未填；有值则 1–60 有限数 |
| activity | ActivityLevel \| '' | 是 | 须选择 |
| trainingDaysPerWeek | string | 是 | 整数 0–7 |
| goal | NutritionGoal \| '' | 是 | 须选择 |

**初始态**: 全部空；每次进入重置。  
**副作用**: 任一字段变更 → `resultView = null`，清除成功态。

---

## Page: ResultView（瞬时展示模型）

由页面在 shared 成功结果上组装，**不含第二套热量/宏量算法**。

| Field | Source |
| ----- | ------ |
| bmrKcal | BmrResult |
| tdeeKcal | TdeeResult |
| targetKcal | TargetIntakeResult（视觉主数字） |
| goal / deltaKcal / deltaRange | TargetIntakeResult |
| bmrFloorApplied / intakeHint | TargetIntakeResult |
| proteinG / fatG | MacroPlanResult |
| carbRestG / carbTrainG | MacroPlanResult（主数字） |
| carbRestRangeG / carbTrainRangeG | MacroPlanResult（参考区间） |
| structureTight | MacroPlanResult |
| reportedBodyFatPct | 表单有合法值时才有；附 `bodyFatNotUsedInCalc: true` |
| trainingDaysPerWeek | 表单 |
| trainingCarbHintZh | 按天数模板生成（research R5） |
| meals | 见下 |
| tipsZh | 按 goal 映射 + 条件追加 BMR 提示（research R7） |
| showAggressiveRisk | `goal === 'cutAggressive'` |
| disclaimerZh | `FITNESS_DISCLAIMER` |

### MealSlot

| Field | Rules |
| ----- | ----- |
| key | `breakfast` \| `lunch` \| `dinner` |
| ratio | 0.3 / 0.4 / 0.3 固定 |
| kcal | 由 `targetKcal` 按比例取整；总和校准到 `targetKcal` |
| exampleZh | 常量文案 |

---

## Validation Feedback

| Entity | Rules |
| ------ | ----- |
| errorTip | 表单级或首个字段错误的中文提示；有 tip 时隐藏 ResultView |
| fieldErrors | 可选；体脂等字段级提示 |

## Relationships

```text
FormState --parse/validate--> BmrInput + activity + goal + trainingDays + optional BF%
                 |
                 v
         shared pipeline (BMR→TDEE→Target→Macro)
                 |
                 v
            ResultView (display only)
```
