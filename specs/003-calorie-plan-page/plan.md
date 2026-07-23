# Implementation Plan: 热量缺口计算页面

**Branch**: `003-calorie-plan-page` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-calorie-plan-page/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在微信小程序饮食 Tab 落地「热量缺口计算」单页：收集身体与运动信息 → 调用 `packages/shared` 串联 BMR → TDEE → 目标摄入 → 宏量计划 → 同页展示目标热量（突出）、宏量（训练日/休息日碳水：主数字 + 参考区间）、三餐 3:4:3、按目标分化的温馨提示与免责声明。页面不重写算法；本功能仅补齐 shared 中碳水参考区间导出（TDD），三餐示意与提示文案留在小程序常量层。

## Technical Context

**Language/Version**: TypeScript 5.x（strict）；微信小程序原生 WXML/WXSS/TS；`packages/shared` 纯 TS

**Primary Dependencies**: 微信小程序原生框架 | pnpm workspace | Vitest | 既有 `sync:shared` + `build:miniprogram`

**Storage**: 无。纯前端本地计算；不写云数据库、不持久化表单

**Testing**: Vitest；shared 变更（宏量区间等）强制 TDD、相关模块覆盖率 100%；页面 UI 不做强制单测

**Target Platform**: 微信小程序（开发者工具预览）；Web 完整方案页复刻不在范围

**Project Type**: pnpm monorepo — 本功能触及 `packages/shared` + `packages/miniprogram`

**Performance Goals**: 单次方案计算用户感知即时（设备上 < 100ms）；无网络依赖

**Constraints**: TypeScript 优先；禁止跨端框架；禁止为热量计算新增云函数；页面不得重复实现 BMR/TDEE/目标摄入/宏量公式；合规免责声明；快速减脂无阻断确认；不预填/不记住输入

**Scale/Scope**: 饮食 Tab 下 1 个计算页 + 入口；复用既有 shared 热量链路；补齐碳水参考区间字段；不扩展 Web/云函数

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 未引入禁止技术（Taro/uni-app/重型框架/自建服务器/第三方 BaaS/Astro SSR）
- [x] **TypeScript First**: shared 与小程序页面逻辑使用 TypeScript；无充分理由不新增纯 JS 业务源码
- [x] **Backend**: 纯计算在 shared/前端；不为热量计算新增云函数
- [x] **Shared Logic First**: BMR/TDEE/目标摄入/宏量（含碳水区间）进 `packages/shared`；三餐比例与温馨提示为展示编排，不另造计算内核
- [x] **TDD**: shared 碳水区间等扩展含红→绿→重构；`__tests__/*.test.ts`；覆盖率目标 100%
- [x] **Product Boundary**: 仅小程序热量方案页；Web 不复刻完整方案
- [x] **MVP & Low Ops**: 复用既有 sync/build；无新后端、无持久化
- [x] **Compliance**: 免责声明、无医疗宣称、快速减脂结果区风险提示、禁止鼓励低于 BMR；本地计算最小必要
- [x] **Monorepo Paths**: 变更落在 `packages/shared`、`packages/miniprogram`
- [x] **Decision Priority**: 小程序体验 → 低运维 → shared 复用 → 合规优先

### Post-design (Phase 1)

- [x] 设计产物未引入栈外依赖或越界能力
- [x] contracts / data-model / quickstart 与澄清结论一致（提示分化、结果区风险、3:4:3、体脂有值才展示、碳水主数字+区间）

## Project Structure

### Documentation (this feature)

```text
specs/003-calorie-plan-page/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/
├── shared/
│   ├── src/
│   │   ├── index.ts
│   │   └── calc/
│   │       ├── bmr.ts                 # 已有，复用
│   │       ├── tdee.ts                # 已有，复用
│   │       ├── targetIntake.ts        # 已有，复用
│   │       ├── macros.ts              # 扩展：碳水参考区间字段
│   │       ├── constants.ts           # 既有 GOAL_DELTA / TRAIN_CARB_BOOST 等
│   │       └── types.ts
│   └── __tests__/
│       └── macros.test.ts             # 扩展区间用例（及既有热量链路回归）
├── miniprogram/
│   ├── app.json                       # 注册 calorie-plan 页
│   ├── pages/diet/
│   │   ├── index.*                    # 饮食 Tab：增加入口
│   │   └── calorie-plan/
│   │       └── index.*                # 单页：表单 + 同页结果
│   ├── utils/shared/                  # sync 产物
│   └── constants/
│       └── calorie-plan-copy.ts       # 三餐示例、目标分化提示、活动/目标中文映射
scripts/
└── sync-shared-to-miniprogram.mjs     # 复用，不手写导出清单
```

**Structure Decision**: 计算内核仅扩展 `packages/shared` 宏量结果；UI 仅进 `packages/miniprogram/pages/diet/calorie-plan/`，与 `toolbox/` 并列。饮食 Tab 增加可发现入口。不触及 `web` / `cloudfunctions` / `database`。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
