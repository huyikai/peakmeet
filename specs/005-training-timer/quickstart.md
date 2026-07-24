# Quickstart: 005-training-timer

**Date**: 2026-07-24  
**Goal**: 验证 shared 计时内核 + 小程序三模式、墙钟校准、唤起与可选打卡

## Prerequisites

- Node.js ≥ 20，pnpm 9+
- `pnpm install`
- 微信开发者工具打开 `packages/miniprogram`（真机测后台/震动更佳）
- 阅读：[spec.md](./spec.md)、[contracts/shared-timer-api.md](./contracts/shared-timer-api.md)、[contracts/timer-launch-params.md](./contracts/timer-launch-params.md)

## 1. Shared 测试（TDD 门禁）

```bash
pnpm --filter @peakmeet/shared test
```

**期望**：`timer` 相关用例全绿；覆盖校验边界、暂停恢复、Tabata `2N` 段、墙钟跳跃完成。

## 2. 构建小程序

```bash
pnpm build:miniprogram
```

**期望**：无 TS 错误；`utils/shared` 含 timer 导出。

## 3. 前台冒烟（DevTools）

1. 训练 Tab → 打开计时器  
2. **组间休息**：设 5s → 开始 → 大字体倒数 → 到点震动/音或完成文案 → 摘要「再用同时长」再跑一轮；「打卡」产生载荷，「跳过」不产生  
3. **Tabata**：3s / 2s / 2 组 → 共 4 段后完成  
4. **正计时**：开始 → 暂停 → 继续 → 结束 → 摘要时长合理  
5. 非法：0 秒 / 组数 0 → 中文拦截  

## 4. 唤起（不自动开始）

开发者工具或临时代码：

```js
wx.navigateTo({ url: '/pages/train/timer/index?mode=rest&restSec=45' });
```

**期望**：模式与 45s 已预填；需手动点开始才计时。

## 5. 后台/锁屏（真机优先）

1. 休息倒计时 15s → 立即切后台或锁屏 ≥10s → 回前台  
2. **期望**：显示与墙钟一致（误差 ≤1s）；若已到期则完成态 + 补提醒  

## 6. 完成门禁

- [x] shared timer 测试全绿（含 coverage 100%）  
- [x] 三模式独立完整会话（代码已接线；DevTools/真机目视确认）  
- [x] Tabata 2 组 = 4 段（单测覆盖）  
- [x] 唤起预填且不自动开始  
- [x] 可选打卡载荷字段齐全  
- [x] 品牌大字体可读、有免责声明  

## Out of scope

- 训练计划库正文、打卡云存储、「我的」记录列表、Web 计时器  
