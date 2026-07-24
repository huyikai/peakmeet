# Implementation Plan: 动作大全模块

**Branch**: `007-actions-catalog` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-actions-catalog/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在微信小程序训练 Tab 落地「动作大全」：列表四维单选筛选 + 名称模糊搜索、收藏态展示、「今日练什么」全库随机、详情（肌肉/步骤/要点/避坑/替代跳转/收藏/加入训练/免责声明）。公共内容复用既有 `contentList`/`contentGetById` 与 `Action` 类型；筛选/搜索/随机在 `packages/shared` 纯函数实现（TDD）；收藏客户端写 `user_collect`（经新建 `getOpenId`）；「加入训练」跳转新建计划库占位页。澄清已锁定：计划库跳转、全库随机、收藏仅详情、替代无关系标签、筛维单选。

## Technical Context

**Language/Version**: TypeScript（shared + 小程序页面逻辑 + 云函数）；WXML/WXSS UI

**Primary Dependencies**: 微信小程序原生；微信云开发（`contentList` / `contentGetById` / 新建 `getOpenId`；云数据库直写 `user_collect`）；Vitest；`pnpm` sync-shared；品牌 `docs/brand` + `styles/tokens.wxss`

**Storage**: 只读 `actions`（及器材选项用 `equipment`）；读写 `user_collect`；图片云存储 fileID + 本地缺省封面

**Testing**: shared 匹配/随机/归一化强制 TDD 100%（`__tests__/action-catalog*.test.ts`）；UI 按 [quickstart.md](./quickstart.md) 人工验收

**Target Platform**: 微信小程序（开发者工具 + 真机收藏/云调用）

**Project Type**: pnpm monorepo — `packages/shared` + `packages/miniprogram` + `packages/cloudfunctions`（不改 Web）

**Performance Goals**: 列表首屏常规网络 ≤3s 可交互；一次拉取 ≤100 条动作内存筛选；图片缺省不破版

**Constraints**: 无 Taro/重型 UI/自建后端；shared 无平台 API；无医疗表述；详情必显 `FITNESS_DISCLAIMER`；Web 无动作库；本版无计划库正文、无替代关系标签、列表不可切换收藏

**Scale/Scope**: ~80 动作种子；四页路由（hub 入口增强 + 列表 + 详情 + 计划占位）；getOpenId CF；shared action-catalog 匹配器

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.2.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 原生小程序 + CloudBase + shared TS；无跨端/重型 UI/自建后端
- [x] **TypeScript First**: 页面状态、筛选、详情、CF 均 TS；无新增无理由纯 JS 业务源码
- [x] **Backend**: 仅云开发；内容只读走既有 CF；收藏客户端写；仅增身份用 `getOpenId`
- [x] **Shared Logic First**: 筛选/搜索/随机匹配进 shared；类型复用 `Action`/`UserCollect`
- [x] **TDD**: shared action-catalog 红→绿→重构；覆盖率 100%
- [x] **Product Boundary**: 仅小程序动作大全；Web 不复刻；计划库仅占位入口
- [x] **MVP & Low Ops**: 内存筛选避扩展复杂查询 CF；占位计划页闭合「加入训练」
- [x] **Compliance**: 详情免责声明；无医疗词；收藏最小必要（openid + targetId）
- [x] **Brand & Visual**: tokens / 内容页样式；无另起主色板
- [x] **Monorepo Paths**: shared / miniprogram / cloudfunctions 约定目录
- [x] **Decision Priority**: 小程序体验 → 低运维 → shared → 合规

### Post-design (Phase 1)

- [x] research / data-model / contracts / quickstart 与澄清五问一致
- [x] 设计未引入栈外依赖；CF 仅 `getOpenId` 身份读取
- [x] 筛选映射与 `__bodyweight__` 哨兵已写入 data-model 与 shared 契约

## Project Structure

### Documentation (this feature)

```text
specs/007-actions-catalog/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── shared-action-catalog.md
│   ├── miniprogram-actions-ui.md
│   └── get-openid.md
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/shared/
├── src/content/
│   ├── types.ts                 # 既有 Action / UserCollect（按需微调导出）
│   ├── actionCatalog.ts         # filters 类型、normalize、match、filter、pickRandom
│   ├── actionCatalogOptions.ts  # 部位/目标/难度中文选项；BODYWEIGHT 哨兵
│   └── index.ts
└── __tests__/action-catalog*.test.ts

packages/miniprogram/
├── pages/train/
│   ├── index.*                  # Hub：动作大全 / 计划库 / 计时器入口
│   ├── actions/
│   │   ├── index.*              # 列表
│   │   └── detail.*             # 详情
│   └── plans/
│       └── index.*              # 计划库占位（加入训练目标）
├── utils/
│   ├── content-cover.ts         # 既有
│   ├── cloud-content.ts         # callFunction contentList/getById 薄封装（新建）
│   └── user-collect.ts          # openid 缓存 + user_collect toggle/list（新建）
└── app.json                     # 注册页面

packages/cloudfunctions/
└── getOpenId/                   # 新建：返回 OPENID
    └── index.ts
```

**Structure Decision**: 可测匹配逻辑在 shared；云调用与 UI 在 miniprogram；身份读取独立薄 CF。不改 Web；不扩展 `contentList` 复杂过滤（见 research）。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
