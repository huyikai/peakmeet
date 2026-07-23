# Quickstart: 002-body-index-toolbox

**Date**: 2026-07-23  
**Goal**: 验证 shared 计算内核与小程序工具箱主路径可用

## Prerequisites

- Node.js ≥ 20，pnpm 9+
- 已安装依赖：`pnpm install`
- 微信开发者工具（预览小程序）
- 阅读：[spec.md](./spec.md)、[contracts/shared-body-metrics-api.md](./contracts/shared-body-metrics-api.md)、[contracts/miniprogram-toolbox-ui.md](./contracts/miniprogram-toolbox-ui.md)

## 1. Shared TDD / 单测

```bash
pnpm --filter @peakmeet/shared test
# 或根：
pnpm test
```

**期望**：BMI / BMR / 体脂简易 / 体脂 Navy / WHR / 1RM 相关用例全绿；覆盖正常、边界、非法入参。

## 2. 构建并同步到小程序

```bash
pnpm sync:shared
# 或完整小程序构建：
pnpm build:miniprogram
```

**期望**：

- `packages/shared/dist` 与 `dist-cjs` 含新导出
- `packages/miniprogram/utils/shared/` 含运行时与完整 `index.d.ts`（不仅是 ping）

## 3. 开发者工具预览

1. 打开 `packages/miniprogram`
2. 饮食 Tab → 进入「身体指数工具箱」
3. 依次点开 5 个工具，按下列冒烟输入点击「计算」

| 工具 | 冒烟输入（示例） | 期望 |
| ---- | ---------------- | ---- |
| BMI | 身高 170，体重 65 | 有 BMI 值；中国 + WHO 两套对照；免责声明 |
| BMR | 男，25 岁，170 cm，65 kg | 有 BMR kcal；解读；免责声明 |
| 体脂-简易 | 男，25，65 kg，腰围 80 | 有 %；局限说明；免责声明 |
| 体脂-围度 | 切到围度法，补齐颈围/身高（女含臀围） | 有 %；切换后旧结果消失 |
| 腰臀比 | 男，腰 80，臀 95 | 有比值与男性风险参考 |
| 1RM | 60 kg × 5 次 | 有估算 1RM 与参考建议 |

## 4. 负面路径速验

- 空点「计算」→ 中文提示，无结果
- 输入负数 → 提示，无结果
- BMI 算出结果后改身高 → 结果消失
- 1RM 次数 20 → 提示超出范围
- 离开工具页再进入 → 表单空白

## 5. 回归

```bash
pnpm test
pnpm lint
```

**期望**：原有 ping 冒烟仍通过；无新增栈外依赖。

## Out of scope for this quickstart

- Web 完整工具箱
- 云函数/云数据库
- 表单持久化与「我的」身体数据联动
