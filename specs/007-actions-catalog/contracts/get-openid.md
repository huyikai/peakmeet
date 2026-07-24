# Contract: getOpenId（云函数）

**Feature**: 007-actions-catalog  
**Runtime**: 微信云函数 + `wx-server-sdk`

## Purpose

为小程序收藏等用户私有读写提供当前用户 `openid`。不做收藏业务写入。

## Request

无业务字段（可忽略 `event`）。

## Response

成功：

```ts
{ ok: true, data: { openid: string } }
```

失败：

```ts
{ ok: false, code: 'UNAUTHORIZED' | 'INTERNAL', message: string }
```

实现：`cloud.getWXContext().OPENID`；空则 `UNAUTHORIZED`。

## Non-goals

- 不返回其它用户资料
- 不读写数据库
- 不替代内容查询 CF
