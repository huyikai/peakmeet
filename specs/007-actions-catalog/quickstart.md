# Quickstart: 007-actions-catalog

**目的**：端到端验证动作大全（列表筛选/搜索、详情、替代跳转、收藏、今日推荐、加入训练、免责声明）。

## Prerequisites

- 微信开发者工具打开 `packages/miniprogram`；云环境已 init；`actions` / `equipment` / `user_collect` 可用（006 已 sync）
- `pnpm` 可跑 shared 测试；已 `pnpm` sync shared → miniprogram（实现阶段脚本）
- 云函数已部署：`contentList`、`contentGetById`、`getOpenId`

## Shared unit checks

```bash
cd /Users/EQDN-10207449_1/Desktop/project/peakmeet
pnpm --filter @peakmeet/shared test
```

**期望**：`matchAction` / `filterActions` / `pickRandomAction` / `normalizeActionCatalogFilters` 相关用例全绿（含身体部位/器材哨兵/关键词/AND 组合）。

## Manual scenarios（开发者工具）

### 1. 列表与四维单选筛选

1. 训练 Tab → 动作大全  
2. 不设筛选：见封面/名称/部位/难度卡片  
3. 依次单选部位、器材、难度、目标：列表为交集；同维不能多选  
4. 清空某一维：该维不限，列表放宽  
5. 无封面样例：缺省图，不崩溃  

### 2. 搜索

1. 输入已知动作名片段 → 命中  
2. 叠加筛选 → 同时满足  
3. 无命中 → 空态；清空关键词 → 恢复  

### 3. 详情与合规

1. 打开详情：基础信息、主/协同肌、步骤、要点、避坑、底栏免责声明（`FITNESS_DISCLAIMER` 文案）  
2. 有 `substituteIds`：点替代进入另一详情；返回正常  
3. 无效替代：不崩溃  

### 4. 今日练什么

1. 先设较严筛选使列表变短  
2. 点「今日练什么」→ 进入某详情，且**可不在**当前筛选结果内  
3. 多次点击允许不同动作  

### 5. 收藏

1. 未登录/无 openid：点收藏 → 引导，不写库  
2. 登录后收藏 → 返回列表见标记；详情再取消 → 标记消失  
3. 列表上不可切换收藏  

### 6. 加入训练

1. 详情点「加入训练」→ `/pages/train/plans/index` 占位页可见  

## Failure checks

- 断网后列表/详情：错误态可重试  
- `getOpenId` 失败时收藏有提示  

## Done when

- 上述场景通过；shared 测试全绿；无医疗违禁表述；品牌色未另起炉灶  
