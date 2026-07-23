# Tasks: 小程序计算页视觉契约（对齐品牌）

**Input**: Design documents from `/specs/004-calc-ui-contract/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 本功能为纯 UI / WXSS，无 shared 计算变更 — **不强制 Vitest**。验收以 [quickstart.md](./quickstart.md) 与 [contracts/migration-checklist.md](./contracts/migration-checklist.md) 人工核对为准。

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **miniprogram**: `packages/miniprogram/`（原生 WXML/WXSS/TS）
- **styles**: `packages/miniprogram/styles/`
- **brand assets**: `packages/miniprogram/assets/brand/logo/`
- **feature docs**: `specs/004-calc-ui-contract/`
- MUST NOT 改 `packages/shared` 计算逻辑；MUST NOT 引入重型 UI 库

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认目录与品牌资产就绪，便于落地 token / theme

- [x] T001 Create `packages/miniprogram/styles/` directory for theme artifacts
- [x] T002 [P] Verify brand logo assets exist under `packages/miniprogram/assets/brand/logo/` (`icon.png`, `lockup-horizontal.png`) per `docs/brand/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 品牌 token + 单一共享样式入口 + 全局底色；**完成前禁止开始各 User Story 页面迁移**

**⚠️ CRITICAL**: No user story page work until this phase is complete

- [x] T003 Create brand CSS variables in `packages/miniprogram/styles/tokens.wxss` (`--pm-ink` `#0B0D10`, `--pm-orange` `#FF5A1F`, `--pm-snow` `#F2F4F7`, plus `--pm-ink-muted`, `--pm-surface`, `--pm-chip-idle`, `--pm-danger`; comment cite `docs/brand/README.md`)
- [x] T004 Create shared theme entry `packages/miniprogram/styles/calc-theme.wxss` that `@import`s `./tokens.wxss` and defines `.pm-page`, `.pm-section-title`, `.pm-field`, `.pm-label`, `.pm-input`, `.pm-btn-primary`, `.pm-entry`, `.pm-chip` / `.pm-chip.active`, `.pm-error`, `.pm-result`, `.pm-result-hero`, `.pm-result-value`, `.pm-result-unit`, `.pm-risk`, `.pm-tip`, `.pm-disclaimer` per `contracts/miniprogram-calc-theme-ui.md` (Ink 主按钮、Orange 选中描边、Ink 主数字)
- [x] T005 Add legacy class aliases in `packages/miniprogram/styles/calc-theme.wxss` for `.primary`, `.sex-btn` / `.sex-btn.active`, `.mode-btn` / `.mode-btn.active`, `.field`, `.label`, `.input`, `.error`, `.result`, `.disclaimer` so存量页可少改 WXML 仍符合契约
- [x] T006 Convert `packages/miniprogram/pages/diet/toolbox/calc-common.wxss` into a thin re-export that only `@import`s `/styles/calc-theme.wxss` (or relative equivalent)
- [x] T007 Align global page chrome in `packages/miniprogram/app.wxss`: `@import` tokens (or set Snow/Ink via `var(--pm-*)`) so `page` background uses Snow and default text uses Ink

**Checkpoint**: Foundation ready — `tokens.wxss` + `calc-theme.wxss` + shim + app 底色可用；user story 迁移可开始

---

## Phase 3: User Story 1 - 建立可复用的品牌视觉契约 (Priority: P1) 🎯 MVP

**Goal**: 用 BMI 样板页证明契约生效：三品牌色、Ink 主按钮、Orange 选中描边、Ink 主数字、弱化免责声明

**Independent Test**: 打开 BMI 页，评审者能指出主色仅来自 Ink/Orange/Snow、主数字为 Ink、免责声明可见且弱于主结果、无橙实心主按钮

### Implementation for User Story 1

- [x] T008 [US1] Point `packages/miniprogram/pages/diet/toolbox/bmi/index.wxss` at shared theme (`@import` `/styles/calc-theme.wxss` or via `../calc-common.wxss`) and remove conflicting hardcoded primary palette
- [x] T009 [US1] Align BMI markup/classes in `packages/miniprogram/pages/diet/toolbox/bmi/index.wxml` for field / chip / primary / result-value / result-unit / disclaimer hierarchy (prefer `.pm-*` or legacy aliases from calc-theme)
- [x] T010 [US1] Confirm BMI page logic untouched in `packages/miniprogram/pages/diet/toolbox/bmi/index.ts` (no calc behavior change); smoke: 合法计算 + 空输入提示仍可用
- [x] T011 [US1] Mark `toolbox-bmi` as `done` in `specs/004-calc-ui-contract/contracts/migration-checklist.md`

**Checkpoint**: BMI 样板页可独立验收视觉契约（MVP）

---

## Phase 4: User Story 2 - 共享样式入口供计算页统一引用 (Priority: P1)

**Goal**: 证明至少两页消费同一 `calc-theme` 入口，主按钮/选中态/结果层级一致；引用路径清晰

**Independent Test**: 打开 BMI 与热量缺口两页对比，主按钮均为 Ink 实心、选中态均为 Orange 描边浅底、结果主数字均为 Ink、均引用同一共享样式来源

### Implementation for User Story 2

- [x] T012 [US2] Migrate `packages/miniprogram/pages/diet/calorie-plan/index.wxss` to consume `calc-theme` (direct or via shim); replace conflicting hardcoded colors; keep page-local layout only
- [x] T013 [US2] Align calorie-plan result hierarchy in `packages/miniprogram/pages/diet/calorie-plan/index.wxml` (`.pm-result-value` / hero Ink；`.pm-result-unit` muted；`.pm-risk` 浅橙非整屏；`.pm-disclaimer`；主按钮 Ink；chip 选中 Orange 描边)
- [x] T014 [US2] Confirm `packages/miniprogram/pages/diet/calorie-plan/index.ts` behavior unchanged; smoke: 温和减脂合法路径 + 空输入提示
- [x] T015 [US2] Mark `calorie-plan` as `done` in `specs/004-calc-ui-contract/contracts/migration-checklist.md`
- [x] T016 [US2] Verify both BMI and calorie-plan wxss ultimately resolve to `packages/miniprogram/styles/calc-theme.wxss` (no duplicate opposing palettes in page wxss)

**Checkpoint**: 双页共享入口与观感一致可验收

---

## Phase 5: User Story 3 - 存量饮食计算页迁移到契约 (Priority: P1)

**Goal**: 迁移清单剩余页全部对齐：饮食 Tab、工具箱聚合、BMR/体脂/腰臀比/1RM；业务行为不变

**Independent Test**: 按 `contracts/migration-checklist.md` 逐页核对；入口 Ink 实心；各计算页合法/非法路径仍可用；清单无 `pending`

### Implementation for User Story 3

- [x] T017 [P] [US3] Migrate diet Tab styles/markup in `packages/miniprogram/pages/diet/index.wxss` + `packages/miniprogram/pages/diet/index.wxml` to calc-theme (Snow 背景、Ink 主入口 `.pm-entry` / `.pm-btn-primary`；可选 `assets/brand/logo/` icon 或 lockup)
- [x] T018 [P] [US3] Migrate toolbox hub in `packages/miniprogram/pages/diet/toolbox/index.wxss` + `packages/miniprogram/pages/diet/toolbox/index.wxml` to calc-theme (入口/卡片风格一致；可选品牌 logo)
- [x] T019 [P] [US3] Migrate BMR page `packages/miniprogram/pages/diet/toolbox/bmr/index.wxss` + `index.wxml` to calc-theme; keep `index.ts` behavior
- [x] T020 [P] [US3] Migrate body-fat page `packages/miniprogram/pages/diet/toolbox/body-fat/index.wxss` + `index.wxml` to calc-theme (含模式切换选中态); keep `index.ts` behavior
- [x] T021 [P] [US3] Migrate WHR page `packages/miniprogram/pages/diet/toolbox/whr/index.wxss` + `index.wxml` to calc-theme; keep `index.ts` behavior
- [x] T022 [P] [US3] Migrate 1RM page `packages/miniprogram/pages/diet/toolbox/one-rm/index.wxss` + `index.wxml` to calc-theme; keep `index.ts` behavior
- [x] T023 [US3] Regression smoke each migrated page (diet index / toolbox hub 导航；BMR、体脂、腰臀比、1RM 各 1 次合法计算 + 1 次非法提示)
- [x] T024 [US3] Set remaining checklist rows (`diet-index`, `toolbox-hub`, `toolbox-bmr`, `toolbox-body-fat`, `toolbox-whr`, `toolbox-one-rm`) to `done` in `specs/004-calc-ui-contract/contracts/migration-checklist.md`

**Checkpoint**: 迁移清单 8 行全部 `done`；存量路径品牌连贯

---

## Phase 6: User Story 4 - 增量计算页默认遵循契约 (Priority: P2)

**Goal**: 文档明确「新计算页如何引用」三要点：品牌三色、共享样式入口、信息层级；禁止另起主色板

**Independent Test**: 抽查 `quickstart.md`（及可选 brand 交叉链接）含必须用品牌三色 + 共享入口 + 信息层级

### Implementation for User Story 4

- [x] T025 [US4] Ensure `specs/004-calc-ui-contract/quickstart.md` §「新计算页如何引用」完整覆盖：`@import` `styles/calc-theme.wxss`、`--pm-*` only、层级类名、禁止另起主色板
- [x] T026 [P] [US4] Add a short cross-link in `docs/brand/README.md` pointing miniprogram calc pages to `packages/miniprogram/styles/calc-theme.wxss` and `specs/004-calc-ui-contract/`

**Checkpoint**: 增量页可按文档直接遵循契约

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全量验收与残留清理

- [x] T027 Sweep diet path for leftover conflicting hex primaries (`#111`, `#f7f7f7` as sole palette, orange solid primary, etc.) under `packages/miniprogram/pages/diet/**/*.wxss` and replace with `var(--pm-*)` / theme classes
- [x] T028 [P] Run `pnpm build:miniprogram` and fix any compile/sync issues
- [x] T029 Execute full visual + behavior pass from `specs/004-calc-ui-contract/quickstart.md` (SC-001–SC-007 人工勾选)
- [x] T030 Confirm `specs/004-calc-ui-contract/contracts/migration-checklist.md` has zero `pending` rows before closing feature acceptance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup；**阻断**所有 User Story
- **US1 (Phase 3)**: 依赖 Foundational → MVP 样板
- **US2 (Phase 4)**: 依赖 US1（需至少一页已对齐后再做第二页对比）；可在 Foundational 后并行起草但验收需 BMI 已完成
- **US3 (Phase 5)**: 依赖 Foundational；建议 US1 完成后再批量迁移其余页（避免主题类未定型）
- **US4 (Phase 6)**: 依赖 Foundational；可与 US3 后期并行
- **Polish (Phase 7)**: 依赖 US1–US4 完成（至少 US1–US3 全部完成才可关迁移验收）

### User Story Dependencies

- **US1 (P1)**: Foundational 完成后即可 — MVP
- **US2 (P1)**: 依赖 US1 的 BMI 作为对比基线；迁移 calorie-plan
- **US3 (P1)**: 依赖 Foundational（建议 theme 经 US1 验证后）；可并行改多页
- **US4 (P2)**: 文档向；不阻塞迁移实现，但交付前应完成

### Within Each User Story

- 先 wxss `@import` / 去冲突色 → 再 wxml class/层级 → 再确认 ts 无行为变更 → 再更新 checklist
- MUST NOT 改 shared 算法或既有交互语义

### Parallel Opportunities

- T001 / T002 可并行
- T017–T022（不同页面文件）可在 US3 内并行
- T025 / T026 可并行
- T028 可与文档核对并行（在代码稳定后）

---

## Parallel Example: User Story 3

```bash
# After Foundational + US1 theme validated, migrate remaining pages in parallel:
Task: "Migrate diet Tab in packages/miniprogram/pages/diet/index.wxss + index.wxml"
Task: "Migrate toolbox hub in packages/miniprogram/pages/diet/toolbox/index.wxss + index.wxml"
Task: "Migrate BMR in packages/miniprogram/pages/diet/toolbox/bmr/"
Task: "Migrate body-fat in packages/miniprogram/pages/diet/toolbox/body-fat/"
Task: "Migrate WHR in packages/miniprogram/pages/diet/toolbox/whr/"
Task: "Migrate 1RM in packages/miniprogram/pages/diet/toolbox/one-rm/"
```

---

## Parallel Example: User Story 1

```bash
# Sequential within BMI (same page files — not parallel):
Task: "Point bmi/index.wxss at calc-theme"
Task: "Align bmi/index.wxml hierarchy classes"
Task: "Smoke bmi/index.ts behavior + mark checklist"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational（tokens + calc-theme + app + shim）
3. Complete Phase 3: US1 — BMI 样板
4. **STOP and VALIDATE**: 视觉契约在 BMI 上可评审
5. 再继续 US2（热量缺口第二页）→ US3 全量 → US4 文档 → Polish

### Incremental Delivery

1. Setup + Foundational → 主题基础设施就绪
2. US1 BMI → MVP 演示品牌契约
3. US2 calorie-plan → 双页一致性
4. US3 入口 + 其余工具页 → 清单全绿
5. US4 + Polish → 增量规范与关验收

### Parallel Team Strategy

1. 共同完成 Setup + Foundational
2. Dev A: US1 → US2
3. Dev B: US3 入口页（T017–T018）与工具页（T019–T022）在 theme 稳定后并行
4. Dev C: US4 文档
5. 合并后统一跑 T027–T030

---

## Notes

- [P] = 不同文件、无未完成依赖
- 无 Vitest 任务（纯 UI；Constitution TDD 不适用本功能）
- 交付前 `migration-checklist.md` 必须 8/`done`
- 主按钮 Ink 实心；选中 Orange 描边；主数字 Ink — 实现不得回退澄清结论
- Commit 建议按 phase/story；提交前 `pnpm build:miniprogram`
