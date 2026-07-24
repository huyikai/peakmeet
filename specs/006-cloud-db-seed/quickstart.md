# Quickstart: 006-cloud-db-seed

**Date**: 2026-07-24  
**Goal**: 验证七集合规则、种子 upsert、shared 校验、云函数读、小程序 AppID + 云 init、缺省封面

## Prerequisites

- Node.js ≥ 20，pnpm 9+
- 微信开发者工具；云环境 `cloud1-d8ghafmni1c847e3f`（或自有环境）
- 腾讯云 API 密钥（仅本地）：`CLOUDBASE_SECRET_ID` / `CLOUDBASE_SECRET_KEY`
- 阅读：[spec.md](./spec.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)

## 1. Shared 测试

```bash
pnpm --filter @peakmeet/shared test
```

**期望**：`content-*` 用例全绿（白名单、分页、过滤、缺省封面）。

## 2. 配置小程序云

1. `packages/miniprogram/project.config.json`：`appid` = `wx07a6368636359893`
2. 开发者工具打开该目录，开通/关联云开发环境 `cloud1-d8ghafmni1c847e3f`
3. 冷启动后 `app.ts` 已 `wx.cloud.init`（无报错）

## 3. 创建集合并应用安全规则

在云控制台创建七集合，将 `database/rules/*.json` 粘贴到对应集合权限（自定义安全规则）。

**抽测**：小程序调试器对 `actions` `add` 应失败；`get` 在有数据后应成功。

## 4. 同步种子

先确认仓库内容图完整（80+20+200）：

```bash
pnpm db:generate-images
```

```bash
# 示例：导出环境变量后
export CLOUDBASE_ENV_ID=cloud1-d8ghafmni1c847e3f
export CLOUDBASE_SECRET_ID=...
export CLOUDBASE_SECRET_KEY=...
pnpm db:sync
```

**期望**：先上传 300 张内容图并将 `asset://` 转成 CloudBase fileID；随后 actions≥80、equipment≥20、training_plans=6、foods≥200；再跑一次同 `_id` 不翻倍。

**降级**：控制台导入同 JSON，冲突模式 Upsert。

## 5. 云函数

```bash
pnpm --filter @peakmeet/cloudfunctions build
```

上传部署 `contentList`、`contentGetById`。调试调用：

- `contentList` `{ collection: "foods", limit: 5, filter: { category: "protein" } }` → `ok: true`
- 非法集合 → `INVALID_COLLECTION`
- `contentGetById` 已知 slug → item；假 id → `NOT_FOUND`

## 6. 直读冒烟

小程序页面临时：

```js
const db = wx.cloud.database()
db.collection('actions').limit(3).get()
```

**期望**：有数据；写操作失败。

## 7. 缺省封面

抽查动作、器材、食物各一条：`cover` 为可访问的 CloudBase fileID。再用一条空 cover 测试 `resolveContentCover`，应得到 `/assets/images/content-placeholder.png` 且图片可显示。

## 8. 合规抽检

随机抽种子文案：无治疗/康复/治病/治愈等医疗承诺；计划中存在 `category: "functional"`。

## Fork 者注意

替换 AppID、环境 ID、密钥为自己的；**勿**提交密钥；种子可直接复用。
