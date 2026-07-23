---
description: 'Task list for PeakMeet project bootstrap / engineering foundation'
---

# Tasks: 项目初始化与工程基建

**Input**: Design documents from `/specs/001-project-bootstrap/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: PeakMeet Constitution — `packages/shared` 核心逻辑强制 TDD（先写失败测试再实现）。本功能 shared 冒烟导出 MUST 含测试任务。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/`, tests in `packages/shared/__tests__/xxx.test.ts`
- **miniprogram**: `packages/miniprogram/`（原生 WXML/WXSS/TS；shared 经构建同步至本地 utils）
- **web**: `packages/web/`（Astro SSG；workspace 引用 shared）
- **cloudfunctions**: `packages/cloudfunctions/`（仅服务端必要逻辑）
- **database seeds**: `database/`
- **sync script**: `scripts/sync-shared-to-miniprogram.mjs`
- Paths MUST stay within Constitution monorepo layout — no new top-level business dirs (`scripts/` allowed as engineering scripts per plan)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建约定顶层目录与 pnpm workspace 壳

- [x] T001 Create monorepo directories `packages/shared/src`, `packages/shared/__tests__`, `packages/miniprogram`, `packages/web`, `packages/cloudfunctions`, `database`, `docs`, `scripts` per plan.md
- [x] T002 Create `pnpm-workspace.yaml` including `packages/*`
- [x] T003 Create root `package.json` with `name: peakmeet`, `private: true`, `packageManager` pnpm 9+, `engines.node >=20`, and script stubs `test`/`lint`/`format`/`build`/`sync:shared`
- [x] T004 [P] Add `database/.gitkeep` (or `database/README.md`) stating seeds are out of scope for bootstrap
- [x] T005 [P] Ensure root `.gitignore` covers `node_modules/`, `dist/`, `.astro/`, coverage, and WeChat tooling noise without ignoring required sources

**Checkpoint**: 顶层目录符合 Constitution；可执行 `pnpm install` 前文件齐备

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全仓 TypeScript / ESLint / Prettier / Vitest 基线；阻塞所有故事

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create root `tsconfig.base.json` (strict TypeScript baseline for workspace extends)
- [x] T007 [P] Create root `eslint.config.js` with typescript-eslint for `.ts`/`.tsx`/`.astro` as needed
- [x] T008 [P] Create root `prettier.config.js` (and ignore file if needed) for workspace formatting
- [x] T009 Create root `vitest.workspace.ts` (or root vitest config) that will include `packages/shared`
- [x] T010 Wire root `package.json` scripts to invoke eslint, prettier, vitest, and a `build` placeholder that will later filter shared+web+cloudfunctions (exclude miniprogram)
- [x] T011 Run `pnpm install` at repo root and commit lockfile when tooling deps are declared

**Checkpoint**: 根工具链配置存在；Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - 建立可交付的单仓多包工程底座 (Priority: P1) 🎯 MVP

**Goal**: 约定分层已落地，根目录统一 test/lint/format/build 入口可执行且不因缺配置失败

**Independent Test**: 审查顶层无多余业务目录；`pnpm lint`/`pnpm format`/`pnpm test`/`pnpm build` 在后续包补齐前至少不因「缺配置文件」失败（test/build 可在 US2/US4/US5 完成后完全变绿，本故事确保入口与目录契约）

### Implementation for User Story 1

- [x] T012 [US1] Verify and document top-level layout against Constitution in root `README.md` (minimal: how to install, test, build, open miniprogram, run web)
- [x] T013 [US1] Finalize root `package.json` `build` script to run only `@peakmeet/shared`, web, and cloudfunctions filters (explicitly exclude miniprogram) per `contracts/root-scripts.md`
- [x] T014 [US1] Finalize root `package.json` `test`/`lint`/`format` scripts per `contracts/root-scripts.md` so commands resolve to configured tools
- [x] T015 [US1] Add fail-soft note or empty-project handling so `pnpm test` will succeed once shared smoke exists (cross-check with US2); ensure no silent misconfig

**Checkpoint**: US1 目录与根脚本契约就绪（完整变绿依赖 US2/US4/US5 产物）

---

## Phase 4: User Story 2 - 共享逻辑包可独立构建与被引用 (Priority: P1)

**Goal**: `@peakmeet/shared` 纯 TS 库可 tsc 构建出 JS+.d.ts，含 TDD 冒烟导出，并提供 sync→小程序脚本

**Independent Test**: `pnpm --filter @peakmeet/shared build` 产出 `dist/`；`pnpm test` 冒烟通过；`pnpm sync:shared` 拷贝到 `packages/miniprogram/utils/shared/`

### Tests for User Story 2 (REQUIRED — TDD) ⚠️

> **NOTE: TDD — write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US2] Write failing unit test for `getPeakMeetPing` in `packages/shared/__tests__/ping.test.ts`
- [x] T017 [P] [US2] Add edge assertion (non-empty string) in `packages/shared/__tests__/ping.test.ts`

### Implementation for User Story 2

- [x] T018 [US2] Create `packages/shared/package.json` as `@peakmeet/shared` with `main`/`types`/`exports` pointing to `dist`, zero runtime dependencies
- [x] T019 [US2] Create `packages/shared/tsconfig.json` extending `tsconfig.base.json` with `declaration: true` and `outDir: dist`
- [x] T020 [US2] Implement `getPeakMeetPing` in `packages/shared/src/ping.ts` and export from `packages/shared/src/index.ts` (after T016 fails)
- [x] T021 [US2] Add `packages/shared` build script (`tsc`) and ensure root/`filter` build emits JS + `.d.ts` under `packages/shared/dist/`
- [x] T022 [US2] Register shared in Vitest workspace and confirm `pnpm test` passes ping tests
- [x] T023 [US2] Create `scripts/sync-shared-to-miniprogram.mjs` copying `packages/shared/dist` → `packages/miniprogram/utils/shared/`
- [x] T024 [US2] Wire root `package.json` script `sync:shared` to run build-then-copy via `scripts/sync-shared-to-miniprogram.mjs`
- [x] T025 [US2] Add `packages/miniprogram/utils/shared/.gitkeep` (or README) so sync target exists before first sync

**Checkpoint**: Shared 可构建、可测、可同步；无平台 API

---

## Phase 5: User Story 3 - 微信小程序骨架可打开并切换四个主入口 (Priority: P1)

**Goal**: 原生小程序 TS 工程，四 Tab 可切换，并引用同步后的 shared 冒烟

**Independent Test**: 微信开发者工具打开 `packages/miniprogram` 可编译；四 Tab 切换；至少一处引用 `utils/shared` smoke export

### Implementation for User Story 3

- [x] T026 [P] [US3] Create `packages/miniprogram/project.config.json` allowing test/empty AppID open per `contracts/miniprogram-shell.md`
- [x] T027 [P] [US3] Create `packages/miniprogram/tsconfig.json` for native miniprogram TypeScript
- [x] T028 [US3] Create `packages/miniprogram/app.ts`, `packages/miniprogram/app.json`, `packages/miniprogram/app.wxss` with tabBar for 首页/训练/饮食/我的
- [x] T029 [P] [US3] Create placeholder page `packages/miniprogram/pages/home/index.{ts,wxml,wxss,json}`
- [x] T030 [P] [US3] Create placeholder page `packages/miniprogram/pages/train/index.{ts,wxml,wxss,json}`
- [x] T031 [P] [US3] Create placeholder page `packages/miniprogram/pages/diet/index.{ts,wxml,wxss,json}`
- [x] T032 [P] [US3] Create placeholder page `packages/miniprogram/pages/mine/index.{ts,wxml,wxss,json}`
- [x] T033 [US3] Wire tabBar `list` paths in `packages/miniprogram/app.json` to the four pages per contract
- [x] T034 [US3] After `pnpm sync:shared`, import smoke export in `packages/miniprogram/pages/home/index.ts` (or `app.ts`) and surface via `console.log` or page text
- [x] T035 [US3] Add minimal `packages/miniprogram/package.json` if needed for tooling metadata (no cross-end frameworks)

**Checkpoint**: 开发者工具可打开；四 Tab + shared 冒烟引用可用

---

## Phase 6: User Story 4 - 官网站点骨架可本地预览 (Priority: P2)

**Goal**: Astro SSG 四页骨架；workspace 依赖 shared；`/tools` 展示冒烟结果

**Independent Test**: `pnpm --filter @peakmeet/web dev` 可启动；访问四路由；`/tools` 显示 `getPeakMeetPing` 结果；无登录/云库/SSR

### Implementation for User Story 4

- [x] T036 [US4] Scaffold Astro TypeScript project under `packages/web/` with static output (no SSR adapter) in `packages/web/astro.config.mjs`
- [x] T037 [US4] Create `packages/web/package.json` named `@peakmeet/web` with `workspace:*` dependency on `@peakmeet/shared`
- [x] T038 [P] [US4] Create page `packages/web/src/pages/index.astro` (首页占位)
- [x] T039 [P] [US4] Create page `packages/web/src/pages/features.astro` (功能介绍占位)
- [x] T040 [P] [US4] Create page `packages/web/src/pages/tools.astro` importing `@peakmeet/shared` smoke export and rendering it
- [x] T041 [P] [US4] Create page `packages/web/src/pages/about.astro` (关于占位)
- [x] T042 [US4] Add `packages/web` `dev`/`build` scripts and ensure root `pnpm build` includes web static build
- [x] T043 [US4] Confirm no login/CloudBase/SSR business deps in `packages/web/package.json`

**Checkpoint**: 本地预览四页 + shared 冒烟；边界合规

---

## Phase 7: User Story 5 - 云函数包具备可编译部署的目录骨架 (Priority: P3)

**Goal**: 唯一占位云函数 `hello` 可 TS 编译为部署产物；纳入根 build

**Independent Test**: 云函数 compile 无密钥；产出可部署 JS；根 `pnpm build` 覆盖该步

### Implementation for User Story 5

- [x] T044 [US5] Create `packages/cloudfunctions/package.json` with compile script for placeholder function
- [x] T045 [US5] Create `packages/cloudfunctions/tsconfig.json` extending base config for function compile
- [x] T046 [US5] Implement placeholder `packages/cloudfunctions/hello/index.ts` (no business logic) per `contracts/cloudfunction-hello.md`
- [x] T047 [US5] Configure compile output to WeChat-deployable JS entry under `packages/cloudfunctions/hello/` (or documented `dist` layout)
- [x] T048 [US5] Wire cloudfunctions compile into root `pnpm build` (after shared if needed; still exclude miniprogram)

**Checkpoint**: `hello` 可编译；根 build 成功包含该包

---

## Phase 8: User Story 6 - 治理宪章对开发者可见并可引用 (Priority: P2)

**Goal**: `docs/constitution.md` 与治理源一致

**Independent Test**: `diff` 源与副本内容一致（允许文首来源说明）；版本信息可读

### Implementation for User Story 6

- [x] T049 [US6] Copy `.specify/memory/constitution.md` to `docs/constitution.md` (optional one-line source banner only)
- [x] T050 [US6] Verify version line present in `docs/constitution.md` and note sync expectation in root `README.md`

**Checkpoint**: 开发者可从 `docs/` 直接引用宪章

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 端到端验收与依赖纪律

- [x] T051 [P] Run full `pnpm lint` and fix issues across configured packages
- [x] T052 [P] Run full `pnpm test` and confirm shared coverage for smoke export
- [x] T053 Run `pnpm build` and confirm shared+web+cloudfunctions succeed without miniprogram
- [x] T054 Run `pnpm sync:shared` and re-check miniprogram import path
- [x] T055 Walk `specs/001-project-bootstrap/quickstart.md` steps 1–7 and record any gaps as fixes
- [x] T056 Audit dependencies: no Taro/uni-app/heavy UI/self-hosted BaaS; shared has zero runtime deps
- [x] T057 [P] Add brief note in `docs/` or README pointing to `specs/001-project-bootstrap/quickstart.md` for validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: After Foundational — root scripts/layout MVP
- **US2 (Phase 4)**: After Foundational（建议在 US1 脚本契约之后）— shared TDD + sync；unblocks US3/US4 smoke
- **US3 (Phase 5)**: After US2 sync script exists
- **US4 (Phase 6)**: After US2 shared package publishable in workspace
- **US5 (Phase 7)**: After Foundational（可与 US3/US4 并行）
- **US6 (Phase 8)**: After Setup（可与多数故事并行）
- **Polish (Phase 9)**: After US1–US6 desired scope complete

### User Story Dependencies

- **US1**: 目录 + 根脚本契约
- **US2**: 独立 shared 价值；为 US3/US4 提供冒烟符号
- **US3**: 依赖 US2 的 `sync:shared`
- **US4**: 依赖 US2 的 `@peakmeet/shared`
- **US5**: 相对独立
- **US6**: 相对独立

### Within Each User Story

- US2: Tests MUST fail before `ping.ts` implementation
- Models/config before pages
- Sync before miniprogram import
- Story complete before treating polish as done

### Parallel Opportunities

- T004/T005 parallel in Setup
- T007/T008 parallel in Foundational
- T016/T017 parallel test writes
- T026/T027 and T029–T032 parallel page scaffolds after app shell started
- T038–T041 parallel Astro pages after scaffold
- T051/T052/T057 parallel in Polish
- US5 ∥ US4 ∥ US6 after US2 (US3 waits on sync)

---

## Parallel Example: User Story 2

```bash
# TDD first (parallel):
Task: "Write failing unit test for getPeakMeetPing in packages/shared/__tests__/ping.test.ts"
Task: "Add edge assertion in packages/shared/__tests__/ping.test.ts"

# Then implement + build + sync (sequential where dependent):
Task: "Implement getPeakMeetPing in packages/shared/src/ping.ts"
Task: "Create scripts/sync-shared-to-miniprogram.mjs"
```

## Parallel Example: User Story 3

```bash
# After app.json exists, scaffold pages in parallel:
Task: "Create packages/miniprogram/pages/home/index.{ts,wxml,wxss,json}"
Task: "Create packages/miniprogram/pages/train/index.{ts,wxml,wxss,json}"
Task: "Create packages/miniprogram/pages/diet/index.{ts,wxml,wxss,json}"
Task: "Create packages/miniprogram/pages/mine/index.{ts,wxml,wxss,json}"
```

---

## Implementation Strategy

### MVP First (User Story 1 + Foundational + US2 smoke)

1. Complete Phase 1–2
2. Complete US1 root contracts
3. Complete US2 shared TDD + build（最小可测底座）
4. **STOP and VALIDATE**: `pnpm test` 绿；目录合规

### Incremental Delivery

1. US3 miniprogram shell + sync smoke
2. US4 web SSG + tools smoke
3. US5 cloudfunction hello in root build
4. US6 docs constitution
5. Polish / quickstart walkthrough

### Parallel Team Strategy

1. Team finishes Setup + Foundational
2. Dev A: US2 → US3；Dev B: US4（等 US2）；Dev C: US5 + US6
3. Integrate on root `pnpm build` / `pnpm test`

---

## Notes

- [P] = different files, no incomplete-task dependencies
- [USn] maps to spec user stories
- shared TDD is NON-NEGOTIABLE
- Commit after each task or logical group；run Vitest before claiming US2 done
- Avoid: 跨端框架、SSR、真实计算器、云部署密钥、watch 同步
