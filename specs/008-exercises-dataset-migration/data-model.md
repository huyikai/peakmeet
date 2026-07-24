# Data Model: 008-exercises-dataset-migration

**Date**: 2026-07-24  
**Related**: [spec.md](./spec.md)、[contracts/](./contracts/)

## Global Conventions

- 动作 `_id`: `exercise_dataset_<sourceId>`；全环境稳定、集合内唯一
- 所有部署记录带 `schemaVersion`、`source` 和 `updatedAt`
- 原始字段不可被 localized、taxonomy 或 enrichment 覆盖
- catalog 中不得出现 `asset://`、裸 GitHub URL 或本机绝对路径

## SourceLock

| Field | Type | Rule |
| --- | --- | --- |
| `repository` | string | 固定来源仓库 |
| `commit` | string | 必须为 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd` |
| `tree` / `dataBlob` | string | 固定对象标识 |
| `counts` | object | exercises=1324, jpg=1324, gif=1324 |
| `files` | LockedFile[] | 相对路径、字节数、SHA-256、类别 |
| `licenseFiles` | string[] | LICENSE 与 NOTICE 路径 |
| `refreshedAt` | string | 人工刷新时间 |

`SourceLock` 为不可变输入；任一字段不符即不得生成 catalog。

## CatalogAction (`actions`)

| Layer / Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | string | yes | `exercise_dataset_<sourceId>` |
| `schemaVersion` | string | yes | catalog schema |
| `source` | ActionSource | yes | 来源、commit、sourceId、raw |
| `localized` | ActionLocalized | yes | 中文名、中文步骤、英文别名 |
| `taxonomy` | ActionTaxonomy | yes | 标准化部位/肌群/器材/场景 |
| `media` | ActionMedia | yes | JPG/GIF 云 fileID、原路径、哈希、许可、署名 |
| `enrichment` | ActionEnrichment | yes | 派生难度/目标/cues/mistakes/substitutes |
| `sortKey` | string | yes | 稳定分页键，建议 `_id` |
| `updatedAt` | string | yes | catalog 生成时间 |

### ActionSource

- `dataset`: `"hasaneyldrm/exercises-dataset"`
- `commit`: 固定 commit
- `sourceId`: 原始 ID
- `raw`: 原始记录的完整、未覆盖副本
- `rawHash`: 规范化记录 SHA-256

### ActionLocalized

- `nameZh`: 非空中文展示名
- `nameEn`: 原始英文名
- `aliases`: 至少含英文名，可含规范化别名
- `stepsZh`: 与来源步骤语义对应的非空中文字符串数组
- `localeVersion`: 术语表/翻译版本
- `reviewStatus`: `generated | reviewed | rejected`

### ActionTaxonomy

- `bodyParts`, `muscleGroups`, `targets`: 标准化枚举数组
- `equipmentIds`: 稳定器材 ID 数组；自重为空
- `scenes`: 标准场景数组
- `rawMappings`: raw 值到标准值的转换证据
- `mappingVersion`: 确定性规则版本

### ActionMedia

- `cover`: MediaSlot（JPG）
- `demo`: MediaSlot（GIF）
- 每个 `MediaSlot`: `vendorPath`, `sha256`, `width=180`, `height=180`, `cloudFileId`
- `rightsStatus`: `"provisional_third_party"`
- `creditText`: `"© Gym visual — https://gymvisual.com/"`
- `aiTrainingAllowed`: `false`
- `replacementRequiredBeforeCommercialUse`: `true`

### ActionEnrichment

- 可选 `difficulty`, `goals`, `cuesZh`, `mistakesZh`, `substituteIds`
- `generator`: `rules | model | human`
- `generatorVersion`, `generatedAt`, `reviewStatus`
- `reviewStatus !== reviewed` 的区块不得作为已审核内容展示

## CatalogEquipment (`equipment`)

| Field | Type | Rule |
| --- | --- | --- |
| `_id` | string | 稳定 taxonomy ID |
| `nameZh` | string | 中文名 |
| `sourceValues` | string[] | 28 类原始枚举值之一或合并证据 |
| `category` / `scenes` | enum/array | PeakMeet taxonomy |
| `mappingVersion` | string | 转换规则版本 |

动作只保存 `equipmentIds` 正向引用；不持久化全量 `relatedActionIds`。

## ActionIdMapping

| Field | Type | Rule |
| --- | --- | --- |
| `legacyId` | string | 旧 80 动作 ID |
| `newId` | string \| null | 新稳定 ID |
| `method` | enum | exact_normalized_name / reviewed / unresolved |
| `evidence` | object | 原名、候选、评分/备注 |
| `status` | enum | mapped / ambiguous / unmatched |
| `reviewedBy` / `reviewedAt` | optional | 人工裁决证据 |

只有 `mapped` 可自动改写引用；其余必须保留原记录并进入阻断报告。

## TrainingPlan / UserCollect Migration

- `TrainingPlan.days.items.actionId` 必须引用现存 `CatalogAction._id`
- `UserCollect(type=action).targetId` 映射成功后改为新 ID
- 未映射收藏原记录保持不变并标记报告，不得删除
- 迁移前后均记录总数、已映射数、未映射数与样本哈希

## SyncRun & BackupManifest

`SyncRun` 状态：

```text
planned → dry_run_passed → backup_completed → applying
→ validating → completed
                 ↘ failed → rollback_ready → rolled_back
```

正式进入 `applying` 必须同时具有成功 dry-run 和可验证备份。`completed` 必须满足全部门禁。

## ContentQuery

- `cursor?: string`, `limit: 1..50`
- filters: `bodyPart`, `equipmentId`, `difficulty`, `goal`
- `keyword`: 规范化中文名、英文名、aliases 搜索
- 排序键固定；响应含 `items`, `nextCursor`, `hasMore`
- 列表 `items` 仅含 `_id`, `nameZh`, `nameEn`, taxonomy 摘要、JPG、审核可见标签
- 详情返回完整 `CatalogAction`

## Integrity Rules

1. actions=1324、JPG slots=1324、GIF slots=1324
2. `_id`、sourceId、媒体路径与哈希均唯一且引用存在
3. `nameZh`、`stepsZh` 覆盖率 100%
4. 所有 equipmentIds、substituteIds、计划和已迁移收藏引用有效
5. 每条媒体均有临时权利状态与逐条署名
6. CloudBase 完成态无旧动作残留、旧动作媒体、`asset://` 或裸 GitHub URL
