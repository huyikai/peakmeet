# PeakMeet CloudBase 云函数

微信 CloudBase 云函数源码。每个子目录是一个独立部署单元，构建脚本使用 esbuild 生成 CommonJS 入口。

## 函数清单

| 函数 | 职责 |
| --- | --- |
| `contentList` | 按集合与筛选条件查询公共内容列表 |
| `contentGetById` | 按 ID 获取公共内容详情 |
| `hello` | 基础连通性示例与工程占位函数 |

## 构建

在仓库根目录运行：

```bash
pnpm --filter @peakmeet/cloudfunctions build
```

构建脚本会为每个函数生成 `index.js`：

- 目标运行时为 Node.js 16 CommonJS
- [`@peakmeet/shared`](../shared/README.md) 会被内联到使用它的内容函数
- `wx-server-sdk` 保持外部依赖，由各函数目录的 `package.json` 声明

生成的 `index.js` 不应手动编辑。

## 部署

1. 先完成构建。
2. 使用微信开发者工具上传 `contentList` 和 `contentGetById`。
3. 在目标 CloudBase 环境中确认集合、安全规则和索引已配置。
4. 按[云数据库验收指引](../../specs/006-cloud-db-seed/quickstart.md)验证列表与详情查询。

数据库规则、种子和内容图片同步见 [`database/README.md`](../../database/README.md)。

返回[项目总览](../../README.md)。
