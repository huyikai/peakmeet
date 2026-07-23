# Contract: Miniprogram Calorie Plan UI

**Package**: `packages/miniprogram`  
**Depends on**: synced shared via `utils/shared`  
**Related**: [data-model.md](../data-model.md)、[contracts/shared-calorie-plan-api.md](./shared-calorie-plan-api.md)

## Routes

| Path | Type | Title (suggested) |
| ---- | ---- | ----------------- |
| `pages/diet/index` | Tab | 饮食（含本功能入口） |
| `pages/diet/calorie-plan/index` | Page | 热量缺口计算 |

须注册于 `app.json` → `pages`。

## Diet Tab entry

- `pages/diet/index` 提供可发现入口进入 `pages/diet/calorie-plan/index`
- 与「身体指数工具箱」入口并列，不互相替换

## Page: calorie-plan

### Form

字段与校验见 [data-model.md](../data-model.md) `FormState`。

- 单位文案：cm / kg / % / 天·周 / kcal
- 主按钮：「计算」
- 禁止输入即自动出正式结果
- 快速减脂：选择时 **禁止** 阻断式确认弹窗

### On calculate (success)

同页结果区，信息层级：

1. **目标每日摄入**（最大号/最突出）
2. BMR、TDEE；目标相对 TDEE 的缺口/盈余说明（可用 `deltaKcal` / `deltaRange`）
3. 宏量：蛋白、脂肪；训练日/休息日碳水各自 **主数字 + 下方参考区间**
4. 结合 `trainingDaysPerWeek` 的碳水落地说明
5. 三餐：固定 **3:4:3** 热量 + 简易搭配示例（不可改比例）
6. 温馨提示：按 `goal` 分化（减脂含减重速度；增肌/维持不含减重速度文案）
7. `cutAggressive`：结果区强化风险提示
8. 可选：有合法体脂时展示自报值 +「未参与本次核心热量计算」
9. 底部：`FITNESS_DISCLAIMER`

### On calculate (failure)

- 中文 `errorTip`（或字段错误）；隐藏结果区

### Input change / lifecycle

- 任意相关输入变更：清空结果
- 每次进入：空白表单（不读 storage、不预填）

### TypeScript

- 页面逻辑 `*.ts`；从 `utils/shared` 引用类型与函数
- MUST NOT 在页面内实现 BMR/TDEE/目标摄入/宏量公式
- 三餐拆分与文案映射可在 `constants/calorie-plan-copy.ts`

### Build

预览前：`pnpm build:miniprogram`（含 sync + 小程序 tsc）。

## Out of scope

- Web 完整方案页、云端存方案、与「我的」身体数据联动、食物库联动
