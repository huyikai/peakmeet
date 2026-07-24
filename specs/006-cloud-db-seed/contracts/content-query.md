# Contract: contentList / contentGetById

**Feature**: 006-cloud-db-seed  
**Runtime**: 微信云函数（`wx-server-sdk`）  
**Shared**: `packages/shared` `validateListQuery` / `validateGetByIdQuery`

## Whitelist collections

`actions` | `equipment` | `training_plans` | `foods`

其它集合名 → `ok: false`, `code: "INVALID_COLLECTION"`

## Envelope

```ts
type Ok<T> = { ok: true; data: T }
type Err = { ok: false; code: string; message: string }
type Envelope<T> = Ok<T> | Err
```

---

## contentList

### Request (`event`)

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `collection` | string | yes | 白名单 |
| `limit` | number | no | 默认 `20`；范围 1–100 |
| `skip` | number | no | 默认 `0`；≥0 |
| `filter` | Record<string, string \| number \| boolean> | no | 仅允许该集合白名单字段；值等值匹配 |

**Per-collection filter keys**（见 [data-model.md](../data-model.md)）:

| collection | keys |
| ---------- | ---- |
| actions | `difficulty`, `primaryScene` |
| equipment | `type`, `primaryScene`, `difficulty` |
| training_plans | `goal`, `scene`, `difficulty`, `category`, `hot` |
| foods | `category`, `recommendGrade` |

非法 key → `INVALID_FILTER`

### Response `data`

```ts
{
  items: unknown[]  // 文档数组（类型由 collection 决定）
  total?: number    // 可选；若实现成本高可省略，但 items.length 必须正确
}
```

排序：`sortWeight` 降序，其次 `_id` 升序（稳定）。

---

## contentGetById

### Request

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `collection` | string | yes | 白名单 |
| `id` | string | yes | 非空；即文档 `_id`/slug |

### Response `data`

```ts
{ item: Record<string, unknown> }
```

不存在 → `ok: false`, `code: "NOT_FOUND"`（非抛裸错）

---

## Error codes

| code | Meaning |
| ---- | ------- |
| `INVALID_COLLECTION` | 集合不在白名单 |
| `INVALID_FILTER` | 过滤字段非法 |
| `INVALID_PAGINATION` | limit/skip 非法 |
| `INVALID_ID` | id 空 |
| `NOT_FOUND` | 无文档 |
| `INTERNAL` | 其它失败（message 可读、无密钥） |

## Non-goals

- 不接受任意 `where` / 聚合管道客户端透传
- 不读写用户三表
- 不提供写/删/同步接口
