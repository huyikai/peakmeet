# Contract: exercises-dataset Source Lock

**Feature**: 008-exercises-dataset-migration  
**Authority**: `database/vendor/exercises-dataset/source.lock.json`

## Required Identity

- Repository: `hasaneyldrm/exercises-dataset`
- Commit: `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`
- Counts: exercises `1324`, JPG `1324`, GIF `1324`
- 必须锁定 commit tree、`exercises.json` blob、Schema、LICENSE、NOTICE 及每个快照文件 SHA-256

## Refresh Contract

人工 refresh 可访问上游，但必须：
1. 使用显式 commit，不接受 branch/latest
2. 下载到临时区，验证数量、Schema、引用、180×180 媒体和哈希
3. 生成完整 lock 后原子替换 vendor 快照
4. 输出 commit、tree/blob、增删改文件和许可差异报告
5. 任一门禁失败非零退出且不修改既有有效快照

## Consumer Contract

常规 catalog 生成、测试、`db:sync` 和小程序运行时只读 vendor，不访问 GitHub。消费者必须先验证 lock；不得忽略未知、缺失或额外媒体。

## Rights Metadata

每个 JPG/GIF 必须关联：

```json
{
  "rightsStatus": "provisional_third_party",
  "creditText": "© Gym visual — https://gymvisual.com/",
  "aiTrainingAllowed": false,
  "commercialUseBlocked": true
}
```

该元数据记录宪章临时例外，不代表 Gym visual 已授权。

## Failure Codes

- `SOURCE_COMMIT_MISMATCH`
- `SOURCE_COUNT_MISMATCH`
- `SOURCE_HASH_MISMATCH`
- `SOURCE_SCHEMA_INVALID`
- `SOURCE_MEDIA_INVALID`
- `SOURCE_LICENSE_MISSING`
