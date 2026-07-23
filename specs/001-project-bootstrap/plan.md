# Implementation Plan: 项目初始化与工程基建

**Branch**: `001-project-bootstrap` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-bootstrap/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

落地 PeakMeet Constitution 约定的 TypeScript 优先 pnpm monorepo 工程底座：根工具链（tsconfig / ESLint / Prettier / Vitest）与统一脚本；初始化 `shared`、`miniprogram`、`web`、`cloudfunctions` 骨架及 `database/`、`docs/`；shared 可构建并产出 `.d.ts`；小程序四 Tab 可打开；官网四页 SSG 可本地预览并 workspace 引用 shared 冒烟；云函数含 1 个可编译占位函数；shared→小程序轻量同步脚本一次冒烟；`docs/constitution.md` 完整落盘。

## Technical Context

**Language/Version**: TypeScript 5.x（strict）；微信小程序原生 WXML/WXSS/TS；Astro Web；shared / cloudfunctions 纯 TS；Node.js 20 LTS；pnpm 9+

**Primary Dependencies**: 微信小程序原生框架 | 微信云开发 CloudBase（仅云函数目录骨架） | Astro（SSG） | pnpm workspace | Vitest | ESLint + Prettier + typescript-eslint | TypeScript（tsc 构建 shared）

**Storage**: 本功能不接入云数据库/云存储；仅预留 `database/` 与云函数目录。Web 禁止数据存储。

**Testing**: Vitest；`packages/shared/__tests__/*.test.ts`；底座至少 1 条冒烟单测且根 `pnpm test` 通过

**Target Platform**: 微信小程序开发者工具 + 静态 Web 官网（SSG 本地 `astro dev`）

**Project Type**: pnpm monorepo（packages/shared | miniprogram | web | cloudfunctions）

**Performance Goals**: 根 `pnpm test` < 1 分钟；根 `pnpm build`（shared+web+cloudfunctions）< 2 分钟；官网 `dev` 启动 < 1 分钟

**Constraints**: TypeScript 优先；禁止 Taro/uni-app/重型框架/自建后端/第三方 BaaS/Astro SSR；纯计算不进云函数；小程序不纳入根 `build`；shared 零第三方运行时依赖；无持续 watch 同步

**Scale/Scope**: 工程基建与各端骨架 + 双端 shared 冒烟；不含业务功能/真实计算器/云部署

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.1.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 未引入禁止技术（Taro/uni-app/重型框架/自建服务器/第三方 BaaS/Astro SSR）
- [x] **TypeScript First**: 新增业务/共享逻辑使用 TypeScript；无充分理由不新增纯 JS
- [x] **Backend**: 仅微信云开发目录骨架；占位云函数无业务计算；纯计算留在 shared/前端
- [x] **Shared Logic First**: shared 纯逻辑包；小程序同步脚本 + Web workspace 引用同一冒烟导出
- [x] **TDD**: shared 冒烟示例强制先测后实现（`__tests__/*.test.ts`）；覆盖率目标对该示例 100%
- [x] **Product Boundary**: 仅骨架/占位；Web 无完整库、无登录、无云库；无真实计算器
- [x] **MVP & Low Ops**: 轻量 tsc/一次性同步；无 watch、无云部署、无重型依赖
- [x] **Compliance**: 无医疗/内容推荐/用户数据采集；骨架阶段无免责声明文案需求
- [x] **Monorepo Paths**: 仅约定顶层目录 + 根配置；不新增业务顶层目录
- [x] **Decision Priority**: 小程序可打开优先；根 build 不含小程序；低运维工具链

### Post-design (Phase 1)

- [x] 设计产物未引入栈外依赖或越界能力
- [x] contracts / quickstart 与澄清结论一致（同步脚本、占位云函数、根 build 范围、Web→shared 冒烟）

## Project Structure

### Documentation (this feature)

```text
specs/001-project-bootstrap/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
peakmeet/
├── packages/
│   ├── shared/
│   │   ├── src/                 # 纯 TS（含冒烟导出，如 ping/hello）
│   │   ├── __tests__/           # Vitest *.test.ts
│   │   ├── dist/                # tsc 输出（JS + .d.ts）
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── miniprogram/
│   │   ├── pages/{home,train,diet,mine}/
│   │   ├── utils/shared/        # sync 目标目录（构建产物拷贝）
│   │   ├── app.ts / app.json / app.wxss
│   │   ├── project.config.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── web/
│   │   ├── src/pages/           # index, features, tools, about
│   │   ├── astro.config.mjs     # output: static（SSG）
│   │   ├── package.json         # depends: @peakmeet/shared
│   │   └── tsconfig.json
│   └── cloudfunctions/
│       ├── hello/               # 唯一占位函数（TS → 编译产物）
│       ├── package.json
│       └── tsconfig.json
├── database/                    # .gitkeep 或 README 占位
├── docs/
│   └── constitution.md          # 自 .specify/memory/constitution.md 同步
├── scripts/
│   └── sync-shared-to-miniprogram.mjs  # 轻量一次性同步
├── tsconfig.base.json
├── eslint.config.js
├── prettier.config.js
├── vitest.workspace.ts          # 或根 vitest 配置扫描 packages/*
├── pnpm-workspace.yaml
├── package.json                 # scripts: test, lint, format, build
└── README.md                    # 可选最小说明
```

**Structure Decision**: 本功能触及全部约定顶层目录。`scripts/` 为根级工程脚本（非业务顶层），用于 shared→miniprogram 同步，符合低运维一次性拷贝策略。不新增 Constitution 未列的业务顶层目录。

## Complexity Tracking

> 无 Constitution 违规需豁免。根目录 `scripts/` 为工程脚本，非新业务包。
