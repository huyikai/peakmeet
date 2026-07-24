# Implementation Plan: 云数据库设计、种子数据与本地同步

**Branch**: `006-cloud-db-seed` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-cloud-db-seed/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

为 PeakMeet 落地微信云开发内容底座：七集合 schema + 安全规则、仓库种子（动作≥80 / 器材≥20 / 计划=6 / 食物≥200）、动作/器材/食物 300 张逐条原创配图入库并由本地/CI 上传云存储、`pnpm db:sync` 按 slug=`_id` upsert（不删种子外文档）、`packages/shared` 内容类型与查询 DTO（TDD）、通用云函数 `contentList` / `contentGetById`、小程序真实 AppID + `wx.cloud.init`、统一本地缺省封面。公共内容客户端直读与云函数并存；本版无用户写云函数、无 CMS。

## Technical Context

**Language/Version**: TypeScript 5.x（shared / 云函数 / 同步脚本 / 小程序配置逻辑）

**Primary Dependencies**: 微信云开发（云数据库 + 安全规则 + 云函数）；`@cloudbase/manager-node`（本地/CI 管理端 upsert，密钥仅本地/CI）；`wx-server-sdk`（云函数运行时）；Vitest；既有 pnpm workspace

**Storage**: 微信云数据库七集合；正式内容图源在 `database/assets/content/`，同步到 CloudBase 云存储；缺省图为小程序本地静态资源

**Testing**: `packages/shared` 内容类型守卫 / 过滤白名单 / 查询入参校验 TDD 100%；云函数核心白名单与信封逻辑鼓励单测；同步脚本以 quickstart 手工/半自动验收；UI 仅缺省图桩验收

**Target Platform**: 微信小程序 + CloudBase 环境 `cloud1-d8ghafmni1c847e3f`（fork 可替换）

**Project Type**: pnpm monorepo — `packages/shared`、`packages/cloudfunctions`、`packages/miniprogram`、`database/`、根 `scripts/`

**Performance Goals**: list 默认分页 ≤20、上限 ≤100；直读优先降低云函数消耗；种子全量 upsert 在免费套餐可完成（可分集合串行）

**Constraints**: 仅 CloudBase；禁止客户端全量刷库；禁止任意 where；纯计算不进云函数；Hyrox/功能性仅分类；密钥不入库；Web 不接云库

**Scale/Scope**: schema/rules/seeds/types/list+getById/sync/AppID+init/300 张逐条内容配图/缺省图；不含内容库完整 UI、用户写接口、CMS

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.2.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 仅微信云开发；无自建后端/第三方 BaaS/跨端框架
- [x] **TypeScript First**: shared / 云函数 / 同步脚本 TypeScript（或 `.mjs` 薄封装调 TS 编译产物）；无新增无理由纯 JS 业务源码
- [x] **Backend**: 云函数仅 list/getById（服务端白名单校验）；纯计算不搬云端
- [x] **Shared Logic First**: 实体类型、过滤白名单、查询 DTO 校验、缺省图路径常量进 shared
- [x] **TDD**: shared content 模块红→绿→重构；覆盖率 100%
- [x] **Product Boundary**: Web 不接云库；无内容库完整 UI；功能性非专区
- [x] **MVP & Low Ops**: seeds + 本地 sync；无 CMS；直读为主、CF 并存
- [x] **Compliance**: 种子文案无医疗/极端；用户隐私不进公开种子；免责声明字段/文档约定
- [x] **Brand & Visual**: 本版以数据为主；缺省占位图落本地 assets，色调不另起主色板
- [x] **Monorepo Paths**: `database/`、`packages/shared`、`packages/cloudfunctions`、`packages/miniprogram`、根 `scripts/`（既有）
- [x] **Decision Priority**: 小程序可读底座 → 低运维同步 → shared 类型 → 合规

### Post-design (Phase 1)

- [x] data-model / contracts / quickstart 与澄清一致（upsert、直读+CF、slug、统一缺省图、白名单等值过滤）
- [x] 设计未引入栈外 BaaS；同步用 CloudBase 官方管理 SDK/导入能力封装

## Project Structure

### Documentation (this feature)

```text
specs/006-cloud-db-seed/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
database/
├── README.md                    # 种子与同步说明（更新）
├── assets/content/              # 300 张逐条内容图 + manifest
├── rules/                       # 安全规则 JSON（七集合）
│   ├── actions.json
│   ├── equipment.json
│   ├── training_plans.json
│   ├── foods.json
│   ├── user_collect.json
│   ├── user_body_record.json
│   └── user_train_record.json
└── seeds/
    ├── actions.json             # ≥80；_id = slug
    ├── equipment.json           # ≥20
    ├── training_plans.json      # =6（含 ≥1 functional）
    └── foods.json               # ≥200

packages/shared/
├── src/content/                 # 新建
│   ├── types.ts                 # 七实体 + 查询 DTO
│   ├── collections.ts           # 公共集合白名单
│   ├── filters.ts               # 每集合允许的等值过滤字段
│   ├── validateQuery.ts         # list/getById 入参校验
│   ├── cover.ts                 # DEFAULT_CONTENT_COVER 路径常量
│   └── index.ts
├── src/index.ts                 # re-export content
└── __tests__/content-*.test.ts

packages/cloudfunctions/
├── contentList/                 # 云函数：列表
│   └── index.ts
├── contentGetById/              # 云函数：详情
│   └── index.ts
├── package.json                 # + wx-server-sdk
└── tsconfig.json                # 扩展多函数编译

packages/miniprogram/
├── project.config.json          # appid → wx07a6368636359893
├── app.ts                       # wx.cloud.init({ env: 'cloud1-d8ghafmni1c847e3f' })
├── assets/images/content-placeholder.png   # 统一缺省图
└── utils/content-cover.ts       # resolveCover(url?) → 缺省路径（可选薄封装）

scripts/
└── db-sync.mjs                  # 读 seeds → 管理端 upsert；凭据来自环境变量

package.json                     # + "db:sync": "node scripts/db-sync.mjs"
.gitignore                       # 确保 .env.local / 密钥忽略（若尚未）
```

**Structure Decision**: 内容权威源在既有顶层 `database/`；类型与查询校验在 shared；云函数仅做白名单读封装；同步为根脚本 + 管理端凭证（永不进小程序包）。不新增顶层目录。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
