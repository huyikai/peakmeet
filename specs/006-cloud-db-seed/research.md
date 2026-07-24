# Research: 006-cloud-db-seed

**Date**: 2026-07-24  
**Spec**: [spec.md](./spec.md)

## R1. 公共内容读路径（直读 vs 仅云函数）

- **Decision**: **客户端直读 + `contentList` / `contentGetById` 并存**。公共四表安全规则 `read: true, write: false`；业务页面可 `db.collection().where().get()`；云函数用于统一信封、白名单过滤与后续复杂读。
- **Rationale**: 微信[数据库安全规则](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloud/guide/database/security-rules)专为前端直连设计；官方示例「公有读、写禁前端」即此模式；社区业务文档亦建议多数 CRUD 放小程序端以省云函数资源。澄清锁定 B。
- **Alternatives considered**: 仅云函数可读 — 与官方习惯不符且增加 GBs 消耗；仅直读不交付 CF — 违反本版 FR-009。

## R2. 稳定业务 ID 与 upsert 键

- **Decision**: 人类可读 **slug**；种子 JSON 中 **`_id` = slug**（同集合唯一）。同步按 `_id` upsert。关联字段（替代动作、关联动作）存 slug 字符串数组。
- **Rationale**: CloudBase 导入 Upsert 以 `_id` 判定存在性；slug 作 `_id` 可开源 diff、免额外业务键索引。澄清锁定 A。
- **Alternatives considered**: 独立 `slug` + 随机 `_id` — 需自定义查找再 update，同步更脆；UUID — 可读性差。

## R3. 重复同步策略

- **Decision**: **Upsert only**；种子删减**不**删除云库残留文档。同步脚本按集合串行：读本地数组 → 对每条 `set`/`update`（管理端）按 `_id`。
- **Rationale**: 澄清锁定；降低误删风险；开源 fork 环境可累积实验数据。
- **Alternatives considered**: 先清空再导入 — 危险；upsert + 删孤儿 — 本版不做。

## R4. 本地/CI 同步实现

- **Decision**:
  1. 权威源：`database/seeds/{actions,equipment,training_plans,foods}.json`（JSON 数组）
  2. 命令：`pnpm db:sync` → `scripts/db-sync.mjs`
  3. 运行时：`@cloudbase/manager-node`（或等价 CloudBase 管理 API）使用环境变量：
     - `CLOUDBASE_ENV_ID`（默认文档值，可覆盖）
     - `CLOUDBASE_SECRET_ID` / `CLOUDBASE_SECRET_KEY`（腾讯云 API 密钥）或微信云开发文档约定的登录态（以实现时官方推荐为准）
  4. 密钥仅 `.env.local` / CI secrets；MUST NOT 提交仓库
  5. 控制台「导入 + Upsert」作为文档化降级路径（同一 seed 文件）
- **Rationale**: 满足「本地/CI、非客户端刷库」；不引入 CMS；开源友好。
- **Alternatives considered**: 可被任意用户调用的 sync 云函数 — 否决；仅控制台手工 — 不可 CI、难复现。

## R5. 安全规则落盘与应用

- **Decision**: 规则 JSON 存 `database/rules/*.json`；README / quickstart 说明在云控制台粘贴或用 CLI/控制台导入。公共四表：`{"read":true,"write":false}`；用户三表：`openid == auth.openid` 读写（字段名 `openid`，查询用 `{openid}`）。
- **Rationale**: 规则可版本管理；与澄清及官方安全规则一致。
- **Alternatives considered**: 仅基础四档权限 — 粒度与文档一致性较差，宪章倾向显式规则。

## R6. 云函数形态与白名单

- **Decision**:
  - 两个函数：`contentList`、`contentGetById`（TS → CommonJS 编译后部署）
  - 公共集合白名单：`actions` | `equipment` | `training_plans` | `foods`
  - list：`collection` + `limit`（默认 20，最大 100）+ `skip` + 可选 `filter`（仅 `filters.ts` 白名单字段的等值）
  - getById：`collection` + `id`（即 `_id`/slug）
  - 统一信封：`{ ok: true, data } | { ok: false, code, message }`
  - **不**开放用户三表给这两个函数（用户数据走直读+未来写路径）
- **Rationale**: 澄清 list=分页+白名单等值过滤；降低任意查询风险。
- **Alternatives considered**: 单函数多 action — 亦可，但两函数更清晰；开放任意 where — 否决。

## R7. shared 内容模块边界

- **Decision**: `packages/shared/src/content/` 导出：实体接口、集合常量、过滤白名单、`validateListQuery` / `validateGetByIdQuery`、`DEFAULT_CONTENT_COVER`（相对小程序路径字符串）。禁止 `wx` / 云 SDK。
- **Rationale**: Shared Logic First + TDD；云函数与小程序共用校验。
- **Alternatives considered**: 类型只写在云函数 — 双端漂移。

## R8. 缺省封面

- **Decision**: 统一本地资源 `packages/miniprogram/assets/images/content-placeholder.png`；shared 常量指向该相对路径（如 `/assets/images/content-placeholder.png`）；`resolveContentCover(cover?)` 空则返回常量。
- **Rationale**: 澄清统一一张；本版不传云存储图。
- **Alternatives considered**: 按类型多图 — 成本高；隐藏图片区 — 列表观感差。

## R8b. 正式内容配图

- **Decision**: 动作 80、器材 20、食物 200 张逐条原创插画卡片存于 `database/assets/content/`；manifest 记录 SHA-256 与稳定云路径。种子写可移植 `asset://content/...`，`pnpm db:sync` 校验、上传 CloudBase 云存储并在导入前替换为 `cloud://...` fileID。缺省图不复制到 database。
- **Rationale**: 用户要求正式内容图入仓库；避免 300 张图片挤占小程序主包；确保开源 fork 可复现并上传自己的云环境。
- **Alternatives considered**: 图片直接打进小程序 — 主包体积风险；外链第三方图库 — 版权与失链风险；仓库硬编码某一环境 fileID — fork 不可移植。

## R9. 小程序云初始化

- **Decision**: `project.config.json` `appid` = `wx07a6368636359893`；`app.ts` `onLaunch` 调用 `wx.cloud.init({ env: 'cloud1-d8ghafmni1c847e3f', traceUser: true })`（需在详情开启云开发）。README 说明 fork 替换 AppID/env；`touristappid` 移除。
- **Rationale**: FR-012；无 init 无法验收直读/CF。
- **Alternatives considered**: 延迟到内容 UI feature — 本版明确包含。

## R10. 种子内容生产与合规

- **Decision**: 仓库内 AI/人工生成结构化 JSON；中文科普向；强制自检：无「治疗/康复/治病/治愈」等；计划与动作含简短免责或依赖全局声明约定；功能性计划 `category: "functional"`（或枚举值见 data-model）至少 1 条。
- **Rationale**: FR-013 + 合规红线。
- **Alternatives considered**: 外链 CMS — 否决；空种子只 schema — 不满足规模 SC。

## R11. 云函数工程结构

- **Decision**: 在既有 `packages/cloudfunctions` 下新增 `contentList/`、`contentGetById/`；扩展 `tsconfig`/`build` 编译多入口；依赖 `wx-server-sdk`；保留或替换 `hello`（不阻塞）。部署方式：开发者工具上传或文档化 CLI，quickstart 写清。
- **Rationale**: 宪章 monorepo 路径；TS 优先。
- **Alternatives considered**: 根目录 `cloudfunctions` — 违目录约定。

## R12. 用户表本版范围

- **Decision**: 仅 schema + shared 类型 + 安全规则；**无**种子、**无**写云函数；客户端未来可直写（规则允许本人）。
- **Rationale**: 澄清锁定；避免半成品写 API。
- **Alternatives considered**: 预写 CF — 越界。
