# Contract: Miniprogram Calc Theme UI

**Package**: `packages/miniprogram`  
**Brand source**: [docs/brand/README.md](../../../docs/brand/README.md)  
**Related**: [data-model.md](../data-model.md)、[research.md](../research.md)

## Shared style entry

| Artifact | Path | Rule |
| -------- | ---- | ---- |
| Tokens | `styles/tokens.wxss` | 定义 `--pm-ink` / `--pm-orange` / `--pm-snow` 及衍生 |
| Theme entry | `styles/calc-theme.wxss` | **唯一**推荐入口；`@import` tokens + 通用类 |
| Legacy shim | `pages/diet/toolbox/calc-common.wxss` | 可选：仅转发 `@import` 到 calc-theme |

计算页 / 饮食入口 / 工具箱聚合页 MUST：

```wxss
@import "/styles/calc-theme.wxss";
/* 或相对路径等价引用 */
```

MUST NOT：在页内重新定义与品牌冲突的主色（如独立 `#111`/`#purple` 主按钮体系）作为唯一来源。

## Class contract（最小集）

| Class | Required look |
| ----- | ------------- |
| `.pm-btn-primary` / `.pm-entry` | 背景 Ink，文字浅色 |
| `.pm-chip.active` | Orange 描边 + 浅底 + Ink 字 |
| `.pm-chip`（默认） | 中性浅灰底 |
| `.pm-result-value` | Ink，显著字号 |
| `.pm-result-unit` | muted |
| `.pm-disclaimer` | 小于正文、muted、位于结果之后 |
| `.pm-error` | 可见错误色（功能色），不压过主按钮可读性 |
| `.pm-risk` | 浅橙提示，非整屏橙底 |

WXML 可逐步把旧 class（`.primary`、`.sex-btn.active`）映射到 `.pm-*`，或在 calc-theme 内为旧 class 提供别名选择器，减少一次性改 WXML 风险。**别名允许，但不得保留冲突填色。**

## Information hierarchy

1. Hero / 主数字（Ink）  
2. 次要指标  
3. 说明 / 温馨提示 / 风险  
4. 免责声明（最弱，仍可见）

## Logo

- 路径前缀：`/assets/brand/logo/`
- 入口页可用 `icon.png` 或 `lockup-horizontal.png`
- 计算页不强制 Logo

## Out of scope

- shared 包样式、Web 主题、暗黑模式
