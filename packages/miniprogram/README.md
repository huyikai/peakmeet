# PeakMeet 微信小程序

原生 WXML / WXSS / TypeScript 小程序，承载训练、饮食计算和个人中心等核心交互。

## 本地开发

1. 安装根目录依赖：

   ```bash
   pnpm install
   ```

2. 使用微信开发者工具打开当前目录 `packages/miniprogram`。
3. 在“详情 → 本地设置”中启用自定义处理命令。

[`project.config.json`](./project.config.json) 已配置以下钩子：

- 编译前：同步 [`@peakmeet/shared`](../shared/README.md) 到 `utils/shared`
- 预览前：同步 shared 并编译页面 TypeScript
- 上传前：同步 shared 并编译页面 TypeScript

也可在仓库根目录手动执行：

```bash
pnpm sync:shared
pnpm build:miniprogram
```

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `pages/` | 首页、训练、饮食、工具箱和个人中心页面 |
| `styles/` | 全局 Token 与计算器共享主题 |
| `assets/` | 小程序本地图片、品牌资源和提示音 |
| `utils/` | 运行时工具及 shared 同步产物 |
| `app.ts` / `app.json` | 应用启动逻辑、页面注册和 TabBar |

`utils/shared/` 由 `pnpm sync:shared` 自动生成，禁止手动编辑。

## 功能入口

- 训练 Tab：训练计时器
- 饮食 Tab：热量缺口计算
- 饮食 Tab → 身体指数工具箱：BMI、基础代谢、体脂率、腰臀比和 1RM

验收步骤见：

- [身体指数工具箱](../../specs/002-body-index-toolbox/quickstart.md)
- [热量缺口计算](../../specs/003-calorie-plan-page/quickstart.md)
- [计算器 UI 契约](../../specs/004-calc-ui-contract/quickstart.md)
- [训练计时器](../../specs/005-training-timer/quickstart.md)

## 环境配置

- AppID：[`project.config.json`](./project.config.json) 的 `appid`
- CloudBase 环境：[`app.ts`](./app.ts) 的 `wx.cloud.init`
- 数据同步凭据：仓库根目录 `.env.local`，详见[数据库指南](../../database/README.md)

Fork 后必须替换 AppID 和 CloudBase 环境 ID。真实腾讯云密钥不得写入小程序源码或提交仓库。

## 品牌素材

运行时 Logo 位于 [`assets/brand/logo/`](./assets/brand/logo/)，其权威导出源和最小文件集见[品牌资源规范](../../docs/brand/README.md)。

返回[项目总览](../../README.md)。
