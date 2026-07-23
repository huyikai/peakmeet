# Contract: Root Scripts

**Package**: repository root  
**Audience**: PeakMeet developers

## Commands

| Script | MUST behavior | MUST NOT |
| ------ | ------------- | -------- |
| `pnpm test` | 启动 Vitest；在 1 分钟内给出通过/失败；至少 1 条 `@peakmeet/shared` 冒烟用例通过 | 因「无测试文件」整体失败 |
| `pnpm lint` | 对约定源码运行 ESLint（含 TS）；缺配置即失败 | 静默跳过全仓 |
| `pnpm format` | Prettier 格式化（或 check 模式在 CI 中等价）；配置存在且可执行 | — |
| `pnpm build` | 成功构建 `shared`、`web`、`cloudfunctions`；建议 2 分钟内完成 | 将小程序编译结果作为失败条件 |
| `pnpm sync:shared` | 构建 shared（ESM+CJS）并将 **CJS** 产物拷贝到 `packages/miniprogram/utils/shared/`，并写入 `index.d.ts` | 启动 watch |
| `pnpm build:miniprogram` | 执行 `sync:shared` 后编译小程序 `app.ts` / `pages/**/*.ts` → 同目录 `.js`，供开发者工具预览 | 替代根 `pnpm build` |
| `pnpm dev:web` | 启动 Astro 本地预览 | — |

## Exit codes

- `0`: 成功
- 非 `0`: 失败，stderr 含可操作原因（缺依赖、类型错误、端口等由具体子命令提供）

## Workspace

- `pnpm-workspace.yaml` MUST include `packages/*`
- Package manager: pnpm only
