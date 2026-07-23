# Implementation Plan: 小程序计算页视觉契约（对齐品牌）

**Branch**: `004-calc-ui-contract` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-calc-ui-contract/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在 `packages/miniprogram` 落地 PeakMeet 品牌视觉契约：以 `docs/brand` 的 Ink / Orange / Snow 为唯一主色板，建立统一 token + 单一共享样式入口（`styles/calc-theme.wxss`），并完成本功能交付范围内全部存量页迁移——饮食 Tab 入口、工具箱聚合页、工具箱五计算页、热量缺口页。澄清结论锁定：主按钮 Ink 实心、选中态 Orange 描边浅底、主数字 Ink。不改 shared 计算逻辑与既有交互行为。

## Technical Context

**Language/Version**: TypeScript 5.x（页面逻辑保持现状）；WXSS + 可选 page 级 CSS 变量（微信基础库 3.x 已可用）

**Primary Dependencies**: 微信小程序原生 WXML/WXSS；既有 `pnpm build:miniprogram` / DevTools prebuild 钩子；品牌静态资源 `assets/brand/logo/`

**Storage**: 无

**Testing**: 无强制单测（纯 UI）；以 quickstart 视觉/回归清单人工验收；不改 shared 故无需新增 Vitest

**Target Platform**: 微信小程序（开发者工具 + 真机预览）

**Project Type**: pnpm monorepo — 仅触及 `packages/miniprogram`（及文档 `docs/brand` 只读引用）

**Performance Goals**: 样式体积可忽略；页面切换与计算反馈无新增卡顿

**Constraints**: 禁止另起主色板；禁止重型 UI 库/跨端框架；禁止把视觉样式塞进 `packages/shared`；Orange 不作主按钮实心、不作整串主数字色

**Scale/Scope**: 共享样式 1 套 + 迁移清单 8 页（饮食入口、工具箱聚合、BMI/BMR/体脂/腰臀比/1RM、热量缺口）+ 增量引用说明

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 原生小程序 WXSS；无 Taro/uni-app/重型 UI 库
- [x] **TypeScript First**: 不为此功能新增无必要的纯 JS 业务源码；页面逻辑保持 TS
- [x] **Backend**: 无后端变更
- [x] **Shared Logic First**: 计算仍在 shared；视觉不进 shared
- [x] **TDD**: 不适用强制（无 shared 计算变更）；UI 以清单验收
- [x] **Product Boundary**: 仅小程序饮食路径视觉；Web 完整体系另开
- [x] **MVP & Low Ops**: 复用既有 brand 资产与 calc-common 迁移，不引入新运行时依赖
- [x] **Compliance**: 免责声明保留且弱化不消失；无医疗/极端节食视觉鼓动
- [x] **Monorepo Paths**: 变更在 `packages/miniprogram`（`styles/`、`pages/diet/**`）；`docs/brand` 只读
- [x] **Decision Priority**: 小程序体验与品牌一致 → 低运维 → 合规

### Post-design (Phase 1)

- [x] 设计产物未引入栈外依赖
- [x] contracts / data-model / quickstart 与澄清结论一致（Ink 主按钮、全量迁移、入口页纳入、主数字 Ink、选中 Orange 描边）

## Project Structure

### Documentation (this feature)

```text
specs/004-calc-ui-contract/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/miniprogram/
├── styles/
│   ├── tokens.wxss          # --pm-ink / --pm-orange / --pm-snow + 衍生
│   └── calc-theme.wxss      # 单一共享入口：@import tokens + 通用组件类
├── assets/brand/logo/       # 已有；入口页按需引用
├── app.wxss                 # 全局 page 背景对齐 Snow（可选轻量）
├── pages/diet/
│   ├── index.*              # 饮食 Tab 入口 — 迁移
│   ├── calorie-plan/        # 热量缺口 — 迁移
│   └── toolbox/
│       ├── index.*          # 聚合页 — 迁移
│       ├── calc-common.wxss # 废弃或改为 re-export → calc-theme
│       └── {bmi,bmr,body-fat,whr,one-rm}/  # 五计算页 — 迁移
docs/brand/README.md         # 品牌权威源（只读）
```

**Structure Decision**: token 与主题样式集中在 `packages/miniprogram/styles/`；存量页将 `@import` 指向 `calc-theme.wxss` 并替换硬编码 `#111`/`#f7f7f7` 等。业务 TS/WXML 结构尽量不动，仅 class 与样式对齐。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
