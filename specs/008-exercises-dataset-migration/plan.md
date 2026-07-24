# Implementation Plan: exercises-dataset 权威数据迁移

**Branch**: `008-exercises-dataset-migration` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

## Summary

固定 `hasaneyldrm/exercises-dataset` 提交 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`，将 1,324 条数据、1,324 JPG、1,324 GIF、许可和 NOTICE 保存为仓库 vendor 快照；以可测试转换生成中文化、分层且稳定 ID 的 catalog。同步流程只读 catalog，先 dry-run 与备份，再替换 CloudBase 动作/器材并迁移计划、收藏引用。查询升级为稳定分页、过滤与搜索，详情展示中文步骤、GIF 和逐条 Gym visual 署名。

## Technical Context

**Language/Version**: TypeScript（Node.js ≥20）；现有 Python 图片脚本仅缩减职责，不新增业务逻辑  
**Primary Dependencies**: pnpm workspace、Vitest、微信云开发 SDK/现有同步工具、原生微信小程序  
**Storage**: Git 中 `database/vendor/` 与 `database/catalog/`；CloudBase 云数据库与云存储  
**Testing**: shared 转换/查询 TDD 100%；来源锁、catalog、引用、媒体和同步契约测试；测试环境端到端验证  
**Target Platform**: 本地/CI 维护流程、CloudBase、小程序  
**Performance Goals**: 1,324 条可稳定分页；首屏常规网络 3 秒内可交互；同步可断点恢复  
**Constraints**: 常规流程不得联网取上游；无 `asset://`/裸 GitHub URL 入云；Gym visual 仅临时非商用例外；不得静默丢失引用  
**Scale/Scope**: 1,324 动作、28 类来源器材归一、2,648 媒体、旧 80 动作及其计划/收藏引用

## Constitution Check

_GATE: Phase 0 前与 Phase 1 后均须通过。_

### Pre-research

- [x] **Stack Lock / TypeScript First**: 沿用 pnpm、TS、CloudBase、原生小程序，无新后端
- [x] **Shared Logic / TDD**: 解析、taxonomy、ID、查询 DTO 与纯迁移规则进入 shared 并先写测试
- [x] **Source Provenance**: commit/blob/SHA-256、LICENSE、NOTICE 和 vendor 快照完整入库
- [x] **Catalog Authority**: `database/catalog/` 是 CloudBase 唯一结构化输入，单向同步
- [x] **Compliance Exception**: 按 v1.3.0 标记 `provisional_third_party`、逐条署名、禁止 AI 训练；商业发布前替换/授权
- [x] **Safety**: dry-run、备份、引用报告和完整性门禁先于破坏性替换
- [x] **Product Boundary**: 仅动作数据、查询及既有小程序展示；无 CMS、Web 动作库、自建服务

### Post-design

- [x] data model 分隔 source/raw、localized/transformed、enrichment，未冒充上游字段
- [x] 三份核心契约覆盖来源锁、catalog 同步、内容查询
- [x] 迁移状态与回滚条件可审计，计划/收藏未匹配项不会被删除
- [x] 006/007 冲突约定由 008 明确取代

## Project Structure

### Documentation

```text
specs/008-exercises-dataset-migration/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── source-lock.md
│   ├── catalog-sync.md
│   └── content-query.md
└── tasks.md
```

### Planned Source Changes

```text
database/
├── vendor/exercises-dataset/       # 固定快照、source.lock、许可、JPG/GIF
├── catalog/                        # actions/equipment/training-plans/foods
├── enrichment/                     # 中文术语、名称与 enrichment
└── migrations/                     # old→new 映射和人工报告
packages/shared/src/content/        # 类型、转换、taxonomy、查询 DTO
packages/cloudfunctions/contentList/
packages/cloudfunctions/contentGetById/
packages/miniprogram/pages/train/actions/
scripts/                            # refresh、build catalog、validate、db sync
```

**Structure Decision**: vendor 只保存不可变来源；catalog 保存可部署结构化输出；enrichment 和 migration evidence 分开版本化。CloudBase 与小程序都不成为内容编辑源。

## Delivery Phases

1. 锁定并导入来源快照，建立哈希与许可门禁
2. 以 TDD 建立分层模型、taxonomy、中文化和 catalog 生成
3. 建立旧 ID 映射，迁移计划/食物至 catalog，生成收藏迁移策略
4. 重构媒体 manifest 与 CloudBase dry-run/备份/替换/恢复流程
5. 实现分页、过滤、搜索和小程序中文详情/署名
6. 测试环境全链路验收后在目标环境执行门禁迁移

## Complexity Tracking

Gym visual 媒体许可并非已授权；这是宪章 v1.3.0 记录的项目所有者临时风险决定。计划通过逐条署名、禁止商业化/AI 训练、固定原始尺寸和商业发布前强制替换来限制风险，但不能消除第三方权利风险。
