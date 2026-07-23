---
description: 'Task list for PeakMeet body index toolbox (miniprogram + shared calcs)'
---

# Tasks: 身体指数工具箱页面

**Input**: Design documents from `/specs/002-body-index-toolbox/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: PeakMeet Constitution — `packages/shared` 核心逻辑强制 TDD（先写失败测试再实现）。涉及 shared 计算的 User Story MUST 含测试任务；纯 UI/交互不强制单测。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/`, tests in `packages/shared/__tests__/xxx.test.ts`
- **miniprogram**: `packages/miniprogram/`（原生 WXML/WXSS/TS；shared 经 `pnpm sync:shared` / `build:miniprogram` 同步至 `utils/shared`）
- **sync script**: `scripts/sync-shared-to-miniprogram.mjs`
- Paths MUST stay within Constitution monorepo layout — no new top-level business dirs

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 为本功能创建 shared 计算目录与小程序 toolbox 目录骨架（仓库已存在，不重复建 monorepo）

- [x] T001 Create directories `packages/shared/src/types`, `packages/shared/src/constants`, `packages/shared/src/calc` per plan.md
- [x] T002 [P] Create directories `packages/miniprogram/pages/diet/toolbox/{bmi,bmr,body-fat,whr,one-rm}` per plan.md
- [x] T003 [P] Create directory `packages/miniprogram/constants` for toolbox copy mappings

**Checkpoint**: 目录骨架就绪，可开始基础类型与路由注册

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 公共类型/常量、sync 声明同步、路由与空白页壳、饮食入口 — 阻塞所有用户故事

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement `Sex` and `CalcResult<T>` in `packages/shared/src/types/result.ts` (and `packages/shared/src/types/sex.ts` if split) per data-model.md
- [x] T005 [P] Implement `DISCLAIMER_ZH`, China/WHO BMI range tables, and WHR sex thresholds in `packages/shared/src/constants/body-metrics.ts` per research.md
- [x] T006 Export new types/constants from `packages/shared/src/index.ts` (keep existing `getPeakMeetPing`)
- [x] T007 Enhance `scripts/sync-shared-to-miniprogram.mjs` to sync full declarations from `packages/shared/dist/*.d.ts` into `packages/miniprogram/utils/shared/` (remove hardcoded ping-only `index.d.ts`)
- [x] T008 Register non-Tab routes `pages/diet/toolbox/index` and `pages/diet/toolbox/{bmi,bmr,body-fat,whr,one-rm}/index` in `packages/miniprogram/app.json`
- [x] T009 Scaffold blank page quartets (`index.ts`/`index.wxml`/`index.wxss`/`index.json`) under `packages/miniprogram/pages/diet/toolbox/` and each tool subfolder (titles only, no calc yet)
- [x] T010 [P] Add discoverable entry to open toolbox on `packages/miniprogram/pages/diet/index.ts` + `index.wxml` (+ wxss as needed)
- [x] T011 [P] Add stub copy/error message map in `packages/miniprogram/constants/toolbox-copy.ts` (keys for validation tips; fill per story)

**Checkpoint**: Foundation ready — `pnpm sync:shared` 可同步类型；路由可打开空白工具页；用户故事可并行开工

---

## Phase 3: User Story 1 - 工具箱聚合入口 (Priority: P1) 🎯 MVP

**Goal**: 饮食 Tab 可进入身体指数工具箱聚合页，展示 5 个工具卡片并导航到对应独立页（目标页可为空白壳）

**Independent Test**: 饮食 Tab → 工具箱 → 见 5 卡片 → 点击任一进入对应页且表单空白 → 返回聚合页

### Implementation for User Story 1

- [x] T012 [US1] Implement hub UI with 5 cards (BMI、基础代谢、体脂估算、腰臀比、1RM) in `packages/miniprogram/pages/diet/toolbox/index.wxml` + `index.wxss`
- [x] T013 [US1] Wire card `navigateTo` paths and titles in `packages/miniprogram/pages/diet/toolbox/index.ts`
- [x] T014 [US1] Confirm each tool page `onLoad` resets blank form state in stub `packages/miniprogram/pages/diet/toolbox/*/index.ts` (no storage prefill)

**Checkpoint**: US1 可独立演示入口与导航（MVP 导航闭环）

---

## Phase 4: User Story 2 - BMI 计算与解读 (Priority: P1)

**Goal**: BMI 页输入身高体重，点击计算后同页展示数值、中国+WHO 双对照、解读/局限与免责声明；非法输入友好提示；改输入结果失效

**Independent Test**: 合法输入算出 BMI 且双标准并列；空/负/非法被拦；改输入后结果消失；底部免责声明可见

### Tests for User Story 2 (REQUIRED — TDD) ⚠️

> **NOTE: TDD — write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US2] Write failing unit tests for `calculateBmi` happy path + China/WHO categories in `packages/shared/__tests__/bmi.test.ts`
- [x] T016 [P] [US2] Add edge/abnormal cases (zero/negative/out-of-range height/weight) in `packages/shared/__tests__/bmi.test.ts`

### Implementation for User Story 2

- [x] T017 [US2] Implement `calculateBmi` in `packages/shared/src/calc/bmi.ts` and export from `packages/shared/src/index.ts` (after T015–T016 fail)
- [x] T018 [US2] Implement BMI page form + 「计算」+ same-page result/dual-standard UI in `packages/miniprogram/pages/diet/toolbox/bmi/index.ts` + `index.wxml` + `index.wxss` + `index.json`
- [x] T019 [US2] Map validation/`CalcErr` codes to Chinese tips and show interpretation + limitations + `DISCLAIMER_ZH` in BMI page (reuse `packages/miniprogram/constants/toolbox-copy.ts`)
- [x] T020 [US2] Clear `result` on any relevant input change; ensure page contains no BMI formula (only shared call via `utils/shared`)
- [x] T021 [US2] Run `pnpm --filter @peakmeet/shared test` and `pnpm build:miniprogram`; smoke BMI path in devtools

**Checkpoint**: US1 + US2 可独立验收；BMI 内核测试全绿

---

## Phase 5: User Story 3 - 基础代谢 BMR (Priority: P2)

**Goal**: BMR 页输入性别/年龄/身高/体重，展示 Mifflin–St Jeor 结果与代谢解读、注意事项与免责声明

**Independent Test**: 合法四项算出 BMR；非法输入提示；免责声明可见

### Tests for User Story 3 (REQUIRED — TDD) ⚠️

- [x] T022 [P] [US3] Write failing unit tests for `calculateBmr` (male/female) in `packages/shared/__tests__/bmr.test.ts`
- [x] T023 [P] [US3] Add edge/abnormal cases (invalid age/sex/height/weight) in `packages/shared/__tests__/bmr.test.ts`

### Implementation for User Story 3

- [x] T024 [US3] Implement `calculateBmr` in `packages/shared/src/calc/bmr.ts` and export from `packages/shared/src/index.ts`
- [x] T025 [US3] Implement BMR calculator page in `packages/miniprogram/pages/diet/toolbox/bmr/index.ts` + `index.wxml` + `index.wxss` + `index.json`
- [x] T026 [US3] Add BMR copy (level interpretation, notes, disclaimer) via `packages/miniprogram/constants/toolbox-copy.ts`; clear result on input change; no local formula

**Checkpoint**: BMR 可独立演示；shared BMR 测试全绿

---

## Phase 6: User Story 4 - 体脂率估算双模式 (Priority: P2)

**Goal**: 体脂页支持简易（YMCA）与围度法（Navy）切换；各自合法计算、局限说明、免责声明；切换清空结果

**Independent Test**: 两种模式分别算出体脂%；切换字段变化且旧结果失效；缺字段/非法被拦

### Tests for User Story 4 (REQUIRED — TDD) ⚠️

- [x] T027 [P] [US4] Write failing unit tests for `calculateBodyFatSimple` in `packages/shared/__tests__/body-fat.test.ts`
- [x] T028 [P] [US4] Write failing unit tests for `calculateBodyFatNavy` (male/female hip rules) in `packages/shared/__tests__/body-fat.test.ts`
- [x] T029 [P] [US4] Add edge cases (neck≥waist, missing female hip, out-of-range) in `packages/shared/__tests__/body-fat.test.ts`

### Implementation for User Story 4

- [x] T030 [US4] Implement `calculateBodyFatSimple` and `calculateBodyFatNavy` in `packages/shared/src/calc/body-fat.ts` and export from `packages/shared/src/index.ts`
- [x] T031 [US4] Implement body-fat page with mode switch default `simple` in `packages/miniprogram/pages/diet/toolbox/body-fat/index.ts` + `index.wxml` + `index.wxss` + `index.json`
- [x] T032 [US4] Wire mode-specific fields, limitation copy, disclaimer; clear result on mode switch/input change; call only shared APIs

**Checkpoint**: 体脂双模式可独立验收；body-fat 测试全绿

---

## Phase 7: User Story 5 - 腰臀比 (Priority: P3)

**Goal**: 腰臀比页输入性别/腰围/臀围，展示比值与按性别风险参考及免责声明

**Independent Test**: 合法算出比值且风险文案随性别变化；臀围 0/非法被拦

### Tests for User Story 5 (REQUIRED — TDD) ⚠️

- [x] T033 [P] [US5] Write failing unit tests for `calculateWhr` male/female bands in `packages/shared/__tests__/whr.test.ts`
- [x] T034 [P] [US5] Add edge/abnormal cases (hip 0, negative, invalid sex) in `packages/shared/__tests__/whr.test.ts`

### Implementation for User Story 5

- [x] T035 [US5] Implement `calculateWhr` in `packages/shared/src/calc/whr.ts` and export from `packages/shared/src/index.ts`
- [x] T036 [US5] Implement WHR page in `packages/miniprogram/pages/diet/toolbox/whr/index.ts` + `index.wxml` + `index.wxss` + `index.json`
- [x] T037 [US5] Add sex-specific risk copy + disclaimer; clear result on input change; no local ratio algorithm beyond shared

**Checkpoint**: WHR 可独立验收

---

## Phase 8: User Story 6 - 1RM 估算 (Priority: P3)

**Goal**: 1RM 页输入重量与次数（1–12），展示 Epley 估算与新手友好训练参考及免责声明

**Independent Test**: 合法算出 1RM；次数越界提示；无超负荷表述；免责声明可见

### Tests for User Story 6 (REQUIRED — TDD) ⚠️

- [x] T038 [P] [US6] Write failing unit tests for `estimateOneRm` (incl. reps=1) in `packages/shared/__tests__/one-rm.test.ts`
- [x] T039 [P] [US6] Add edge cases (reps 0/13+, non-positive weight) in `packages/shared/__tests__/one-rm.test.ts`

### Implementation for User Story 6

- [x] T040 [US6] Implement `estimateOneRm` in `packages/shared/src/calc/one-rm.ts` and export from `packages/shared/src/index.ts`
- [x] T041 [US6] Implement 1RM page in `packages/miniprogram/pages/diet/toolbox/one-rm/index.ts` + `index.wxml` + `index.wxss` + `index.json`
- [x] T042 [US6] Add training reference copy (no overload language) + disclaimer; clear result on input change; shared-only math

**Checkpoint**: 全部 6 个用户故事可独立功能验证

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 全链路回归、合规与文档对齐

- [x] T043 [P] Verify all calculator pages show unified `DISCLAIMER_ZH` from shared and scan copy for medical/extreme-diet/overload claims across `packages/miniprogram/pages/diet/toolbox/**` and `packages/miniprogram/constants/toolbox-copy.ts`
- [x] T044 [P] Confirm layout usable on ~375–430px width for hub + five tools under `packages/miniprogram/pages/diet/toolbox/**`
- [x] T045 Run full `pnpm test` and ensure new shared calc modules meet 100% coverage expectation for `packages/shared/src/calc/**`
- [x] T046 Run `pnpm build:miniprogram` and execute smoke checklist in `specs/002-body-index-toolbox/quickstart.md`
- [x] T047 [P] Update root `README.md` (brief) with diet toolbox entry path / preview steps if missing
- [x] T048 Confirm no algorithm duplication outside `packages/shared` (grep pages for BMI/BMR/Navy/Epley formulas)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — no shared calc dependency
- **US2–US6 (Phases 4–8)**: After Foundational; each story’s shared TDD → implement → page; can proceed in priority order or parallel after foundation if staffed
- **Polish (Phase 9)**: After desired stories complete (ideally all)

### User Story Dependencies

- **US1 (P1)**: After Phase 2 only
- **US2 (P1)**: After Phase 2；可与 US1 并行（不同文件）；导航依赖 US1 更顺畅但不阻塞单页直达（路由已注册）
- **US3 (P2)**: After Phase 2；独立于 US2 内核
- **US4 (P2)**: After Phase 2；独立
- **US5 (P3)**: After Phase 2；独立
- **US6 (P3)**: After Phase 2；独立

### Within Each Calc Story (US2–US6)

1. Write failing Vitest tests
2. Implement shared function + export
3. Wire miniprogram page (form → calculate → result/disclaimer)
4. Clear-on-edit + no local algorithm
5. Story checkpoint / sync build

### Parallel Opportunities

- T002/T003；T005/T010/T011
- T015/T016；T022/T023；T027/T028/T029；T033/T034；T038/T039
- After Phase 2：不同开发者可并行 US2–US6（注意协调 `packages/shared/src/index.ts` 导出合并）
- T043/T044/T047 可并行

---

## Parallel Example: User Story 2 (BMI)

```bash
# TDD first (parallel):
Task: "Write failing unit tests for calculateBmi in packages/shared/__tests__/bmi.test.ts"
Task: "Add edge/abnormal cases in packages/shared/__tests__/bmi.test.ts"

# After red → implement shared, then page:
Task: "Implement calculateBmi in packages/shared/src/calc/bmi.ts"
Task: "Implement BMI page under packages/miniprogram/pages/diet/toolbox/bmi/"
```

## Parallel Example: After Foundation

```bash
# Different stories / files:
Task: "US3 BMR shared tests + calc"
Task: "US5 WHR shared tests + calc"
Task: "US1 hub UI (if not done)"
```

---

## Implementation Strategy

### MVP First (US1 → US2)

1. Complete Phase 1 Setup + Phase 2 Foundational
2. Complete US1 hub navigation — demo entry
3. Complete US2 BMI (TDD shared + page) — first full calc loop
4. **STOP and VALIDATE** per quickstart BMI rows + `pnpm test`

### Incremental Delivery

1. US3 BMR → demo
2. US4 Body fat dual mode → demo
3. US5 WHR → demo
4. US6 1RM → demo
5. Phase 9 polish + full quickstart

### Parallel Team Strategy

1. Team finishes Phase 1–2 together（含 sync d.ts 修复）
2. Dev A: US1 + US2；Dev B: US3 + US5；Dev C: US4 + US6；合并 `index.ts` 导出时避免冲突
3. Polish jointly

---

## Notes

- [P] = different files, no incomplete-task dependency
- [USn] maps to spec user stories 1–6
- Shared TDD is NON-NEGOTIABLE for calc modules
- Page UI tests not required
- Commit after each task or logical group; run Vitest before commit when touching shared
- Suggested MVP: **US1 + US2**（入口 + BMI 完整闭环）
