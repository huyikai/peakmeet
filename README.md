# PeakMeet（顶峰相见）

微信小程序 + 静态 Web 官网的轻量化健身工具。Monorepo 由 pnpm workspace 管理。

## 目录

```text
packages/shared         # 共享纯逻辑（TS）
packages/miniprogram    # 微信小程序原生（WXML/WXSS/TS）
packages/web            # Astro SSG 官网
packages/cloudfunctions # 微信云函数（TS → 编译部署）
database/               # 云库规则与种子（见 database/README.md）
docs/constitution.md    # 项目宪章（强制依据）
```

治理源文件：`.specify/memory/constitution.md`（`docs/constitution.md` 为其同步副本）。

## 要求

- Node.js >= 20
- pnpm 9+

## 常用命令

```bash
pnpm install
pnpm lint
pnpm format
pnpm test
pnpm build          # shared + cloudfunctions + web（不含小程序）
pnpm sync:shared    # 构建 shared 并拷贝到小程序 utils/shared
pnpm db:sync        # 本地/CI 将 database/seeds upsert 到云库（需密钥，见 .env.example）
pnpm dev:web        # 官网本地预览
```

## 小程序

1. 用微信开发者工具打开目录 `packages/miniprogram`（不要打开仓库根目录）
2. **启用自动构建（必做一次）**：详情 → 本地设置 → 勾选「启用自定义处理命令」  
   - **编译前**：自动 `pnpm sync:shared`（保证 `utils/shared` 最新）  
   - **预览 / 上传前**：自动 `pnpm build:miniprogram`（sync + 页面 TS→JS）
3. 仓库 `project.config.json` 使用 AppID `wx07a6368636359893`，并在 `app.ts` 中 `wx.cloud.init` 到环境 `cloud1-d8ghafmni1c847e3f`。**Fork 者请替换为自己的 AppID / 环境 ID**；腾讯云密钥仅放 `.env.local`，勿提交。
4. 若钩子未启用或失败，仍可手动：`pnpm build:miniprogram`
5. **身体指数工具箱**：饮食 Tab →「身体指数工具箱」→ BMI / 基础代谢 / 体脂估算 / 腰臀比 / 1RM；冒烟步骤见 `specs/002-body-index-toolbox/quickstart.md`
6. **热量缺口计算**：饮食 Tab →「热量缺口计算」；冒烟步骤见 `specs/003-calorie-plan-page/quickstart.md`
7. **云库 / 种子**：创建集合并粘贴 `database/rules/`；执行 `pnpm db:sync` 或控制台 Upsert；云函数构建后上传 `contentList` / `contentGetById`。详见 `database/README.md` 与 `specs/006-cloud-db-seed/quickstart.md`

## 验收指引

- 工程基建：`specs/001-project-bootstrap/quickstart.md`
- 身体指数工具箱：`specs/002-body-index-toolbox/quickstart.md`
- 云数据库与种子：`specs/006-cloud-db-seed/quickstart.md`
