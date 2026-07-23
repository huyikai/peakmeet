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

1. 执行 `pnpm sync:shared`
2. 用微信开发者工具打开 `packages/miniprogram`
3. 可使用测试号 / `touristappid`

## 验收指引

见 `specs/001-project-bootstrap/quickstart.md`。
