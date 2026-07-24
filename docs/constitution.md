<!-- Synced from .specify/memory/constitution.md for developer reference. Edit the source under .specify/memory/ then re-copy. -->

<!--
Sync Impact Report
- Version change: 1.2.0 → 1.3.0
- Modified principles:
  - VI. Compliance Red Lines（新增经项目所有者确认的临时 Gym visual 媒体例外）
  - Technology Stack / Backend & Data（仓库内 catalog 为云端内容权威源）
- Added sections:
  - IX. Source Data & Media Provenance
  - Temporary Media Exception (2026-07-24)
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check + v1.3.0)
  - .specify/templates/spec-template.md ✅ updated (source/media compliance)
  - .specify/templates/checklist-template.md ✅ updated (source/media check)
  - .specify/templates/tasks-template.md ✅ updated (catalog/provenance note)
  - docs/constitution.md ✅ synced from this file
  - .specify/templates/constitution-template.md ⚠ pending (scaffold only)
  - README.md ⚠ pending (file not present yet)
  - Spec Kit skills (.cursor/skills/speckit-*) ✅ verified
- Follow-up TODOs:
  - Gym visual 媒体 MUST 在首次商业发布前替换为自有素材或取得书面授权
-->

# PeakMeet（顶峰相见）Constitution

## Core Principles

### I. Project Identity & Positioning

PeakMeet（中文品牌：顶峰相见）是微信小程序 + 轻量化 Web 官网站点的
健身工具产品。仓库：https://github.com/huyikai/peakmeet。架构为
pnpm workspace monorepo。

- 微信小程序：面向健身新手与居家/健身房训练人群的轻量化工具，主打
  「训练 + 饮食」双闭环。四大核心能力：动作查询、器材查询、饮食计算、
  训练计划。MUST NOT 做重度社交、社区或运营后台。
- Web 站点：品牌展示页 + 小程序流量入口。仅做简介展示与极简计算器；
  核心功能 MUST 全部引导至微信小程序，MUST NOT 做功能复刻。

**Rationale**: 身份与边界恒定，避免范围蔓延与双端重复建设。

### II. MVP First & Low Ops Cost

- MUST 优先保证核心功能可用；拒绝过度设计与过度开发。
- MUST 优先选用免运维、低成本的原生方案，极致降低个人开发与运维成本。
- 内容 MUST 面向普通用户，避免晦涩专业术语，突出新手友好性。

**Rationale**: 单人/小团队可持续交付优于完备性幻想。

### III. Shared Logic First

可复用纯逻辑 MUST 统一沉淀到 `packages/shared`，业务端 MUST NOT
重复实现相同算法。`packages/shared` MUST 为纯逻辑包，不得包含任何
平台相关代码（小程序 API、DOM API 等）。小程序端通过构建脚本将
shared 同步至本地 utils；Astro 端通过 workspace 直接引用 shared。

**Rationale**: 双端计算结果必须一致，且禁止重复实现。

### IV. Stack Lock (NON-NEGOTIABLE)

所有技术选型 MUST 严格遵循本宪章技术栈规约，禁止擅自引入额外框架、
服务或依赖。详见「Technology Stack Constraints」。

**Rationale**: 锁定栈降低复杂度与审核/运维风险。

### V. Test-First TDD (NON-NEGOTIABLE)

核心逻辑开发 MUST 遵循 TDD 红绿循环，禁止先写代码后补测试。

1. **红（Red）**：先写失败单元测试，明确预期 I/O，确认测试不通过。
2. **绿（Green）**：写最少业务代码使测试通过，只保证结果正确。
3. **重构（Refactor）**：在测试全绿基础上优化结构/命名/性能。

强制覆盖：`packages/shared` 内所有计算逻辑与工具函数 MUST 100% TDD，
单元测试覆盖率 MUST 达到 100%。云函数核心处理逻辑鼓励 TDD；页面 UI
与交互逻辑不做强制测试要求。测试文件统一放在对应包 `__tests__`
目录，命名 `xxx.test.ts`；用例 MUST 覆盖正常、边界与异常入参。
每次提交前 MUST 运行全量测试且全部通过。测试框架统一使用 Vitest。

**Rationale**: 共享计算是产品正确性底座，无测试不得合入。

### VI. Compliance Red Lines (NON-NEGOTIABLE)

零容忍，违反即阻断交付：

1. **医疗合规**：内容仅限健身科普与训练指导；严禁「治疗、康复、理疗、
   治病、治愈」等医疗表述。所有计算结果、训练方案、动作指导 MUST
   附带免责声明：「仅供参考，不构成专业健身指导，请根据自身身体状况
   量力而行」。
2. **隐私合规**：最小必要原则；仅收集功能必需信息。小程序与 Web MUST
   配置隐私协议并明确数据用途。用户数据基于微信 OpenID；仅使用微信
   授权基础信息，不收集多余隐私。
3. **内容合规**：图文素材 MUST 有可追踪来源与授权状态；除下述经项目
   所有者明确批准的临时媒体例外外，MUST NOT 发布无复用授权的素材。
   禁止推荐极端节食、超负荷训练等有害健康内容。
4. **平台合规**：遵守微信小程序平台规则（服务类目与内容一致）；Web
   内容符合国内网络内容规范。

**Rationale**: 合规风险高于功能完整度。

#### Temporary Media Exception (2026-07-24)

项目所有者明确决定：在 PeakMeet 保持非商用期间，允许临时复制并展示
`hasaneyldrm/exercises-dataset` 固定提交中的 Gym visual 180×180 JPG/GIF。
此例外 MUST 同时满足：

- 每条动作及相关页面 MUST 展示 `© Gym visual — https://gymvisual.com/`；
- 媒体 MUST 标记为 `provisional_third_party`，MUST NOT 宣称自有版权，
  MUST NOT 用于训练生成式 AI；
- 原始 `LICENSE`、`NOTICE.md`、来源 commit、文件哈希 MUST 随快照入库；
- MUST NOT 提升分辨率或脱离动作内容单独提供下载；
- 首次商业发布、收费、广告变现或对外商业合作前，MUST 完成自有素材替换
  或取得 Gym visual 对 PeakMeet 的书面授权，并移除此例外；
- 此例外仅记录项目所有者的风险决定，不代表第三方已授予 PeakMeet 权利。

任何超出上述边界的媒体使用仍属于交付阻断项。

### VII. Decision Priority

遇到未明确说明的问题，按以下优先级决策：

1. 优先保证微信小程序核心体验与功能完整性。
2. 优先选择更低运维成本、更简单的技术方案。
3. 可复用逻辑优先抽离到 shared，不新增重复代码与依赖。
4. 存在合规风险时，必须以合规为第一准则。

**Rationale**: 冲突时有可执行的裁决顺序。

### VIII. Brand & Visual Alignment

- 小程序与 Web 面向用户的界面 MUST 遵循 `docs/brand` 中的品牌色与
  Logo 约定。
- 计算类页面 MUST 遵循已建立的视觉契约与共享样式；MUST NOT 另起主色板；
  MUST NOT 引入重型 UI 组件库。
- 具体 token 与版式以 `docs/brand` 及现行视觉契约规格为准（宪章不内嵌
  色值表或组件清单）。

**Rationale**: 品牌识别与可读性依赖统一视觉源；细节落在 brand 文档与
契约规格，宪章只锁定「必须对齐、禁止另起炉灶」。

### IX. Source Data & Media Provenance

- 外部数据 MUST 固定到可复现的 commit / blob / SHA-256，并在仓库内保存
  来源锁、原许可与声明；常规构建和云同步 MUST NOT 隐式追随远端最新版本。
- `database/catalog/` MUST 是 CloudBase 公共内容的唯一结构化权威源；
  `database/vendor/` 保存经审核的外部固定快照。云端 MUST 由仓库单向同步，
  小程序运行时 MUST NOT 直接依赖 GitHub 或其它外部内容源。
- 导入转换、中文化、规则或 AI enrichment MUST 与上游原始字段分层，
  记录转换版本、生成来源与审核状态，MUST NOT 冒充上游原始数据。
- 外部媒体与自有媒体 MUST 记录各自授权状态；替换媒体时 MUST 保持稳定
  内容 ID，避免破坏收藏、计划和内容关联。

**Rationale**: 可复现来源、清晰权属与分层转换是大规模内容库长期可维护、
可审计和可替换的基础。

## Technology Stack Constraints


### 开发语言（TypeScript 优先）

- 全仓业务与共享逻辑 MUST 以 **TypeScript** 作为默认开发语言。
- `packages/shared`、`packages/web`、`packages/cloudfunctions` 以及小程序
  逻辑层新增代码 MUST 使用 TypeScript（`.ts` / `.tsx` 按场景）。
- MUST NOT 在无充分理由时新增纯 JavaScript（`.js`）业务源码；仅当平台
  或工具链强制要求时方可例外，并在 plan 的 Complexity Tracking 中说明。
- 全仓 MUST 启用统一 `tsconfig` 基线（workspace 可继承），保持严格类型
  检查；禁止用 `any` 逃避类型约束（确需时 MUST 局部标注并说明原因）。

### 微信小程序端

- MUST 使用微信小程序原生框架（WXML + WXSS + TypeScript）。
- MUST NOT 使用 Taro、uni-app 等跨端框架。
- MUST NOT 引入重型前端框架或重型 UI 组件库；保持轻量、加载快、审核兼容。
- 面向用户界面 MUST 对齐 `docs/brand`；计算类页面 MUST 消费已建立的
  视觉契约与共享样式（见原则 VIII）。
- 核心计算逻辑 MUST 复用 monorepo 内 `shared` 包。

### 后端与数据层

- MUST 使用微信云开发（CloudBase）作为唯一后端：云数据库、云存储、
  云函数。
- MUST NOT 自建服务器、使用第三方 BaaS，或自行搭建后端服务。
- 纯计算类逻辑（指数计算、热量计算）MUST 前端实现，MUST NOT 为简单
  计算调用云函数。
- 公共内容库（动作、器材、计划、食物）为只读权限；用户私有数据
  （收藏、记录）仅本人可读写。
- 云函数仅用于需要服务端处理的逻辑（数据聚合、权限校验等）；云函数
  源码 MUST 优先 TypeScript 编写并按云开发要求编译交付。
- 结构化内容 MUST 存于云数据库；图片资源 MUST 存于云存储；禁止在
  前端硬编码大量内容。
- 公共内容 MUST 先进入仓库内 `database/catalog/`，再由同步脚本写入
  CloudBase；部署/同步流程 MUST NOT 在运行时从第三方仓库抓取内容。
- 外部固定快照 MUST 位于 `database/vendor/`，并与 source lock、许可、
  NOTICE 和哈希一并版本管理。

### Web 官网站点

- MUST 使用 Astro，纯静态站点生成（SSG），源码 TypeScript 优先。
- MUST NOT 启用 SSR，MUST NOT 接入服务端业务逻辑。
- 面向用户界面 MUST 对齐 `docs/brand`（品牌色与 Logo）；MUST NOT 另起
  主色板或引入重型 UI 组件库。
- 计算器逻辑 MUST 复用 `shared`，与小程序结果完全一致。

### 工程与版本管理

- 包管理：pnpm + workspace monorepo。
- 代码规范：全仓统一 ESLint + Prettier（含 TypeScript 规则）。
- 代码托管于 GitHub，全仓使用 Git 版本管理。

## Monorepo Structure

整体目录 MUST 遵循以下约定，不得随意新增顶层目录：

```text
peakmeet/
├── packages/
│   ├── shared/             # 共享核心库：计算逻辑、常量、纯工具函数
│   │   ├── src/
│   │   ├── __tests__/
│   │   └── package.json
│   ├── miniprogram/        # 微信小程序前端
│   ├── web/                # Astro Web 官网
│   └── cloudfunctions/     # 微信云函数
├── database/               # catalog 权威数据、vendor 固定快照与同步素材
├── docs/                   # 项目文档与设计稿
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Product Boundaries

### 微信小程序（底部 4 Tab：首页、训练、饮食、我的）

**训练 Tab**

- 动作大全：按部位、器材、难度、训练目标四维筛选；详情含步骤、目标
  肌肉、发力要点、避坑指南、替代动作与图示；支持搜索、收藏、
  「今日练什么」随机推荐。
- 器材大全：场景（健身房/居家小器械/自重）× 类型（自由重量/固定器械/
  有氧/辅助）分类；详情含基础信息、核心价值、居家替代、选购避坑；
  MUST 实现「器材-动作」联动并可一键跳转；支持按部位筛选、收藏、
  新手器材专题。
- 训练计划库：按目标、场景、周期分类提供成品计划；Hyrox 仅作为计划
  分类之一，MUST NOT 设独立专区或重点突出；详情含热身/正式/拉伸，
  标注组数次数与休息；支持一键唤起训练计时器。
- 训练计时器：组间休息倒计时、Tabata、正计时；可自定义时长与组数；
  结束音效震动；支持一键打卡。

**饮食 Tab**

- 热量缺口计算：输入性别、年龄、身高、体重、体脂率（选填）、日常活动
  水平、训练频率、训练目标；采用 Mifflin-St Jeor 计算 BMR，结合活动
  系数得 TDEE；减脂温和缺口 300–500、快速缺口 500–700 大卡，MUST
  强制标注「摄入不得低于基础代谢」；增肌盈余 200–400 大卡；输出每日
  总热量、宏量营养素（区分训练日/休息日碳水）、三餐建议与温馨提示。
- 身体指数工具箱：BMI、体脂率估算、BMR、腰臀比、1RM；全部前端计算；
  每个结果 MUST 附带通俗解读与注意事项。
- 食物热量库：分类展示常见食材，支持搜索；展示每 100g 营养成分与
  推荐等级。

**我的 Tab**

- 我的收藏（动作/器材/计划）、身体数据记录、训练打卡记录、基础设置。

### Web 站点

- 页面：首页、功能介绍页、简易工具页、关于页。
- 作用：品牌价值展示、小程序码引流、极简在线计算工具。
- 禁止项：MUST NOT 实现完整动作库/器材库/训练计划；MUST NOT 用户登录、
  数据存储或接入云数据库。
- 计算器仅开放 BMI 与基础热量测算，复用 shared。

## Coding & Engineering Standards

1. 语言：TypeScript 优先；类型与导出边界清晰，shared 包导出稳定类型。
2. 命名：文件、变量、函数语义化，统一小驼峰。
3. 逻辑复用：可复用纯逻辑优先进 `packages/shared`。
4. 云开发：权限与云函数边界见「Technology Stack Constraints」。
5. 内容数据：仓库 `database/catalog/` 为结构化权威源，`database/vendor/`
   保存外部固定快照；结构化内容同步进云数据库，图片同步进云存储。
6. 品牌与视觉：面向用户 UI 对齐 `docs/brand`；计算页遵循现行视觉契约与
   共享样式；色值/版式细节不在宪章内展开。

## Delivery Requirements

1. 核心逻辑交付 MUST 附带对应单元测试且全部通过。
2. 代码 MUST 符合 monorepo 目录规范；可复用逻辑 MUST 进 shared。
3. 输出代码 MUST 可直接运行；关键逻辑附带必要注释。
4. 功能变更 MUST NOT 破坏已有功能与对应测试用例。
5. 新增功能 MUST 符合本 Constitution 全部规约，不得突破产品边界与
   技术选型。
6. 外部数据/媒体变更 MUST 附来源锁、许可状态、转换版本、完整性校验与
   回滚/替换策略。

## Governance

本 Constitution 高于一切其他实践与临时约定。冲突时以本文件为准。

**修订程序**

1. 通过 `/speckit-constitution`（或等价流程）提交修订草案。
2. 明确变更类型：MAJOR（原则删除/不兼容重定义）、MINOR（新增或实质
   扩展原则/章节）、PATCH（澄清、措辞、笔误）。
3. 同步更新依赖模板（plan/spec/tasks 等）中的 Constitution Check 与
   路径/测试约定。
4. 更新版本号与 `Last Amended` 日期（ISO `YYYY-MM-DD`）。

**合规审查**

- 每个 feature 的 plan MUST 通过 Constitution Check 门禁后方可进入
  设计与实现。
- PR/评审 MUST 核对：栈锁定、TypeScript 优先、shared 复用、TDD（shared）、
  产品边界、合规红线、来源/媒体 provenance、品牌与视觉对齐
  （`docs/brand` / 视觉契约）。
- 违规项 MUST 在合入前修复，或在 Complexity Tracking 中书面论证且
  不得突破 NON-NEGOTIABLE 条款（Stack Lock、TDD、Compliance）。

**运行时开发指引**：以本文件与 `docs/` 下设计文档为准；Spec Kit 命令
（specify → plan → tasks → implement）执行时 MUST 加载本 Constitution。

**Version**: 1.3.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-24
