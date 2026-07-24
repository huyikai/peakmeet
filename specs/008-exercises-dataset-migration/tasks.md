# Tasks: exercises-dataset 权威数据迁移

**Input**: [spec.md](./spec.md)、[plan.md](./plan.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)

## Phase 1: Setup

- [ ] T001 创建 `database/vendor/exercises-dataset/`、`database/catalog/`、`database/enrichment/`、`database/migrations/` 目录与 README 边界说明
- [ ] T002 [P] 在 `package.json` 注册 refresh、build-catalog、validate 与 db:sync 入口
- [ ] T003 [P] 在 `database/README.md` 记录 vendor→catalog→CloudBase 单向权威链和旧 seeds 废弃规则

## Phase 2: Foundational

- [ ] T004 先在 `packages/shared/__tests__/exercise-dataset-model.test.ts` 编写稳定 ID、分层模型与校验失败测试
- [ ] T005 在 `packages/shared/src/content/types.ts` 实现 SourceLock、CatalogAction、MediaSlot、enrichment 与迁移类型并使 T004 通过
- [ ] T006 [P] 先在 `packages/shared/__tests__/exercise-taxonomy.test.ts` 编写 raw taxonomy 与 28 类器材映射测试
- [ ] T007 在 `packages/shared/src/content/exerciseTaxonomy.ts` 实现版本化 taxonomy 转换并使 T006 通过
- [ ] T008 [P] 在 `scripts/__tests__/source-lock.test.ts` 编写 commit、1324/1324/1324、哈希、Schema、尺寸和许可失败测试
- [ ] T009 在 `scripts/refresh-exercises-dataset.mjs` 实现固定提交人工 refresh 与原子快照替换并使 T008 通过

## Phase 3: User Story 1 — 可复现完整动作库 (P1)

**Independent Test**: 离线校验固定快照并确定性重建相同 catalog digest。

- [ ] T010 [US1] 将固定提交数据、Schema、LICENSE、NOTICE、1324 JPG、1324 GIF 导入 `database/vendor/exercises-dataset/`
- [ ] T011 [US1] 生成 commit/tree/blob/逐文件 SHA-256 的 `database/vendor/exercises-dataset/source.lock.json`
- [ ] T012 [P] [US1] 在 `scripts/__tests__/build-exercise-catalog.test.ts` 编写确定性生成、数量、唯一 ID 与引用测试
- [ ] T013 [US1] 在 `scripts/build-exercise-catalog.mjs` 实现只读 vendor 的 catalog 生成管线并使 T012 通过
- [ ] T014 [US1] 在 `scripts/validate-content-assets.mjs` 增加来源锁、1324/1324/1324 与 180×180 完整性门禁

## Phase 4: User Story 2 — 中文分层内容 (P1)

**Independent Test**: 1324 条均有稳定 ID、中文名与中文步骤，raw/转换/enrichment 可追溯。

- [ ] T015 [P] [US2] 在 `database/enrichment/terms.zh.json` 建立版本化中文术语与映射规则
- [ ] T016 [P] [US2] 在 `database/enrichment/action-names.zh.json` 生成 1324 条中文名、英文别名和审核状态
- [ ] T017 [P] [US2] 在 `database/enrichment/action-enrichment.json` 保存派生内容、生成来源、版本、时间与审核状态
- [ ] T018 [US2] 在 `packages/shared/src/content/exerciseDataset.ts` 实现 raw/localized/taxonomy/enrichment 合并且禁止层间覆盖
- [ ] T019 [US2] 生成 `database/catalog/actions.json` 与 `database/catalog/equipment.json` 并通过中文覆盖及引用门禁
- [ ] T020 [US2] 在 `database/catalog/actions.json` 为每条媒体写入 provisional 状态、Gym visual 署名和商业替换门禁

## Phase 5: User Story 3 — 安全 CloudBase 替换 (P1)

**Independent Test**: 测试环境 dry-run、备份、替换、引用迁移、残留清理和恢复证据完整。

- [ ] T021 [P] [US3] 在 `database/migrations/action-id-map.json` 生成旧 80 动作到新 ID 的证据化映射
- [ ] T022 [US3] 在 `database/catalog/training-plans.json` 重写已确认计划 actionId，并将食物迁入 `database/catalog/foods.json`
- [ ] T023 [P] [US3] 在 `scripts/__tests__/reference-migration.test.ts` 编写计划/收藏成功、歧义、未匹配和禁止静默丢失测试
- [ ] T024 [US3] 在 `scripts/db-sync.mjs` 实现 dry-run、环境确认、catalog digest、备份与检查点
- [ ] T025 [US3] 在 `scripts/db-sync.mjs` 实现 actions 替换、equipment 重建、计划/收藏引用迁移与旧残留清理
- [ ] T026 [US3] 在 `scripts/db-sync.mjs` 实现失败摘要、恢复/rollback 和完整性完成态门禁
- [ ] T027 [US3] 更新 `database/assets/content/manifest.json` 直接引用 vendor 1324 JPG/GIF，并移除旧动作资产清单
- [ ] T028 [US3] 删除旧动作 seed 权威输入和旧 80 自生成动作媒体，保留非动作第一方素材生成职责

## Phase 6: User Story 4 — 分页过滤搜索 (P1)

**Independent Test**: 1324 条分页无重漏；过滤/搜索组合与详情媒体、署名均正确。

- [ ] T029 [P] [US4] 在 `packages/shared/__tests__/content-query-v2.test.ts` 先写游标、过滤、搜索、摘要和乱序请求测试
- [ ] T030 [US4] 在 `packages/shared/src/content/` 实现查询 DTO、白名单校验和稳定游标纯逻辑并使 T029 通过
- [ ] T031 [US4] 在 `packages/cloudfunctions/contentList/index.ts` 实现动作稳定分页、taxonomy 过滤与中英文/别名搜索
- [ ] T032 [P] [US4] 在 `packages/cloudfunctions/contentGetById/index.ts` 返回完整分层动作详情
- [ ] T033 [US4] 在 `packages/miniprogram/utils/cloud-content.ts` 实现游标分页、条件重置与请求去旧结果
- [ ] T034 [US4] 在 `packages/miniprogram/pages/train/actions/index.ts` 实现分页加载、四维过滤、搜索及全库随机入口
- [ ] T035 [US4] 在 `packages/miniprogram/pages/train/actions/detail.ts` 实现中文详情、JPG/GIF、审核可见性、逐条署名和免责声明

## Phase 7: Polish & Release Gates

- [ ] T036 [P] 更新 `scripts/generate-content-images.py`，明确不再生成动作图且仅维护器材/食物第一方素材
- [ ] T037 [P] 在 `database/README.md` 补充人工 refresh、商业发布媒体替换和故障恢复手册
- [ ] T038 运行 shared 100% 覆盖、全仓测试、类型检查和 lint，并修复本功能引入问题
- [ ] T039 按 `specs/008-exercises-dataset-migration/quickstart.md` 在测试环境执行全链路并归档报告
- [ ] T040 在目标环境重复 dry-run、备份、apply、1324/2648/引用/署名门禁并保存 rollback 证据

## Dependencies

- Phase 2 阻塞全部用户故事
- US1 → US2 → US3；US4 依赖 US2 的 catalog/query 模型，可与 US3 后半段并行
- 目标环境发布依赖 US1–US4 和测试环境全链路通过

## Parallel Opportunities

- T006/T008、T015/T016/T017、T021/T023、T029/T032 可按 `[P]` 并行
- 数据翻译、enrichment 与媒体哈希可分片生成，但最终必须由单一完整性门禁汇总

## Implementation Strategy

先交付可离线重建的 vendor+catalog（US1/US2），再在测试环境完成安全迁移（US3），最后切换 1,324 规模查询与 UI（US4）。任何阶段不得以跳过备份、许可或引用门禁换取上线。
