# PeakMeet CloudBase 数据与内容

本目录是公共内容种子、集合安全规则和内容配图的权威源。详细规格与验收步骤见 [`specs/006-cloud-db-seed`](../specs/006-cloud-db-seed/)。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| [`rules/`](./rules/) | 7 个集合的 CloudBase 安全规则 |
| [`seeds/`](./seeds/) | actions、equipment、foods、training_plans 公共种子 |
| [`assets/content/`](./assets/content/) | 300 张内容配图和 `manifest.json` |
| [`assets/images/`](./assets/images/) | 内容缺省图等通用图片源 |

`user_collect`、`user_body_record` 和 `user_train_record` 只提供安全规则与共享类型，不提供用户数据种子。

## 快速同步

1. 从根目录复制环境变量模板并填写 CloudBase 凭据：

   ```bash
   cp .env.example .env.local
   ```

2. 校验种子与图片：

   ```bash
   pnpm db:validate-assets
   ```

3. 上传图片并同步公共内容：

   ```bash
   pnpm db:sync
   ```

同步命令会先校验并上传内容图片，将种子中的 `asset://content/...` 转换为目标环境的 `cloud://...` fileID，再按 `_id` Upsert 集合文档。该流程不会删除种子中未包含的云端文档。

## 环境变量与安全

| 变量 | 说明 |
| --- | --- |
| `CLOUDBASE_ENV_ID` | 目标 CloudBase 环境 ID |
| `CLOUDBASE_SECRET_ID` | 腾讯云 API SecretId |
| `CLOUDBASE_SECRET_KEY` | 腾讯云 API SecretKey |

- `.env.local` 已被 Git 忽略，禁止提交真实密钥。
- Fork 后应同时替换小程序 AppID、CloudBase 环境 ID 和本地凭据。
- 小程序环境配置位置见 [`packages/miniprogram/README.md`](../packages/miniprogram/README.md)。

## 内容种子与配图

正式配图均为项目自生成的品牌风格原创卡片，不使用外部版权素材：

- `actions/`：80 张动作图
- `equipment/`：20 张器材图
- `foods/`：200 张食物图
- `manifest.json`：记录种子 URI、本地路径、稳定云路径与 SHA-256

种子 `_id` 同时决定图片文件名。图片保持在数据库素材目录并上传 CloudBase，不打进小程序主包。详细约束见 [`assets/content/README.md`](./assets/content/README.md)。

需要重建数据与图片时运行：

```bash
pnpm db:generate-seeds
pnpm db:generate-images
pnpm db:validate-assets
```

缺省图源位于 [`assets/images/content-placeholder.png`](./assets/images/content-placeholder.png)，小程序运行时副本位于 [`packages/miniprogram/assets/images/content-placeholder.png`](../packages/miniprogram/assets/images/content-placeholder.png)。

## 云函数

```bash
pnpm --filter @peakmeet/cloudfunctions build
```

构建后使用微信开发者工具上传 `contentList` 和 `contentGetById`。函数职责、构建产物与部署方式见 [`packages/cloudfunctions/README.md`](../packages/cloudfunctions/README.md)。

## 控制台配置

### 安全规则

在 CloudBase 控制台中创建对应集合，再粘贴 [`rules/`](./rules/) 下的规则。

### 建议索引

按实际查询组合创建 `sortWeight`、`category`、`difficulty`、`primaryScene`、`goal`、`scene`、`type`、`recommendGrade` 索引。

### 手动降级

自动同步不可用时，可在云控制台进入“数据库 → 集合 → 导入”，并将冲突模式设置为 **Upsert**。手动导入前仍应先运行素材校验。

返回[项目总览](../README.md)。
