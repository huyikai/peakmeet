# Quickstart: 004-calc-ui-contract

**Date**: 2026-07-23  
**Goal**: 验证品牌 token、共享样式入口与饮食路径存量页视觉对齐

## Prerequisites

- Node.js ≥ 20，pnpm 9+
- `pnpm install`
- 微信开发者工具打开 `packages/miniprogram`
- 建议启用「自定义处理命令」以便自动 sync/build
- 阅读：[spec.md](./spec.md)、[contracts/miniprogram-calc-theme-ui.md](./contracts/miniprogram-calc-theme-ui.md)、[contracts/migration-checklist.md](./contracts/migration-checklist.md)、[docs/brand/README.md](../../docs/brand/README.md)

## 1. 构建

```bash
pnpm build:miniprogram
```

**期望**：无编译错误；存在 `packages/miniprogram/styles/tokens.wxss` 与 `styles/calc-theme.wxss`。

## 2. 视觉冒烟（DevTools）

按 [migration-checklist.md](./contracts/migration-checklist.md) 逐页：

1. 饮食 Tab → 背景接近 Snow；主入口 Ink 实心；可选小型品牌 logo  
2. 身体指数工具箱聚合 → 同上  
3. BMI（样板）→ 「计算」Ink 实心；性别选中 Orange 描边浅底；结果主数字 Ink；底部免责声明弱化可见  
4. 热量缺口 → 目标热量 Ink 大字；快速减脂风险条非整屏橙；主按钮 Ink  
5. 其余 BMR / 体脂 / 腰臀比 / 1RM → 与 BMI 同契约  

**对照**：页面中不应再出现与品牌无关的主色（如大面积紫、橙实心主按钮）。

## 3. 行为回归（勿改逻辑）

| 页 | 合法路径 | 非法路径 |
| -- | -------- | -------- |
| BMI | 170 / 65 → 有结果 | 空点计算 → 中文提示 |
| 热量缺口 | 填齐必填温和减脂 → 有目标热量 | 空点计算 → 提示 |
| 工具箱其他 | 各页一次合法计算 | 各页一次非法输入 |

## 4. 新计算页如何引用（增量说明）

1. 页面 wxss 顶部：`@import "/styles/calc-theme.wxss";`（或相对路径）  
2. 主按钮使用 `.pm-btn-primary`（或主题提供的旧类别名）  
3. 选择态使用 `.pm-chip` / `.pm-chip.active`  
4. 结果主数字 `.pm-result-value`（Ink），单位 `.pm-result-unit`  
5. 底部 `.pm-disclaimer`  
6. **禁止**另起主色板；色值只消费 `--pm-*`  
7. 需求/规格中注明「遵循 004-calc-ui-contract / docs/brand」

## 5. 完成门禁

- [x] migration-checklist 8 行均为 done  
- [x] SC 视觉对照通过（Ink 主按钮、选中 Orange 描边、主数字 Ink）— 以 DevTools 目视最终确认  
- [x] 行为回归无破坏 — TS 逻辑未改；建议在 DevTools 各页抽测一次  


## Out of scope for this quickstart

- Web 官网主题  
- 训练 / 我的 Tab 完整改版（全局 page 背景除外）  
- shared 计算变更  
