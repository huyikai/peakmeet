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

- `packages/shared/dist` 含 JS + `.d.ts`
- `packages/web` 静态构建成功
- `packages/cloudfunctions/hello` 产出可部署 JS  
  （见 [contracts/root-scripts.md](./contracts/root-scripts.md)、[contracts/cloudfunction-hello.md](./contracts/cloudfunction-hello.md)）

## 4. Sync shared → miniprogram

```bash
pnpm sync:shared
```

**Expect**: `packages/miniprogram/utils/shared/` 出现构建产物；小程序侧可引用 smoke export  
（见 [contracts/miniprogram-shell.md](./contracts/miniprogram-shell.md)）。

## 5. Miniprogram（开发者工具）

1. 打开微信开发者工具 → 导入 `packages/miniprogram`
2. 使用测试号 / 空 AppID（若提示）
3. 编译；依次点击 Tab：首页、训练、饮食、我的

**Expect**: 编译无骨架阻断；四 Tab 可切换；至少一处可验证 shared 同步引用（控制台或页面）。

## 6. Web 本地预览

```bash
pnpm --filter @peakmeet/web dev
# 若包名不同，使用 plan 中实际 filter 名
```

**Expect**:

- 1 分钟内可访问
- 打开 `/`、`/features`、`/tools`、`/about`
- `/tools` 展示 shared smoke 返回值（非真实计算器）  
  （见 [contracts/web-shell.md](./contracts/web-shell.md)）

## 7. Constitution 文档

```bash
# 目视或 diff
diff -u .specify/memory/constitution.md docs/constitution.md
```

**Expect**: `docs/constitution.md` 存在且与源宪章内容一致（允许文首增加简短来源说明行）；版本信息可读。

## 8. Structure sanity

**Expect** 顶层可见：`packages/`、`database/`、`docs/`、`pnpm-workspace.yaml`、根 `package.json`；无未约定业务顶层目录。`scripts/` 仅含工程同步脚本。

## Failure hints

| Symptom                   | Check                                              |
| ------------------------- | -------------------------------------------------- |
| `pnpm test` 无用例失败    | shared `__tests__` 是否存在且纳入 vitest workspace |
| `pnpm build` 因小程序失败 | 根 build 不应依赖小程序；检查 scripts              |
| Web 无法解析 shared       | workspace 协议与 shared `exports`/`main`/`types`   |
| 同步后小程序找不到模块    | sync 目标路径与页面 import 路径是否一致            |
| 云函数 build 要登录       | 不应需要密钥；检查是否误调部署命令                 |

## Definition of done (quick)

全部步骤 1–7 按 Expect 通过，即本功能 quickstart 验收完成；细节对齐 [spec.md](./spec.md) SC-001–SC-011。
