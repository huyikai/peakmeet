# Tasks: 训练计时器

**Input**: Design documents from `/specs/005-training-timer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Constitution — `packages/shared` 计时内核强制 TDD（先写失败测试再实现）。UI 以 quickstart 人工验收。

**Brand / UI**: 大字体对齐 `docs/brand` / `--pm-*`；MUST NOT 另起主色板或引入重型 UI 库。

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: [US1]…[US5] for user story phases only
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/timer/`, tests `packages/shared/__tests__/timer-*.test.ts`
- **miniprogram**: `packages/miniprogram/pages/train/`
- MUST NOT 在 shared 调用 `wx` / DOM

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 目录与路由骨架，便于后续 TDD 与页面接线

- [x] T001 Create `packages/shared/src/timer/` directory and stub `packages/shared/src/timer/index.ts`
- [x] T002 [P] Register `pages/train/timer/index` in `packages/miniprogram/app.json` (pages array)
- [x] T003 [P] Scaffold empty timer page files `packages/miniprogram/pages/train/timer/index.{ts,wxml,wxss,json}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 共享类型、校验与导出基线；**完成前禁止写页面业务计时逻辑**

**⚠️ CRITICAL**: No user story UI/session work until this phase is complete

- [x] T004 [P] Write failing tests for config bounds in `packages/shared/__tests__/timer-validate.test.ts` (rest/tabata 1–3600s; rounds 1–50; reject 0/negative/over)
- [x] T005 Define timer types in `packages/shared/src/timer/types.ts` per `specs/005-training-timer/data-model.md` (`TimerMode`, `SessionStatus`, configs, `TimerSession`, `TimerTickEvent`)
- [x] T006 Implement validators in `packages/shared/src/timer/validate.ts` until T004 passes
- [x] T007 Export timer public API surface from `packages/shared/src/timer/index.ts` and re-export in `packages/shared/src/index.ts`
- [x] T008 Run `pnpm --filter @peakmeet/shared test` and confirm validate suite green before story work

**Checkpoint**: Types + validate ready; shared export path exists

---

## Phase 3: User Story 1 - 组间休息倒计时 (Priority: P1) 🎯 MVP

**Goal**: Rest 模式可配置、开始/暂停/继续/取消、到点完成、摘要「再用同时长」、大字体 UI + 震动/提示音尝试

**Independent Test**: 设 5s → 开始 → 倒数到 0 → 提醒 → 摘要可「再用同时长」；非法 0s 拦截

### Tests for User Story 1 (TDD) ⚠️

- [x] T009 [P] [US1] Write failing rest session tests in `packages/shared/__tests__/timer-rest.test.ts` (start/tick/complete, pause/resume wall-clock, cancel, `restartRestSameConfig`)
- [x] T010 [P] [US1] Write failing edge tests in `packages/shared/__tests__/timer-rest.test.ts` (tick jump past end → completed; invalid start blocked)

### Implementation for User Story 1

- [x] T011 [US1] Implement rest lifecycle in `packages/shared/src/timer/session.ts` (`createSession`/`startSession`/`pauseSession`/`resumeSession`/`cancelSession`/`tickSession`/`restartRestSameConfig` for `rest`) until T009–T010 pass
- [x] T012 [US1] Add alert helpers in `packages/miniprogram/utils/timer-alerts.ts` (`vibrateShort` + optional `InnerAudioContext`; fail soft)
- [x] T013 [US1] Wire rest mode UI/logic in `packages/miniprogram/pages/train/timer/index.ts` + `index.wxml` + `index.wxss` (large Ink display, start/pause/resume/cancel, summary + 再用同时长, disclaimer; consume shared via utils/shared)
- [x] T014 [US1] Sync shared and verify build: `pnpm build:miniprogram` after rest page compiles

**Checkpoint**: Rest MVP usable from timer page (entry may still be manual path)

---

## Phase 4: User Story 2 - Tabata 交替循环 (Priority: P1)

**Goal**: Tabata `2N` 段（含末组 rest）；段切换与结束事件；UI 显示阶段/组次

**Independent Test**: 3s/2s/2 组 → 恰好 4 段后完成

### Tests for User Story 2 (TDD) ⚠️

- [x] T015 [P] [US2] Write failing Tabata tests in `packages/shared/__tests__/timer-tabata.test.ts` (2 rounds = 4 segments; phase_complete then session_complete; mid-pause; wall-clock jump across segments)

### Implementation for User Story 2

- [x] T016 [US2] Extend `packages/shared/src/timer/session.ts` for `tabata` mode until T015 passes
- [x] T017 [US2] Add Tabata config + running UI in `packages/miniprogram/pages/train/timer/index.ts` + `index.wxml` (work/rest labels, round 1…N, alerts on phase/session complete)

**Checkpoint**: Tabata independently completable on timer page

---

## Phase 5: User Story 4 - 后台与锁屏墙钟校准 (Priority: P1)

**Goal**: 切后台/锁屏后回前台显示与墙钟一致；到期补完成态与提醒

**Independent Test**: 休息 15s → 切后台 ≥10s → 回前台误差 ≤1s 或已完成并补提醒

### Tests for User Story 4 (TDD) ⚠️

- [x] T018 [P] [US4] Write failing wall-clock jump tests in `packages/shared/__tests__/timer-wallclock.test.ts` (advance `nowMs` by 10s+ while running rest/tabata → correct remaining or completed)

### Implementation for User Story 4

- [x] T019 [US4] Ensure `tickSession` in `packages/shared/src/timer/session.ts` is authoritative for jumps (fix until T018 green; no interval-only decrement)
- [x] T020 [US4] Wire `onShow`/`onHide` in `packages/miniprogram/pages/train/timer/index.ts` to call `tickSession(Date.now())` and replay alerts if `session_complete` / overdue

**Checkpoint**: Background reconciliation meets SC-003 hard bar (foreground catch-up)

---

## Phase 6: User Story 3 - 正计时 (Priority: P2)

**Goal**: 正计时累加、暂停不计时、结束出摘要时长

**Independent Test**: 开始 → 数秒 → 暂停 → 继续 → 结束，时长与墙钟一致（±1s）

### Tests for User Story 3 (TDD) ⚠️

- [x] T021 [P] [US3] Write failing stopwatch tests in `packages/shared/__tests__/timer-stopwatch.test.ts` (accumulate, pause freezes, endStopwatch → completed duration)

### Implementation for User Story 3

- [x] T022 [US3] Implement stopwatch branch in `packages/shared/src/timer/session.ts` until T021 passes
- [x] T023 [US3] Add stopwatch UI controls in `packages/miniprogram/pages/train/timer/index.ts` + `index.wxml`

**Checkpoint**: All three modes available on one page

---

## Phase 7: User Story 5 - 入口、唤起与可选打卡 (Priority: P2)

**Goal**: 训练 Tab 入口；query 预填且不自动开始；摘要可选打卡载荷

**Independent Test**: Tab 进入三模式；`navigateTo` 带 `restSec` 预填需手点开始；打卡字段齐全，跳过无载荷

### Tests for User Story 5 (TDD) ⚠️

- [x] T024 [P] [US5] Write failing check-in tests in `packages/shared/__tests__/timer-checkin.test.ts` (`buildWorkoutCheckInPayload` only for completed; required fields per `contracts/workout-checkin-payload.md`)

### Implementation for User Story 5

- [x] T025 [US5] Implement `packages/shared/src/timer/checkIn.ts` and export until T024 passes
- [x] T026 [US5] Parse launch query per `contracts/timer-launch-params.md` in `packages/miniprogram/pages/train/timer/index.ts` (`onLoad` prefill; MUST NOT autoStart; illegal → defaults)
- [x] T027 [US5] Add train Tab entry in `packages/miniprogram/pages/train/index.wxml` + `index.ts` (+ styles) navigating to `/pages/train/timer/index`
- [x] T028 [US5] Wire summary optional「打卡」/跳过 in `packages/miniprogram/pages/train/timer/index.ts` + `index.wxml` (call builder only on confirm; keep payload in page data for debug/验收)

**Checkpoint**: Standalone + launch + optional check-in ready for联调

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 全量测试、品牌与 quickstart 门禁

- [x] T029 [P] Add short beep asset under `packages/miniprogram/assets/audio/` (or document vibrate-only fallback) and wire in `packages/miniprogram/utils/timer-alerts.ts`
- [x] T030 Ensure mode switch only when idle in `packages/miniprogram/pages/train/timer/index.ts`; lock mode while running
- [x] T031 Run full `pnpm --filter @peakmeet/shared test` (timer coverage 100% for new modules) and `pnpm build:miniprogram`
- [x] T032 Execute `specs/005-training-timer/quickstart.md` checklist (三模式、唤起、可选打卡；真机后台项尽力)
- [x] T033 [P] Confirm disclaimer copy present in `packages/miniprogram/pages/train/timer/index.wxml` (量力而行 / 仅供辅助计时)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖
- **Foundational (Phase 2)**: 依赖 Setup；阻断所有 Story
- **US1 (Phase 3)**: 依赖 Foundational → **MVP**
- **US2 (Phase 4)**: 依赖 Foundational；建议 US1 session API 已成型
- **US4 (Phase 5)**: 依赖 US1（至少 rest tick）；建议与 US2 后或并行加强 jump 测试
- **US3 (Phase 6)**: 依赖 Foundational；可与 US2 后并行
- **US5 (Phase 7)**: 依赖至少 US1 完成（需摘要页）；check-in 依赖 completed 会话
- **Polish (Phase 8)**: 依赖 US1–US5 目标范围完成

### User Story Dependencies

- **US1**: 无跨 story 依赖 — MVP
- **US2**: 共享 `session.ts` 扩展
- **US4**: 强化已有 `tickSession` + 页面 lifecycle
- **US3**: 共享 `session.ts` 扩展
- **US5**: UI 入口 + launch + checkIn 模块

### Within Each Story

- Tests MUST fail before implementation (shared)
- Shared session before miniprogram wiring
- Story checkpoint before next priority when sequential

### Parallel Opportunities

- T002 / T003 与 T001 后可并行
- T004 与 T005 可部分并行（测可先写预期 API）
- T009 / T010 可并行撰写后串行实现 T011
- T015 与 US3 的 T021 在 US1 完成后可由不同人并行（注意 `session.ts` 合并冲突）
- T027 与 T026 可并行（不同文件）
- T029 / T033 可并行

---

## Parallel Example: User Story 1

```bash
# TDD first (parallel test files/cases):
Task: "Failing rest tests in packages/shared/__tests__/timer-rest.test.ts"
Task: "Failing rest edge/jump cases in same suite"

# Then implement shared, then UI:
Task: "Implement rest lifecycle in packages/shared/src/timer/session.ts"
Task: "Wire rest UI in packages/miniprogram/pages/train/timer/"
```

---

## Parallel Example: User Story 5

```bash
Task: "Check-in tests + checkIn.ts in packages/shared"
Task: "Train tab entry in packages/miniprogram/pages/train/index.*"
Task: "Launch query parse in packages/miniprogram/pages/train/timer/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundational（validate TDD）  
3. Phase 3 US1 Rest（session TDD + 页面）  
4. **STOP**：用 5s 休息验收 MVP  
5. 再推进 US2 → US4 → US3 → US5 → Polish  

### Incremental Delivery

1. Rest MVP → Tabata → 墙钟/lifecycle → Stopwatch → 入口/唤起/打卡 → quickstart 全绿  

### Parallel Team Strategy

1. 共同完成 Setup + Foundational  
2. Dev A: US1 → US4  
3. Dev B: US2 → US3（协调 `session.ts`）  
4. Dev C: US5 入口与 launch（US1 摘要就绪后接打卡）  

---

## Notes

- [P] = 不同文件、无未完成依赖  
- shared 禁止 `wx`；提醒只在 miniprogram  
- 唤起 MUST NOT autoStart；休息 MUST NOT 自动连环（仅「再用同时长」）  
- Tabata MUST 含末组 rest（`2N` 段）  
- Commit 前跑 shared test + `pnpm build:miniprogram`
