# Contract: Shared Body Metrics API

**Package**: `@peakmeet/shared`  
**Consumers**: 小程序（经 `utils/shared` CJS sync）、未来 Web 极简计算器（本功能不强制实现 Web UI）  
**Style**: 纯函数；无 I/O；无平台 API

## Exports (additive to existing `getPeakMeetPing`)

### Types

- `Sex`, `CalcResult<T>`, `BmiInput`, `BmiValue`, `BmrInput`, `BmrValue`
- `BodyFatMode`, `BodyFatSimpleInput`, `BodyFatNavyInput`, `BodyFatValue`
- `WhrInput`, `WhrValue`, `OneRmInput`, `OneRmValue`
- 相关 category / risk / level 枚举

### Constants

- `DISCLAIMER_ZH: string` — 合规免责声明全文
- BMI 中国 / WHO 区间表（可供 UI 直接渲染）
- WHR 性别切点常量

### Functions

| Symbol | Signature (conceptual) | Notes |
| ------ | ---------------------- | ----- |
| `calculateBmi` | `(input: BmiInput) => CalcResult<BmiValue>` | 双标准 category |
| `calculateBmr` | `(input: BmrInput) => CalcResult<BmrValue>` | Mifflin–St Jeor |
| `calculateBodyFatSimple` | `(input: BodyFatSimpleInput) => CalcResult<BodyFatValue>` | YMCA |
| `calculateBodyFatNavy` | `(input: BodyFatNavyInput) => CalcResult<BodyFatValue>` | U.S. Navy |
| `calculateWhr` | `(input: WhrInput) => CalcResult<WhrValue>` | 含性别 riskBand |
| `estimateOneRm` | `(input: OneRmInput) => CalcResult<OneRmValue>` | Epley；reps 1–12 |

## Error codes (non-exhaustive, stable)

`INVALID_NUMBER` | `OUT_OF_RANGE` | `INVALID_HEIGHT` | `INVALID_WEIGHT` | `INVALID_AGE` | `INVALID_WAIST` | `INVALID_HIP` | `INVALID_NECK` | `NECK_NOT_LT_WAIST` | `HIP_REQUIRED` | `REPS_OUT_OF_RANGE` | `INVALID_SEX`

## Invariants

1. 相同合法输入 → 稳定相同输出（含舍入）
2. 非法输入 → `ok: false`，不返回部分数值
3. 零第三方运行时依赖
4. 所有新符号经 `src/index.ts` 导出，并被 Vitest 覆盖

## Sync

`pnpm sync:shared` 必须将上述运行时与类型声明同步至 `packages/miniprogram/utils/shared/`（见 research R9）。
