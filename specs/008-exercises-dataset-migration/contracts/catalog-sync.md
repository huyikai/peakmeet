# Contract: Catalog → CloudBase Sync

**Feature**: 008-exercises-dataset-migration  
**Command**: `pnpm db:sync`（具体参数由实现帮助输出为准）  
**Inputs**: 仅 `database/catalog/`、vendor media manifest、迁移映射和目标环境凭证

## Modes

- `--dry-run`: 只验证、读取云端现状并生成变更/引用/残留报告，不写云数据库或云存储
- `--apply`: 仅在同一 catalog digest 的 dry-run 成功且备份完成后允许
- `--resume <runId>`: 从检查点恢复，仍须复核 catalog digest 与备份
- `--rollback <runId>`: 从已验证备份恢复公共集合与被迁移引用

## Apply Sequence

1. 验证 source lock、catalog digest、1324/1324/1324、中文覆盖与引用
2. 确认显式目标环境，创建云数据库与相关媒体备份清单
3. 上传/复用 1,324 JPG 与 1,324 GIF 至稳定云路径
4. 以 catalog 替换 `actions`，按 catalog 重建 `equipment`，同步 plans/foods
5. 按已审核映射迁移训练计划和 `user_collect` 动作引用
6. 清理旧 80 动作文档、旧动作媒体及 catalog 外动作残留
7. 运行完整性门禁并写不可变摘要；全部通过后标记 completed

## Safety Gates

- 未匹配或歧义的计划引用：阻断 apply
- 未匹配收藏：保留原记录、纳入报告；清理旧目标前阻断完成态
- 无备份、备份 digest 无法验证、目标环境不明确：阻断 apply
- 任一写入失败：非零退出，状态为 failed，不得报告成功
- 日志不得打印密钥；常规同步不得下载外部资源

## Completion Invariants

- CloudBase `actions` 恰为 1,324 条且 ID 集合与 catalog 完全一致
- 2,648 个媒体 fileID 可访问；无 `asset://`、裸 GitHub URL、旧动作媒体
- 计划、器材、替代和已迁移收藏引用有效
- 每条动作具备 `provisional_third_party` 与逐条 Gym visual 署名
- 云端不存在旧 80 动作或 catalog 外动作残留

## Report

报告必须含 runId、环境、commit、catalog digest、备份位置/digest、各集合前后数量、上传/复用/删除媒体数、引用迁移/未匹配数、门禁结果和恢复命令。
