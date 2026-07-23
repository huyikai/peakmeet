# Contract: Web Site Shell (Astro SSG)

**Package**: `packages/web`  
**Audience**: 浏览器本地预览

## Mode

- Static site generation only
- MUST NOT enable SSR adapter / server endpoints for business logic
- MUST NOT integrate login, persistence, or CloudBase client for data

## Routes

| Path        | Purpose                        |
| ----------- | ------------------------------ |
| `/`         | 首页（品牌）                   |
| `/features` | 功能介绍                       |
| `/tools`    | 简易工具占位 + shared 冒烟展示 |
| `/about`    | 关于                           |

## Shared dependency

- `package.json` MUST depend on `@peakmeet/shared` via `workspace:*`（或 pnpm workspace 等价写法）
- `/tools` MUST call smoke export and render its return value in the page（可见即可）
- MUST NOT implement real BMI / TDEE calculators in this feature

## Dev command

- `pnpm --filter <web-package> dev`（或根脚本 `dev:web`）MUST start local preview within ~1 minute when deps installed
