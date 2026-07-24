# Implementation Plan: 训练计时器

**Branch**: `005-training-timer` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-training-timer/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

在微信小程序训练 Tab 落地通用训练计时器：组间休息倒计时、Tabata（每组=训练+休息，共 `2N` 段）、正计时。可复用纯计时状态机与校验放入 `packages/shared`（TDD）；小程序负责大字体 UI、震动/提示音、前后台墙钟校准、训练入口与唤起参数解析、可选打卡载荷。澄清锁定：打卡可选、唤起不自动开始、单段 1–3600s / 组数 1–50、休息结束可「再用同时长」。

## Technical Context

**Language/Version**: TypeScript 5.x（shared + 小程序页面逻辑）；WXML/WXSS UI

**Primary Dependencies**: 微信小程序原生 API（`wx.vibrateShort` / `InnerAudioContext`、页面 `onShow`/`onHide`）；Vitest（shared TDD）；既有 `pnpm build:miniprogram` / sync shared；品牌 token（`docs/brand` / `styles/tokens.wxss`）

**Storage**: 无云库写入；打卡仅内存/回调载荷预留

**Testing**: `packages/shared/__tests__/timer*.test.ts` 强制 TDD 100%；UI 以 quickstart 人工验收

**Target Platform**: 微信小程序（开发者工具 + 真机；后台/锁屏场景真机优先）

**Project Type**: pnpm monorepo — `packages/shared` + `packages/miniprogram`（不改 Web / 云函数）

**Performance Goals**: 主时间显示秒级刷新流畅；切前后台校正 ≤1s 误差；页面轻量无重型 UI 库

**Constraints**: shared 禁止小程序 API；禁止另起主色板/重型组件库；不自动开始（唤起）；不自动连环倒计时；无医疗表述；免责声明可见

**Scale/Scope**: shared 计时内核 + 训练 Tab 入口 + 计时器页（三模式）+ 唤起约定 + 打卡载荷类型；不含计划库正文与打卡持久化

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

PeakMeet Constitution v1.2.0 — 全部勾选方可继续；NON-NEGOTIABLE 项不可豁免。

### Pre-research

- [x] **Stack Lock**: 原生小程序 + shared TS；无 Taro/uni-app/重型 UI/自建后端
- [x] **TypeScript First**: 计时状态/配置/载荷完整类型；无新增纯 JS 业务源码
- [x] **Backend**: 无云函数/云库；纯前端计时
- [x] **Shared Logic First**: 校验、状态迁移、墙钟推算、打卡造型进 shared
- [x] **TDD**: shared timer 红→绿→重构；`__tests__/timer*.test.ts`；覆盖率 100%
- [x] **Product Boundary**: 仅小程序训练计时器；Web 不计时器复刻
- [x] **MVP & Low Ops**: 无计划库依赖即可独立验收；存储后接
- [x] **Compliance**: 辅助计时免责声明；无超负荷鼓动；本版不持久化隐私数据
- [x] **Brand & Visual**: Ink/Orange/Snow；大字体可读；对齐 docs/brand
- [x] **Monorepo Paths**: `packages/shared`、`packages/miniprogram/pages/train/**`
- [x] **Decision Priority**: 小程序体验 → 低运维 → shared → 合规

### Post-design (Phase 1)

- [x] contracts / data-model / quickstart 与澄清一致（可选打卡、2N Tabata、唤起不自动开始、上下限、再用同时长）
- [x] 设计未引入栈外依赖；后台策略以墙钟校准为主（见 research）

## Project Structure

### Documentation (this feature)

```text
specs/005-training-timer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/shared/
├── src/timer/                 # 纯计时内核（新建）
│   ├── types.ts
│   ├── validate.ts
│   ├── session.ts             # create / pause / resume / cancel / tick(nowMs)
│   ├── checkIn.ts             # buildWorkoutCheckInPayload
│   └── index.ts
├── src/index.ts               # re-export timer
└── __tests__/timer*.test.ts

packages/miniprogram/
├── pages/train/
│   ├── index.*                # 入口：跳转计时器
│   └── timer/
│       └── index.*            # 三模式 UI + 平台适配
├── utils/timer-alerts.ts      # vibrate + audio（可选拆分）
├── assets/audio/              # 短提示音（若需打包）
└── styles/                    # 复用 tokens；计时大字可用页面局部 + brand 色
```

**Structure Decision**: 墙钟无关的会话状态与校验在 shared；震动/音频/生命周期仅在 miniprogram。训练 Tab 占位页增加入口；计时器为子页 `pages/train/timer`，支持 `navigateTo` query 唤起。

## Complexity Tracking

> 无 Constitution 违规项，本表留空。
