# Research: 002-fitness-calc-shared

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)

本文锁定实现与测试夹具所需的全部公式、系数、取整与错误模型。无未决 `NEEDS CLARIFICATION`。

---

## 1. 错误模型：`CalcResult`（不抛异常）

**Decision**: 所有公开计算函数返回可辨识联合类型，禁止 `throw`。

```ts
type CalcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CalcError };

interface CalcError {
  code: CalcErrorCode; // 稳定字符串枚举
  message: string;     // 面向用户的中文友好文案
}
```

**Rationale**: 澄清结论；小程序/Web 统一处理失败分支；纯函数更可预测。

**Alternatives considered**: `throw`（拒绝）；`null` + 副作用错误通道（拒绝）。

**Error codes（锁定）**:

| Code | 何时使用 |
| ---- | -------- |
| `INVALID_HEIGHT` | 身高缺失、非有限数、≤0 |
| `INVALID_WEIGHT` | 体重缺失、非有限数、≤0 |
| `INVALID_AGE` | 年龄缺失、非有限数、≤0 或非合理整数（实现：须为正整数，建议 1–120；超出仍可算但带「仅供参考」——见 BMI/体脂解读；年龄 ≤0 失败） |
| `INVALID_SEX` | 非 `male` / `female` |
| `INVALID_ACTIVITY` | 非五档活动枚举 |
| `INVALID_GOAL` | 非四类目标枚举 |
| `INVALID_LOAD` | 1RM 重量缺失、非有限数、≤0 |
| `INVALID_REPS` | 次数非整数，或不在 1–12 |
| `INVALID_WAIST` | 腰围缺失、非有限数、≤0 |
| `INVALID_HIP` | 臀围缺失、非有限数、≤0 |
| `INVALID_BMR` | 目标摄入入参 BMR 非法 |
| `INVALID_TDEE` | 目标摄入/宏量入参 TDEE 或目标热量非法 |
| `INVALID_TARGET_KCAL` | 宏量入参目标热量非法 |

年龄边界：`age < 1` 或非整数 → `INVALID_AGE`；`age > 120` → 仍计算，但解读附「仅供参考、非医疗建议」。

---

## 2. 取整规则

**Decision**:

- 热量（BMR、TDEE、目标摄入、1RM 重量估算）：`Math.round(x)` → **整数**
- 宏量克数、BMI 数值、体脂率、腰臀比：保留 **1 位小数**，`Math.round(x * 10) / 10`
- 中间计算可用全精度；仅对外 `data` 字段取整

**Rationale**: 澄清 Option B；四舍五入（half away from zero via `Math.round`）便于 Vitest 精确断言。

**Alternatives considered**: 全部整数；全部 1 位小数。

---

## 3. 区间固定中点（不可覆盖）

**Decision**: 内核使用下表中点；API 不提供覆盖参数；成功结果可附带 `range: { min, max }`。

| 参数 | 区间 | 中点（锁定） |
| ---- | ---- | ------------ |
| 减脂温和缺口 | 300–500 kcal | **400** |
| 减脂快速缺口 | 500–700 kcal | **600** |
| 增肌盈余 | 200–400 kcal | **300** |
| 减脂蛋白 g/kg | 1.8–2.2 | **2.0** |
| 增肌蛋白 g/kg | 2.0–2.4 | **2.2** |
| 维持蛋白 g/kg | （宪章未给；取温和减脂同带）1.8–2.2 | **2.0** |
| 脂肪 g/kg（各目标） | 0.8–1.0 | **0.9** |
| 训练日碳水相对休息日上浮 | 10%–20% | **15%**（×1.15） |

**Rationale**: 澄清不可覆盖；维持目标宏量对齐减脂蛋白带，避免新增未规格化区间。

**Alternatives considered**: 调用方覆盖；强制传入精确值。

---

## 4. BMI

**Decision**:

- 公式：`BMI = weightKg / (heightM)²`，`heightM = heightCm / 100`
- 中国成人常用切点（标签中文）：

| 范围 | `category` | `label`（通俗） |
| ---- | ---------- | --------------- |
| &lt; 18.5 | `underweight` | 偏瘦 |
| 18.5 – 23.9 | `normal` | 标准 |
| 24.0 – 27.9 | `overweight` | 超重 |
| ≥ 28.0 | `obese` | 肥胖 |

- 免责：结果附可展示 `notes` 或调用方使用全局 `DISCLAIMER`

**Rationale**: 产品面向国内用户；WHO 切点（25/30）作为备选已拒绝。

**Alternatives considered**: WHO 国际切点。

**Fixture**: height 175 cm, weight 70 kg → BMI = 22.9 → `normal` / 标准。

---

## 5. BMR（Mifflin-St Jeor）

**Decision**:

- Male: `10*weight + 6.25*heightCm - 5*age + 5`
- Female: `10*weight + 6.25*heightCm - 5*age - 161`
- 对外 `Math.round`

**Rationale**: 宪章与规格强制。

**Alternatives considered**: Harris-Benedict（拒绝）。

**Fixture**: male 30y, 175 cm, 70 kg → raw = 1648.75 → **1649** kcal。

---

## 6. TDEE 活动系数

**Decision**:

| `ActivityLevel` | 系数 |
| --------------- | ---- |
| `sedentary`（久坐） | 1.2 |
| `light`（轻度） | 1.375 |
| `moderate`（中度） | 1.55 |
| `active`（高度） | 1.725 |
| `veryActive`（极高） | 1.9 |

`TDEE = round(BMR * factor)`（若入参已是整数 BMR，仍对乘积取整）。

**Rationale**: 规格 Assumptions。

---

## 7. 目标摄入 + BMR 兜底

**Decision**:

```
raw = TDEE + delta
  maintain: 0
  cutMild: -400
  cutAggressive: -600
  bulk: +300

if raw < BMR:
  targetKcal = BMR
  bmrFloorApplied = true
  hint = 固定中文提示（见 constants）
else:
  targetKcal = round(raw)  // raw 已按整数运算则保持
  bmrFloorApplied = false
```

提示文案（锁定）：`建议摄入已调整至不低于基础代谢（BMR），请量力而行。`

**Rationale**: Constitution 红线。

---

## 8. 宏量营养素

**Decision**:

1. `proteinG = round1(weightKg * proteinGPerKg)`
2. `fatG = round1(weightKg * 0.9)`
3. `proteinKcal = proteinG * 4`；`fatKcal = fatG * 9`
4. `remainKcal = targetKcal - proteinKcal - fatKcal`
5. 若 `remainKcal < 0`：`carbRestG = 0`，可选 `structureTight: true`
6. 否则 `carbRestG = round1(remainKcal / 4)`
7. `carbTrainG = round1(carbRestG * 1.15)`

减脂类目标（`cutMild` / `cutAggressive`）与 `maintain` 用蛋白 2.0；`bulk` 用 2.2。

**Rationale**: 规格 + 中点表。

---

## 9. 1RM（Epley）

**Decision**:

- `oneRm = round(weight * (1 + reps / 30))`
- `reps` ∈ **[1, 12]** 整数；`weight > 0` 有限数

**Rationale**: 澄清 1–12；Epley 常见实践。

**Fixture**: 100 kg × 5 → `100 * (1 + 5/30) = 116.666…` → **117**.

---

## 10. 体脂率：PeakMeet 四输入估算式（PWW-v1）

**Decision**: 项目固定式（非临床金标准），四项均参与：

```
// waistCm, weightKg, ageYears, sex: 'male' | 'female'
const sexAdj = sex === 'male' ? -5 : 8;
const raw =
  0.4 * waistCm
  + 0.15 * ageYears
  - 0.2 * weightKg
  + sexAdj;
const bodyFatPct = clamp(round1(raw), 3.0, 60.0);
```

解读标签（锁定，非医疗）：

| 性别 | 偏低 | 标准 | 偏高 | 过高 |
| ---- | ---- | ---- | ---- | ---- |
| male | &lt; 14 | 14–20 | 20.1–25 | &gt; 25 |
| female | &lt; 21 | 21–29 | 29.1–35 | &gt; 35 |

`category`: `low` | `normal` | `high` | `veryHigh`  
`label`: 偏低 | 标准 | 偏高 | 过高

**Rationale**: 澄清要求腰围+体重+性别+年龄均参与；公开公式（如仅 BMI+年龄的 Deurenberg、需颈围/身高的 US Navy）不满足输入约束，故锁定 PeakMeet PWW-v1 并写死夹具。

**Alternatives considered**: Deurenberg（无腰围）；US Navy（需身高/颈围）。

**Fixtures**:

| 输入 | raw | bodyFatPct | category |
| ---- | --- | ---------- | -------- |
| male, waist 85, weight 75, age 30 | 18.5 | 18.5 | normal |
| female, waist 75, weight 60, age 28 | 30.2 | 30.2 | high |

---

## 11. 腰臀比（WHR）

**Decision**:

- `whr = round1(waistCm / hipCm)`
- 风险分级：

| 性别 | 较低 `low` | 中等 `moderate` | 较高 `high` |
| ---- | ---------- | --------------- | ----------- |
| male | &lt; 0.90 | 0.90–0.99 | ≥ 1.00 |
| female | &lt; 0.80 | 0.80–0.84 | ≥ 0.85 |

`label`: 较低风险 | 中等风险 | 较高风险（科普用语，非诊断）

**Rationale**: 规格示例切点扩展为三档，便于工具箱展示。

**Fixture**: male waist 90 / hip 100 → 0.9 → moderate。

---

## 12. 免责声明常量

**Decision**: 导出：

```ts
export const FITNESS_DISCLAIMER =
  '仅供参考，不构成专业健身指导，请根据自身身体状况量力而行';
```

与 Constitution 措辞一致。

---

## 13. 模块与测试组织

**Decision**: `src/calc/*.ts` 按能力拆分；每个公开函数独立 `__tests__/*.test.ts`；Vitest coverage 对 `src/calc/**` 要求 100%（lines/functions/branches/statements）。保留 `ping`。

**Rationale**: Constitution TDD；便于按 User Story 增量交付。

**Alternatives considered**: 单文件巨模块（拒绝，难测难审）。

---

## 14. 构建与多端

**Decision**: 沿用既有 ESM `dist/` + CJS `dist-cjs/` + `pnpm sync:shared`；本功能不改 sync 脚本语义。公开导出名见 [contracts/calc-api.md](./contracts/calc-api.md)。

**Rationale**: 001 基建已验证路径。
