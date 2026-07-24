# Contract: Action Content Query

**Feature**: 008-exercises-dataset-migration  
**Collections**: `actions`（列表/详情）、`equipment`（筛选选项）

## List Request

```json
{
  "collection": "actions",
  "limit": 20,
  "cursor": null,
  "filter": {
    "bodyPart": null,
    "equipmentId": null,
    "difficulty": null,
    "goal": null
  },
  "keyword": ""
}
```

- `limit`: 1–50，默认 20；不得用 `limit=100` 假装全库
- `cursor`: 不透明稳定游标，绑定排序与规范化查询；条件变化必须重新从空游标开始
- 过滤字段仅白名单值；多维 AND
- `keyword`: 对中文名、英文名、aliases 做 trim/大小写等规范化搜索
- 未知字段、非法枚举、过期/不匹配游标返回明确错误，不接受任意 where

## List Response

```json
{
  "ok": true,
  "data": {
    "items": [],
    "nextCursor": "opaque-or-null",
    "hasMore": false
  }
}
```

列表项只包含 `_id`、中文名、英文名、部位/器材/难度/目标摘要、JPG cover fileID、可展示审核状态；不得返回 raw、多语言全集或完整 enrichment。

## Detail Request / Response

请求 `{ "collection": "actions", "id": "exercise_dataset_<sourceId>" }`。成功返回完整分层 `CatalogAction`；不存在返回 `NOT_FOUND`。详情必须提供 JPG、GIF、中文步骤、来源和逐条署名；未审核 enrichment 可保留元数据但客户端不得当已审核内容展示。

## Paging Invariants

- 固定查询快照/排序语义下连续翻页无重复、无遗漏
- 同一请求与游标重复调用结果确定
- 页面变更筛选/关键词或发起新请求后，旧响应不得覆盖新结果
- “今日练什么”从完整 1,324 条有效动作范围抽样，不从当前页数组抽样

## Error Codes

`INVALID_COLLECTION`, `INVALID_FILTER`, `INVALID_LIMIT`, `INVALID_CURSOR`, `NOT_FOUND`, `CONTENT_UNAVAILABLE`
