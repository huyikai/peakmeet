# Contract: Miniprogram App Shell

**Package**: `packages/miniprogram`  
**Audience**: 微信开发者工具 + 开发者

## Open / compile

- Import root: `packages/miniprogram`
- MUST open with 测试号 / 空 AppID（工具现行能力）
- MUST compile TypeScript 页面逻辑无骨架级阻断错误

## tabBar (exactly 4)

| order | text | pagePath            |
| ----- | ---- | ------------------- |
| 1     | 首页 | `pages/home/index`  |
| 2     | 训练 | `pages/train/index` |
| 3     | 饮食 | `pages/diet/index`  |
| 4     | 我的 | `pages/mine/index`  |

- 切换任一 Tab MUST 展示对应页（占位文案可接受）

## Shared smoke consumption

- Sync target directory: `utils/shared/`（由 `pnpm sync:shared` 填充）
- MUST 至少在一处页面或 `app.ts` 引用同步后的 smoke export，证明可运行（可为 `console.log` 或页面展示）

## Out of scope

- 业务列表/详情、登录、云开发初始化密钥
