# Quickstart: 002-fitness-calc-shared

验证 `@peakmeet/shared` 健身计算内核：公式锁定、Result 错误模型、TDD 覆盖率。

## Prerequisites

- Node.js 20+、pnpm 9+
- 仓库已完成 `001-project-bootstrap`（可 `pnpm install`）
- 功能分支：`002-fitness-calc-shared`
- 契约与模型：[contracts/calc-api.md](./contracts/calc-api.md)、[data-model.md](./data-model.md)、[research.md](./research.md)

## Setup

```bash
cd /path/to/peakmeet
pnpm install
```

## Develop（TDD 顺序）

对每个公开计算能力：

1. 在 `packages/shared/__tests__/<name>.test.ts` 写失败测试（夹具期望见 research）
2. 在 `packages/shared/src/calc/` 实现最少代码使测试通过
3. 从 `packages/shared/src/index.ts` 导出
4. 重构并保持全绿

```bash
pnpm --filter @peakmeet/shared test
# 或根目录
pnpm test
```

覆盖率（实现阶段应配置 Vitest coverage，对 `src/calc/**` 要求 100%）：

```bash
pnpm --filter @peakmeet/shared exec vitest run --coverage
```

## Build & sync（可选，多端接入前）

```bash
pnpm --filter @peakmeet/shared build
pnpm sync:shared   # 将 CJS 拷到小程序 utils/shared（本功能可不改小程序页）
```

## Golden fixtures（手工/单测对照）

| Case | Expect |
| ---- | ------ |
| BMI 175 cm / 70 kg | bmi **22.9**，category `normal` |
| BMR male 30y / 175 / 70 | **1649** kcal |
| TDEE 1649 × sedentary | **1979**（1649×1.2） |
| Target cutMild TDEE 2000 BMR 1500 | target **1600**（−400），无兜底 |
| Target cutAggressive TDEE 1800 BMR 1600 | raw 1200 → 兜底 **1600**，`bmrFloorApplied` |
| 1RM 100×5 | **117** |
| Body fat male 85/75/30 | **18.5%**，`normal` |
| Body fat female 75/60/28 | **30.2%**，`high` |
| WHR male 90/100 | **0.9**，`moderate` |
| reps 0 或 13 | `ok: false`，`INVALID_REPS` |
| height ≤0 | `ok: false`，`INVALID_HEIGHT` |

## Acceptance checklist

- [ ] `getPeakMeetPing` 仍可用
- [ ] 上表公开函数均从包入口可 import
- [ ] 非法入参返回 `ok: false`，进程内无未捕获异常
- [ ] 减脂低于 BMR 夹具 100% 触发兜底
- [ ] `FITNESS_DISCLAIMER` 可导出且含「仅供参考」语义
- [ ] `pnpm test` 全绿；calc 覆盖率 100%
- [ ] `pnpm --filter @peakmeet/shared build` 产出 `.d.ts`

## Out of scope for this quickstart

- 小程序饮食 Tab / Web 工具页 UI
- 微信开发者工具预览业务页
