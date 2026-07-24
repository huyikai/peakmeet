# PeakMeet Web 官网

基于 Astro 的静态官网，用于展示 PeakMeet 品牌、功能和工具入口。构建产物可直接部署到静态托管服务。

## 本地开发

在仓库根目录运行：

```bash
pnpm dev:web
```

常用包级命令：

```bash
pnpm --filter @peakmeet/web build
pnpm --filter @peakmeet/web preview
```

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `src/pages/` | 首页、功能、工具和关于页面 |
| `public/` | 原样复制到构建产物的静态资源 |
| `astro.config.mjs` | Astro 静态输出配置 |

当前站点使用 `output: 'static'`。生产构建输出到 `dist/`，该目录不应作为源码手动维护。

## 共享逻辑

Web 通过 workspace 依赖消费 [`@peakmeet/shared`](../shared/README.md)。修改共享计算逻辑后，根目录 `pnpm build` 会先构建 shared，再构建 Web。

## 品牌素材

Web 品牌资源位于 [`public/brand/logo/`](./public/brand/logo/)，文件会保持原路径复制到构建产物。权威导出源、颜色和同步规则见[品牌资源规范](../../docs/brand/README.md)。

返回[项目总览](../../README.md)。
