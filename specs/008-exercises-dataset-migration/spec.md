# Feature Specification: exercises-dataset 权威数据迁移

**Feature Branch**: `008-exercises-dataset-migration`  
**Created**: 2026-07-24  
**Status**: Draft  
**Input**: 固定外部动作数据集，将仓库 vendor 快照转换为 catalog，并安全单向同步至 CloudBase，替代旧动作种子与媒体。

## User Scenarios & Testing

### User Story 1 - 可复现地维护完整动作库 (Priority: P1)

维护者需要从固定来源得到可审计、可重复生成的 1,324 条动作及其媒体，不因上游变化或网络状态产生漂移。

**Independent Test**: 在离线环境仅使用仓库快照重建 catalog，得到 1,324 条稳定 ID 动作、1,324 张 JPG、1,324 张 GIF，来源锁与哈希全部通过。

**Acceptance Scenarios**:
1. **Given** 来源锁固定提交 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`，**When** 校验快照，**Then** 数据、许可、NOTICE、1,324 JPG 与 1,324 GIF 均完整且哈希一致
2. **Given** 常规构建、测试或同步，**When** 外网不可用，**Then** 流程仍只依赖仓库快照并可完成
3. **Given** 任一来源文件、数量或哈希不符，**When** 生成 catalog，**Then** 在写入前失败并报告差异

### User Story 2 - 获得中文、可追溯的动作内容 (Priority: P1)

用户需要以中文名称和中文步骤浏览动作，同时维护者能区分上游原始字段、确定性转换和后续 enrichment，避免把派生内容冒充原始数据。

**Independent Test**: 抽取任意动作可追溯到 sourceId；中文名与全部步骤存在；raw、transformed、enrichment 三层边界及版本/审核状态明确。

**Acceptance Scenarios**:
1. **Given** 任一来源动作，**When** 转换，**Then** `_id` 为 `exercise_dataset_<sourceId>` 且重复生成不变
2. **Given** 原始英文及多语言字段，**When** 生成展示内容，**Then** 原始字段不被覆盖，中文名和中文步骤位于 localized 层
3. **Given** 推导出的难度、目标、要点、避坑或替代关系，**When** 入库，**Then** 仅位于 enrichment 层并记录生成方式、版本与审核状态

### User Story 3 - 安全替换 CloudBase 公共内容 (Priority: P1)

维护者需要先 dry-run 和备份，再以仓库 catalog 为唯一结构化权威源替换云端动作与器材；迁移训练计划和收藏引用，任何无法映射的数据不得静默丢失。

**Independent Test**: 在测试环境完成 dry-run、备份、同步、引用迁移与完整性门禁；报告明确列出所有已迁移、未匹配和阻断项。

**Acceptance Scenarios**:
1. **Given** 旧 80 动作、旧动作媒体与旧 seed 权威源存在，**When** 执行迁移，**Then** 它们被新 catalog 和新媒体替代且不再作为部署输入
2. **Given** 训练计划或 `user_collect` 引用旧动作 ID，**When** 映射明确，**Then** 引用改写为稳定新 ID
3. **Given** 引用无法唯一映射，**When** dry-run，**Then** 原记录保留、进入人工报告且正式替换被阻断，不得删除或静默跳过
4. **Given** 尚未完成备份或完整性门禁，**When** 请求正式同步，**Then** 同步拒绝执行

### User Story 4 - 在 1,324 条规模下检索动作 (Priority: P1)

用户需要通过稳定分页、四维过滤和中英文名称搜索浏览动作，列表只加载摘要，详情按 ID 加载完整中文内容与演示媒体。

**Independent Test**: 连续遍历分页无重复、无遗漏；过滤与搜索可组合；详情显示中文名、中文步骤、JPG、GIF 与逐条署名。

**Acceptance Scenarios**:
1. **Given** 1,324 条动作，**When** 分页遍历，**Then** 每条恰好出现一次且下一页游标稳定
2. **Given** 部位、器材、难度、目标及关键词，**When** 组合查询，**Then** 返回满足全部条件的摘要
3. **Given** 用户打开详情，**When** 内容可用，**Then** 显示中文名、英文别名、中文步骤、JPG 封面、GIF 演示及 `© Gym visual — https://gymvisual.com/`

### Edge Cases

- sourceId 重复、缺失或含不安全字符：阻断 catalog 生成并报告
- 中文名或任一步骤缺失：完整性门禁失败，不以英文静默代替
- 媒体缺失、哈希不符、尺寸不为 180×180：阻断同步
- 分页期间筛选变化或请求乱序：废弃旧请求结果，不能混页
- enrichment 缺失或未审核：隐藏对应展示区块，不伪造内容
- 云端出现 catalog 外残留：迁移模式必须报告并按备份后替换策略清理
- 同步中断：保留备份和检查点；恢复前不得宣告新版本生效

## Requirements

### Functional Requirements

- **FR-001**: 来源 MUST 固定为 `hasaneyldrm/exercises-dataset` 提交 `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`，并锁定 tree、数据 blob、许可/NOTICE 与逐文件 SHA-256
- **FR-002**: 仓库快照 MUST 包含恰好 1,324 条动作、1,324 张 JPG、1,324 张 GIF；常规构建、测试、同步与小程序运行时 MUST NOT 访问外部内容源
- **FR-003**: 数据流 MUST 严格为 `database/vendor/` 快照 → `database/catalog/` → CloudBase 单向同步；`database/catalog/` 是唯一结构化部署权威源
- **FR-004**: 每条动作稳定 ID MUST 为 `exercise_dataset_<sourceId>`，且刷新、环境切换与媒体替换不得改变
- **FR-005**: 每条动作 MUST 有中文展示名、英文别名和完整中文步骤；原始字段 MUST 原样保留并可追溯
- **FR-006**: 模型 MUST 分隔 `source/raw`、`localized/transformed`、`enrichment`；转换与 enrichment MUST 记录版本、来源、生成时间及审核状态
- **FR-007**: Gym visual JPG/GIF 仅按宪章 v1.3.0 临时例外使用；每条动作 MUST 带 `provisional_third_party` 状态及逐条署名，MUST NOT 宣称自有版权、用于生成式 AI 训练或提升分辨率
- **FR-008**: 旧 80 动作、旧自生成动作媒体及 `database/seeds` 动作权威源 MUST 废弃；食物与重映射后的训练计划 MUST 迁入 catalog
- **FR-009**: 系统 MUST 生成旧动作 ID 到新 ID 的可审计映射；计划与收藏中可确定引用必须迁移，歧义或未匹配项必须保留并报告，MUST NOT 静默丢失
- **FR-010**: 同步 MUST 支持 dry-run、目标环境确认、云端备份、断点恢复、摘要报告和失败非零退出；正式替换必须在 dry-run 与备份成功后执行
- **FR-011**: 正式迁移 MUST 替换公共 `actions`、重建 `equipment`、迁移计划/收藏引用并清理旧动作媒体与云端残留；不得沿用“种子删减不删除残留”的旧约定
- **FR-012**: 完整性门禁 MUST 校验动作/媒体数量、来源哈希、ID 唯一性、中文覆盖、taxonomy、fileID、署名、计划/器材/收藏引用及无 `asset://`、裸 GitHub URL
- **FR-013**: 内容查询 MUST 支持稳定游标分页、部位/器材/难度/目标过滤和中文名/英文名/别名搜索；列表返回摘要投影，详情按稳定 ID 返回完整记录
- **FR-014**: “今日练什么” MUST 从完整 catalog 服务器侧或等价可证明的全库范围抽样，不得只从当前页抽样
- **FR-015**: 详情 MUST 展示 JPG 封面、GIF 演示、中文步骤、来源署名和统一健身免责声明；未审核 enrichment MUST 隐藏
- **FR-016**: 首次商业发布、收费、广告变现或商业合作前，Gym visual 媒体 MUST 替换为自有素材或取得书面授权

### Key Entities

- **SourceLock**：固定仓库、commit、tree/blob、许可、NOTICE、文件清单与哈希
- **VendorExercise**：未经覆盖的上游原始记录
- **CatalogAction**：稳定 ID、来源、中文化、taxonomy、媒体及 enrichment 分层后的部署记录
- **CatalogEquipment**：由来源器材值归一得到的稳定器材实体
- **ActionIdMapping**：旧 ID 到新 ID 的匹配依据、置信度与人工决策
- **SyncRun / BackupManifest**：dry-run、备份、写入、清理、验证与回滚证据
- **ContentQuery**：游标、分页大小、过滤、关键词及摘要/详情响应

## Success Criteria

- **SC-001**: 来源校验结果为 1,324 动作、1,324 JPG、1,324 GIF，哈希与引用完整率均为 100%
- **SC-002**: 1,324 条动作稳定 ID、中文名与中文步骤覆盖率均为 100%
- **SC-003**: catalog 到 CloudBase 同步后动作恰为 1,324 条，2,648 个媒体 fileID 可访问且逐条署名覆盖率 100%
- **SC-004**: 分页遍历 1,324 条动作无重、无漏；过滤和中英文搜索约定用例通过率 100%
- **SC-005**: 训练计划与收藏引用中，已映射项迁移成功率 100%；未映射项记录保留并报告率 100%，静默丢失为 0
- **SC-006**: 每次正式同步都有成功 dry-run、可恢复备份及完整性报告；任一门禁失败时云端新版本不得生效

## Assumptions

- 来源 `sourceId` 在固定提交内可稳定读取；其字符串只用于构造前缀后的稳定 ID
- 中文内容由版本化术语表、转换和受审 enrichment 生成，审核状态不等于上游事实
- 旧计划与收藏数量可在迁移前完整导出；无法自动匹配的记录允许延后人工处理但不能删除
- 该迁移取代 006/007 中旧的 80/300、`limit=100`、`asset://` 和“不删除残留”约定

## Constitution Alignment

- 仅使用 TypeScript/现有脚本体系、CloudBase、原生小程序与 shared 纯逻辑
- shared 转换与查询核心逻辑遵循 TDD 和 100% 覆盖要求
- 显式采用宪章 v1.3.0 Gym visual 临时例外；此规格不声称获得第三方授权
- vendor、catalog、来源分层、单向同步和稳定 ID 符合 Source Data & Media Provenance 原则
- 范围不包含 Web 动作库、CMS、自建后端或商业化授权获取
