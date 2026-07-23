# Contract: Miniprogram App Shell

**Package**: `packages/miniprogram`  
**Audience**: 微信开发者工具 + 开发者

## Open / compile

- Import root: **`packages/miniprogram` only**（禁止以仓库根目录作为小程序工程根）
- Tracked `project.config.json` MUST use `appid: "touristappid"`（或同等占位）；真实 AppID MUST 仅存在于 gitignored 的 `project.private.config.json`
- `project.config.json` MUST 启用 `setting.useCompilerPlugins: ["typescript"]`
- 源码为 TypeScript（`app.ts`、`pages/**/*.ts`）；预览/自动预览前 MUST 存在对应运行时 `.js`：
  - `app.js`
  - `pages/home|train|diet|mine/index.js`
- 生成方式：根目录执行 `pnpm build:miniprogram`（`sync:shared` + `tsc` 编译页面/入口）
- MUST 能在微信开发者工具中编译并预览，无「未找到 pages/*/index.js」类骨架阻断错误

## tabBar (exactly 4)

| order | text | pagePath |
| ----- | ---- | -------- |
| 1 | 首页 | `pages/home/index` |
| 2 | 训练 | `pages/train/index` |
| 3 | 饮食 | `pages/diet/index` |
| 4 | 我的 | `pages/mine/index` |

- 切换任一 Tab MUST 展示对应页（占位文案可接受）

## Shared smoke consumption

- Sync target directory: `utils/shared/`（由 `pnpm sync:shared` / `build:miniprogram` 填充 CJS 产物）
- MUST 至少在一处页面（推荐首页）引用同步后的 smoke export，证明可运行（页面展示或 `console.log`）
- 修改 shared 或页面 TS 后 MUST 重新执行 `pnpm build:miniprogram`（或至少 `sync:shared` + miniprogram `build`）

## Out of scope

- 业务列表/详情、登录、云开发初始化密钥
- 将真实 AppID / AppSecret 提交进 Git 跟踪文件
