---
description: 'Task list for PeakMeet calorie plan page (miniprogram + shared macro ranges)'
---

# Tasks: 热量缺口计算页面

**Input**: Design documents from `/specs/003-calorie-plan-page/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: PeakMeet Constitution — `packages/shared` 核心逻辑强制 TDD（先写失败测试再实现）。本功能 shared 变更主要在宏量碳水区间；涉及 shared 的 User Story MUST 含测试任务；纯 UI/交互不强制单测。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/`, tests in `packages/shared/__tests__/xxx.test.ts`
- **miniprogram**: `packages/miniprogram/`（原生 WXML/WXSS/TS；shared 经 `pnpm sync:shared` / `build:miniprogram` 同步至 `utils/shared`）
- Paths MUST stay within Constitution monorepo layout — no new top-level business dirs

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 为本功能创建小程序页面与文案目录骨架（仓库与 shared 热量链路已存在，不重复建 monorepo）

- [x] T001 Create directory `packages/miniprogram/pages/diet/calorie-plan/` per plan.md
- [x] T002 [P] Ensure `packages/miniprogram/constants/` exists for `calorie-plan-copy.ts` (create dir if missing)

**Checkpoint**: 目录骨架就绪，可注册路由与空白页

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 路由、空白页壳、饮食 Tab 入口、文案常量桩、类型化表单状态 — 阻塞所有用户故事

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Register non-Tab route `pages/diet/calorie-plan/index` in `packages/miniprogram/app.json`
- [x] T004 Scaffold blank page quartet `packages/miniprogram/pages/diet/calorie-plan/index.ts` + `index.wxml` + `index.wxss` + `index.json` (title「热量缺口计算」, no calc yet)
- [x] T005 [P] Add discoverable entry to open calorie-plan on `packages/miniprogram/pages/diet/index.ts` + `index.wxml` (+ wxss as needed), alongside toolbox entry
- [x] T006 [P] Add stub copy/maps in `packages/miniprogram/constants/calorie-plan-copy.ts` (activity/goal labels, validation tip keys, empty tip lists for meals/tips/risk — fill per story)
- [x] T007 Define typed blank `FormState` + `resultView: null` + `errorTip` lifecycle (`onLoad`/`onShow` reset, no storage) in `packages/miniprogram/pages/diet/calorie-plan/index.ts` per data-model.md

**Checkpoint**: Foundation ready — 饮食 Tab 可打开空白热量页；用户故事可开工

---

## Phase 3: User Story 1 - 填写信息并生成核心热量方案 (Priority: P1) 🎯 MVP

**Goal**: 用户填写身体/运动/目标（体脂选填），点击计算后同页展示 BMR、TDEE、目标每日摄入（目标最突出）；可选体脂有值才展示且注明未参与计算；改输入结果失效

**Independent Test**: 饮食 Tab → 热量页 → 合法必填算出三热量且目标突出；体脂留空无体脂行、填合法有说明；改体重后结果消失；无需登录

### Implementation for User Story 1

- [x] T008 [US1] Implement form sections (基础信息含选填体脂、运动信息、训练目标) in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `index.wxss`
- [x] T009 [US1] Wire 「计算」to parse/validate required fields then call `calculateBmr` → `calculateTdee` → `calculateTargetIntake` via `packages/miniprogram/utils/shared` in `packages/miniprogram/pages/diet/calorie-plan/index.ts` (no local formulas)
- [x] T010 [US1] Render core result block (target kcal hero + BMR + TDEE + delta/goal note) and optional reported body-fat row with「未参与本次核心热量计算」in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `index.ts`
- [x] T011 [US1] Clear `resultView` on any relevant input change; map basic validation/`CalcError` to Chinese tips using `packages/miniprogram/constants/calorie-plan-copy.ts`
- [x] T012 [US1] Run `pnpm build:miniprogram` and smoke US1 path in WeChat DevTools per quickstart.md §3 温和减脂核心热量行

**Checkpoint**: US1 可独立演示输入→核心热量闭环（MVP）

---

## Phase 4: User Story 2 - 宏量营养素与训练日/休息日碳水 (Priority: P1)

**Goal**: 结果区展示蛋白/脂肪与训练日·休息日碳水（主数字 + 参考区间），并按每周训练频率给出落地说明

**Independent Test**: 合法计算后可见四类宏量数字；碳水主数字下有区间；改训练天数后说明文案匹配 0/3/7 等边界

### Tests for User Story 2 (REQUIRED — TDD) ⚠️

> **NOTE: TDD — write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US2] Write failing unit tests for `carbRestRangeG` / `carbTrainRangeG` on `calculateMacroPlan` (happy path, `min≤max`, non-negative, primary grams vs ranges) in `packages/shared/__tests__/macros.test.ts` per research.md R2
- [x] T014 [P] [US2] Add edge cases for macro ranges when `structureTight` / low target kcal in `packages/shared/__tests__/macros.test.ts`

### Implementation for User Story 2

- [x] T015 [US2] Implement `carbRestRangeG` / `carbTrainRangeG` in `packages/shared/src/calc/macros.ts` and ensure types export via `packages/shared/src/calc/index.ts` + `packages/shared/src/index.ts` (after T013–T014 fail)
- [x] T016 [US2] Extend calculate pipeline with `calculateMacroPlan` and build macro fields on `resultView` in `packages/miniprogram/pages/diet/calorie-plan/index.ts`
- [x] T017 [US2] Render macros UI (protein/fat; rest/train carb primary + range) and training-frequency carb hint templates in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `packages/miniprogram/constants/calorie-plan-copy.ts`
- [x] T018 [US2] Run `pnpm --filter @peakmeet/shared test` and `pnpm sync:shared` / `pnpm build:miniprogram`; smoke macros + frequency hints in DevTools

**Checkpoint**: US1 + US2 可验收宏量与碳水双日展示；shared macros 测试全绿

---

## Phase 5: User Story 3 - 减脂两档与风险 / BMR 托底提示 (Priority: P1)

**Goal**: 温和/快速减脂目标摄入可区分；快速档仅结果区强化风险（无选择确认框）；BMR 托底时展示不低于 BMR 提示；增肌/维持不用减脂风险文案

**Independent Test**: 同输入下快速目标热量低于温和；快速结果有风险条、选择时无 modal；触发托底时有 hint；增肌/维持无快速减脂风险文案

### Implementation for User Story 3

- [x] T019 [US3] Add goal-delta explanation UI (`deltaKcal` / `deltaRange`) for cutMild vs cutAggressive vs bulk/maintain in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `index.ts`
- [x] T020 [US3] Add `cutAggressive` result-only risk copy in `packages/miniprogram/constants/calorie-plan-copy.ts` and show when `goal === 'cutAggressive'` after calculate (MUST NOT `wx.showModal` on goal select) in `packages/miniprogram/pages/diet/calorie-plan/index.ts` + `index.wxml`
- [x] T021 [US3] Surface `bmrFloorApplied` / `hint` / `BMR_FLOOR_HINT` in result area in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `index.ts`
- [x] T022 [US3] Smoke mild vs aggressive vs bulk in DevTools; confirm no confirm-dialog on aggressive select per contracts/miniprogram-calorie-plan-ui.md

**Checkpoint**: US3 合规风险与托底提示可独立验收

---

## Phase 6: User Story 4 - 三餐建议与按目标分化温馨提示 (Priority: P2)

**Goal**: 固定 3:4:3 三餐热量 + 简易搭配示例；温馨提示按目标分化（减脂含减重速度；增肌/维持不含）

**Independent Test**: 结果见三餐比例与示例且不可改比例；减脂有减重速度文案；增肌/维持无该文案

### Implementation for User Story 4

- [x] T023 [US4] Implement meal split helper (0.3/0.4/0.3, sum calibrate to `targetKcal`) in `packages/miniprogram/constants/calorie-plan-copy.ts` or colocated util under `packages/miniprogram/pages/diet/calorie-plan/` (display-only, not shared formula)
- [x] T024 [US4] Render meals block (ratios + kcal + exampleZh) in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + wire from `index.ts`
- [x] T025 [US4] Implement goal-differentiated `tipsZh` maps (cut / bulk / maintain) in `packages/miniprogram/constants/calorie-plan-copy.ts` and render tips section in `packages/miniprogram/pages/diet/calorie-plan/index.wxml`
- [x] T026 [US4] Ensure bulk/maintain tips omit weekly weight-loss speed wording; append BMR-floor tip when `bmrFloorApplied` in `packages/miniprogram/pages/diet/calorie-plan/index.ts`

**Checkpoint**: US4 三餐与分化提示可独立验收

---

## Phase 7: User Story 5 - 完整校验、信息层级与免责声明 (Priority: P2)

**Goal**: 空值/负值/非法体脂/未选枚举全拦；结果视觉层级清晰；底部统一 `FITNESS_DISCLAIMER`

**Independent Test**: 负面路径 100% 无结果；目标热量视觉优先；页底免责声明可见

### Implementation for User Story 5

- [x] T027 [US5] Complete form validation matrix (empty, negative, non-number, activity/goal unset, trainingDays 0–7 bounds, bodyFat 1–60 or empty) with Chinese tips in `packages/miniprogram/pages/diet/calorie-plan/index.ts` + `packages/miniprogram/constants/calorie-plan-copy.ts`
- [x] T028 [US5] Polish result visual hierarchy (target hero > BMR/TDEE/macros > meals/tips) in `packages/miniprogram/pages/diet/calorie-plan/index.wxss` (+ wxml class hooks)
- [x] T029 [US5] Always show bottom disclaimer from `FITNESS_DISCLAIMER` when result visible in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` + `index.ts`
- [x] T030 [US5] Run negative-path smoke from quickstart.md §4 in DevTools

**Checkpoint**: 全故事主路径 + 校验/合规底线可验收

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 回归、构建、quickstart 全量验证

- [x] T031 [P] Confirm page contains no duplicated BMR/TDEE/target/macro algorithms (grep / review `packages/miniprogram/pages/diet/calorie-plan/`)
- [x] T032 Run full `pnpm --filter @peakmeet/shared test` — macros + related calc coverage MUST remain 100% for touched modules
- [x] T033 [P] Run `pnpm build:miniprogram` and `pnpm lint`
- [x] T034 Compliance pass: no medical claims, no extreme-diet encouragement, aggressive risk tone OK, disclaimer present — spot-check copy in `packages/miniprogram/constants/calorie-plan-copy.ts`
- [x] T035 Execute end-to-end checks in quickstart.md §3–§5

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational；实践上依赖 US1 结果区容器，但宏量可独立测 shared
- **US3 (Phase 5)**: After US1（需目标热量结果）；与 US2 可并行于不同文案区块
- **US4 (Phase 6)**: After US1（需 `targetKcal`）；提示文案可与 US3 并行编写常量
- **US5 (Phase 7)**: After US1 最小闭环；建议在 US2–US4 UI 落稳后做层级与校验收口
- **Polish (Phase 8)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: 无故事依赖 — MVP
- **US2 (P1)**: shared 区间 TDD 独立；UI 挂在 US1 结果区
- **US3 (P1)**: 依赖 US1 目标/goal 展示
- **US4 (P2)**: 依赖 US1 的 `targetKcal`
- **US5 (P2)**: 加固 US1–US4 的校验与视觉/免责

### Within Each User Story

- Shared 测试 MUST 先写且失败再实现（US2）
- 先串联 shared 再堆展示区块
- 故事完成后再升优先级下一项

### Parallel Opportunities

- T001 ‖ T002（Setup）
- T005 ‖ T006（Foundational UI entry vs copy stub）
- T013 ‖ T014（US2 测试）
- T019–T021 文案与 WXML 区块可与 T023–T025 常量编写并行（不同文件时标 [P] 已体现）
- T031 ‖ T033（Polish）

---

## Parallel Example: User Story 2

```bash
# TDD first (parallel):
Task: "Failing tests for carbRestRangeG/carbTrainRangeG in packages/shared/__tests__/macros.test.ts"
Task: "Edge cases structureTight/low target in packages/shared/__tests__/macros.test.ts"

# After fail → implement shared, then page:
Task: "Implement ranges in packages/shared/src/calc/macros.ts"
Task: "Wire calculateMacroPlan + macros UI in packages/miniprogram/pages/diet/calorie-plan/"
```

---

## Parallel Example: User Story 3 + 4 (after US1)

```bash
# Different files — copy vs meal helper:
Task: "Aggressive risk + BMR floor copy/UI in calorie-plan-copy.ts + calorie-plan page"
Task: "Meal 3:4:3 helper + tips maps in calorie-plan-copy.ts + meals/tips WXML"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2
2. Complete Phase 3 (US1)
3. **STOP and VALIDATE**: 核心热量同页结果 + 体脂选填行为
4. Demo 饮食 Tab 主路径

### Incremental Delivery

1. Setup + Foundational → 可打开空白页
2. US1 → MVP 核心热量
3. US2 → 宏量 + 碳水区间（含 shared TDD）
4. US3 → 减脂风险与 BMR 托底
5. US4 → 三餐与分化提示
6. US5 + Polish → 校验/层级/免责与回归

### Parallel Team Strategy

1. Together: Phase 1–2
2. Dev A: US1 → US5 校验收口
3. Dev B: US2 shared TDD + macros UI（US1 结果壳就绪后合入）
4. Dev C: US3 + US4 文案与区块（避免与 A 同文件冲突时分常量/页面）

---

## Notes

- [P] = 不同文件且无未完成依赖
- [USn] 对应用户故事可追溯
- 禁止在页面重写 BMR/TDEE/目标摄入/宏量公式
- shared 变更提交前 `pnpm --filter @peakmeet/shared test` 必须全绿
- 快速减脂禁止选择时阻断确认弹窗
- 三餐比例锁定 3:4:3，不做用户自定义
- Commit 建议按故事或逻辑组；Stop at checkpoints 独立验收
