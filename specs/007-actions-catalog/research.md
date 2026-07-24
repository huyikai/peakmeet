# Research: 007-actions-catalog

**Date**: 2026-07-24  
**Feature**: 动作大全模块

## 1. 列表查询与四维筛选 / 搜索实现位置

**Decision**: 以 `contentList({ collection: 'actions', limit: 100 })`（或等价客户端直读全量 ≤100）拉取公共动作后，在 `packages/shared` 用纯函数完成四维筛选、名称模糊搜索与「今日练什么」抽样；详情用 `contentGetById`；不扩展云函数复杂 `where`/`RegExp`。

**Rationale**:
- 种子规模约 80 条，全量进内存筛选可满足 SC-006（首屏 3s）且便于 Vitest 100% TDD
- 现有 `contentList` 仅等值过滤 `difficulty`/`primaryScene`，无法直接支撑部位/器材/目标（数组字段）与名称模糊搜索
- 006 已允许公共表客户端可读；本方案优先复用既有 CF + shared，避免为本版引入高成本查询协议

**Alternatives considered**:
- 扩展 `contentList` 支持数组包含 + 名称正则：可扩展性更好，但对 80 条过重，且云函数难测
- 小程序端 `db.where` + `db.RegExp`：可行，但筛选语义难在 shared 做纯 TDD，易与校验分叉

## 2. 筛选字段映射与单选语义

**Decision**:
| UI 维度 | 筛选值语义 | 匹配规则（纯函数） |
| ------- | ---------- | ------------------ |
| 训练部位 | 肌肉枚举（如 `chest`） | `primaryMuscles` 数组包含该值 |
| 所用器材 | 器材 `_id`（如 `equip_002`）或哨兵 `__bodyweight__` | 含该 id；哨兵匹配 `equipment` 为空/缺省 |
| 难度等级 | `Difficulty` | `difficulty` 等值 |
| 训练目标 | 目标枚举（如 `strength`） | `goals` 数组包含该值 |

每维最多 1 个值；未选 = 不限；多维 AND。名称搜索：对 `name`（及存在时的 `aliases`）做不区分大小写的子串包含（normalize trim）。

**Rationale**: 对齐 spec Assumptions 与种子真实字段；器材种子为 slug id，选项展示名从 `equipment` 内容解析。

**Alternatives considered**:
- 客户端按难度推断替代标签：已在 clarify 否决
- 器材按中文名过滤：种子存 id，名称需二次解析，过滤键仍用 id 更稳

## 3. 收藏与 OpenID

**Decision**: 详情页客户端直写 `user_collect`（`type: 'action'`）；新增极薄云函数 `getOpenId`（或等价命名）仅返回 `OPENID`，小程序缓存后用于读写；列表只读合并收藏态，不提供列表切换。

**Rationale**:
- 安全规则已要求 `doc.openid == auth.openid` 且查询带 openid
- 006 约定用户表客户端写、本版不写通用写 CF；仅需身份读取 CF（合规最小）
- 澄清：收藏仅详情可操作

**Alternatives considered**:
- `userCollectToggle` 云函数封装写：多一层运维，非必要
- 无 openid、仅本地收藏：无法满足「写入用户收藏表」验收

## 4. 「今日练什么」抽样

**Decision**: 在已加载的全库动作数组上均匀随机取 1 条并 `navigateTo` 详情；**忽略**当前筛选/搜索；用可注入 `random()` 的 shared 纯函数便于测。

**Rationale**: 澄清锁定全库随机；与内存筛选模型一致。

**Alternatives considered**: 按筛选池随机 / 空池回退 — 已否决。

## 5. 「加入训练」跳转目标

**Decision**: 新建训练 Tab 内占位页 `pages/train/plans/index`（「训练计划库」入口文案 + 简要说明「计划库内容后续迭代」），详情「加入训练」`navigateTo` 该页；计划库正文不在本 feature 交付。

**Rationale**: FR-014 要求可跳转入口；当前无计划页，占位页使验收路径闭合且不膨胀为计划库本体（Out of scope）。

**Alternatives considered**:
- 仅 Toast：澄清选跳转，Toast 不满足
- 跳转计时器：非澄清结论

## 6. 封面、步骤图与免责声明

**Decision**: 列表/详情封面与步骤配图统一走 `resolveContentCover` / `contentCoverSrc`；单步无独立图时复用动作封面或缺省图；详情底部复用 `FITNESS_DISCLAIMER` + 既有 disclaimer 样式（如 `.pm-disclaimer`）。

**Rationale**: 006 缺省图约定 + 宪章合规文案已存在，避免平行常量。

## 7. 页面与类型边界

**Decision**:
- 页面：`pages/train/actions/index`（列表）、`pages/train/actions/detail`（详情）；训练 Hub 增加入口
- 类型与匹配：`packages/shared/src/content/` 扩展（filters catalog、`matchActionFilters`、`pickRandomAction`、收藏查询形状校验等），经 `sync-shared-to-miniprogram` 同步
- 小程序仅编排：云调用、UI 状态、导航；禁止平行定义冲突的 Action 模型

**Rationale**: Constitution Shared Logic First + TypeScript First；UI 不强制 TDD。

## 8. 是否扩展 contentList filter 白名单

**Decision**: 本版**不依赖**扩展 CF `LIST_FILTER_KEYS.actions` 完成四维筛选（内存匹配为主）。若实现选择直读 DB where，可将 shared 白名单与映射表一并扩展，但非 MVP 阻塞项。`contentGetById('actions', id)` 保持不变。

**Rationale**: 降低 CF 变更面；全量 ≤100 已够用。
