# Contract: shared content module

**Feature**: 006-cloud-db-seed  
**Package**: `@peakmeet/shared` → `src/content/`

## Exports (minimum)

| Export | Kind | Purpose |
| ------ | ---- | ------- |
| `Action`, `Equipment`, `TrainingPlan`, `Food`, … | types | 七实体；字段对齐 [data-model.md](../data-model.md) |
| `PUBLIC_COLLECTIONS` | const | 只读元组/数组 |
| `LIST_FILTER_KEYS` | const | `Record<PublicCollection, readonly string[]>` |
| `validateListQuery(input)` | fn | 返回 `Ok` 规范化参数或 `Err` |
| `validateGetByIdQuery(input)` | fn | 同上 |
| `DEFAULT_CONTENT_COVER` | const | `"/assets/images/content-placeholder.png"` |
| `resolveContentCover(cover?: string \| null)` | fn | 空/空白 → 缺省路径，否则原值 |

## validateListQuery 规范化结果

```ts
{
  collection: PublicCollection
  limit: number
  skip: number
  filter: Record<string, string | number | boolean>
}
```

## Constraints

- MUST NOT import `wx` / DOM / `wx-server-sdk`
- 单测：`__tests__/content-*.test.ts` 覆盖合法/非法集合、过滤、分页边界、缺省封面

## Consumers

- 云函数：校验后再查库
- 小程序：类型 + `resolveContentCover`（经 sync-shared）
