# Contract: seed sync CLI

**Feature**: 006-cloud-db-seed  
**Command**: `pnpm db:sync`  
**Entry**: `scripts/db-sync.mjs`（可调用 TS 编译逻辑或内联）

## Purpose

将 `database/seeds/*.json` upsert 到**当前凭证所属**云环境公共四表。不对小程序客户端暴露。

## Inputs

| Source | Path / Env |
| ------ | ---------- |
| Seeds | `database/seeds/actions.json` 等（JSON **数组**） |
| Images | `database/assets/content/manifest.json` + 300 张 PNG |
| Env ID | `CLOUDBASE_ENV_ID`（建议默认 `cloud1-d8ghafmni1c847e3f`，可覆盖） |
| Credentials | `CLOUDBASE_SECRET_ID` + `CLOUDBASE_SECRET_KEY`（或文档等价管理凭证） |

缺种子文件或 JSON 非法 → **非 0 退出**，打印可读错误，不继续后续集合。

## Behavior

1. 校验 manifest、图片存在性与 SHA-256；上传动作/器材/食物 300 张图到稳定 `content/...` 云路径
2. 将种子 `asset://content/...` cover 转成目标环境 `cloud://...` fileID
3. 仅处理公共四集合：`actions`, `equipment`, `training_plans`, `foods`
4. 每条记录必须含 `_id`（slug）；缺 `_id` → 该集合失败退出
5. 按 `_id` **upsert**（存在更新，不存在插入）
6. **不删除**云库中种子未包含的文档
7. 打印图片上传进度与每集合导入摘要

## Outputs

- Exit `0`：四集合均成功
- Exit `≠0`：任一集合失败；stderr 含原因
- MUST NOT 打印完整密钥

## Fallback

云控制台 → 数据库 → 集合 → 导入：同一 JSON，冲突模式选 **Upsert**（基于 `_id`）。见 [quickstart.md](../quickstart.md)。

## Security

- 凭证不入库；`.env.local` gitignore
- 禁止云函数 `dbSync` 对匿名/登录用户开放
