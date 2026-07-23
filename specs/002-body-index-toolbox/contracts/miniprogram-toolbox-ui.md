# Contract: Miniprogram Body Index Toolbox UI

**Package**: `packages/miniprogram`  
**Depends on**: synced `@peakmeet/shared` via `utils/shared`

## Routes

| Path | Type | Title (suggested) |
| ---- | ---- | ----------------- |
| `pages/diet/index` | Tab | 饮食（含入口） |
| `pages/diet/toolbox/index` | Page | 身体指数工具箱 |
| `pages/diet/toolbox/bmi/index` | Page | BMI 计算 |
| `pages/diet/toolbox/bmr/index` | Page | 基础代谢 |
| `pages/diet/toolbox/body-fat/index` | Page | 体脂估算 |
| `pages/diet/toolbox/whr/index` | Page | 腰臀比 |
| `pages/diet/toolbox/one-rm/index` | Page | 1RM 估算 |

所有非 Tab 页须注册于 `app.json` → `pages`。

## Hub page

- 展示 5 张入口卡片，文案对应：BMI、基础代谢、体脂估算、腰臀比、1RM 估算
- `tap` → `wx.navigateTo` 对应工具页
- 无计算结果、无表单

## Calculator page (common)

### Required UX

1. 表单字段按 [data-model.md](../data-model.md)；单位文案 cm / kg / 次
2. 主按钮「计算」；禁止输入即自动出正式结果
3. 成功：同页结果区展示数值 + 通俗解读 + 注意事项 + 底部 `DISCLAIMER_ZH`
4. 失败：中文 `errorTip`，隐藏结果区
5. 任意相关输入变更：清空结果
6. 每次进入：空白表单（不读 storage、不预填）

### Body-fat specifics

- 模式切换：`简易估算` | `围度法`
- 默认简易；切换时切换可见字段并清空结果
- 围度法女性显示臀围必填

### BMI specifics

- 结果同时展示中国成人常用标准与 WHO 对照，并标注来源

### WHR specifics

- 必填性别；风险文案随性别切点

## Diet Tab entry

- `pages/diet/index` 提供可发现入口（按钮/列表项）进入 `pages/diet/toolbox/index`
- 不替换 Tab 本身为工具箱

## TypeScript

- 页面逻辑 `*.ts`；`require('../../../../utils/shared/index.js')` 或项目约定相对路径
- 类型从 sync 的 `index.d.ts` 引用；不重复声明与 shared 等价的业务类型
- 禁止在页面内实现 BMI/BMR/体脂/WHR/1RM 公式

## Build

预览前执行：`pnpm build:miniprogram`（含 sync + 小程序 tsc）。
