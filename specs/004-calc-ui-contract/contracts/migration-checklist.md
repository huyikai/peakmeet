# Contract: Diet Path UI Migration Checklist

**Feature**: 004-calc-ui-contract  
**Related**: [data-model.md](../data-model.md)

本功能交付前，下表全部行 MUST 为 `done`。

| id | Page path | Status | Done criteria |
| -- | --------- | ------ | ------------- |
| diet-index | `pages/diet/index` | done | `@import` calc-theme；主入口按钮 Ink 实心；背景 Snow 体系；品牌 logo 可选且来自 assets/brand |
| toolbox-hub | `pages/diet/toolbox/index` | done | 同上；卡片/入口风格与主题一致 |
| toolbox-bmi | `pages/diet/toolbox/bmi/index` | done | calc-theme；Ink 主按钮；选中态 Orange 描边；结果主数字 Ink；免责声明弱化可见；业务路径可用 |
| toolbox-bmr | `pages/diet/toolbox/bmr/index` | done | 同 BMI |
| toolbox-body-fat | `pages/diet/toolbox/body-fat/index` | done | 同 BMI（含模式切换选中态） |
| toolbox-whr | `pages/diet/toolbox/whr/index` | done | 同 BMI |
| toolbox-one-rm | `pages/diet/toolbox/one-rm/index` | done | 同 BMI |
| calorie-plan | `pages/diet/calorie-plan/index` | done | 同 BMI；hero 目标热量 Ink；风险条非整屏橙 |

**Rules**

- 实现中可分批改 `Status`；验收关闭前禁止残留 `pending`
- 每计算页回归：1 次合法计算 + 1 次空/非法输入提示
- 入口/聚合回归：可进入各子页
- MUST NOT 修改 shared 计算公式或既有交互语义
