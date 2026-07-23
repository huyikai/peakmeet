# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Fill feature-specific details. Defaults below reflect PeakMeet
  Constitution (Stack Lock). Do not introduce tech outside the locked stack.
-->

**Language/Version**: TypeScript 优先（微信小程序原生 WXML/WXSS/TS；Astro Web；shared 纯 TS；云函数 TS）

**Primary Dependencies**: 微信小程序原生框架 | 微信云开发 CloudBase | Astro (SSG) | pnpm workspace | Vitest | ESLint + Prettier + TypeScript

**Storage**: 微信云数据库 + 云存储（唯一后端）；Web 端禁止数据存储/云库接入

**Testing**: Vitest；`packages/shared` 强制 TDD，覆盖率 100%；测试路径 `__tests__/xxx.test.ts`

**Target Platform**: 微信小程序 + 静态 Web 官网（SSG）

**Project Type**: pnpm monorepo（packages/shared | miniprogram | web | cloudfunctions）

**Performance Goals**: [feature-specific；默认：小程序轻量快速加载；纯计算前端完成]

**Constraints**: TypeScript 优先；禁止跨端框架/重型前端框架/自建后端/第三方 BaaS/Astro SSR；纯计算禁止云函数；Hyrox 不作独立专区

**Scale/Scope**: [feature-specific；对齐 Constitution Product Boundaries]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

- [ ] **Stack Lock**: 未引入禁止技术（Taro/uni-app/重型框架/自建服务器/第三方 BaaS/Astro SSR）
- [ ] **TypeScript First**: 新增业务/共享逻辑使用 TypeScript；无充分理由不新增纯 JS
- [ ] **Backend**: 仅微信云开发；纯计算逻辑在前端/`shared`，未为简单计算新增云函数
- [ ] **Shared Logic First**: 可复用计算/工具进 `packages/shared`，无平台 API，两端复用一致
- [ ] **TDD**: 涉及 shared 核心逻辑时，计划含红→绿→重构与 `__tests__/*.test.ts`；覆盖率目标 100%
- [ ] **Product Boundary**: 未突破小程序 4 Tab / Web 导流边界（Web 无完整库、无登录、无云库）
- [ ] **MVP & Low Ops**: 无过度设计；优先免运维原生方案
- [ ] **Compliance**: 无医疗表述；含免责声明要求；隐私最小必要；无极端节食/超负荷推荐
- [ ] **Monorepo Paths**: 变更落在约定目录，未随意新增顶层目录
- [ ] **Decision Priority**: 冲突时已按 小程序体验 → 低运维 → shared 复用 → 合规优先 裁决

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Keep PeakMeet monorepo layout. Only expand package-internal
  paths needed by this feature. Do not invent new top-level directories.
-->

```text
packages/
├── shared/
│   ├── src/
│   └── __tests__/
├── miniprogram/
├── web/
└── cloudfunctions/
database/
docs/
pnpm-workspace.yaml
package.json
README.md
```

**Structure Decision**: [Document which packages this feature touches and why;
must align with Constitution Monorepo Structure]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
