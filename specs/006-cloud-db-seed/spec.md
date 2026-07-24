# Feature Specification: 云数据库设计、种子数据与本地同步

**Feature Branch**: `006-cloud-db-seed`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "基于微信云开发完成 7 集合 schema、权限、shared TS 类型、公共内容种子；仓库 database/seeds 为内容源，以本地/CI 同步导入云库（开源友好、非 CMS）；通用 list/getById；小程序 AppID + wx.cloud.init；图片可空兼容缺省；用户私有表本版无写入云函数。AppID wx07a6368636359893，环境 cloud1-d8ghafmni1c847e3f。"

## Clarifications

### Session 2026-07-24（需求锁定）

- Q: AppID？ → A: `wx07a6368636359893`
- Q: 封面图？ → A: 本版不批量上传；字段可空，展示兼容缺省图
- Q: 种子来源？ → A: 仓库内生成结构化种子
- Q: 查询云函数粒度？ → A: 通用 list + getById（传集合与过滤）
- Q: 是否含云初始化？ → A: 是（AppID + `wx.cloud.init`）
- Q: 用户表写入？ → A: 本版不提供写入云函数
- Q: 内容如何更新（开源仓库）？ → A: **推荐方案**：`database/seeds` 为唯一内容源；通过**本地/CI 同步脚本**导入开发者自己的云环境；**禁止**普通小程序客户端调用全量刷库同步；不为公开仓库配套可被任意调用的「写公共库」接口；不当 CMS
- Q: 功能性/Hyrox 计划？ → A: 仅分类字段；不独立专区（尊宪章）

### Session 2026-07-24

- Q: 重复同步公共四表时采用何种策略？ → A: 按稳定业务 ID **upsert**（存在则更新，不存在则插入；不删除种子未再包含的云库文档）
- Q: 公共内容读路径：直读还是仅云函数？ → A: **直读 + 云函数并存**（安全规则允许客户端直读公共四表；list/getById 仍交付，供统一信封/复杂过滤等场景）
- Q: 公共内容稳定业务 ID 形态？ → A: **人类可读 slug**（英文/拼音短码，仓库内按集合唯一，用作 upsert 键）
- Q: 缺省封面图策略？ → A: **统一一张缺省图**（动作/器材/食物/计划共用同一本地占位资源）
- Q: 缺省图源文件放在哪里？ → A: 高质量源图保存在 `database/assets/images/content-placeholder.png`，小程序保留同图运行时副本
- Q: list 云函数过滤能力范围？ → A: **分页 + 白名单等值过滤**（集合白名单；skip/limit 或等价分页；允许文档化的少量字段等值匹配，如分类/难度/场景）
- Q: 动作/器材/食物正式配图如何交付？ → A: **全量逐条配图**（80+20+200）；源图进入仓库，部署时同步到 CloudBase 云存储，种子 cover 写环境专属 fileID；不塞入小程序主包

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 公共内容库可被安全读取 (Priority: P1)

产品需要动作、器材、训练计划、食物四类公共内容在云数据库中结构化存放，权限为所有人可读、客户端不可写。开发与后续页面可通过统一的列表/详情查询拿到类型一致的数据。

**Why this priority**: 无公共内容底座，内容库页面无法推进。

**Independent Test**: 配置好环境后，客户端可按安全规则直读公共集合；调用通用 list/getById 也能读到种子数据；客户端直写公共集合失败。

**Acceptance Scenarios**:

1. **Given** 公共四表已创建且权限正确，**When** 未登录或普通用户尝试客户端写入 `actions`，**Then** 被拒绝
2. **Given** 种子已导入，**When** 小程序端按安全规则直读公共集合，**Then** 能读到数据
3. **Given** 种子已导入，**When** 调用 list（指定集合、分页与白名单等值过滤），**Then** 返回统一结构的列表数据
4. **Given** 已知文档 ID，**When** 调用 getById，**Then** 返回对应详情或明确的未找到结果
---

### User Story 2 - 仓库种子经本地/CI 同步到云库 (Priority: P1)

维护者（及开源 fork 者）在仓库 `database/seeds` 中维护公共内容；执行约定的本地或 CI 同步流程后，数据进入**当前开发者配置的**云环境。公开仓库不依赖 CMS；同步入口不对普通终端用户开放。

**Why this priority**: 开源场景下内容可版本管理、可复现；避免「谁都能刷库」。

**Independent Test**: 在空/干净环境执行同步命令后，公共四表记录数达到种子约定规模；再次同步时按稳定业务 ID upsert（同 ID 更新字段，不堆重复文档），且不因种子删减而自动删除云库中仍存在的旧文档。

**Acceptance Scenarios**:

1. **Given** 仓库内存在规范种子文件，**When** 维护者按文档执行本地/CI 同步，**Then** 云库公共集合出现对应数据
2. **Given** 开源 fork 者使用自己的云环境凭证，**When** 执行同一同步流程，**Then** 数据进入其环境，而非他人环境
3. **Given** 普通小程序用户，**When** 仅使用正式发布的客户端能力，**Then** 无法触发全量内容同步或覆写公共库
4. **Given** 某业务 slug 已在云库，**When** 种子中同 slug 字段变更后再次同步，**Then** 该文档被更新而非新增重复行
5. **Given** 某业务 slug 曾在云库但已从种子移除，**When** 再次同步，**Then** 云库中该文档仍保留（本版不同步删除）

---

### User Story 3 - 用户私有表结构就绪但不提供写入接口 (Priority: P2)

收藏、身体记录、训练打卡三表结构与权限就绪（仅本人可读写），shared 中有对应类型，便于后续功能对接。本功能不交付用户数据写入云函数或页面写路径。

**Why this priority**: 提前定表避免后续返工，但不阻塞公共内容 MVP。

**Independent Test**: 三表存在且安全规则为「仅创建者/本人」；仓库与种子中**不含**任何真实用户隐私数据。

**Acceptance Scenarios**:

1. **Given** 用户私有三表已配置，**When** 用户 A 的身份访问用户 B 的记录，**Then** 无法读写
2. **Given** 本功能交付范围，**When** 检查云函数列表，**Then** 不存在面向客户端的收藏/打卡/身体记录写入接口

---

### User Story 4 - 小程序接入指定云环境 (Priority: P1)

小程序使用真实 AppID，并在启动时初始化到约定云环境，使后续查询云函数/云库可用。

**Why this priority**: 无正确 init，读写链路无法验收。

**Independent Test**: 开发者工具使用 AppID `wx07a6368636359893`，启动后云能力指向环境 `cloud1-d8ghafmni1c847e3f`（或文档约定的等价配置方式）。

**Acceptance Scenarios**:

1. **Given** 项目已配置 AppID 与环境 ID，**When** 小程序冷启动，**Then** 云开发初始化成功且无指向错误环境
2. **Given** README/快速说明，**When** fork 者阅读，**Then** 知道需替换为自己的 AppID/环境 ID，且密钥不得提交仓库

---

### User Story 5 - 类型与图片缺省约定可复用 (Priority: P2)

七张表在 shared 中有完整 TypeScript 接口；动作/器材/食物（及计划若有配图字段）的图片字段可空；展示约定：缺图时使用统一缺省图，不因空字段崩溃。

**Why this priority**: 类型与缺省约定降低后续页面与开源贡献者的歧义。

**Independent Test**: shared 导出类型与 schema 文档字段一一对应；抽样缺 `cover` 的种子记录在约定展示规则下可渲染缺省图（可用单测或页面桩验证）。

**Acceptance Scenarios**:

1. **Given** shared 类型包，**When** 对照七表字段说明，**Then** 关键业务字段均有对应类型
2. **Given** 某动作封面为空，**When** 按缺省约定展示，**Then** 显示统一默认占位图且不报错

---

### Edge Cases

- 同步时种子文件缺失、JSON 非法 → 失败并给出可读错误，不静默写半库
- 重复同步 → 按稳定业务 slug upsert；同 slug 不堆重复；种子删减不自动删云库文档
- list 请求非法集合名或非白名单过滤字段 → 拒绝，不得开放任意集合/任意 where
- getById 不存在 → 统一「未找到」，非裸异常
- 公开仓库误提交密钥/私钥 → 文档与 ignore 规则明确禁止；发现即轮换
- 种子文案触及医疗承诺用语 → 交付前合规检查剔除

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 系统 MUST 在微信云开发中提供七个集合：`actions`、`equipment`、`training_plans`、`foods`、`user_collect`、`user_body_record`、`user_train_record`
- **FR-002**: 公共四表字段 MUST 覆盖需求所列业务属性；MUST 使用稳定业务标识（便于种子 upsert）；稳定业务 ID MUST 为**人类可读 slug**（英文/拼音短码），在同一集合内唯一；MUST 支持排序/筛选所需的基础字段（如排序权重、分类、难度等已列字段）
- **FR-003**: `actions` / `equipment` / `foods` MUST 各有逐条正式配图（80+20+200），源图 MUST 版本管理在仓库且无外部版权风险；同步时 MUST 上传 CloudBase 云存储并将环境专属 fileID 写入 `cover`；缺省图仅留在小程序本地，缺图 MUST NOT 导致页面崩溃
- **FR-004**: `training_plans` MUST 支持分类字段表达「功能性训练」等；Hyrox/功能性 MUST NOT 做成独立专区，仅作分类之一
- **FR-005**: 公共四表安全规则 MUST 为：所有用户可读；客户端不可写；服务端/管理同步通道除外；小程序端 MUST 被允许直读公共四表（与微信云开发「公有读 + 安全规则」模式一致）
- **FR-006**: 用户三表安全规则 MUST 为：仅记录所属用户（openid）可读写；仓库 MUST NOT 包含真实用户隐私种子
- **FR-007**: 公共内容的权威源 MUST 为仓库 `database/seeds`（或同等约定目录）；更新流程 MUST 为改种子 → 版本管理 → **本地或 CI 同步**到目标云环境
- **FR-008**: 系统 MUST 提供可文档化的本地/CI 同步方式，供维护者与开源 fork 者导入**自己的**环境；MUST NOT 向普通小程序客户端暴露全量覆写公共库的能力；同步 MUST 按稳定业务 ID **upsert**（存在更新、不存在插入）；本版 MUST NOT 因种子删减而自动删除云库文档
- **FR-009**: 系统 MUST 提供 TypeScript 云函数（编译后部署）通用 **list** 与 **getById**：入参含集合标识与分页或 ID；list MUST 支持**白名单等值过滤**（仅文档化字段，如分类/难度/场景，按集合有则可用）；仅允许白名单公共集合；MUST NOT 接受任意 where；返回结构统一且类型安全；本版读路径为 **直读与云函数并存**（云函数非唯一合法读通道）
- **FR-010**: 本功能 MUST NOT 提供用户收藏/身体记录/训练打卡的写入云函数
- **FR-011**: `packages/shared` MUST 导出与七表一一对应的完整 TS 接口类型，供小程序与云函数复用
- **FR-012**: 小程序 MUST 配置 AppID `wx07a6368636359893`，并在启动时 `wx.cloud.init` 至环境 `cloud1-d8ghafmni1c847e3f`（示例环境）；文档 MUST 说明 fork 者替换为自己的 AppID/环境，且密钥不得入库
- **FR-013**: 首批种子规模 MUST 达到：动作 ≥80、器材 ≥20、训练计划 =6（其中至少 1 套功能性分类）、食物 ≥200；文案 MUST 符合合规（无医疗治疗承诺、无极端有害建议）
- **FR-014**: 纯计算逻辑 MUST NOT 改为云函数实现（宪章）

### Key Entities

- **Action**：动作内容文档（稳定 slug ID、可空封面、步骤、肌群、器材、替代 ID、权重等）
- **Equipment**：器材内容文档（稳定 slug ID、可空封面、关联动作 ID 列表等）
- **TrainingPlan**：计划内容文档（稳定 slug ID、目标/场景/周期/频次/日程结构、热门标记、分类）
- **Food**：食物营养文档（稳定 slug ID、每 100g 宏量、推荐等级、可空配图）
- **UserCollect / UserBodyRecord / UserTrainRecord**：用户私有文档（含 openid 与业务字段）
- **SeedBundle**：仓库内按集合组织的种子文件集合
- **ContentQuery**：list/getById 的请求与统一响应信封

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 七集合均存在且字段说明与 shared 类型可逐项对照通过
- **SC-002**: 公共四表客户端写入抽测失败；客户端直读公共四表抽测成功；用户三表跨用户访问抽测失败
- **SC-003**: 本地/CI 同步一次后，动作≥80、器材≥20、计划=6、食物≥200 可在目标环境查询到；再次同步同 ID 更新不产生重复文档，且不因种子删减自动删除云库文档
- **SC-004**: list/getById 对白名单集合返回统一信封；非法集合名或非法过滤字段被拒绝；直读与云函数读均可用于验收公共内容可读
- **SC-005**: 正式客户端路径无法触发公共库全量同步
- **SC-006**: 仓库存在动作 80、器材 20、食物 200 张逐条配图且与种子一一对应；同步后 `cover` 为可访问的 CloudBase fileID；缺封面记录仍可展示小程序本地占位图
- **SC-007**: 小程序使用指定 AppID 启动后云初始化成功（开发者工具可见）
- **SC-008**: 种子与文档抽检无医疗违规表述

## Assumptions

- 云环境已创建：`cloud1` / `cloud1-d8ghafmni1c847e3f`；套餐为免费开发环境，容量足够首批种子
- 同步使用云开发官方/社区成熟的管理员导入手段或项目脚本封装；具体 CLI 在 plan 阶段选定，但产品规则「本地/CI、非客户端刷库」不变
- 正式内容图源文件纳入仓库并同步 CloudBase；缺省图源位于 `database/assets/images/`，同图复制到小程序代码作为运行时资源
- 开源许可证下种子为项目可分发的科普内容；贡献者按同一 schema 提交 PR
- 「功能性」计划用分类枚举/字符串标识即可
- hello 占位云函数可保留或替换，以本功能交付的查询函数为准

## Constitution Alignment _(mandatory)_

### In Scope / Out of Scope

- **In scope**: CloudBase 七表 schema 与权限；seeds + 本地/CI 同步；shared 类型；list/getById 云函数；小程序 AppID 与云 init；动作/器材/食物逐条配图入库并同步云存储；图片缺省约定
- **Out of scope**: 内容库完整 UI；用户写接口；CMS；客户端可调的全量同步；Web 接云库；自建服务器

### Stack & Shared Logic

- **Language**: TypeScript（shared、云函数、小程序配置相关逻辑）
- **Target package(s)**: `packages/shared`、`database/`、`packages/cloudfunctions`、`packages/miniprogram`
- **Shared extraction**: 全部集合实体类型与查询 DTO；MUST NOT 在 shared 调 `wx` API
- **Backend usage**: 仅微信云开发；公共内容读以客户端直读为主路径之一，云函数 list/getById 并存；同步仅本地/CI 管理通道

### Compliance Checklist

- [x] No medical/treatment claims; disclaimer required on calculators/guidance
- [x] Privacy: minimum necessary；用户数据不进公开种子
- [x] No extreme diet / overload training recommendations
- [x] Platform rules: WeChat / CloudBase
- [x] Brand: 本功能以数据与接入为主；若有缺省图资源则对齐 brand 资产约定
