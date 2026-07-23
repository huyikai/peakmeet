# Quickstart: 003-calorie-plan-page

**Date**: 2026-07-23  
**Goal**: 验证 shared 热量链路（含碳水区间）与小程序热量缺口页主路径可用

## Prerequisites

- Node.js ≥ 20，pnpm 9+
- 已安装依赖：`pnpm install`
- 微信开发者工具（预览小程序）
- 阅读：[spec.md](./spec.md)、[contracts/shared-calorie-plan-api.md](./contracts/shared-calorie-plan-api.md)、[contracts/miniprogram-calorie-plan-ui.md](./contracts/miniprogram-calorie-plan-ui.md)

## 1. Shared 单测

```bash
pnpm --filter @peakmeet/shared test
```

**期望**：

- BMR / TDEE / TargetIntake / MacroPlan 既有用例仍绿
- 宏量新增：`carbRestRangeG` / `carbTrainRangeG` 存在、`min≤max`、下限非负；主数字与区间关系符合 research 约定
- 覆盖率：相关 calc 模块 100%

## 2. 构建并同步到小程序

```bash
pnpm sync:shared
# 或：
pnpm build:miniprogram
```

**期望**：`packages/miniprogram/utils/shared/` 含更新后的运行时与 `MacroPlanResult` 区间字段声明。

## 3. 开发者工具预览

1. 打开 `packages/miniprogram`
2. 饮食 Tab → 「热量缺口计算」
3. 冒烟输入示例后点「计算」：

| 场景 | 输入要点 | 期望 |
| ---- | -------- | ---- |
| 温和减脂 | 男，25，170cm，70kg，活动中等，训练 3 天/周，温和减脂 | 目标热量突出；BMR/TDEE；宏量；训练日/休息日碳水主数字+区间；三餐 3:4:3；减脂温馨提示；免责声明 |
| 快速减脂 | 同上，目标改快速减脂 | 目标更低（相对温和）；结果区有强化风险提示；选择时无确认弹窗 |
| 增肌 | 目标增肌 | 盈余说明；温馨提示无「每周减重速度」 |
| 体脂选填 | 填体脂 18 | 摘要有自报体脂 + 未参与计算说明 |
| 体脂留空 | 不填体脂 | 无体脂行，仍可出结果 |
| BMR 托底 | 极端低消耗/激进缺口组合（若可触发） | 目标 ≥ BMR，有不低于 BMR 提示 |

## 4. 负面路径速验

- 空点「计算」→ 中文提示，无结果
- 负数/非法体脂 → 提示，无结果
- 训练频率 8 或空 → 提示
- 算出结果后改体重 → 结果消失
- 离开再进入 → 表单空白

## 5. 回归

```bash
pnpm test
pnpm lint
```

**期望**：工具箱与既有 shared 用例不回归；无新增栈外依赖。

## Out of scope for this quickstart

- Web 完整热量方案页
- 云函数 / 云数据库
- 表单持久化与「我的」身体数据联动
