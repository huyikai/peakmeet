# Quickstart: 008 exercises-dataset migration

**Goal**: 在测试环境证明固定来源、catalog、引用迁移、媒体、分页查询与安全同步满足门禁。

## Prerequisites

- Node.js ≥20、pnpm、CloudBase 测试环境与仅本地管理凭证
- 阅读 [source-lock](./contracts/source-lock.md)、[catalog-sync](./contracts/catalog-sync.md)、[content-query](./contracts/content-query.md)
- 禁止先在生产环境尝试；不要提交密钥

## 1. 验证固定快照

```bash
pnpm db:validate
```

期望：commit 为 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`；动作/JPG/GIF 分别为 1324；许可、NOTICE、Schema、180×180 和全部 SHA-256 通过。命令不得访问网络。

## 2. 生成并验证 catalog

```bash
pnpm db:build-catalog
pnpm --filter @peakmeet/shared test
```

期望：
- actions 恰为 1324，所有 `_id` 以 `exercise_dataset_` 开头且唯一
- 中文名、中文步骤 100% 覆盖
- source/raw、localized/taxonomy、enrichment、media 分层
- 2,648 个媒体 slot 与 vendor 文件一一对应
- plans、equipment、substitutes 引用完整；无 `asset://` 或裸 GitHub URL

## 3. 审阅迁移报告

检查旧 80 动作映射、训练计划重写与收藏迁移预览。任何 `ambiguous` / `unmatched` 计划引用必须人工处理；未匹配收藏必须保留原记录并进入阻断报告，不能删除。

## 4. 测试环境 dry-run 与备份

```bash
export CLOUDBASE_ENV_ID=<test-env>
export CLOUDBASE_SECRET_ID=...
export CLOUDBASE_SECRET_KEY=...
pnpm db:sync -- --dry-run
```

核对环境、catalog digest、集合/媒体变更、残留清理与引用报告。随后按命令帮助创建并验证备份；没有成功 dry-run 和备份不得执行 apply。

## 5. 测试环境 apply

```bash
pnpm db:sync -- --apply
```

期望完成态：actions=1324、JPG=1324、GIF=1324；无旧 80 动作、旧动作媒体、catalog 外动作残留；计划/收藏引用报告无静默丢失；每条动作都有 Gym visual 临时权利状态和署名。

## 6. 查询与小程序验收

1. 以 20 条页长遍历全部动作：总数 1324，无重漏
2. 分别及组合验证部位、器材、难度、目标过滤与中英文/别名搜索
3. 快速切换条件：旧请求结果不覆盖新结果
4. 详情显示中文名、英文别名、中文步骤、JPG、GIF、`© Gym visual — https://gymvisual.com/` 和免责声明
5. 未审核 enrichment 区块隐藏
6. “今日练什么”可命中当前页之外动作

## 7. 目标环境发布门禁

重复 dry-run、备份、apply 和完整性验证；保存 runId 与报告。任一门禁失败立即停止，使用报告中的 rollback 命令恢复。首次商业化前必须替换 Gym visual 媒体或取得书面授权。
