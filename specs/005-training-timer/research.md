# Research: 005-training-timer

**Date**: 2026-07-24  
**Spec**: [spec.md](./spec.md)

## R1. 纯计时内核放置与 TDD

- **Decision**: 在 `packages/shared/src/timer/` 实现无平台依赖的会话引擎：
  - 配置校验（单段 1–3600s，组数 1–50）
  - 状态：`idle | running | paused | completed | cancelled`
  - `tick(session, nowMs)` 基于墙钟推算剩余/已用，发出阶段切换与完成事件（纯数据，不调 vibrate）
  - `pause` / `resume` 用「暂停时冻结剩余 + resume 时重算 deadline」保证墙钟正确
  - `buildWorkoutCheckInPayload(session)` 造型打卡载荷
  - Vitest `__tests__/timer-*.test.ts` 覆盖正常/边界/异常，覆盖率 100%
- **Rationale**: Constitution Shared Logic First + TDD；双端可复用规则；页面不可各自实现倒计时算术
- **Alternatives considered**: 仅小程序内实现 — 难测且违宪；云函数心跳 — 过重且违纯前端

## R2. 墙钟模型（前台刷新 + 后台校准）

- **Decision**:
  - 倒计时类：维护 `phaseEndsAtMs`（绝对墙钟）；显示剩余 = `max(0, ceil((phaseEndsAtMs - nowMs)/1000))`
  - 正计时：维护 `accumulatedMs` + `runningSinceMs`；已用 = accumulated + (now - runningSince)
  - 暂停：倒计时保存 `remainingMs`；正计时把段内已用并入 `accumulatedMs` 并清空 `runningSinceMs`
  - 小程序用 `setInterval(200–250ms)` 或每秒 tick 刷新 UI；**权威时间来自 `Date.now()`**，禁止仅靠 interval 累减秒数
  - `onShow`：立即 `tick`；若已完成则进入完成态并补发提醒
- **Rationale**: 满足 SC 后台误差 ≤1s；微信后台 JS 定时器不可靠
- **Alternatives considered**: 纯 setInterval 递减 — 后台漂移；Worker — 小程序支持有限、过度设计

## R3. 后台提醒可达性（平台现实）

- **Decision**（产品验收口径与实现策略对齐 spec）：
  1. **MUST**：墙钟正确；回前台完成态与补提醒
  2. **SHOULD**：在前台/刚切后台仍存活时，到点触发 `vibrateShort` + 短提示音
  3. **不做本版强依赖**：系统级推送、常驻后台音频保活（审核与耗电成本高）
  - 可选增强（非门禁）：短 `InnerAudioContext` 提示音文件；用户首次开始前由手势触发解锁音频
  - quickstart 标明：后台到期提醒以「回前台必达完成态+补提醒」为硬验收；静默后台是否听到声音为机型相关 soft 目标
- **Rationale**: MVP 低运维；诚实对待微信限制，避免虚假「锁屏必响」承诺
- **Alternatives considered**: BackgroundAudioManager 静音循环保活 — 体验差、审核风险；订阅消息 — 需用户授权且非即时

## R4. 三模式状态机细节

- **Decision**:
  - **Rest**：单段倒计时；完成 → summary；「再用同时长」= 同 config 新建 running 会话
  - **Tabata**：段序列 `work, rest` × N；当前 `roundIndex` 1…N、`phase: work|rest`；段切换产生 `phase_complete` 事件；全部 `2N` 段完成 → `session_complete`
  - **Stopwatch**：无 deadline；用户「结束」→ completed + 摘要时长
  - 非法配置：`validate*` 返回错误码 + 中文消息键或直接中文（与 calc 风格一致可用 `CalcResult` 模式或 timer 专用 Result）
- **Rationale**: 澄清 Tabata 含末组休息；与 FR 一致
- **Alternatives considered**: 末组跳过休息 — 澄清否决

## R5. 小程序页面与唤起

- **Decision**:
  - 路由：`pages/train/timer/index`；`app.json` 注册；训练 Tab `pages/train/index` 增加入口按钮
  - 唤起：`wx.navigateTo({ url: '/pages/train/timer/index?mode=rest&restSec=90' })`（见 contracts）
  - `onLoad` 解析 query → 预填 → **不** autoStart；用户点开始
  - 单页内切换三模式（未开始时可切换）；进行中锁定模式直至取消/完成
- **Rationale**: 计划库未上线也可测唤起；澄清不自动开始
- **Alternatives considered**: 三模式三页面 — 重复；插件 — 过重

## R6. 提醒适配层

- **Decision**: `packages/miniprogram/utils/timer-alerts.ts`（或页面内私有模块）：
  - `notifyPhaseChange()` / `notifySessionComplete()` → `wx.vibrateShort` + 尝试 `InnerAudioContext.play()`
  - 音频失败静默忽略，依赖震动与 UI 文案
  - shared 只返回事件列表，由页面消费后调用 alerts
- **Rationale**: 平台 API 不出 shared
- **Alternatives considered**: shared 注入 callback 接口 — 可测性略好但易把平台味渗入；本版事件数组更简单

## R7. 打卡载荷

- **Decision**: 摘要页按钮「打卡」调用 `buildWorkoutCheckInPayload`；结果暂存页面 `lastCheckIn` 供调试展示或 `console`；**不**写 storage/云库。跳过则不调用 builder。
- **Rationale**: 澄清可选打卡；后续模块订阅同一类型
- **Alternatives considered**: 自动打卡 — 澄清否决；本地 storage — 越界本功能

## R8. UI / 品牌

- **Decision**: 主时间极大字号（≥96rpx）；Ink 主数字；主按钮 Ink 实心；进行中阶段可用 Orange 小标签点缀（非整串数字着色）；复用 `--pm-*` tokens；免责声明弱化置底
- **Rationale**: Constitution VIII + 训练中可读
- **Alternatives considered**: 引入 Vant 等 — 禁止重型 UI 库

## R9. 无需澄清残留

Technical Context 无 `NEEDS CLARIFICATION`：澄清会话 5 项与宪章约束已足够进入设计。
