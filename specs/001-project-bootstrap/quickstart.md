# Quickstart: 001-project-bootstrap

**Purpose**: 端到端验证工程底座是否满足 spec 验收（非实现教程）。  
**Related**: [plan.md](./plan.md) · [contracts/](./contracts/) · [data-model.md](./data-model.md)

## Prerequisites

- Node.js 20+
- pnpm 9+
- 微信开发者工具（验证小程序）
- 已克隆本仓库并位于仓库根目录

## 1. Install

```bash
pnpm install
```

**Expect**: workspace 依赖安装成功，无栈外重型框架被引入（抽查 `package.json` / lockfile）。

## 2. Lint / Format / Test

```bash
pnpm lint
pnpm format
pnpm test
```

**Expect**:

- lint/format 因配置齐全可执行
- `pnpm test` 在 1 分钟内结束，至少 1 条 `@peakmeet/shared` 冒烟用例通过  
  （见 [contracts/shared-api.md](./contracts/shared-api.md)）

## 3. Root build（不含小程序）

```bash
pnpm build
```

**Expect**（约 2 分钟内）:

- `packages/shared/dist` 含 ESM JS + `.d.ts`
- `packages/shared/dist-cjs` 含 CJS JS（供小程序 sync）
- `packages/web` 静态构建成功
- `packages/cloudfunctions/hello` 产出可部署 JS  
  （见 [contracts/root-scripts.md](./contracts/root-scripts.md)、[contracts/cloudfunction-hello.md](./contracts/cloudfunction-hello.md)、[contracts/shared-api.md](./contracts/shared-api.md)）

## 4. 小程序构建（sync shared + 编译 TS→JS）

```bash
pnpm build:miniprogram
```

等价于：`pnpm sync:shared` → `pnpm --filter @peakmeet/miniprogram build`。

**Expect**:

- `packages/miniprogram/utils/shared/` 出现 CJS 构建产物 + `index.d.ts`
- 存在 `packages/miniprogram/app.js` 与各 Tab 页 `pages/*/index.js`  
  （微信开发者工具 / 自动预览按 `app.json` 查找 `.js`，仅有 `.ts` 会报「未找到 index.js」）  
  （见 [contracts/miniprogram-shell.md](./contracts/miniprogram-shell.md)）

## 5. Miniprogram（开发者工具）

1. 先完成步骤 4（`pnpm build:miniprogram`）
2. 微信开发者工具 → **仅导入** `packages/miniprogram`（不要选仓库根目录）
3. 真实 AppID 放在本地 `project.private.config.json`（已 gitignore）；仓库内 `project.config.json` 保持 `touristappid`
4. 建议：清缓存 → 全部清除 → 再编译 / 预览
5. 依次点击 Tab：首页、训练、饮食、我的

**Expect**: 无「未找到 pages/*/index.js」类阻断；四 Tab 可切换；首页可展示或打印 shared smoke（`peakmeet`）。

改动页面 `.ts` 后须重新执行 `pnpm --filter @peakmeet/miniprogram build`（或完整 `pnpm build:miniprogram`）。

## 6. Web 本地预览

```bash
pnpm dev:web
# 或 pnpm --filter @peakmeet/web dev
```

**Expect**:

- 1 分钟内可访问
- 打开 `/`、`/features`、`/tools`、`/about`
- `/tools` 展示 shared smoke 返回值（非真实计算器）  
  （见 [contracts/web-shell.md](./contracts/web-shell.md)）

## 7. Constitution 文档

```bash
# 目视或 diff（文首允许一行来源说明）
diff -u .specify/memory/constitution.md docs/constitution.md
```

**Expect**: `docs/constitution.md` 存在且与源宪章正文一致；版本信息可读。

## 8. Structure sanity

**Expect** 顶层可见：`packages/`、`database/`、`docs/`、`pnpm-workspace.yaml`、根 `package.json`；无未约定业务顶层目录。`scripts/` 仅含工程同步脚本。

## Failure hints

| Symptom | Check |
| ------- | ----- |
| `pnpm test` 无用例 / 失败 | shared `__tests__` 是否存在且纳入 vitest workspace |
| `pnpm build` 因小程序失败 | 根 build 不应依赖小程序；检查 scripts |
| Web 无法解析 shared | 先 `pnpm --filter @peakmeet/shared build`；检查 `dist` ESM `exports` |
| 同步后小程序找不到模块 | 是否跑过 `sync:shared`；import 路径是否为 `utils/shared/index` |
| `未找到 pages/home/index.js` | 未执行 `build:miniprogram`；或打开了错误目录（必须是 `packages/miniprogram`） |
| GitHub Secret Scanning 报 AppID | 勿把真实 AppID 写入已跟踪的 `project.config.json`；用 private 配置 |
| 云函数 build 要登录 | 不应需要密钥；检查是否误调部署命令 |

## Definition of done (quick)

全部步骤 1–7 按 Expect 通过，即本功能 quickstart 验收完成；细节对齐 [spec.md](./spec.md) SC-001–SC-011。
