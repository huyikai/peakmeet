# Research: exercises-dataset 权威数据迁移

**Date**: 2026-07-24  
**Feature**: 008-exercises-dataset-migration

## 1. 来源与更新策略

**Decision**: 固定提交 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`，保存 tree/blob、逐文件 SHA-256、LICENSE、NOTICE、数据和媒体；仅人工 refresh 可访问上游。  
**Rationale**: 可复现、可离线验证，避免构建与同步隐式追随远端。  
**Alternatives considered**: 运行时或 CI 拉 latest（不可复现）；只存 URL/commit 不存媒体（离线与再现性不足）。

## 2. 权威源与派生层

**Decision**: `vendor` 是不可变来源快照，`catalog` 是唯一部署权威源；CloudBase 只能由 catalog 单向同步。raw、localized/transformed、enrichment 分层。  
**Rationale**: 同时保留上游事实、可审计转换与可替换的派生内容。  
**Alternatives considered**: 直接编辑 vendor（破坏追溯）；云端作为编辑源（引入双向漂移/CMS）。

## 3. 稳定 ID

**Decision**: `_id = exercise_dataset_<sourceId>`；旧动作通过单独映射表迁移，不复用旧 slug。  
**Rationale**: 来源命名空间避免碰撞，刷新、环境迁移与媒体替换时保持引用稳定。  
**Alternatives considered**: 中文/英文名 slug（改名会漂移）；随机 ID（无法确定性重建）。

## 4. 中文化与 enrichment

**Decision**: 中文名称和步骤为版本化 localized 转换；难度、目标、场景、要点、避坑、替代关系等非上游事实进入 enrichment，并带规则/模型版本与审核状态。  
**Rationale**: 满足中文体验，同时不伪造来源字段。  
**Alternatives considered**: 覆盖原始字段（不可审计）；未标记 AI 内容直接作为事实（来源混淆）。

## 5. 媒体许可边界

**Decision**: 按宪章 v1.3.0 临时使用原 180×180 JPG/GIF；每条记录和详情显示 `© Gym visual — https://gymvisual.com/`，状态为 `provisional_third_party`。  
**Rationale**: 这是项目所有者已记录的临时决定，且保留最小必要限制与替换门禁。  
**Alternatives considered**: 声称上游许可证覆盖媒体（无依据）；不署名（违反宪章）；立即生成自有媒体（当前范围与成本不符）。

## 6. 旧内容与引用迁移

**Decision**: 旧 80 动作通过标准化名称精确匹配优先，歧义进入人工裁决；计划引用在 catalog 中重写，收藏在云迁移阶段改写。未匹配记录保留并阻断清理。  
**Rationale**: 防止用户数据和计划语义静默丢失。  
**Alternatives considered**: 删除后重建收藏（数据损失）；模糊最高分自动接受（误映射风险）。

## 7. 同步替换语义

**Decision**: 008 为一次受控权威源迁移，顺序为 dry-run → 备份 → 上传媒体 → 替换公共集合 → 改写引用 → 清理旧媒体/残留 → 完整性验证；失败保留备份并不发布。  
**Rationale**: 旧 006 的“只 upsert、不删除残留”会让旧 80 动作长期混入新 catalog。  
**Alternatives considered**: 永久 upsert（残留且数量不可验证）；先清空后备份（不可恢复）。

## 8. 查询策略

**Decision**: 服务端/云端查询提供稳定游标分页、白名单 taxonomy 过滤和标准化中英文/别名搜索；列表摘要、详情全量分离。  
**Rationale**: 1,324 条不适合 `limit=100` 后全量内存筛选；游标比分页 offset 更稳定。  
**Alternatives considered**: 客户端只拉前 100 条（不完整）；一次拉全库（慢且昂贵）；任意 where/正则（安全与可维护性差）。

## 9. 器材关系

**Decision**: 从固定来源枚举归一 28 类原始器材值，转换为稳定器材实体；自重映射为空引用，动作保存正向 equipmentIds，不维护超长反向 ID 数组。  
**Rationale**: 防止反向数组超限和双向不同步，保留 raw 值以处理歧义。  
**Alternatives considered**: 器材保留旧 20 条（关系不完整）；把 raw 字符串直接当展示分类（中文与 taxonomy 不稳定）。

所有研究项已有明确决策，无未解决澄清项。
