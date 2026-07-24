# Tasks: 云数据库设计、种子数据与本地同步

**Input**: Design documents from `/specs/006-cloud-db-seed/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Constitution — `packages/shared` content 模块强制 TDD（先写失败测试再实现）。云函数白名单/信封鼓励单测；同步与控制台操作用 quickstart 人工验收。

**Brand / UI**: 本版无内容库完整 UI；缺省占位图落 `packages/miniprogram/assets/`，MUST NOT 另起主色板或引入重型 UI 库。

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: [US1]…[US5] for user story phases only
- Include exact file paths in descriptions

## Path Conventions

- **shared**: `packages/shared/src/content/`, tests `packages/shared/__tests__/content-*.test.ts`
- **cloudfunctions**: `packages/cloudfunctions/contentList/`, `packages/cloudfunctions/contentGetById/`
- **database**: `database/rules/`, `database/seeds/`
- **miniprogram**: `packages/miniprogram/`
- **scripts**: `scripts/db-sync.mjs`
- MUST NOT 在 shared 调用 `wx` / 云 SDK

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 目录、脚本入口、密钥忽略与文档骨架

- [x] T001 Create `database/rules/` and `database/seeds/` directories; update `database/README.md` with schema/sync overview linking to `specs/006-cloud-db-seed/`
- [x] T002 [P] Create `packages/shared/src/content/` with stub `packages/shared/src/content/index.ts`
- [x] T003 [P] Ensure `.gitignore` ignores `.env.local` and CloudBase credential files; document required env vars in `database/README.md`
- [x] T004 [P] Add root script `"db:sync": "node scripts/db-sync.mjs"` in `package.json` and stub `scripts/db-sync.mjs` that exits with a clear “not implemented” message

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: shared 内容类型、白名单、查询校验、缺省封面常量（TDD）；**完成前禁止写云函数业务与种子规模填充**

**⚠️ CRITICAL**: No US1–US5 implementation beyond setup until this phase is complete

- [x] T005 [P] Write failing tests for list/getById validation in `packages/shared/__tests__/content-validate-query.test.ts` (whitelist collections, limit 1–100 default 20, skip≥0, illegal filter keys, empty id)
- [x] T006 [P] Write failing tests for cover helper in `packages/shared/__tests__/content-cover.test.ts` (`resolveContentCover` null/blank → `DEFAULT_CONTENT_COVER`)
- [x] T007 Define entity + DTO types in `packages/shared/src/content/types.ts` per `specs/006-cloud-db-seed/data-model.md` (seven entities, PlanDay/PlanItem, MacroPer100g)
- [x] T008 [P] Add `packages/shared/src/content/collections.ts` with `PUBLIC_COLLECTIONS` constant
- [x] T009 [P] Add `packages/shared/src/content/filters.ts` with `LIST_FILTER_KEYS` per contracts/data-model
- [x] T010 Implement `packages/shared/src/content/validateQuery.ts` (`validateListQuery`, `validateGetByIdQuery`) until T005 passes
- [x] T011 Implement `packages/shared/src/content/cover.ts` (`DEFAULT_CONTENT_COVER`, `resolveContentCover`) until T006 passes
- [x] T012 Export content API from `packages/shared/src/content/index.ts` and re-export in `packages/shared/src/index.ts`
- [x] T013 Run `pnpm --filter @peakmeet/shared test` and confirm content suites green before story work

**Checkpoint**: shared content types + query/cover helpers ready for CF and miniprogram

---

## Phase 3: User Story 1 - 公共内容库可被安全读取 (Priority: P1) 🎯 MVP

**Goal**: 公共四表安全规则 + `contentList` / `contentGetById` 云函数（白名单、分页、等值过滤、统一信封）；客户端不可写

**Independent Test**: 规则下直写 `actions` 失败；`contentList`/`contentGetById` 对白名单集合返回信封；非法集合/过滤字段被拒绝（有种子后可读到数据；无种子时至少规则与 CF 行为可测）

### Tests for User Story 1 (encouraged)

- [x] T014 [P] [US1] Add unit tests for envelope/error mapping helpers (if extracted) under `packages/cloudfunctions/` test path or shared pure helpers used by CF — cover `INVALID_COLLECTION` / `INVALID_FILTER` / `NOT_FOUND`

### Implementation for User Story 1

- [x] T015 [P] [US1] Write public security rules JSON in `database/rules/actions.json`, `database/rules/equipment.json`, `database/rules/training_plans.json`, `database/rules/foods.json` (`read: true`, `write: false`) per `contracts/security-rules.md`
- [x] T016 [US1] Add `wx-server-sdk` dependency and multi-entry build support in `packages/cloudfunctions/package.json` + `packages/cloudfunctions/tsconfig.json` for `contentList` and `contentGetById`
- [x] T017 [US1] Implement `packages/cloudfunctions/contentList/index.ts` using shared `validateListQuery` + DB query (sort `sortWeight` desc, `_id` asc; limit/skip; equality filters) returning contract envelope
- [x] T018 [US1] Implement `packages/cloudfunctions/contentGetById/index.ts` using shared `validateGetByIdQuery` + doc get by `_id`; missing → `NOT_FOUND`
- [x] T019 [US1] Build cloudfunctions (`pnpm --filter @peakmeet/cloudfunctions build`) and document deploy steps in `database/README.md` (upload `contentList` / `contentGetById`)
- [x] T020 [US1] Verify no user-write or sync cloud functions exist under `packages/cloudfunctions/` for this feature

**Checkpoint**: Public rules + list/getById deployable; writes denied by rules

---

## Phase 4: User Story 2 - 仓库种子经本地/CI 同步到云库 (Priority: P1)

**Goal**: 公共四表种子达规模；`pnpm db:sync` 按 `_id`/slug upsert；不删种子外文档；密钥不入库

**Independent Test**: 执行 sync（或控制台 Upsert 降级）后规模达标；再 sync 同 `_id` 不翻倍；客户端无法触发全量同步

### Implementation for User Story 2

- [x] T021 [P] [US2] Generate compliant seed `database/seeds/actions.json` (≥80; `_id`=slug; fields per data-model; no medical claims)
- [x] T022 [P] [US2] Generate compliant seed `database/seeds/equipment.json` (≥20; relatedActionIds use action slugs where possible)
- [x] T023 [P] [US2] Generate compliant seed `database/seeds/training_plans.json` (exactly 6; ≥1 `category: "functional"`; PlanDay structure)
- [x] T024 [P] [US2] Generate compliant seed `database/seeds/foods.json` (≥200; `per100g` macros; recommendGrade S/A/B/C)
- [x] T025 [US2] Implement upsert sync in `scripts/db-sync.mjs` with `@cloudbase/manager-node` (or documented equivalent), reading seeds, env `CLOUDBASE_ENV_ID` / secrets; per-collection summary; fail fast on invalid JSON/missing `_id`; **no delete orphans**
- [x] T026 [US2] Add `@cloudbase/manager-node` (or chosen SDK) as root or script dependency in `package.json` / lockfile as needed for `pnpm db:sync`
- [x] T027 [US2] Document console Upsert fallback and fork credential setup in `database/README.md` + align with `specs/006-cloud-db-seed/quickstart.md`
- [x] T028 [US2] Compliance spot-check seeds (no 治疗/康复/治病/治愈; no extreme diet/overload wording); fix offending strings in seed files

**Checkpoint**: Seeds versioned; sync path documented and runnable with local secrets

---

## Phase 5: User Story 3 - 用户私有表结构就绪但不提供写入接口 (Priority: P2)

**Goal**: 用户三表规则 + shared 类型已在 foundational；确认无写 CF、无隐私种子

**Independent Test**: 规则文件存在；仓库无真实用户种子；云函数目录无收藏/打卡/身体记录写接口

### Implementation for User Story 3

- [x] T029 [P] [US3] Write private security rules in `database/rules/user_collect.json`, `database/rules/user_body_record.json`, `database/rules/user_train_record.json` (`doc.openid == auth.openid` read/write)
- [x] T030 [US3] Confirm `UserCollect` / `UserBodyRecord` / `UserTrainRecord` types in `packages/shared/src/content/types.ts` match data-model; extend tests in `packages/shared/__tests__/content-types-shape.test.ts` if needed for required fields
- [x] T031 [US3] Assert `database/seeds/` contains **no** `user_*` seed files; note in `database/README.md` that user collections are schema-only this release
- [x] T032 [US3] Double-check `packages/cloudfunctions/` has no user-write functions (collect/body/train)

**Checkpoint**: Private tables rules+types ready; no write API this feature

---

## Phase 6: User Story 4 - 小程序接入指定云环境 (Priority: P1)

**Goal**: AppID `wx07a6368636359893`；启动 `wx.cloud.init` 至 `cloud1-d8ghafmni1c847e3f`；fork 说明

**Independent Test**: 开发者工具使用真实 AppID 冷启动无云 init 报错；env 指向约定环境

### Implementation for User Story 4

- [x] T033 [US4] Set `"appid": "wx07a6368636359893"` in `packages/miniprogram/project.config.json` (replace `touristappid`)
- [x] T034 [US4] Call `wx.cloud.init({ env: 'cloud1-d8ghafmni1c847e3f', traceUser: true })` in `packages/miniprogram/app.ts` `onLaunch` (keep `app.js` in sync if generated/committed)
- [x] T035 [US4] Document fork替换 AppID/env/密钥且禁止提交密钥 in `database/README.md` (and root README if present)

**Checkpoint**: Miniprogram cloud-ready for direct DB + CF calls

---

## Phase 7: User Story 5 - 类型与图片缺省约定可复用 (Priority: P2)

**Goal**: 统一本地缺省图资源；小程序可解析空 cover；shared 类型与七表对照完整

**Independent Test**: 空 cover → `resolveContentCover` / 页面使用占位图路径且资源可加载

### Implementation for User Story 5

- [x] T036 [P] [US5] Add placeholder image `packages/miniprogram/assets/images/content-placeholder.png` (simple brand-neutral placeholder; path matches `DEFAULT_CONTENT_COVER`)
- [x] T037 [US5] Add thin helper `packages/miniprogram/utils/content-cover.ts` wrapping shared `resolveContentCover` (via synced utils/shared)
- [x] T038 [US5] Run `pnpm sync:shared` / `pnpm build:miniprogram` and verify content exports available under miniprogram shared utils
- [x] T039 [US5] Cross-check `packages/shared/src/content/types.ts` field list against `specs/006-cloud-db-seed/data-model.md` for all seven collections; fix gaps

**Checkpoint**: Types + unified default cover usable by future content UI

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: 端到端对照 quickstart、索引提示、清理

- [x] T040 [P] Update `specs/006-cloud-db-seed/quickstart.md` if commands/paths drifted during implementation
- [x] T041 [P] Recommend/create CloudBase indexes note in `database/README.md` for frequent filters (`sortWeight`, `category`, `difficulty`, `primaryScene`) — document only if console-created
- [x] T042 Run full `pnpm test` (shared content + existing suites) and fix regressions
- [x] T043 Manual quickstart pass: rules applied, sync (or console upsert), CF smoke, direct read smoke, empty cover placeholder
- [x] T044 Confirm no CMS / client sync CF / medical-claim seed leftovers; mark all story checkpoints done

### Content image scope extension

- [x] T045 Generate 80 action covers in `database/assets/content/actions/` via `scripts/generate-content-images.py`
- [x] T046 [P] Generate 20 equipment and 200 food covers in `database/assets/content/equipment/` and `database/assets/content/foods/`
- [x] T047 Create checksum/upload map in `database/assets/content/manifest.json` and set seed `cover` values to portable `asset://content/...` URIs
- [x] T048 Extend `scripts/db-sync.mjs` to upload content images to CloudBase and replace asset URIs with environment fileIDs before upsert
- [x] T049 Update `database/README.md` and `specs/006-cloud-db-seed/quickstart.md` for repository image generation/upload validation

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** → **Phase 2** → Story phases
- **US1** needs Phase 2 (validateQuery) before CF
- **US2** can start seed file generation [P] after Phase 1; sync script needs env + preferably after US1 collections exist in cloud
- **US3** rules [P] after Phase 1; types already in Phase 2
- **US4** can run parallel to US1/US2 after Phase 1 (needed for E2E of US1/US2)
- **US5** needs Phase 2 cover constants + placeholder asset; soft-depends on `pnpm sync:shared`
- **Phase 8** after intended stories complete

### User story completion order (suggested)

```text
Phase 2 (shared) → US4 (init) ∥ US1 (rules+CF) → US2 (seeds+sync) → US3 (private rules) → US5 (placeholder) → Polish
```

### Parallel opportunities

- T002–T004; T005–T006; T008–T009
- T015 ∥ T016 early; T021–T024 seed files in parallel
- T029 ∥ T036
- T040–T041 polish docs in parallel

### Independent test criteria (summary)

| Story | Independent test |
| ----- | ---------------- |
| US1 | 公共表不可客户端写；list/getById 信封与非法集合拒绝 |
| US2 | sync 后规模达标；再 sync 不重复；无客户端刷库入口 |
| US3 | 私有规则文件 + 无用户种子 + 无写 CF |
| US4 | 真实 AppID + cloud.init 成功 |
| US5 | 空 cover → 统一占位图路径可用 |

---

## Parallel example: User Story 2 seeds

```bash
# After Phase 1, in parallel:
# T021 actions.json | T022 equipment.json | T023 training_plans.json | T024 foods.json
# Then T025–T028 sequentially for sync + compliance
```

---

## Implementation strategy

### MVP (recommended first slice)

1. Phase 1–2  
2. US4 (init) + US1 (rules + CF)  
3. Minimal smoke without full 200 foods if needed → then US2 full seeds  

### Incremental delivery

1. MVP readable empty/public rules + CF  
2. US2 full content  
3. US3 private readiness  
4. US5 placeholder polish  
5. Phase 8 quickstart gate  

### Notes

- Do **not** implement user write cloud functions  
- Do **not** add client-callable full sync  
- Seed `_id` = slug; upsert only  

---

## Task count summary

| Phase | Tasks | Count |
| ----- | ----- | ----- |
| Phase 1 Setup | T001–T004 | 4 |
| Phase 2 Foundational | T005–T013 | 9 |
| US1 | T014–T020 | 7 |
| US2 | T021–T028 | 8 |
| US3 | T029–T032 | 4 |
| US4 | T033–T035 | 3 |
| US5 | T036–T039 | 4 |
| Polish | T040–T049 | 10 |
| **Total** | T001–T049 | **49** |

**Format validation**: All tasks use `- [ ]`, Task ID, optional `[P]` / `[USn]`, and include file paths.
