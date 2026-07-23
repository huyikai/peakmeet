# PeakMeet（顶峰相见）

微信小程序 + 静态 Web 官网的轻量化健身工具。Monorepo 由 pnpm workspace 管理。

## 目录

```text
packages/shared         # 共享纯逻辑（TS）
packages/miniprogram    # 微信小程序原生（WXML/WXSS/TS）
packages/web            # Astro SSG 官网
packages/cloudfunctions # 微信云函数（TS → 编译部署）
database/               # 种子数据（bootstrap 为空）
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
pnpm dev:web        # 官网本地预览
```

## 小程序

1. 用微信开发者工具打开目录 `packages/miniprogram`（不要打开仓库根目录）
2. **启用自动构建（必做一次）**：详情 → 本地设置 → 勾选「启用自定义处理命令」  
   - **编译前**：自动 `pnpm sync:shared`（保证 `utils/shared` 最新）  
   - **预览 / 上传前**：自动 `pnpm build:miniprogram`（sync + 页面 TS→JS）
3. 本地 AppID 写在已忽略的 `project.private.config.json`；仓库内 `project.config.json` 保持 `touristappid`
4. 若钩子未启用或失败，仍可手动：`pnpm build:miniprogram`
5. **身体指数工具箱**：饮食 Tab →「身体指数工具箱」→ BMI / 基础代谢 / 体脂估算 / 腰臀比 / 1RM；冒烟步骤见 `specs/002-body-index-toolbox/quickstart.md`
6. **热量缺口计算**：饮食 Tab →「热量缺口计算」；冒烟步骤见 `specs/003-calorie-plan-page/quickstart.md`

## 验收指引

- 工程基建：`specs/001-project-bootstrap/quickstart.md`
- 身体指数工具箱：`specs/002-body-index-toolbox/quickstart.md`
