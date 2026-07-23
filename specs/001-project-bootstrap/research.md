# Research: 001-project-bootstrap

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)

## R1. Shared 构建工具

- **Decision**: 使用 `tsc` 双产物：`tsconfig.json` → `dist/`（ESM + `.d.ts`）；`tsconfig.cjs.json` → `dist-cjs/`（CommonJS）
- **Rationale**: Astro/Vite 需要 ESM named export；微信小程序侧 `require` 需要 CJS；零额外打包器
- **Alternatives considered**:
  - 仅 ESM：Web 可用，小程序 sync 后引用困难
  - 仅 CJS：Astro 构建曾报「getPeakMeetPing is not exported」
  - tsup/esbuild：更快但多一层构建依赖，底座阶段非必需

## R2. 包管理与 Node 版本

- **Decision**: pnpm 9+ workspace；`engines.node` 建议 `>=20`（LTS）；根 `packageManager` 字段锁定 pnpm 主版本
- **Rationale**: Constitution 强制 pnpm；Node 20 为当前 LTS，Astro/Vitest/TS 生态兼容稳定
- **Alternatives considered**:
  - npm/yarn workspaces：违反栈锁定
  - Node 18：仍可用但非优先 LTS

## R3. 根 Vitest / ESLint / Prettier 布局

- **Decision**: 根配置 + workspace 继承；`pnpm test` 跑 Vitest workspace（至少包含 `packages/shared`）；ESLint flat config + typescript-eslint；Prettier 统一格式化；忽略小程序编译出的 `*.js`
- **Rationale**: 一次配置全仓；shared 冒烟保证「无测试文件不失败」
- **Alternatives considered**:
  - 每包独立互不共享配置：重复维护，拒绝
  - Jest：Constitution 指定 Vitest

## R4. Shared → 小程序同步

- **Decision**: 根脚本 `scripts/sync-shared-to-miniprogram.mjs`：shared build 后拷贝 **`dist-cjs`** → `packages/miniprogram/utils/shared/`，并写入 `index.d.ts`；暴露为 `pnpm sync:shared`；不做 watch
- **Rationale**: 澄清结论 B；对齐 Constitution「构建脚本同步至本地 utils」；CJS 适配小程序 `require`
- **Alternatives considered**:
  - 仅文档说明：已在澄清中否决
  - 拷贝 ESM `dist/`：小程序侧兼容差
  - npm link / 小程序 npm 构建：链路更重，底座阶段不选
  - watch 增量：超出范围

## R5. 微信小程序 TypeScript 骨架

- **Decision**:
  - 源码 TS（`app.ts`、页面 `*.ts`）+ `tsconfig`；`app.json` 四 Tab
  - `project.config.json`：`useCompilerPlugins: ["typescript"]`；跟踪文件 `appid` 固定 `touristappid`
  - 真实 AppID 仅写入 gitignored 的 `project.private.config.json`（避免 GitHub Secret Scanning）
  - 另提供 `pnpm build:miniprogram`：`tsc` 将入口/页面编译为同目录 `.js`（开发者工具与「自动预览」按 `app.json` 查找 `.js`）
  - 根 `pnpm build` **不**包含小程序
- **Rationale**: 栈锁定禁止跨端；实测仅提交 `.ts` 时自动预览报「未找到 index.js」；双轨（插件 + 显式 tsc）保证可预览
- **Alternatives considered**:
  - Taro/uni-app — 禁止
  - 仅依赖 IDE 插件、不产出 `.js` — 自动预览不稳定，拒绝作为唯一路径
  - 把真实 AppID 写入跟踪的 `project.config.json` — 触发 Secret Scanning，拒绝

## R6. Astro Web 骨架

- **Decision**: Astro 静态输出（默认 SSG，不启用 SSR adapter）；TypeScript 严格；四页路由：`/`、`/features`、`/tools`、`/about`；`dependencies` 使用 `workspace:*` 引用 `@peakmeet/shared`；`/tools` 调用 shared 冒烟导出并展示
- **Rationale**: Constitution SSG；澄清：workspace 依赖 + 极简冒烟，非真实计算器
- **Alternatives considered**:
  - Next/Nuxt SSR — 禁止
  - 本阶段不依赖 shared — 澄清已否决

## R7. 云函数 TS 编译

- **Decision**: `packages/cloudfunctions/hello` 单占位函数；源码 TS，编译输出到该函数目录下微信可部署的 `index.js`；根 `pnpm build` 调用该包 compile；无云端部署、无密钥、无本地模拟调用
- **Rationale**: 澄清结论 B（1 个可编译占位函数）
- **Alternatives considered**: 空目录 / 多函数 / wx-server-sdk 真实调用 — 超出或不足验收

## R8. 包命名与导出

- **Decision**: shared 包名 `@peakmeet/shared`；导出冒烟纯函数 `getPeakMeetPing(): string`；Web、单测、小程序同步产物均消费同一符号
- **Rationale**: 单冒烟符号贯穿 SC-008 / SC-011，降低双端不一致风险
- **Alternatives considered**: 无作用域名 `shared` — 可工作但 monorepo 辨识弱

## R9. Constitution 文档同步

- **Decision**: 将 `.specify/memory/constitution.md` 完整复制为 `docs/constitution.md`（可附一行来源说明）；本功能不做自动 watch；后续修订靠人工或后续脚本
- **Rationale**: FR-014 / SC-007；Assumptions 允许一次完整落盘
- **Alternatives considered**: symlink — Windows/工具链体验差；CI 强制 diff — 可后续加

## R10. 根 `build` 编排

- **Decision**: `pnpm build` = `shared`（ESM+CJS）→ `cloudfunctions` → `web`；明确排除 miniprogram。小程序使用独立 `pnpm build:miniprogram`
- **Rationale**: 澄清根 build 范围；shared 须先于依赖方；小程序预览依赖 DevTools + 本地 tsc
- **Alternatives considered**: 四包全含小程序 — 已否决

## Open items / post-implement notes

- Astro / typescript-eslint 版本随 lockfile 锁定
- 小程序 `sitemap` 已占位；隐私协议文案留给后续功能
- 修改小程序 TS 后须重新 `pnpm build:miniprogram` 再预览
