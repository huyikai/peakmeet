# PeakMeet CloudBase 数据与内容

本目录是公共内容 catalog、外部固定快照、集合安全规则和内容配图的权威源。动作库迁移规格见 [`specs/008-exercises-dataset-migration`](../specs/008-exercises-dataset-migration/)。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| [`catalog/`](./catalog/) | CloudBase 同步的唯一结构化权威源（actions/equipment/foods/training_plans） |
| [`vendor/exercises-dataset/`](./vendor/exercises-dataset/) | 固定 commit 的外部动作数据与 Gym visual 媒体快照 + `source.lock.json` |
| [`enrichment/`](./enrichment/) | 中文名与规则 enrichment 的可审计产物 |
| [`reports/`](./reports/) | 计划/收藏迁移报告 |
| [`rules/`](./rules/) | 7 个集合的 CloudBase 安全规则 |
| [`assets/content/`](./assets/content/) | 第一方器材/食物配图与动态 `manifest.json` |
| [`seeds/`](./seeds/) | **已退役**历史种子，仅作迁移对照，不再作为部署输入 |

`user_collect`、`user_body_record` 和 `user_train_record` 只提供安全规则与共享类型，不提供用户数据种子。

## 快速同步

1. 复制并填写凭据：

   ```bash
   cp .env.example .env.local
   ```

2. 从本地 vendor 重建 catalog（不访问网络）：

   ```bash
   pnpm db:build-source-lock
   pnpm db:build-catalog
   pnpm db:build-manifest
   pnpm db:validate-assets
   ```

3. 先 dry-run，再正式同步：

   ```bash
   DB_SYNC_DRY_RUN=1 pnpm db:sync
   pnpm db:sync
   ```

同步只读 `database/catalog/` 与本地 manifest，把 `vendor://` / `asset://` 转成目标环境 `cloud://` fileID。`DB_SYNC_REPLACE=1` 才允许替换残留动作/器材。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `CLOUDBASE_ENV_ID` | 目标 CloudBase 环境 ID |
| `CLOUDBASE_SECRET_ID` | 腾讯云 API SecretId |
| `CLOUDBASE_SECRET_KEY` | 腾讯云 API SecretKey |
| `DB_SYNC_DRY_RUN` | `1` 时只校验/备份路径，不写云 |
| `DB_SYNC_SKIP_ASSETS` | `1` 时跳过重新上传，仅解析已有 fileID |
| `DB_SYNC_REPLACE` | `1` 时启用正式替换残留策略 |

## 媒体与版权

- 动作 JPG/GIF：来自固定 vendor 快照，标记 `provisional_third_party`，必须逐条署名 `© Gym visual — https://gymvisual.com/`。
- 器材/食物封面：项目自有第一方素材，可由 `pnpm db:generate-images` 重建。
- 首次商业发布前必须替换 Gym visual 媒体或取得书面授权（宪章 v1.3.0 临时例外）。

## 云函数

```bash
pnpm --filter @peakmeet/cloudfunctions build
```

动作列表已支持分页、taxonomy 过滤和搜索；详情按 ID 返回完整记录。

返回[项目总览](../README.md)。
