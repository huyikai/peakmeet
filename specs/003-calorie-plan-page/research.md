# Research: 003-calorie-plan-page

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)

## R1. 计算编排链路（页面调用顺序）

- **Decision**: 页面点击「计算」后严格串联既有 shared API：
  1. `calculateBmr({ sex, ageYears, heightCm, weightKg })`
  2. `calculateTdee({ bmrKcal, activity })`
  3. `calculateTargetIntake({ tdeeKcal, bmrKcal, goal })`
  4. `calculateMacroPlan({ targetKcal, weightKg, goal })`
  - 任一步 `ok===false` → 中文错误提示，不展示结果
  - 成功后由页面组装展示模型（三餐拆分、训练频率说明、提示文案）
- **Rationale**: Constitution Shared Logic First；`002-fitness-calc-shared` 已提供完整链路；禁止页面重写公式
- **Alternatives considered**: 单入口 `calculateCaloriePlan` 门面 — 可后续加，本版直接串联降低 shared 面；云函数聚合 — 违反纯计算前端

## R2. 碳水「主数字 + 参考区间」

- **Decision**:
  - 主数字：沿用 `carbRestG` / `carbTrainG`
  - 参考区间：在 `calculateMacroPlan` 内新增 `carbRestRangeG` / `carbTrainRangeG`（`NumericRange`），**写入 shared 并 TDD**
  - 区间算法（锁定）：
    - 用 `PROTEIN_RANGE[goal]` 与 `FAT_RANGE` 的 g/kg 边界，分别计算「剩余热量 → 碳水克数」得休息日区间上下界（蛋白+脂肪取最大消耗 → 碳水下限；取最小消耗 → 碳水上限；下限夹到 ≥0）
    - 训练日区间 = 休息日区间两端分别 × `(1 + TRAIN_CARB_BOOST_RANGE.min|max)`，与主数字 `carbTrainG = carbRestG * TRAIN_CARB_BOOST` 一致的思想
  - 页面：主数字突出，区间次级展示；不得在页面用随意 ±10% 自研区间
- **Rationale**: 澄清要求主数字+区间；规格要求区间来自内核；当前 macros 仅有蛋白/脂肪区间与加成系数区间，缺碳水克数区间
- **Alternatives considered**:
  - 页面用 `trainCarbBoostRange` 临时派生 — 易漂移、难双端一致
  - 仅展示主数字 — 澄清已否决（选了 C）

## R3. 体脂选填

- **Decision**: 表单可选；校验：若填写须为有限正数，建议 1–60（含），非法拦截；**不传入** `calculateBmr`（Mifflin 无体脂入参）。有合法值时结果摘要展示「用户自报体脂率 X%」+「未参与本次核心热量计算」说明；未填不展示行
- **Rationale**: 澄清 B；与现有 BMR API 一致
- **Alternatives considered**: Katch–McArdle 切换 — 本版不做；隐藏字段 — 产品输入清单要求保留选填

## R4. 训练目标与风险提示时机

- **Decision**:
  - UI 目标：`cutMild` / `cutAggressive` / `bulk` / `maintain`，中文映射「温和减脂 / 快速减脂 / 增肌 / 维持体重」
  - 缺口/盈余数值完全来自 `GOAL_DELTA_KCAL` + 结果内 `deltaRange` 展示说明
  - `cutAggressive`：**仅结果区**强化风险文案；选择时不弹 `wx.showModal` 阻断确认
  - `bmrFloorApplied` 或 `hint` 非空时展示 `BMR_FLOOR_HINT`（或内核 hint）
- **Rationale**: 澄清结论；对齐 shared 既有常量
- **Alternatives considered**: 选择时二次确认 — 澄清否决

## R5. 每周训练频率与碳水说明

- **Decision**: 整数 0–7（天/周）；不参与宏量公式。结果文案模板：
  - `N=0`：建议本周均可参考休息日碳水
  - `1≤N≤6`：建议约 N 个训练日参考训练日碳水，其余参考休息日
  - `N=7`：多数日子可参考训练日碳水，仍需结合恢复感受调整
- **Rationale**: 规格要求「匹配训练频率」且不另造第二套宏量算法
- **Alternatives considered**: 按频率加权平均单一碳水 — 模糊训练日/休息日差异，验收冲突

## R6. 三餐 3:4:3 与搭配示例

- **Decision**:
  - 页面常量：`MEAL_RATIO = { breakfast: 0.3, lunch: 0.4, dinner: 0.3 }`
  - 各餐 kcal = `round(targetKcal * ratio)`，必要时微调使三餐之和等于 `targetKcal`（差值补到午餐）
  - 搭配示例：静态科普文案（蛋白源 + 碳水 + 蔬果示意），随目标可共用一套或减脂/增肌轻微措辞差；**非**食材库查询
  - 不进 shared（非算法）
- **Rationale**: 澄清固定 3:4:3；MVP 低运维
- **Alternatives considered**: 用户切换比例 — 澄清否决；shared 导出比例 — 过度抽象

## R7. 温馨提示按目标分化

- **Decision**: 小程序 `calorie-plan-copy.ts` 按 `NutritionGoal` 映射提示列表：
  - 减脂两档：合理减重速度（约每周 0.5–1% 体重量级通俗表述）、平台期思路、不低于 BMR
  - `bulk`：渐进增重、盈余温和、量力而行（无减重速度）
  - `maintain`：体重稳定观察、微调活动/摄入（无减重速度）
  - 任一目标若 `bmrFloorApplied`：追加/强调 BMR 底线提示
- **Rationale**: 澄清 B
- **Alternatives considered**: 全目标共用减重文案 — 澄清否决

## R8. 页面交互状态（对齐工具箱）

- **Decision**: 单页 `pages/diet/calorie-plan/index`；`data` 含表单 string/枚举、`resultView | null`、`errorTip`；点击「计算」校验 → 串联 shared → 写结果；任意相关输入变更清空结果；`onShow`/`onLoad` 空白初始态；不读 storage
- **Rationale**: 与 `002-body-index-toolbox` / 规格 FR-015/016 一致
- **Alternatives considered**: 独立结果页、实时计算 — 规格否决

## R9. 目录与入口

- **Decision**:
  - 路由：`pages/diet/calorie-plan/index`（与 `toolbox` 并列）
  - `pages/diet/index` 增加入口（按钮/列表项）`navigateTo` 该页
  - `app.json` 注册页面
- **Rationale**: 产品边界「热量缺口计算」为饮食 Tab 核心能力，不宜埋在工具箱五卡片内
- **Alternatives considered**: 放进 toolbox — 削弱主功能发现性

## R10. 校验与错误文案

- **Decision**:
  - 页面先做空值/未选择/格式校验（中文）；通过后再调 shared
  - shared 失败：优先使用返回 `error.message`（已有中文），否则映射 `ERROR_MESSAGES` / 本地兜底
  - 体脂非法单独字段提示
- **Rationale**: 与工具箱模式一致；shared 已带中文 message
- **Alternatives considered**: 仅依赖 shared — 枚举未选等 UI 态 shared 无对应

## R11. 无需澄清项

Technical Context 无残留 `NEEDS CLARIFICATION`：栈、存储、测试、边界均由 Constitution + 澄清会话锁定。
