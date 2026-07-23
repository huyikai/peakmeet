# Implementation Plan: 身体指数工具箱页面

**Branch**: `002-body-index-toolbox` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-body-index-toolbox/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在微信小程序饮食 Tab 落地「身体指数工具箱」：聚合入口 + 五个独立计算页（BMI、BMR、体脂简易/围度法双模式、腰臀比、1RM）。全部数值算法与领域类型沉淀在 `packages/shared`（TDD、100% 覆盖），经既有 `pnpm sync:shared` / `build:miniprogram` 供小程序调用；页面层仅负责表单、点击计算、同页结果/解读/免责声明与基础校验提示，不重写算法、不预填、不落库、不调云函数。

## Technical Context

**Language/Version**: TypeScript 5.x（strict）；微信小程序原生 WXML/WXSS/TS；`packages/shared` 纯 TS

**Primary Dependencies**: 微信小程序原生框架 | pnpm workspace | Vitest | 既有 `sync:shared` + `build:miniprogram`（tsc 双产物 ESM/CJS）

**Storage**: 无。纯前端本地计算；不写云数据库/本地持久化表单

**Testing**: Vitest；`packages/shared/__tests__/*.test.ts` 强制 TDD，本功能新增计算模块覆盖率 100%；页面 UI 不做强制单测

**Target Platform**: 微信小程序（开发者工具预览）；Web 完整工具箱复刻不在范围

**Project Type**: pnpm monorepo — 本功能触及 `packages/shared` + `packages/miniprogram`（及根 sync 脚本对声明文件的维护）

**Performance Goals**: 单次计算在设备上即时完成（用户感知 < 100ms）；页面切换无明显卡顿；无网络依赖

**Constraints**: TypeScript 优先；禁止跨端框架；禁止为指数计算新增云函数；页面不得重复实现算法；合规免责声明与非医疗文案；不预填/不记住输入

**Scale/Scope**: 饮食 Tab 下 1 聚合页 + 5 工具页；shared 新增 BMI/BMR/体脂双模式/WHR/1RM 内核与类型；不扩展 Web 官网完整工具箱

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 未引入禁止技术（Taro/uni-app/重型框架/自建服务器/第三方 BaaS/Astro SSR）
- [x] **TypeScript First**: shared 与小程序页面逻辑使用 TypeScript；无充分理由不新增纯 JS 业务源码
- [x] **Backend**: 纯计算在 shared/前端；不为指数计算新增云函数
- [x] **Shared Logic First**: BMI/BMR/体脂/WHR/1RM 算法与类型进 `packages/shared`，无平台 API
- [x] **TDD**: 计划含红→绿→重构；`__tests__/*.test.ts`；覆盖率目标 100%
- [x] **Product Boundary**: 仅小程序饮食工具箱；Web 不复刻完整工具箱
- [x] **MVP & Low Ops**: 复用既有 sync/build；无新后端、无持久化
- [x] **Compliance**: 免责声明、无医疗宣称、无极端训练/节食建议；本地计算最小必要
- [x] **Monorepo Paths**: 变更落在 `packages/shared`、`packages/miniprogram`、必要时 `scripts/`
- [x] **Decision Priority**: 小程序体验 → 低运维 → shared 复用 → 合规优先

### Post-design (Phase 1)

- [x] 设计产物未引入栈外依赖或越界能力
- [x] contracts / data-model / quickstart 与澄清结论一致（双模式体脂、BMI 双标准、点击计算、空白表单、按性别 WHR）

## Project Structure

### Documentation (this feature)

```text
specs/002-body-index-toolbox/
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
│   │   ├── index.ts                 # 聚合导出（含本功能计算器）
│   │   ├── types/                   # Sex、单位相关公共类型（按需）
│   │   ├── constants/               # BMI 阈值、WHR 阈值、免责声明文案键等
│   │   └── calc/
│   │       ├── bmi.ts
│   │       ├── bmr.ts
│   │       ├── body-fat.ts          # 简易 + 围度法
│   │       ├── whr.ts
│   │       └── one-rm.ts
│   └── __tests__/
│       ├── bmi.test.ts
│       ├── bmr.test.ts
│       ├── body-fat.test.ts
│       ├── whr.test.ts
│       └── one-rm.test.ts
├── miniprogram/
│   ├── app.json                     # 注册 toolbox 子页面（非 Tab）
│   ├── pages/diet/
│   │   ├── index.*                  # 饮食 Tab：入口跳转工具箱
│   │   └── toolbox/
│   │       ├── index.*              # 聚合页（5 卡片）
│   │       ├── bmi/index.*
│   │       ├── bmr/index.*
│   │       ├── body-fat/index.*
│   │       ├── whr/index.*
│   │       └── one-rm/index.*
│   ├── utils/shared/                # sync 产物（CJS + d.ts）
│   └── constants/                   # 页面解读文案映射（可选，消费 shared 枚举）
scripts/
└── sync-shared-to-miniprogram.mjs   # 扩展：同步完整类型声明，勿手写单一符号
```

**Structure Decision**: 计算内核仅进 `packages/shared`；UI 仅进 `packages/miniprogram/pages/diet/toolbox/**`。饮食 Tab 页增加进入工具箱的入口。复用既有 sync/build，必要时增强 sync 的 `.d.ts` 生成以免手写过时。不触及 `web`/`cloudfunctions`/`database` 业务。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
