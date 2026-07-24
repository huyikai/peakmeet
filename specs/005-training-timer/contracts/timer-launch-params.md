# Contract: Timer Launch Params（小程序唤起）

**Page**: `pages/train/timer/index`  
**Related**: [data-model.md](../data-model.md)

## Navigation

```text
/pages/train/timer/index?mode=rest&restSec=90
/pages/train/timer/index?mode=tabata&workSec=20&restSec=10&rounds=8
/pages/train/timer/index?mode=stopwatch
```

训练计划（未来）示例：

```js
wx.navigateTo({
  url: '/pages/train/timer/index?mode=rest&restSec=120',
});
```

## Query fields

| Key | Type | Required | Notes |
| --- | ---- | -------- | ----- |
| mode | string | yes（唤起时） | `rest` \| `tabata` \| `stopwatch` |
| restSec | string/number | rest/tabata 可选 | 解析为 int；越界→默认 |
| workSec | string/number | tabata 可选 | 同上 |
| rounds | string/number | tabata 可选 | 同上 |

## Behavior

1. 解析成功 → 预填对应模式配置，`status=idle`
2. **MUST NOT** autoStart
3. 缺 mode 或非法 mode → 默认 `rest` + 默认时长，仍 idle
4. 独立入口（训练 Tab 按钮）可不带 query，等同 standalone 默认态
5. 页面内部标记 `source=launch` 当且仅当带有有效唤起 query（或显式 source）

## Out of scope

- 云函数代开页面
- App 间 URL Scheme（本版仅小程序内 navigateTo）
