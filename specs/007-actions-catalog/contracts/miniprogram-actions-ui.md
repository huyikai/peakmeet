# Contract: Action Catalog — Miniprogram UI & Data Access

**Feature**: 007-actions-catalog  
**Runtime**: 微信小程序原生（WXML/WXSS/TS）

## Routes

| Path | Role |
| ---- | ---- |
| `/pages/train/index` | 训练 Hub；入口「动作大全」「训练计划库」「计时器」 |
| `/pages/train/actions/index` | 动作列表：筛选、搜索、收藏态、「今日练什么」 |
| `/pages/train/actions/detail` | 详情；query `id`（Action `_id`） |
| `/pages/train/plans/index` | 计划库占位入口（「加入训练」目标） |

`app.json` 注册上述页面；品牌色消费 `styles/tokens.wxss` / 既有内容页模式，不引入重型 UI 库。

## List page behavior

1. 加载：`contentList` `collection=actions` `limit=100`（失败 → 可重试错误态）
2. 可选并行：当前用户 `user_collect` where `type=action`（无 openid 则全部 `collected=false`）
3. 器材选项：`contentList` `equipment` 或直读，映射 id→name，并插入自重哨兵
4. UI 绑定 `ActionCatalogFilters`；变更后用 shared `filterActions` 刷新列表
5. 卡片：封面（`resolveContentCover`）、名称、主部位、难度、收藏标记；**不可**点收藏
6. 点卡片 → `navigateTo` detail?id=
7. 「今日练什么」→ `pickRandomAction(allActions)` → detail；与当前 filters 无关
8. 空结果：空态 + 清除条件

## Detail page behavior

1. `contentGetById({ collection: 'actions', id })`；失败 NOT_FOUND/网络 → 错误态
2. 区块：基础信息、主/协同肌、步骤（文+封面/缺省图）、cues、mistakes、substituteIds（解析名称：内存 map 或二次 get；无效跳过）
3. 底部：收藏切换、加入训练、`FITNESS_DISCLAIMER`
4. 收藏：需 openid；未登录引导；toggle `user_collect`
5. 加入训练 → `/pages/train/plans/index`；失败 Toast

## Data access

| 操作 | 方式 |
| ---- | ---- |
| 列表/详情公共内容 | `wx.cloud.callFunction` → `contentList` / `contentGetById` |
| OpenID | `callFunction` → `getOpenId`（新建，仅返回 openid） |
| 收藏读写 | `wx.cloud.database()` → `user_collect`（规则：本人） |

Envelope 与 006 `content-query` 一致。

## Disclaimer copy

必须与 shared `FITNESS_DISCLAIMER` 一致：  
`仅供参考，不构成专业健身指导，请根据自身身体状况量力而行`

## Non-goals

- 列表收藏切换
- 计划库正文 / 按动作筛计划
- 替代关系分类标签
- Web 动作库
