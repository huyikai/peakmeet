# PeakMeet 共享逻辑

跨小程序、Web 和云函数复用的纯 TypeScript 逻辑。模块不依赖浏览器、微信或 Node 专属运行时，便于在各端保持一致计算结果。

## 模块范围

| 模块 | 职责 |
| --- | --- |
| `src/calc/` | BMI、BMR、体脂率、腰臀比、1RM、TDEE 与目标摄入量 |
| `src/timer/` | 训练计时会话、校验与打卡逻辑 |
| `src/content/` | 公共内容类型、筛选、查询校验与封面解析 |

公共 API 统一从 [`src/index.ts`](./src/index.ts) 导出。

## 构建与测试

在仓库根目录运行：

```bash
pnpm --filter @peakmeet/shared build
pnpm --filter @peakmeet/shared test
pnpm --filter @peakmeet/shared test:coverage
```

构建会生成：

- `dist/`：ESM 与 TypeScript 声明，供 Web 等 workspace 包使用
- `dist-cjs/`：CommonJS 产物，供微信小程序同步流程使用

## 小程序同步

```bash
pnpm sync:shared
```

该命令先构建本包，再将 `dist-cjs/` 和声明文件复制到 [`packages/miniprogram/utils/shared/`](../miniprogram/utils/shared/)，同时重写目录级 `require` 为显式 `/index` 路径以兼容微信运行时。

小程序同步目录是生成产物，禁止直接修改。所有逻辑变更都应提交到本包 `src/` 并通过测试。

返回[项目总览](../../README.md)。
