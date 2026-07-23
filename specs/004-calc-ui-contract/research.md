# Research: 004-calc-ui-contract

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)

## R1. Token 落地方式

- **Decision**: 在 `packages/miniprogram/styles/tokens.wxss` 定义 page 级 CSS 变量：
  - `--pm-ink: #0B0D10`
  - `--pm-orange: #FF5A1F`
  - `--pm-snow: #F2F4F7`
  - 衍生：`--pm-ink-muted`（次级文字）、`--pm-surface`（近白表面 `#FFFFFF` 或 `#FAFBFC`）、`--pm-danger`（校验错误，Ink 调深的红系，**非品牌第四主色**，仅功能语义）
  - 类名/注释标明来源 `docs/brand/README.md`
- **Rationale**: 微信基础库 3.x + 项目 `libVersion` 支持 CSS 变量；一处改色全局生效；与品牌文档一一对应
- **Alternatives considered**: 仅用 SCSS 预处理 — 增加工具链；每页硬编码 hex — 正是要消除的开盲盒

## R2. 单一共享样式入口

- **Decision**: `styles/calc-theme.wxss` 为唯一入口：
  1. `@import "./tokens.wxss";`
  2. 提供通用类：`.pm-page`、`.pm-section-title`、`.pm-field`、`.pm-label`、`.pm-input`、`.pm-btn-primary`、`.pm-chip` / `.pm-chip.active`、`.pm-error`、`.pm-result`、`.pm-result-hero`、`.pm-result-value`、`.pm-result-unit`、`.pm-risk`、`.pm-tip`、`.pm-disclaimer`、`.pm-entry`（入口按钮）
  3. 存量 `pages/diet/toolbox/calc-common.wxss` **改为** 一行 `@import` 到 `calc-theme`（兼容旧路径）或删除并改各页 import；推荐：**各页直接改 import 到 `/styles/calc-theme.wxss`**，`calc-common.wxss` 保留为薄转发以免漏改
- **Rationale**: 满足 FR-005「单一入口」；降低迁移漏网
- **Alternatives considered**: 仅文档无代码 — 无法验收；复制 token 到每页 — 再次发散

## R3. 组件态与澄清锁定

- **Decision**（与 Clarifications 一致）:
  | 元素 | 样式 |
  | --- | --- |
  | 主按钮 / 主入口 | Ink 实心，字色 Snow/近白 |
  | 选中 chip | Orange 1–2px 描边 + 浅底（surface）+ Ink 字 |
  | 未选中 chip | 中性浅灰底（Snow 衍生），无橙 |
  | 结果主数字 | Ink，字号显著大于次要 |
  | 单位 | `--pm-ink-muted` |
  | Orange 点缀 | 可选极短强调条/小标记，禁止整串数字着色 |
  | 风险条 | 浅橙底（Orange 低透明）+ Ink 文，不大面积铺满屏 |
  | 免责声明 | 更小字号 + muted，置于结果区之后 |
- **Rationale**: 澄清会话已定；实现不得回退
- **Alternatives considered**: 橙实心主按钮、橙主数字 — 已否决

## R4. 迁移清单与顺序

- **Decision**: 本功能交付 MUST 全部完成：
  1. `pages/diet/index`（饮食 Tab）
  2. `pages/diet/toolbox/index`（聚合）
  3. `pages/diet/toolbox/bmi|bmr|body-fat|whr|one-rm`
  4. `pages/diet/calorie-plan/index`
  - 实现顺序：tokens + calc-theme → BMI 样板验证 → diet index + toolbox hub（含小型 lockup/icon）→ calorie-plan → 其余四工具页 → 删除/收敛重复 wxss
  - `tasks.md` / quickstart 用 checklist 标记已对齐/待对齐；全部勾完才关闭验收
- **Rationale**: 澄清 B：全量交付；入口纳入避免路径割裂
- **Alternatives considered**: 仅样板页 MVP — 澄清否决

## R5. Logo 使用

- **Decision**:
  - 饮食 Tab / 工具箱聚合：可用 `assets/brand/logo/lockup-horizontal.png` 或 `icon.png`（控制高度约 48–64rpx），不强制大 splash
  - 各计算页：不强制页顶 Logo
  - 禁止用非 brand 目录装饰图冒充品牌
- **Rationale**: FR-008；资产已存在于 miniprogram
- **Alternatives considered**: 每计算页放大 Logo — 规格明确不强制

## R6. app.wxss 全局背景

- **Decision**: `app.wxss` 的 `.page` / `page` 背景改为 `var(--pm-snow, #F2F4F7)`，文字默认 Ink；变量在 app 层 `@import` tokens 或在 calc-theme 已 import 的页面生效。为让非 diet 页也不突兀，**app.wxss 直接 import tokens 并设 page 背景 Snow**
- **Rationale**: 统一底色；训练/我的 Tab 仅背景对齐，不强制本功能改其布局（超出迁移清单的页只做全局底色，不算清单完成项）
- **Alternatives considered**: 仅 diet 页设背景 — 切 Tab 时闪色

## R7. 文档位置

- **Decision**: 增量引用说明写在本功能 `quickstart.md`「新计算页如何引用」一节；可在 `docs/brand/README.md` 末尾加一行「小程序计算页样式见 specs/004… / styles/calc-theme.wxss」（可选轻量交叉链接）
- **Rationale**: FR-014；不把设计手册塞进宪章
- **Alternatives considered**: 只改 README — 验收场景不足

## R8. 无需澄清项

Technical Context 无残留 `NEEDS CLARIFICATION`：色板、范围、交互锁定、栈约束均已由 spec + brand 文档给定。
