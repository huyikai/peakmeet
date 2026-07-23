---
description: 'Task list template for feature implementation'
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: PeakMeet Constitution — `packages/shared` 核心逻辑强制 TDD（先写失败测试再实现）。云函数核心逻辑鼓励 TDD；纯 UI/交互可不强制。涉及 shared 的 story MUST 包含测试任务。

**Brand / UI**: 面向用户界面任务 MUST 对齐 `docs/brand`；计算类页面 MUST 遵循现行视觉契约与共享样式，MUST NOT 另起主色板或引入重型 UI 组件库。

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
- Paths MUST stay within Constitution monorepo layout — no new top-level dirs

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo dirs per Constitution (packages/shared|miniprogram|web|cloudfunctions, database, docs)
- [ ] T002 Initialize pnpm workspace + root package.json scripts
- [ ] T003 [P] Configure ESLint + Prettier + Vitest for workspace

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup CloudBase collections/permissions (public read vs user-private)
- [ ] T005 [P] Scaffold packages/shared with Vitest and empty src entry
- [ ] T006 [P] Scaffold miniprogram native app shell (4 Tab if needed)
- [ ] T007 [P] Scaffold Astro SSG web shell (no SSR)
- [ ] T008 Configure shared sync script for miniprogram utils
- [ ] T009 Setup seed data layout under database/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED if shared/calc logic) ⚠️

> **NOTE: TDD — write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for [calc/util] in packages/shared/**tests**/[name].test.ts
- [ ] T011 [P] [US1] Edge/abnormal input cases in packages/shared/**tests**/[name].test.ts

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement shared logic in packages/shared/src/[module].ts (after T010 fails)
- [ ] T013 [P] [US1] Wire miniprogram UI in packages/miniprogram/[path] (if applicable)
- [ ] T014 [P] [US1] Wire web page in packages/web/[path] (if applicable; SSG only)
- [ ] T015 [US1] Cloud function only if server-side required in packages/cloudfunctions/[name]
- [ ] T016 [US1] Add validation, disclaimer, and error handling per Compliance
- [ ] T017 [US1] Ensure no duplicated algorithm outside packages/shared

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (REQUIRED if shared/calc logic) ⚠️

- [ ] T018 [P] [US2] Unit test for [calc/util] in packages/shared/**tests**/[name].test.ts
- [ ] T019 [P] [US2] Edge/abnormal input cases in packages/shared/**tests**/[name].test.ts

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement shared logic in packages/shared/src/[module].ts
- [ ] T021 [US2] Wire miniprogram/web/cloud as applicable under packages/
- [ ] T022 [US2] Implement feature UI/flow in packages/[target]/[path]
- [ ] T023 [US2] Integrate with User Story 1 components (if needed; no logic duplication)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (REQUIRED if shared/calc logic) ⚠️

- [ ] T024 [P] [US3] Unit test for [calc/util] in packages/shared/**tests**/[name].test.ts
- [ ] T025 [P] [US3] Edge/abnormal input cases in packages/shared/**tests**/[name].test.ts

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement shared logic in packages/shared/src/[module].ts
- [ ] T027 [US3] Wire miniprogram/web/cloud as applicable under packages/
- [ ] T028 [US3] Implement feature UI/flow in packages/[target]/[path]

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring (keep shared pure; no platform APIs)
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Run full Vitest suite; shared coverage MUST remain 100% for calc/utils
- [ ] TXXX Compliance pass: disclaimer, privacy, no medical claims
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch shared unit tests for User Story 1 together (TDD first):
Task: "Unit test for [calc/util] in packages/shared/__tests__/[name].test.ts"
Task: "Edge/abnormal input cases in packages/shared/__tests__/[name].test.ts"

# After tests fail, implement shared + wire packages in parallel where safe:
Task: "Implement shared logic in packages/shared/src/[module].ts"
Task: "Wire miniprogram UI in packages/miniprogram/[path]"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (TDD for shared if applicable)
4. **STOP and VALIDATE**: Test User Story 1 independently; run Vitest
5. Deploy/demo if ready (miniprogram first per Decision Priority)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories or shared tests

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently; shared package changes coordinate to avoid duplicate algorithms

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (shared TDD is NON-NEGOTIABLE)
- Commit after each task or logical group; run full Vitest before commit
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence, stack violations, logic duplication outside shared
