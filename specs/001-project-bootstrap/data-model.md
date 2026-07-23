# Data Model: 001-project-bootstrap

**Date**: 2026-07-23  
**Note**: 本功能为工程基建，无业务持久化实体。下列为逻辑/配置实体，用于约束骨架与验收。

## Entities

### WorkspacePackage

| Field       | Rules                                                                 |
| ----------- | --------------------------------------------------------------------- |
| name        | 唯一；shared 使用 `@peakmeet/shared`                                  |
| path        | 位于 `packages/{shared\|miniprogram\|web\|cloudfunctions}`            |
| language    | TypeScript 优先                                                       |
| buildable   | shared / web / cloudfunctions = true；miniprogram = false（根 build） |
| runtimeDeps | shared MUST 为空（零第三方运行时依赖）                                |

**Relationships**: web `dependsOn` shared（workspace）；miniprogram `consumesCopyOf` shared dist via sync script。

### RootToolchainProfile

| Field               | Rules                                     |
| ------------------- | ----------------------------------------- |
| scripts.test        | 根入口；须成功且至少 1 条 shared 冒烟用例 |
| scripts.lint        | 全仓 ESLint                               |
| scripts.format      | Prettier                                  |
| scripts.build       | 仅 shared + web + cloudfunctions          |
| scripts.sync:shared | shared build 后拷贝至 miniprogram utils   |
| tsconfigBase        | `tsconfig.base.json`，子包 extends        |
| nodeEngine          | `>=20`（建议）                            |

### SharedSmokeExport

| Field     | Rules                                        |
| --------- | -------------------------------------------- |
| symbol    | 稳定导出名（如 `getPeakMeetPing`）           |
| purity    | 纯函数；无 I/O、无平台 API                   |
| tests     | `__tests__` 中至少 1 条覆盖正常路径          |
| consumers | Vitest；web `/tools`；miniprogram 同步后引用 |

### AppShellTab

| Field    | Rules                                                             |
| -------- | ----------------------------------------------------------------- |
| id       | `home` \| `train` \| `diet` \| `mine`                             |
| title    | 首页 / 训练 / 饮食 / 我的                                         |
| pagePath | `pages/{id}/index`                                                |
| content  | 占位即可；可展示 sync 冒烟结果（可选，至少一处引用以满足 SC-008） |

**State**: 无服务端状态；仅客户端 Tab 切换。

### SiteShellPage

| Field       | Rules                                      |
| ----------- | ------------------------------------------ |
| route       | `/` \| `/features` \| `/tools` \| `/about` |
| purpose     | 品牌 / 介绍 / 简易工具占位 / 关于          |
| sharedUsage | 仅 `/tools` MUST 引用 SharedSmokeExport    |
| forbidden   | 登录、存储、云库、SSR 业务                 |

### CloudFunctionPlaceholder

| Field    | Rules                                     |
| -------- | ----------------------------------------- |
| name     | `hello`（唯一）                           |
| source   | TypeScript                                |
| behavior | 无业务逻辑（可返回固定占位字符串/空成功） |
| artifact | 编译后可供微信云开发部署的 JS 入口        |
| deploy   | 本功能不做真实部署                        |

### GovernanceDocument

| Field       | Rules                             |
| ----------- | --------------------------------- |
| path        | `docs/constitution.md`            |
| source      | `.specify/memory/constitution.md` |
| consistency | 内容一致；版本信息可读            |
| syncMode    | 本功能一次性复制                  |

### SeedDataDirectory

| Field   | Rules                  |
| ------- | ---------------------- |
| path    | `database/`            |
| content | 空或 README/`.gitkeep` |
| import  | 不要求导入云库         |

## Validation rules (cross-cutting)

1. 顶层不得出现 Constitution 未约定的业务目录（`scripts/` 仅工程脚本例外，见 plan）。
2. shared 源码不得引用 `wx`、`document`、`window` 等平台全局。
3. web 不得声明云开发/登录相关依赖。
4. 根 `build` 失败条件不得绑定小程序编译结果。

## State transitions

不适用（无用户数据生命周期）。工具链状态仅为：未安装 → `pnpm install` → 可 test/lint/build/dev。
