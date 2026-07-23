# Data Model: 002-body-index-toolbox

**Date**: 2026-07-23  
**Note**: 无持久化实体。下列为 shared 领域模型与小程序页面瞬时状态模型。

## Shared Enums & Common Types

### Sex

| Value  | Meaning |
| ------ | ------- |
| `male` | 男      |
| `female` | 女    |

### CalcResult\<T\>

| Field | Rules |
| ----- | ----- |
| ok | `true` \| `false` |
| value | 仅 `ok===true`；类型 T |
| code | 仅 `ok===false`；稳定错误码（如 `INVALID_HEIGHT`、`REPS_OUT_OF_RANGE`） |
| meta | 可选；警告（如年龄超出简易体脂最佳适用区间） |

### Disclaimer

| Field | Rules |
| ----- | ----- |
| textZh | 固定合规中文；所有结果区底部必须展示 |

---

## BMI

### BmiInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| heightCm | number | 有限数；建议 50–250；`>0` |
| weightKg | number | 有限数；建议 20–300；`>0` |

### BmiValue

| Field | Type | Notes |
| ----- | ---- | ----- |
| bmi | number | 一位小数策略由 shared 固定 |
| chinaCategory | enum | `underweight` \| `normal` \| `overweight` \| `obese` |
| whoCategory | enum | 同上 |
| chinaRanges | list | 供 UI 展示区间表 |
| whoRanges | list | 供 UI 展示区间表 |

**Transitions**: 无持久化；每次调用纯函数。

---

## BMR

### BmrInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | Sex | 必填 |
| age | number | 整数 1–120 |
| heightCm | number | `>0`，建议 50–250 |
| weightKg | number | `>0`，建议 20–300 |

### BmrValue

| Field | Type | Notes |
| ----- | ---- | ----- |
| bmrKcal | number | 整数 kcal/日 |
| level | enum | `lower` \| `typical` \| `higher`（相对同性别粗分参考，科普用） |

---

## Body Fat

### BodyFatMode

`simple` | `navy`

### BodyFatSimpleInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | Sex | 必填 |
| age | number | 1–120；18–65 外可带 `meta.warning` |
| weightKg | number | `>0` |
| waistCm | number | `>0` |

### BodyFatNavyInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | Sex | 必填 |
| heightCm | number | `>0` |
| neckCm | number | `>0`；且须小于腰围（Navy 约束） |
| waistCm | number | `>0` |
| hipCm | number | 仅 `female` 必填且 `>0` |

### BodyFatValue

| Field | Type | Notes |
| ----- | ---- | ----- |
| percent | number | 体脂率 % |
| method | BodyFatMode | 与入参模式一致 |
| limitationCode | string | 驱动误差/局限文案 |

**UI state**: 切换 `mode` 时清空 `result`；默认 `simple`。

---

## WHR

### WhrInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| sex | Sex | 必填 |
| waistCm | number | `>0` |
| hipCm | number | `>0`（禁止 0） |

### WhrValue

| Field | Type | Notes |
| ----- | ---- | ----- |
| ratio | number | 两位小数 |
| riskBand | enum | `lower` \| `higher`（按性别阈值） |
| threshold | number | 当前性别切点，供 UI 展示 |

---

## 1RM

### OneRmInput

| Field | Type | Validation |
| ----- | ---- | ---------- |
| weightKg | number | `>0` |
| reps | number | 整数 1–12 |

### OneRmValue

| Field | Type | Notes |
| ----- | ---- | ----- |
| oneRmKg | number | 估算 1RM（合理精度，如 1 位小数） |
| percentages | optional | 如 60/70/80% 对应重量，供参考建议 |

---

## Miniprogram Page State（瞬时）

### ToolboxHubItem

| Field | Rules |
| ----- | ----- |
| id | `bmi` \| `bmr` \| `body-fat` \| `whr` \| `one-rm` |
| title | 展示名 |
| desc | 一句话说明 |
| path | `navigateTo` 路径 |

### CalculatorPageState\<Form\>

| Field | Rules |
| ----- | ----- |
| form | 字符串字段（输入框）；`onLoad` 空 |
| result | `null` 或上次成功计算结果视图模型 |
| errorTip | 校验/内核错误中文 |
| dirtySinceResult | 输入变更后置位并 `result=null` |

**State transitions**:

```text
[Blank] --input--> [Editing]
[Editing] --tap 计算 + invalid--> [Editing + errorTip]
[Editing] --tap 计算 + ok--> [ResultVisible]
[ResultVisible] --any form change--> [Editing, result cleared]
[any] --leave & re-enter--> [Blank]
```

---

## Relationships

- 页面 `CalculatorPageState` **调用** shared 纯函数；**不**拥有算法副本
- `ToolboxHubItem` **导航至** 各 `CalculatorPageState`
- 饮食 Tab **导航至** 工具箱聚合页
- 无服务端实体、无云集合
