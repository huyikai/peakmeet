# PeakMeet CloudBase — schema, seeds, sync

本目录是公共内容的**权威源**与安全规则落盘处。设计文档见 `specs/006-cloud-db-seed/`。

## 布局

| Path | 说明 |
| ---- | ---- |
| `rules/*.json` | 七集合安全规则（控制台粘贴） |
| `seeds/*.json` | 公共四表种子（`_id` = slug） |
| `assets/content/` | 动作 80 + 器材 20 + 食物 200 张仓库配图及 manifest |
| 无 `user_*` 种子 | 用户表本版仅规则 + shared 类型 |

## 环境变量（本地 / CI）

复制 `.env.example` 为 `.env.local`（已 gitignore），填入：

- `CLOUDBASE_ENV_ID`（默认 `cloud1-d8ghafmni1c847e3f`）
- `CLOUDBASE_SECRET_ID` / `CLOUDBASE_SECRET_KEY`（腾讯云 API 密钥）

**禁止**将密钥提交仓库。Fork 者请替换为自己的 AppID / 环境 ID / 密钥。

## 同步

```bash
pnpm db:sync
```

命令先校验并上传 `database/assets/content/` 的 300 张配图，再把种子中的
`asset://content/...` 转换为目标环境的 `cloud://...` fileID，最后按
`_id` upsert；**不删除**种子未包含的云库文档。

降级：云控制台 → 数据库 → 集合 → 导入，冲突模式选 **Upsert**。

## 云函数

构建：`pnpm --filter @peakmeet/cloudfunctions build`  
部署：开发者工具上传 `contentList`、`contentGetById`（见 `packages/cloudfunctions/`）。

小程序 AppID：`wx07a6368636359893`；`wx.cloud.init` 环境见 `packages/miniprogram/app.ts`。

## 建议索引（控制台创建）

`sortWeight`、`category`、`difficulty`、`primaryScene`、`goal`、`scene`、`type`、`recommendGrade`（按查询需要）。

## 内容配图

高质量缺省图源文件：`database/assets/images/content-placeholder.png`。  
小程序运行时副本：`packages/miniprogram/assets/images/content-placeholder.png`。

动作、器材、食物的正式配图位于：

- `database/assets/content/actions/`：80 张
- `database/assets/content/equipment/`：20 张
- `database/assets/content/foods/`：200 张
- `database/assets/content/manifest.json`：本地源、云端路径、SHA-256

种子 `cover` 使用可移植的 `asset://content/...` URI；`pnpm db:sync`
上传图片后才转换成环境专属 CloudBase fileID。图片不打进小程序主包。

重新生成：

```bash
pnpm db:generate-seeds
pnpm db:generate-images
```

图片为项目自生成的品牌风格原创插画卡片，无外部版权素材。
