# Tasks: 动作大全模块

**Input**: Design documents from `/specs/007-actions-catalog/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Constitution — `packages/shared` action-catalog 匹配/随机逻辑强制 TDD（先写失败测试再实现）。UI 以 [quickstart.md](./quickstart.md) 人工验收。

**Brand / UI**: 对齐 `docs/brand` / `styles/tokens.wxss`；MUST NOT 另起主色板或引入重型 UI 库；详情免责声明复用 `FITNESS_DISCLAIMER`。

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: [US1]…[US7] for user story phases only
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/content/`, tests `packages/shared/__tests__/action-catalog*.test.ts`
- **miniprogram**: `packages/miniprogram/pages/train/`
- **cloudfunctions**: `packages/cloudfunctions/getOpenId/`
- MUST NOT 在 shared 调用 `wx` / DOM

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 目录、路由与空页面骨架，便于后续 TDD 与接线

- [x] T001 Create stub modules `packages/shared/src/content/actionCatalog.ts` and `packages/shared/src/content/actionCatalogOptions.ts`
- [x] T002 [P] Register routes in `packages/miniprogram/app.json`: `pages/train/actions/index`, `pages/train/actions/detail`, `pages/train/plans/index`
- [x] T003 [P] Scaffold list page files `packages/miniprogram/pages/train/actions/index.{ts,wxml,wxss,json}`
- [x] T004 [P] Scaffold detail page files `packages/miniprogram/pages/train/actions/detail.{ts,wxml,wxss,json}`
- [x] T005 [P] Scaffold plans placeholder files `packages/miniprogram/pages/train/plans/index.{ts,wxml,wxss,json}`
- [x] T006 [P] Scaffold cloud function package `packages/cloudfunctions/getOpenId/` (`index.ts`, `package.json` per existing CF layout)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: shared 筛选契约、内容云调用封装、Hub 入口；**完成前禁止写列表/详情业务 UI**

**⚠️ CRITICAL**: No user story list/detail business logic until this phase is complete

### Tests (TDD) ⚠️

- [x] T007 [P] Write failing tests for `normalizeActionCatalogFilters` / single-select dims in `packages/shared/__tests__/action-catalog-normalize.test.ts`
- [x] T008 [P] Write failing tests for `matchAction` / `filterActions` (muscle, equipment, `__bodyweight__`, difficulty, goal, AND) in `packages/shared/__tests__/action-catalog-match.test.ts`

### Implementation

- [x] T009 Implement options + `BODYWEIGHT_EQUIPMENT_ID` in `packages/shared/src/content/actionCatalogOptions.ts` per `contracts/shared-action-catalog.md` and seed enums
- [x] T010 Implement `ActionCatalogFilters`, `normalizeActionCatalogFilters`, `matchAction`, `filterActions` in `packages/shared/src/content/actionCatalog.ts` until T007–T008 pass
- [x] T011 Export action-catalog API from `packages/shared/src/content/index.ts` and re-export in `packages/shared/src/index.ts`
- [x] T012 Run `pnpm --filter @peakmeet/shared test` and confirm action-catalog normalize/match suites green
- [x] T013 Add `packages/miniprogram/utils/cloud-content.ts` thin wrappers for `contentList` / `contentGetById` (typed envelope handling)
- [x] T014 Add training Hub entries in `packages/miniprogram/pages/train/index.{ts,wxml}` navigating to actions list and plans placeholder (keep timer entry)
- [x] T015 Sync shared to miniprogram (`pnpm` sync / `build:miniprogram` per repo scripts) so `utils/shared` exposes action-catalog exports

**Checkpoint**: Shared matchers green; cloud-content helper + Hub routes ready

---

## Phase 3: User Story 1 - 浏览与四维筛选动作列表 (Priority: P1) 🎯 MVP

**Goal**: 动作列表可加载、四维单选筛选（可清空）、卡片展示封面/名称/主部位/难度；缺省图；Hub 可进入

**Independent Test**: 训练 Tab → 动作大全 → 分别/组合单选四维 → 列表为交集；清空某维放宽；无封面用缺省图

### Implementation for User Story 1

- [x] T016 [US1] Load actions via `cloud-content` (`contentList` actions limit 100) and map list items with `resolveContentCover` / `contentCoverSrc` in `packages/miniprogram/pages/train/actions/index.ts`
- [x] T017 [US1] Wire four single-select filter controls (muscle/equipment/difficulty/goal) + clear-to-unlimited using shared options; apply `filterActions` in `packages/miniprogram/pages/train/actions/index.ts` + `index.wxml`
- [x] T018 [US1] Render action cards (cover, name, primary muscle label, difficulty) with empty/error/retry states in `packages/miniprogram/pages/train/actions/index.wxml` + `index.wxss` (brand tokens; no heavy UI kit)
- [x] T019 [US1] Load equipment options for filter labels (contentList equipment + `__bodyweight__`) in `packages/miniprogram/pages/train/actions/index.ts`
- [x] T020 [US1] Navigate card tap to `/pages/train/actions/detail?id=` (detail body may still be stub until US3)

**Checkpoint**: List + filters MVP usable; detail may be placeholder

---

## Phase 4: User Story 2 - 按名称搜索动作 (Priority: P1)

**Goal**: 名称（及 aliases）模糊搜索，可与筛选 AND 叠加；空态与清空

**Independent Test**: 输入已知名片段命中；叠加筛选仍正确；无命中空态；清空关键词恢复

### Tests for User Story 2 (TDD) ⚠️

- [x] T021 [P] [US2] Write failing keyword/alias match tests in `packages/shared/__tests__/action-catalog-search.test.ts` (case-insensitive substring; AND with other dims; empty keyword = no-op)

### Implementation for User Story 2

- [x] T022 [US2] Extend `matchAction` keyword/`aliases` behavior in `packages/shared/src/content/actionCatalog.ts` until T021 passes; re-run shared tests
- [x] T023 [US2] Add search input + clear + empty-state copy bound to `filters.keyword` in `packages/miniprogram/pages/train/actions/index.{ts,wxml}`

**Checkpoint**: Search works with filters on list page

---

## Phase 5: User Story 3 - 查看动作详情（新手友好） (Priority: P1)

**Goal**: 详情展示基础信息、主/协同肌、步骤图文、发力要点、避坑、底部 `FITNESS_DISCLAIMER`

**Independent Test**: 打开完整动作详情，各区块齐全；页底免责声明可见；缺图用缺省图

### Implementation for User Story 3

- [x] T024 [US3] Load action by id via `contentGetById` in `packages/miniprogram/pages/train/actions/detail.ts` with loading/error/retry
- [x] T025 [US3] Render detail sections (name/difficulty/equipment/scenes, primary+secondary muscles, steps with cover/default image, cues, mistakes) in `packages/miniprogram/pages/train/actions/detail.wxml` + `detail.wxss`
- [x] T026 [US3] Render bottom `FITNESS_DISCLAIMER` from shared in `packages/miniprogram/pages/train/actions/detail.{ts,wxml}` (disclaimer style consistent with diet/calc pages)

**Checkpoint**: Detail readable end-to-end from list navigation

---

## Phase 6: User Story 4 - 替代动作内容联动 (Priority: P2)

**Goal**: 详情展示可跳转「替代动作」列表（无关系标签）；无效 id 不崩溃

**Independent Test**: 打开含 `substituteIds` 的详情 → 点击进入另一详情 → 返回正常

### Implementation for User Story 4

- [x] T027 [US4] Resolve substitute ids to display names (in-memory map from loaded catalog or getById) and filter invalid ids in `packages/miniprogram/pages/train/actions/detail.ts`
- [x] T028 [US4] Render substitute list + navigateTo same detail route with new `id` in `packages/miniprogram/pages/train/actions/detail.{ts,wxml}`; empty → hide or「暂无替代」

**Checkpoint**: Substitute chain navigable without crash

---

## Phase 7: User Story 5 - 收藏与取消收藏 (Priority: P2)

**Goal**: 详情可收藏/取消并写 `user_collect`；列表只读展示标记；未登录引导

**Independent Test**: 登录后详情收藏 → 列表见标记 → 详情取消 → 标记消失；列表不可切换；未登录有提示

### Implementation for User Story 5

- [x] T029 [US5] Implement `getOpenId` cloud function per `contracts/get-openid.md` in `packages/cloudfunctions/getOpenId/index.ts` and wire build/deploy per `packages/cloudfunctions` conventions
- [x] T030 [US5] Add `packages/miniprogram/utils/user-collect.ts` (cache openid via getOpenId; list action collects; add/remove by openid+type+targetId)
- [x] T031 [US5] Wire detail favorite toggle + login/openid failure prompts in `packages/miniprogram/pages/train/actions/detail.{ts,wxml}`
- [x] T032 [US5] Merge collect marks into list cards (display-only, no toggle) in `packages/miniprogram/pages/train/actions/index.ts` + `index.wxml`

**Checkpoint**: Collect round-trip works; list marks read-only

---

## Phase 8: User Story 6 - 「今日练什么」随机推荐 (Priority: P2)

**Goal**: 全库随机推荐入口，忽略当前筛选/搜索；可进详情

**Independent Test**: 严筛选下列表变短后点推荐 → 仍可进全库动作详情；多次结果可变化

### Tests for User Story 6 (TDD) ⚠️

- [x] T033 [P] [US6] Write failing `pickRandomAction` tests in `packages/shared/__tests__/action-catalog-random.test.ts` (empty → null; injectable random; index bounds)

### Implementation for User Story 6

- [x] T034 [US6] Implement `pickRandomAction` in `packages/shared/src/content/actionCatalog.ts`, export it, until T033 passes; sync shared
- [x] T035 [US6] Add「今日练什么」control calling `pickRandomAction(allActions)` (not filtered list) + navigate detail / failure toast in `packages/miniprogram/pages/train/actions/index.{ts,wxml}`

**Checkpoint**: Random recommend independent of filters

---

## Phase 9: User Story 7 - 加入训练入口 (Priority: P3)

**Goal**: 详情「加入训练」跳转训练计划库占位页

**Independent Test**: 详情点加入训练 → 进入 `pages/train/plans/index`

### Implementation for User Story 7

- [x] T036 [US7] Implement plans placeholder UI copy in `packages/miniprogram/pages/train/plans/index.{ts,wxml,wxss}` (品牌对齐；说明计划库后续迭代)
- [x] T037 [US7] Add bottom「加入训练」button → `navigateTo` `/pages/train/plans/index` with failure toast in `packages/miniprogram/pages/train/actions/detail.{ts,wxml}`

**Checkpoint**: Join-training path closed per clarification

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: 质量门禁与 quickstart 验收

- [x] T038 [P] Ensure no parallel Action type definitions outside shared; pages import synced `utils/shared` types only
- [x] T039 Run full `pnpm --filter @peakmeet/shared test` (action-catalog coverage green / 100% for new modules)
- [x] T040 Compliance pass on detail copy + disclaimer visibility; no medical claim strings in new UI
- [x] T041 Run manual scenarios in `specs/007-actions-catalog/quickstart.md` (list/search/detail/substitutes/collect/random/join-training/failures)
- [x] T042 [P] Confirm brand tokens used; no alternate primary palette / heavy UI kit on actions/plans pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After US1 list shell (needs keyword UI on same page); shared search tests can start after T010 exists
- **US3 (Phase 5)**: After Foundational (+ US1 navigation ideal)
- **US4 (Phase 6)**: After US3 detail shell
- **US5 (Phase 7)**: After US3 (favorite on detail); list marks after US1
- **US6 (Phase 8)**: After US1 (needs allActions loaded)
- **US7 (Phase 9)**: After US3 + Setup plans scaffold
- **Polish (Phase 10)**: After desired stories complete

### User Story Dependencies

- **US1**: Foundational only
- **US2**: Extends US1 list + shared keyword
- **US3**: Foundational; navigable from US1
- **US4**: US3
- **US5**: US3 (+ US1 for list marks)
- **US6**: US1 (+ shared random)
- **US7**: US3 + plans page

### Within Each User Story

- Shared tests MUST fail before implementation (TDD)
- Shared before miniprogram wiring that consumes it
- Story complete before treating as done at checkpoint

### Parallel Opportunities

- T002–T006 scaffold in parallel
- T007–T008 failing tests in parallel
- After Foundational: US3 detail can proceed while US1 polish continues if staffed carefully on different files
- T033 random tests parallel with other story work once actionCatalog.ts exists
- T038 / T042 polish checks in parallel

---

## Parallel Example: Foundational + US1

```bash
# TDD first (parallel):
Task: "normalize tests in packages/shared/__tests__/action-catalog-normalize.test.ts"
Task: "match tests in packages/shared/__tests__/action-catalog-match.test.ts"

# After green shared + cloud-content:
Task: "List load + filters in packages/miniprogram/pages/train/actions/index.ts"
Task: "List WXML/WXSS cards in packages/miniprogram/pages/train/actions/index.wxml"
```

---

## Parallel Example: US5 collect

```bash
Task: "getOpenId CF in packages/cloudfunctions/getOpenId/index.ts"
Task: "user-collect util in packages/miniprogram/utils/user-collect.ts"
# Then wire detail + list marks sequentially on page files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundational (shared matchers + cloud-content + Hub)  
3. Phase 3 US1 list + filters  
4. **STOP**：按 Independent Test / quickstart §1 验收  
5. 再增量 US2 → US3 → …

### Incremental Delivery

1. US1 列表筛选 MVP  
2. US2 搜索  
3. US3 详情 + 免责声明  
4. US4 替代跳转  
5. US5 收藏  
6. US6 今日推荐  
7. US7 加入训练  
8. Polish + quickstart 全量  

### Suggested MVP Scope

**US1 only**（Foundational + 列表四维筛选）即可演示核心查询价值；建议至少紧接 **US2 + US3** 再对外演示「能找能看」。

---

## Notes

- [P] = different files, no incomplete-task dependency
- [USn] maps to spec user stories
- Verify shared tests fail before implement
- Commit after logical groups; run Vitest before commit
- Do not extend `contentList` complex where for MVP (memory filter per research)
- Avoid duplicating Action models in miniprogram
