# Data Model: 004-calc-ui-contract

**Date**: 2026-07-23  
**Note**: 无持久化实体。下列为设计 token、样式契约与迁移清单的逻辑模型。

## BrandColorToken

| Field | Value | Role |
| ----- | ----- | ---- |
| name | `ink` \| `orange` \| `snow` | 品牌三色 |
| hex | `#0B0D10` / `#FF5A1F` / `#F2F4F7` | 权威值见 docs/brand |
| cssVar | `--pm-ink` / `--pm-orange` / `--pm-snow` | 小程序消费名 |
| usage | 见下表 | 用途边界 |

### Usage rules

| Token | Allowed | Forbidden |
| ----- | ------- | --------- |
| ink | 主文字、主按钮填充、结构描边、结果主数字 | — |
| orange | 选中描边、小点缀、风险浅底（低透明） | 主按钮实心、整串主数字、整屏大底 |
| snow | 页面背景/浅底体系 | 作为唯一强调色 |

### Derived tokens（非品牌第四主色）

| Field | Example role |
| ----- | ------------ |
| inkMuted | 次要文字、单位、免责声明 |
| surface | 表单/结果近白表面 |
| chipIdle | 未选中浅灰底 |
| danger | 校验错误文案（功能色） |

---

## ThemeStyleContract

单一入口：`styles/calc-theme.wxss`（内部 import tokens）。

| Class / pattern | Maps to |
| --------------- | ------- |
| page / `.pm-page` | snow 背景、ink 默认字色、统一 padding |
| `.pm-btn-primary` / `.pm-entry` | ink 实心 + 浅色字 |
| `.pm-chip` / `.pm-chip.active` | 未选中灰底；选中 orange 描边 + surface + ink 字 |
| `.pm-field` / `.pm-label` / `.pm-input` | 表单块 |
| `.pm-error` | danger 色错误提示 |
| `.pm-result-hero` / `.pm-result-value` / `.pm-result-unit` | 主数字 ink 大字；单位 muted |
| `.pm-risk` | 浅橙提示条 |
| `.pm-disclaimer` | 弱化免责声明 |

**Validation**: 页面不得再定义与上述冲突的主色硬编码（迁移完成后抽查）。

---

## MigrationChecklistItem

| Field | Rules |
| ----- | ----- |
| id | 稳定键，如 `diet-index`、`toolbox-bmi`、`calorie-plan` |
| path | 小程序页面路径 |
| status | `pending` \| `done` |
| doneWhen | 引用 calc-theme；主按钮/入口 Ink 实心；计算页含结果层级与免责；选中态符合契约（若有） |
| regression | 至少 1 次合法计算 + 1 次非法提示（入口/聚合页则验证导航） |

### Required items（本功能交付全部 done）

| id | path |
| -- | ---- |
| diet-index | `pages/diet/index` |
| toolbox-hub | `pages/diet/toolbox/index` |
| toolbox-bmi | `pages/diet/toolbox/bmi/index` |
| toolbox-bmr | `pages/diet/toolbox/bmr/index` |
| toolbox-body-fat | `pages/diet/toolbox/body-fat/index` |
| toolbox-whr | `pages/diet/toolbox/whr/index` |
| toolbox-one-rm | `pages/diet/toolbox/one-rm/index` |
| calorie-plan | `pages/diet/calorie-plan/index` |

**Transition**: `pending` → `done` 仅当完成定义满足；全部 `done` 后方可关闭存量迁移验收。

---

## BrandAssetRef

| Field | Rules |
| ----- | ----- |
| kind | `icon` \| `lockup-horizontal` \| `lockup-stacked` |
| src | `assets/brand/logo/...` 下既有文件 |
| where | 饮食 Tab / 工具箱聚合可选；计算页不强制 |

---

## Relationships

```text
docs/brand (authority)
    → BrandColorToken → tokens.wxss
         → ThemeStyleContract (calc-theme.wxss)
              → MigrationChecklistItem pages (consume)
BrandAssetRef → diet-index / toolbox-hub (optional display)
```
