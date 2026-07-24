# PeakMeet（顶峰相见）

面向微信小程序和静态 Web 的轻量化健身工具，提供训练计时、身体指标计算、热量规划和公共健身内容。项目采用 pnpm workspace 管理 Monorepo。

![PeakMeet Fitness Brand Identity Board](./docs/brand/logo/brand-board.svg)

## 技术组成

- **微信小程序**：原生 WXML / WXSS / TypeScript
- **Web 官网**：Astro 静态站点
- **共享逻辑**：TypeScript ESM + CommonJS 双产物
- **云端能力**：微信 CloudBase 数据库与云函数

## 快速开始

要求 Node.js 20+、pnpm 9.15。

```bash
pnpm install
pnpm test
pnpm build
pnpm dev:web
```

微信小程序需使用开发者工具打开 [`packages/miniprogram`](./packages/miniprogram/README.md)，不要直接打开仓库根目录。

## 仓库结构

```text
packages/shared         # 跨端共享的纯逻辑与类型
packages/miniprogram    # 微信小程序
packages/web            # Astro 静态官网
packages/cloudfunctions # CloudBase 云函数
database                # 云库规则、种子和内容配图
docs                     # 品牌规范与项目宪章
specs                    # 功能规格、计划和验收指引
```

## 常用命令

### 质量检查

| 命令 | 说明 |
| --- | --- |
| `pnpm lint` | 检查全仓 ESLint 规则 |
| `pnpm format` | 使用 Prettier 格式化全仓文件 |
| `pnpm format:check` | 只检查格式，不写入文件 |
| `pnpm test` | 运行 Vitest workspace；当前覆盖共享逻辑测试 |

### 构建与开发

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 构建 shared、cloudfunctions 和 web，不含小程序 |
| `pnpm build:miniprogram` | 同步 shared 并编译小程序 TypeScript |
| `pnpm sync:shared` | 构建 shared 并同步 CommonJS 与声明文件到小程序 |
| `pnpm dev:web` | 启动 Web 本地开发服务器 |

### 数据与内容素材

| 命令 | 说明 |
| --- | --- |
| `pnpm db:generate-seeds` | 生成公共内容种子 |
| `pnpm db:generate-images` | 生成内容配图和 manifest |
| `pnpm db:validate-assets` | 校验种子、图片、路径和 SHA-256 |
| `pnpm db:sync` | 上传图片并按 `_id` Upsert CloudBase 数据 |

数据库准备、同步行为和密钥要求见 [`database/README.md`](./database/README.md)。

## 核心功能与验收

- [工程基建](./specs/001-project-bootstrap/quickstart.md)
- [跨端健身计算逻辑](./specs/002-fitness-calc-shared/quickstart.md)
- [身体指数工具箱](./specs/002-body-index-toolbox/quickstart.md)
- [热量缺口计算](./specs/003-calorie-plan-page/quickstart.md)
- [计算器 UI 契约](./specs/004-calc-ui-contract/quickstart.md)
- [训练计时器](./specs/005-training-timer/quickstart.md)
- [云数据库与公共内容](./specs/006-cloud-db-seed/quickstart.md)

## 环境与安全

- 小程序 AppID 配置在 [`packages/miniprogram/project.config.json`](./packages/miniprogram/project.config.json)。
- CloudBase 环境初始化配置在 [`packages/miniprogram/app.ts`](./packages/miniprogram/app.ts)。
- 数据同步凭据只允许写入由 [`.env.example`](./.env.example) 复制出的 `.env.local`，禁止提交真实密钥。
- Fork 后请替换 AppID、CloudBase 环境 ID 和本地凭据。

## 文档导航

- [微信小程序开发](./packages/miniprogram/README.md)
- [Web 官网开发](./packages/web/README.md)
- [共享逻辑](./packages/shared/README.md)
- [云函数](./packages/cloudfunctions/README.md)
- [数据库与内容同步](./database/README.md)
- [品牌资源规范](./docs/brand/README.md)
- [项目宪章](./docs/constitution.md)

项目治理源文件为 [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)，[`docs/constitution.md`](./docs/constitution.md) 是其阅读副本。
