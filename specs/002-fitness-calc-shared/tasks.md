---
description: 'Task list for PeakMeet fitness calc shared library'
---

# Tasks: 健身核心计算共享库

**Input**: Design documents from `/specs/002-fitness-calc-shared/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: PeakMeet Constitution — `packages/shared` 核心逻辑强制 TDD（先写失败测试再实现）。本功能全部计算 MUST 含测试任务；覆盖率 `src/calc/**` 100%。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 仅触达 `packages/shared`（无 UI）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/`, tests in `packages/shared/__tests__/xxx.test.ts`
- **calc**: `packages/shared/src/calc/`
- Paths MUST stay within Constitution monorepo layout — no new top-level dirs

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认功能分支与 calc 目录骨架（monorepo 已由 001 建成）

- [ ] T001 Create feature branch `002-fitness-calc-shared` from latest main if not already checked out
- [ ] T002 Create directories `packages/shared/src/calc/` and ensure `packages/shared/__tests__/` exists for new calc tests
- [ ] T003 [P] Add empty barrel placeholder `packages/shared/src/calc/index.ts` (re-export stubs to be filled in later phases)

**Checkpoint**: 可在 `packages/shared` 内开始写失败测试

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Result 类型、取整、常量、免责声明、Vitest coverage — 阻塞全部故事

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Write failing tests for `CalcResult` helpers / error shape in `packages/shared/__tests__/result.test.ts` (assert `ok` discriminant; no throw expectation)
- [ ] T005 Implement `CalcErrorCode` union, `CalcError`, `CalcResult<T>` in `packages/shared/src/calc/result.ts` (after T004 fails)
- [ ] T006 [P] Implement `roundKcal` / `round1` in `packages/shared/src/calc/round.ts` per research.md §2
- [ ] T007 [P] Implement locked constants (activity factors, goal midpoints, macro g/kg, carb boost 1.15, BMR floor hint, BMI/BF/WHR label maps) in `packages/shared/src/calc/constants.ts`
- [ ] T008 [P] Export `FITNESS_DISCLAIMER` from `packages/shared/src/calc/constants.ts` (Constitution wording)
- [ ] T009 Wire foundational exports from `packages/shared/src/calc/index.ts` and re-export from `packages/shared/src/index.ts` without removing `getPeakMeetPing`
- [ ] T010 Configure Vitest coverage for `packages/shared` in `packages/shared/vitest.config.ts` (include `src/calc/**`; thresholds 100% lines/branches/functions/statements for calc)
- [ ] T011 Add `@vitest/coverage-v8` (or project-standard coverage provider) as shared/root devDependency and a `test:coverage` script in `packages/shared/package.json` if missing

**Checkpoint**: Foundation ready — user stories can start (TDD per story)

---

## Phase 3: User Story 1 - 身体指数与基础代谢可一致计算 (Priority: P1) 🎯 MVP

**Goal**: `calculateBmi` / `calculateBmr` / `calculateTdee` 纯函数可用，夹具与 research 一致

**Independent Test**: `pnpm --filter @peakmeet/shared test` 中 BMI/BMR/TDEE 用例全绿；同一输入两次调用结果深等；非法身高体重返回 `ok: false`

### Tests for User Story 1 (REQUIRED — TDD) ⚠️

> **NOTE: TDD — write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Write failing tests for BMI golden fixture (175/70 → 22.9 `normal`) and invalid height/weight in `packages/shared/__tests__/bmi.test.ts`
- [ ] T013 [P] [US1] Write failing tests for Mifflin-St Jeor BMR (male 30/175/70 → 1649) + sex/age validation in `packages/shared/__tests__/bmr.test.ts`
- [ ] T014 [P] [US1] Write failing tests for TDEE factors (1649×sedentary → 1979) + invalid activity in `packages/shared/__tests__/tdee.test.ts`

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement `calculateBmi` in `packages/shared/src/calc/bmi.ts` (after T012 fails)
- [ ] T016 [P] [US1] Implement `calculateBmr` in `packages/shared/src/calc/bmr.ts` (after T013 fails)
- [ ] T017 [P] [US1] Implement `calculateTdee` in `packages/shared/src/calc/tdee.ts` (after T014 fails)
- [ ] T018 [US1] Export `calculateBmi` / `calculateBmr` / `calculateTdee` and related types from `packages/shared/src/calc/index.ts` and `packages/shared/src/index.ts`
- [ ] T019 [US1] Add purity assertion (double-call equality) covering BMI/BMR/TDEE in the respective `__tests__` files

**Checkpoint**: US1 独立可测；可作为 MVP demo（仅 shared API）

---

## Phase 4: User Story 2 - 目标摄入热量与「不低于 BMR」兜底 (Priority: P1)

**Goal**: `calculateTargetIntake` 四目标中点缺口/盈余 + BMR 兜底提示

**Independent Test**: cutMild/cutAggressive/bulk/maintain 夹具通过；`TDEE 1800 / BMR 1600 / cutAggressive` 必兜底至 1600 且 `bmrFloorApplied === true`

### Tests for User Story 2 (REQUIRED — TDD) ⚠️

- [ ] T020 [P] [US2] Write failing tests for four goals midpoints (−400/−600/+300/0) in `packages/shared/__tests__/targetIntake.test.ts`
- [ ] T021 [P] [US2] Write failing test for BMR floor + hint string in `packages/shared/__tests__/targetIntake.test.ts`
- [ ] T022 [P] [US2] Write failing tests for invalid TDEE/BMR/goal → `CalcError` in `packages/shared/__tests__/targetIntake.test.ts`

### Implementation for User Story 2

- [ ] T023 [US2] Implement `calculateTargetIntake` in `packages/shared/src/calc/targetIntake.ts` (after T020–T022 fail)
- [ ] T024 [US2] Export `calculateTargetIntake` and `TargetIntakeResult` types from `packages/shared/src/calc/index.ts` and `packages/shared/src/index.ts`
- [ ] T025 [US2] Assert `deltaRange` / `bmrFloorApplied` / integer kcal in `packages/shared/__tests__/targetIntake.test.ts`

**Checkpoint**: US1+US2 热量链路可独立验收

---

## Phase 5: User Story 5 - 非法输入有明确失败信息 (Priority: P1)

**Goal**: 错误码表完整可测；公开 API 不抛异常；与 contracts 对齐

**Independent Test**: 对每个已实现公开函数至少一类非法入参断言 `ok: false` + 稳定 `code`；故意非法调用无 throw

### Tests for User Story 5 (REQUIRED — TDD) ⚠️

- [ ] T026 [P] [US5] Extend `packages/shared/__tests__/result.test.ts` with exhaustive `CalcErrorCode` documentation assertions (codes listed in research §1 exist as type/const)
- [ ] T027 [P] [US5] Add cross-cutting “never throws” smoke in `packages/shared/__tests__/result.test.ts` calling each exported calc with empty/`NaN` inputs where already implemented
- [ ] T028 [US5] Audit US1/US2 tests for missing codes (`INVALID_SEX`, `INVALID_ACTIVITY`, `INVALID_GOAL`, etc.) and add cases in the respective `__tests__/*.test.ts` files

### Implementation for User Story 5

- [ ] T029 [US5] Centralize shared validators (finite positive number, positive int age, enum checks) in `packages/shared/src/calc/validate.ts` and refactor bmi/bmr/tdee/targetIntake to use them (no behavior change)
- [ ] T030 [US5] Ensure friendly Chinese `message` strings for all codes used so far live in `packages/shared/src/calc/constants.ts` or `validate.ts`

**Checkpoint**: P1 错误语义稳定；后续故事复用 `validate.ts`

---

## Phase 6: User Story 3 - 宏量营养素按目标与训练日/休息日分配 (Priority: P2)

**Goal**: `calculateMacroPlan` 蛋白/脂肪中点 + 剩余热量碳水 + 训练日 ×1.15

**Independent Test**: 固定 targetKcal/weight/goal 下蛋白脂肪克数与 research 中点一致；`carbTrainG >= carbRestG`；剩余不足时 `carbRestG === 0` 且 `structureTight`

### Tests for User Story 3 (REQUIRED — TDD) ⚠️

- [ ] T031 [P] [US3] Write failing tests for cut/bulk/maintain protein & fat midpoints in `packages/shared/__tests__/macros.test.ts`
- [ ] T032 [P] [US3] Write failing tests for rest vs train carbs (+15%) and non-negative carbs in `packages/shared/__tests__/macros.test.ts`
- [ ] T033 [P] [US3] Write failing tests for invalid targetKcal/weight/goal and structureTight edge in `packages/shared/__tests__/macros.test.ts`

### Implementation for User Story 3

- [ ] T034 [US3] Implement `calculateMacroPlan` in `packages/shared/src/calc/macros.ts` (after T031–T033 fail)
- [ ] T035 [US3] Export `calculateMacroPlan` and macro types from `packages/shared/src/calc/index.ts` and `packages/shared/src/index.ts`
- [ ] T036 [US3] Confirm gram rounding to 1 decimal in `packages/shared/__tests__/macros.test.ts`

**Checkpoint**: 饮食热量→宏量链路可验收（仍无 UI）

---

## Phase 7: User Story 4 - 力量与围度相关指标 (Priority: P2)

**Goal**: `estimateOneRm` / `estimateBodyFat` / `calculateWhr` 按 research 锁定公式

**Independent Test**: 1RM 100×5→117；体脂男 18.5 / 女 30.2；WHR 男 90/100→0.9 moderate；reps 0/13 → `INVALID_REPS`

### Tests for User Story 4 (REQUIRED — TDD) ⚠️

- [ ] T037 [P] [US4] Write failing Epley tests (100×5→117; reps 1–12 bounds) in `packages/shared/__tests__/oneRm.test.ts`
- [ ] T038 [P] [US4] Write failing PWW-v1 body fat fixtures + category labels in `packages/shared/__tests__/bodyFat.test.ts`
- [ ] T039 [P] [US4] Write failing WHR risk tiers + invalid waist/hip in `packages/shared/__tests__/whr.test.ts`

### Implementation for User Story 4

- [ ] T040 [P] [US4] Implement `estimateOneRm` in `packages/shared/src/calc/oneRm.ts` (after T037 fails)
- [ ] T041 [P] [US4] Implement `estimateBodyFat` in `packages/shared/src/calc/bodyFat.ts` (after T038 fails)
- [ ] T042 [P] [US4] Implement `calculateWhr` in `packages/shared/src/calc/whr.ts` (after T039 fails)
- [ ] T043 [US4] Export oneRm/bodyFat/whr APIs and types from `packages/shared/src/calc/index.ts` and `packages/shared/src/index.ts`
- [ ] T044 [US4] Extend US5 never-throws / invalid-input coverage for oneRm/bodyFat/whr in `packages/shared/__tests__/result.test.ts` or respective test files

**Checkpoint**: 工具箱三项指标独立可测

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 契约对齐、覆盖率、quickstart、合规抽检

- [ ] T045 Verify all exports in `contracts/calc-api.md` are present in `packages/shared/src/index.ts` (including `FITNESS_DISCLAIMER`)
- [ ] T046 [P] Run `pnpm --filter @peakmeet/shared build` and confirm `dist/` + `dist-cjs/` include new calc `.d.ts` / JS
- [ ] T047 [P] Run `pnpm sync:shared` and confirm synced CJS under `packages/miniprogram/utils/shared/` includes calc exports (no miniprogram UI required)
- [ ] T048 Run coverage: `pnpm --filter @peakmeet/shared exec vitest run --coverage` — `src/calc/**` at 100%
- [ ] T049 Compliance pass: grep calc labels/messages for 治疗/康复/治病/治愈；confirm disclaimer export matches Constitution
- [ ] T050 Execute golden fixtures from `specs/002-fitness-calc-shared/quickstart.md` via Vitest (all rows green)
- [ ] T051 [P] Ensure `getPeakMeetPing` still passes in `packages/shared/__tests__/ping.test.ts`
- [ ] T052 Run root `pnpm test` and `pnpm lint` (fix any regressions introduced by calc)

**Checkpoint**: Feature ready for `/speckit-implement` completion / review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖
- **Foundational (Phase 2)**: 依赖 Setup；**阻塞**全部故事
- **US1 (Phase 3)**: 依赖 Foundational → MVP
- **US2 (Phase 4)**: 依赖 Foundational；逻辑上消费 BMR/TDEE 数值但不依赖 US1 源码文件（可并行，建议串行）
- **US5 (Phase 5)**: 依赖 US1+US2 已有公开函数以便扫错误码；`validate.ts` 供 US3/US4 复用
- **US3 (Phase 6)**: 依赖 Foundational + 建议在 US5 validators 之后
- **US4 (Phase 7)**: 依赖 Foundational；与 US3 可并行（不同文件）
- **Polish (Phase 8)**: 依赖目标故事全部完成

### User Story Dependencies

- **US1 (P1)**: Foundational 后即可 — MVP
- **US2 (P1)**: Foundational 后即可；与 US1 弱相关（入参为数字）
- **US5 (P1)**: 建议在 US1+US2 实现后做集中错误扫尾，并在 US3/US4 实现后用 T044 补全
- **US3 (P2)**: 依赖 validators（US5）；不依赖 UI
- **US4 (P2)**: 与 US3 无代码依赖，可并行

### Within Each User Story

1. 写失败测试 → 确认红
2. 实现最少代码 → 绿
3. 导出 → 补边界/纯度断言 → 重构

### Parallel Opportunities

- T006 / T007 / T008 可并行
- T012 / T013 / T014 可并行；随后 T015 / T016 / T017 可并行
- T020 / T021 / T022 可并行（同文件时改为顺序编辑）
- T037 / T038 / T039 可并行；T040 / T041 / T042 可并行
- US3 与 US4 在 Foundational+US5 validators 后可由不同人并行
- Polish 中 T046 / T047 / T051 可并行

---

## Parallel Example: User Story 1

```bash
# TDD first (parallel files):
Task: "BMI tests in packages/shared/__tests__/bmi.test.ts"
Task: "BMR tests in packages/shared/__tests__/bmr.test.ts"
Task: "TDEE tests in packages/shared/__tests__/tdee.test.ts"

# After red, implement in parallel:
Task: "calculateBmi in packages/shared/src/calc/bmi.ts"
Task: "calculateBmr in packages/shared/src/calc/bmr.ts"
Task: "calculateTdee in packages/shared/src/calc/tdee.ts"
```

## Parallel Example: User Story 4

```bash
Task: "oneRm.test.ts"
Task: "bodyFat.test.ts"
Task: "whr.test.ts"
# then
Task: "oneRm.ts" / "bodyFat.ts" / "whr.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup + Phase 2 Foundational
2. Phase 3 US1（BMI/BMR/TDEE）
3. **STOP**：`pnpm --filter @peakmeet/shared test` 验证 US1
4. 再进入 US2 / US5

### Suggested incremental path

1. Setup + Foundational
2. US1 → MVP API
3. US2 → 热量目标 + 兜底（合规关键）
4. US5 → 错误模型收口 + `validate.ts`
5. US3 → 宏量
6. US4 → 1RM / 体脂 / WHR
7. Polish → coverage 100% + quickstart + sync

### Parallel Team Strategy

1. 共同完成 Setup + Foundational
2. Dev A: US1 → US2；Dev B: 可先写 US4 失败测试（待 Foundational）
3. US5 validators 合并后：Dev A US3 / Dev B US4
4. 共同 Polish

---

## Notes

- [P] = 不同文件且无未完成依赖
- 禁止公开 API `throw`；禁止区间中点覆盖参数
- 体脂必须用 research **PWW-v1**，不得改用 Navy/Deurenberg
- 保留 `getPeakMeetPing`；本功能不改 miniprogram/web 页面
- 每完成一故事运行 Vitest；提交前全绿 + calc 覆盖率 100%
