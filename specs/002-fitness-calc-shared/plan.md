# Implementation Plan: 健身核心计算共享库

**Branch**: `002-fitness-calc-shared` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-fitness-calc-shared/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在既有 `@peakmeet/shared` 上以 TDD 交付健身纯计算内核：BMI、Mifflin-St Jeor BMR、五档 TDEE、四目标摄入（固定中点缺口/盈余 + ≥BMR 兜底）、宏量（训练日/休息日碳水）、Epley 1RM（次数 1–12）、PeakMeet 四输入体脂估算、腰臀比风险分级。全部公开 API 返回 `CalcResult` 联合类型（不抛异常）；热量整数 kcal、宏量 1 位小数；零运行时依赖；保留 `getPeakMeetPing`。本功能仅改 `packages/shared`（及根测试脚本若需开覆盖率），不接 UI。

## Technical Context

**Language/Version**: TypeScript 5.x（strict）；`packages/shared` 纯 TS

**Primary Dependencies**: Vitest（dev）| TypeScript/tsc（双产物 ESM+CJS）| 零第三方运行时依赖

**Storage**: 无（纯函数，不读写存储）

**Testing**: Vitest；`packages/shared/__tests__/**/*.test.ts`；红→绿→重构；计算相关覆盖率 **100%**

**Target Platform**: 供小程序（sync CJS）与 Web（workspace ESM）复用；本功能不改两端 UI

**Project Type**: pnpm monorepo；触达包仅 `packages/shared`

**Performance Goals**: 单次计算微秒级即可；`pnpm --filter @peakmeet/shared test` < 30s；全量 `pnpm test` 仍 < 1 分钟

**Constraints**: 纯计算禁止云函数；禁止平台 API；禁止 throw；区间代表值不可覆盖；医疗用语禁止；免责声明常量可导出

**Scale/Scope**: shared 计算模块 + 类型契约 + 100% 覆盖单测；不含饮食 Tab UI、三餐菜谱、云函数、身体数据持久化

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 未引入禁止技术；仅 Vitest/tsc 既有工具链
- [x] **TypeScript First**: 全部新增逻辑为 TypeScript
- [x] **Backend**: 无云函数、无云库；计算仅在 shared
- [x] **Shared Logic First**: 唯一实现地位于 `packages/shared`；无平台 API
- [x] **TDD**: 计划强制先测后实现；覆盖率 100%
- [x] **Product Boundary**: 不交付小程序完整饮食 UI / Web 完整库
- [x] **MVP & Low Ops**: 纯函数模块拆分，无新基础设施
- [x] **Compliance**: 免责声明常量 + 无医疗用语；BMR 兜底防极端节食建议；无用户数据采集
- [x] **Monorepo Paths**: 仅扩展 `packages/shared/src` 与 `__tests__`
- [x] **Decision Priority**: shared 复用与合规优先于 API 灵活性（区间不可覆盖）

### Post-design (Phase 1)

- [x] 设计产物未引入栈外依赖或越界能力
- [x] contracts / data-model / research 与澄清结论一致（Result 不抛、Epley 1–12、取整、固定中点、四输入体脂）

## Project Structure

### Documentation (this feature)

```text
specs/002-fitness-calc-shared/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
packages/shared/
├── src/
│   ├── ping.ts                    # 保留
│   ├── calc/
│   │   ├── result.ts              # CalcResult / CalcError
│   │   ├── round.ts               # kcal / gram 取整
│   │   ├── constants.ts           # 活动系数、区间中点、标签、免责声明
│   │   ├── bmi.ts
│   │   ├── bmr.ts
│   │   ├── tdee.ts
│   │   ├── targetIntake.ts
│   │   ├── macros.ts
│   │   ├── oneRm.ts
│   │   ├── bodyFat.ts
│   │   ├── whr.ts
│   │   └── index.ts               # calc 子入口（可选）
│   └── index.ts                   # 统一导出 ping + calc
├── __tests__/
│   ├── ping.test.ts               # 保留
│   ├── bmi.test.ts
│   ├── bmr.test.ts
│   ├── tdee.test.ts
│   ├── targetIntake.test.ts
│   ├── macros.test.ts
│   ├── oneRm.test.ts
│   ├── bodyFat.test.ts
│   ├── whr.test.ts
│   └── result.test.ts             # 可选：错误码/联合类型约定
├── dist/ / dist-cjs/              # 既有双产物
├── vitest.config.ts               # 启用 coverage（lines/branches/functions/statements 100% 对 calc）
└── package.json
```

**Structure Decision**: 仅扩展 `packages/shared`。计算按领域文件拆分，便于 TDD 与覆盖率；统一从包根 `index.ts` 导出，保证小程序 sync 与 Web workspace 同一契约。不新增顶层目录；不改 miniprogram/web/cloudfunctions（后续功能再接入）。

## Complexity Tracking

> 无 Constitution 违规需豁免；本表留空。
