# Contract: database security rules

**Feature**: 006-cloud-db-seed  
**Files**: `database/rules/<collection>.json`

## Public content

`actions` | `equipment` | `training_plans` | `foods`:

```json
{
  "read": true,
  "write": false
}
```

含义：小程序端可读；小程序端不可写；管理端/同步不受限。

## User private

`user_collect` | `user_body_record` | `user_train_record`:

```json
{
  "read": "doc.openid == auth.openid",
  "write": "doc.openid == auth.openid"
}
```

客户端查询必须带 `openid: '{openid}'`（安全规则子集要求）。本版不交付写云函数；未来直写时 create 数据的 `openid` 必须等于当前用户。

## Apply

开发者在云开发控制台为各集合粘贴对应 JSON，或按 README 使用支持的 CLI。规则文件为仓库真相源。
