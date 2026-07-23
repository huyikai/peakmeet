# Feature Specification: 项目初始化与工程基建

**Feature Branch**: `001-project-bootstrap`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "基于项目 Constitution 约定，完成 TypeScript 优先的 monorepo 整体工程搭建，统一规范、测试环境与各端项目骨架，为后续所有功能开发提供基础底座。"

## Clarifications

### Session 2026-07-23

- Q: 小程序如何接入 shared（本功能交付深度）？ → A: 实现轻量同步脚本：能将 shared 构建产物拷到小程序本地 utils，并跑通一次冒烟（不做完整 watch/增量链路）
- Q: 云函数骨架交付深度？ → A: 含 1 个可编译占位函数（无业务逻辑），能跑通编译出部署产物
- Q: 根目录统一 build 的覆盖范围？ → A: 根 build 须成功构建 shared + web + cloudfunctions；小程序不纳入根 build（由微信开发者工具编译）
- Q: 官网是否在本功能内依赖并引用 shared？ → A: 官网 workspace 依赖 shared，并在占位页做一次极简引用冒烟（不实现真实计算器）

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 建立可交付的单仓多包工程底座 (Priority: P1)

作为 PeakMeet 开发者，我希望仓库具备约定好的分层目录与统一工程入口，以便后续任意功能都能在同一底座上开发，而不必反复搭脚手架。

**Why this priority**: 无工程底座则后续所有功能无法落地；是全项目阻塞项。

**Independent Test**: 仅完成本故事后，仓库顶层目录结构符合治理约定，根目录可执行统一的质量与构建类命令，且不出现未约定的多余顶层目录。

**Acceptance Scenarios**:

1. **Given** 空的或仅有治理文档的仓库，**When** 完成本功能交付，**Then** 存在约定的各业务包目录、种子数据目录与文档目录，且无多余顶层目录。
2. **Given** 工程底座已就绪，**When** 开发者在仓库根目录执行统一测试命令，**Then** 测试运行器可正常启动并支持类型化单测用例（至少有一条可运行的示例/冒烟用例）。
3. **Given** 工程底座已就绪，**When** 开发者执行统一的代码检查与格式化命令，**Then** 命令可在全仓范围执行且不因缺少配置而失败。
4. **Given** 工程底座已就绪，**When** 开发者在根目录执行统一构建命令，**Then** `shared`、`web`、`cloudfunctions` 均构建成功；小程序不作为该命令的强制失败条件。

---

### User Story 2 - 共享逻辑包可独立构建与被引用 (Priority: P1)

作为开发者，我希望共享逻辑包以纯逻辑形式存在并可产出类型声明，以便小程序与官网复用同一套计算与工具，避免重复实现。

**Why this priority**: Constitution 强制 Shared Logic First；底座阶段必须具备可构建的共享包骨架。

**Independent Test**: 仅交付共享包骨架时，可独立构建并产出可被其他包引用的产物与类型声明；包内无平台相关 API。

**Acceptance Scenarios**:

1. **Given** 共享包骨架已初始化，**When** 执行该包的构建，**Then** 产出可运行的编译结果与类型声明文件。
2. **Given** 共享包已构建，**When** 检查包内容边界，**Then** 不包含小程序专属 API 或浏览器 DOM API 等平台相关代码。
3. **Given** 共享包存在示例纯函数与对应单测，**When** 在根目录运行全量测试，**Then** 该单测通过。
4. **Given** 共享包已构建且同步脚本可用，**When** 执行轻量同步脚本，**Then** 构建产物出现在小程序本地可运行目录，且小程序侧可引用示例导出完成冒烟。

---

### User Story 3 - 微信小程序骨架可打开并切换四个主入口 (Priority: P1)

作为开发者，我希望微信小程序原生工程骨架可在微信开发者工具中打开并完成基础编译，底部四个主入口（首页、训练、饮食、我的）可切换，以便后续在既定导航结构上叠加业务功能。

**Why this priority**: 产品主端是小程序；无可用骨架则无法验证后续训练/饮食功能。

**Independent Test**: 仅用开发者工具打开小程序包目录，可编译运行，四个 Tab 页面可互相切换；逻辑层以类型化源码编写并可编译。

**Acceptance Scenarios**:

1. **Given** 小程序骨架已就绪，**When** 在微信开发者工具中导入该包目录，**Then** 项目可正常打开且完成基础编译，无因骨架缺失导致的阻断错误。
2. **Given** 小程序已启动，**When** 用户依次点击底部「首页」「训练」「饮食」「我的」，**Then** 对应页面可切换展示（可为占位内容）。
3. **Given** 小程序逻辑层使用类型化源码，**When** 执行小程序编译流程，**Then** 类型化文件可正常编译运行。

---

### User Story 4 - 官网站点骨架可本地预览 (Priority: P2)

作为开发者，我希望官网具备可本地启动的静态站点骨架与基础页面结构，以便后续填充品牌展示与导流内容，且不引入服务端业务能力。

**Why this priority**: Web 为导流与品牌展示，优先级次于小程序，但仍是产品双端之一。

**Independent Test**: 在对应包内启动本地开发服务后，可在浏览器访问基础页面；站点保持静态生成模式，无用户登录与数据存储能力。

**Acceptance Scenarios**:

1. **Given** 官网骨架已就绪，**When** 执行该包的本地开发启动命令，**Then** 本地服务可在合理时间内启动并可访问。
2. **Given** 本地服务已启动，**When** 访问约定的基础路由/页面，**Then** 至少能看到与 Constitution 一致的基础页面结构（首页、功能介绍、简易工具、关于）的占位或骨架页。
3. **Given** 官网已 workspace 依赖 shared，**When** 打开简易工具占位页，**Then** 页面能引用并展示来自 shared 示例导出的冒烟结果（非真实计算器）。
4. **Given** 官网骨架已就绪，**When** 审查能力边界，**Then** 不包含用户登录、服务端业务逻辑或云数据库接入。

---

### User Story 5 - 云函数包具备可编译部署的目录骨架 (Priority: P3)

作为开发者，我希望云函数目录具备类型化编写与编译后部署的骨架，以便后续仅在确需服务端处理时扩展，而不在底座阶段实现具体业务云函数。

**Why this priority**: 后端仅作能力预留；底座阶段只需骨架，不阻塞小程序/Web MVP 演示。

**Independent Test**: 云函数包目录结构符合微信云开发约定，含 1 个可编译占位函数与编译输出路径；不要求真实业务或云端部署。

**Acceptance Scenarios**:

1. **Given** 云函数骨架已就绪，**When** 查看包结构与说明，**Then** 存在适配微信云开发的目录约定与类型化编写入口，且含 1 个无业务逻辑的占位函数。
2. **Given** 云函数骨架已就绪，**When** 执行约定的编译步骤，**Then** 可产出用于部署的编译结果（来自该占位函数）。

---

### User Story 6 - 治理宪章对开发者可见并可引用 (Priority: P2)

作为开发者，我希望在项目文档目录中能直接读到完整 Constitution，以便后续功能开发与评审以同一强制依据为准。

**Why this priority**: 不阻塞编译运行，但是后续所有开发的强制依据落地。

**Independent Test**: 打开文档目录中的宪章文档，内容与 `.specify/memory/constitution.md` 完整一致（或明确为同步副本且版本信息一致）。

**Acceptance Scenarios**:

1. **Given** 文档落地完成，**When** 打开 `docs/constitution.md`，**Then** 可见完整项目 Constitution 内容，并包含当前版本信息。
2. **Given** 宪章已落库，**When** 对比治理源文件与文档副本，**Then** 二者内容一致，可作为后续开发强制依据。

---

### Edge Cases

- 根目录执行统一命令时，若某子包尚无业务代码，命令仍 MUST 成功退出（允许仅跑通冒烟/空套件），不得因「无测试文件」而整体失败（若工具默认失败，则底座 MUST 提供至少一条通过的冒烟用例）。
- 导入小程序工程时，若开发者未登录微信或未配置 AppID，骨架仍 MUST 允许以测试号/无 AppID 模式打开并预览基础 Tab（以微信开发者工具现行能力为准）。
- 官网本地启动失败时，错误信息 MUST 指向缺失依赖或端口占用等可操作原因，而非静默失败。
- 不得因本功能引入跨端框架、重型 UI 框架、自建后端或第三方 BaaS；若某工具仅为工程必需（类型检查、测试、格式化、轻量构建），允许引入，但 MUST 保持轻量且符合栈锁定。
- 顶层除约定目录与根配置文件外，MUST NOT 新增未在 Constitution 中声明的业务顶层目录。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 仓库 MUST 提供符合 PeakMeet Constitution 的 monorepo 分层：共享核心库、微信小程序、官网站点、云函数、种子数据目录、项目文档目录。
- **FR-002**: 仓库 MUST NOT 新增 Constitution 未约定的业务顶层目录。
- **FR-003**: 根目录 MUST 提供统一的测试、代码检查、格式化与构建入口，供开发者一键执行。其中根目录构建入口 MUST 成功覆盖 `shared`、`web`、`cloudfunctions`；微信小程序 MUST NOT 强制纳入根构建（由其开发者工具完成编译验证）。
- **FR-004**: 全仓 MUST 启用统一的类型系统基线，各子包可继承扩展；新增业务与共享逻辑默认使用类型化源码。
- **FR-005**: 全仓 MUST 启用统一的代码风格与静态检查规则，并适配类型化语法校验。
- **FR-006**: 全仓 MUST 启用统一的单元测试运行能力，并原生支持类型化测试文件。
- **FR-007**: 共享核心库 MUST 以纯逻辑包形式初始化，可构建产出编译结果与类型声明，且零第三方运行时依赖。
- **FR-008**: 共享核心库 MUST 包含至少一条可运行的类型化单元测试（冒烟/示例），以证明测试链路可用。
- **FR-009**: 微信小程序包 MUST 以原生小程序工程骨架初始化，启用类型化支持，并配置底部四个 Tab 基础页面：首页、训练、饮食、我的。
- **FR-010**: 微信小程序骨架 MUST 可在微信开发者工具中打开、编译，且四个 Tab 可正常切换（页面可为占位）。
- **FR-011**: 官网站点包 MUST 以静态站点骨架初始化，默认类型化，配置与 Constitution 一致的基础页面结构（首页、功能介绍、简易工具、关于），并可通过本地开发命令启动预览。MUST 通过 workspace 依赖 `packages/shared`，并在简易工具占位页完成一次极简引用冒烟（调用 shared 示例导出即可）；MUST NOT 在本功能实现真实 BMI/热量计算器。
- **FR-012**: 官网站点骨架 MUST NOT 实现用户登录、数据存储或云数据库接入，MUST NOT 启用服务端渲染业务模式。
- **FR-013**: 云函数包 MUST 提供适配微信云开发的目录骨架，支持类型化编写与编译后部署；MUST 包含恰好 1 个可编译的占位云函数（无业务逻辑），用于验证编译产物链路。本功能不要求真实业务云函数，也不要求本地模拟调用或接入云环境密钥。
- **FR-014**: 项目文档目录 MUST 落盘完整 Constitution 文档（`docs/constitution.md`），作为后续开发强制依据。
- **FR-015**: 工程底座 MUST 仅使用 Constitution 允许的技术选型与轻量工程工具，MUST NOT 引入跨端框架、重型前端框架、自建服务器或第三方 BaaS。
- **FR-016**: 小程序端 MUST 提供可运行的轻量同步脚本（或等价机制），将 `packages/shared` 的构建产物拷贝/同步至小程序本地可运行位置（如 utils），并完成本功能内至少一次冒烟验证（小程序侧可引用同步后的示例导出）。本功能不要求业务算法全量同步，也不要求持续 watch/增量同步链路。

### Key Entities

- **Workspace Package**: 单仓内的一个可独立命名与构建的包（共享库 / 小程序 / 官网 / 云函数）。
- **Root Toolchain Profile**: 根目录统一的类型检查、规范检查、测试与构建约定。
- **App Shell (Miniprogram)**: 含四个主 Tab 的小程序导航与占位页面集合。
- **Site Shell (Web)**: 官网基础页面集合（品牌/介绍/工具/关于）的静态骨架。
- **Governance Document**: 落盘于文档目录的完整项目宪章副本。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 交付后顶层目录 100% 符合 Constitution 约定分层，审查时找不到未约定的业务顶层目录。
- **SC-002**: 开发者在根目录执行统一测试命令后，在 1 分钟内得到明确通过/失败结果；至少 1 条类型化单测可稳定通过。
- **SC-003**: 使用微信开发者工具打开小程序包后，首次编译可完成；四个 Tab 均可在 3 次点击内完成切换并看到对应页面。
- **SC-004**: 官网本地开发服务可在 1 分钟内启动成功，并至少可打开全部基础骨架页面。
- **SC-005**: 共享库执行构建后，产物中同时包含可运行编译输出与类型声明文件，且构建过程无第三方运行时依赖。
- **SC-006**: 依赖审查中不出现跨端框架、重型 UI 框架、自建后端或第三方 BaaS；仅存在栈内允许的轻量工程依赖。
- **SC-007**: `docs/constitution.md` 存在且与治理源宪章内容一致，版本信息可读；开发者无需翻找隐藏路径即可引用。
- **SC-008**: 开发者执行一次约定的 shared→小程序同步命令后，可在小程序工程内引用到同步后的示例导出（冒烟通过）；无需依赖持续 watch。
- **SC-009**: 云函数包执行约定编译后，可得到来自占位函数的部署用编译产物；全程无需接入真实云环境。
- **SC-010**: 根目录统一构建命令在 2 分钟内对 `shared`、`web`、`cloudfunctions` 全部成功；小程序构建不纳入该命令验收。
- **SC-011**: 官网简易工具占位页可展示来自 shared 的示例引用结果；不提供完整热量/BMI 业务计算。

## Assumptions

- 本功能的主要使用者是 PeakMeet 开发者（当前为个人/小团队），不是终端健身用户；终端业务功能不在本规格范围。
- 「统一命令」默认通过根目录包管理脚本暴露（测试 / 检查 / 格式化 / 构建）；具体命令名可在实现计划中定为 `test`、`lint`、`format`、`build`。根 `build` 覆盖 shared + web + cloudfunctions；小程序由微信开发者工具编译，不纳入根 `build` 强制范围。
- 共享库构建工具选用轻量方案（如 tsc 或同等轻量打包器），以「可产出 JS + 类型声明、零运行时依赖」为验收，不锁定某一品牌工具为业务需求。
- 小程序占位页仅需可切换与可编译，不实现动作库/饮食计算等业务。
- 官网基础页面与 Constitution「首页、功能介绍页、简易工具页、关于页」对齐；简易工具页本阶段为占位 + shared 极简引用冒烟，不实现真实计算器。
- 云函数骨架不接入真实云环境密钥；本地仅验证目录与「1 个占位函数可编译」链路，不要求模拟调用。
- `docs/constitution.md` 以当前 `.specify/memory/constitution.md` 为源同步生成；后续宪章修订时需保持同步（同步机制可在计划中约定，本功能至少完成一次完整落盘）。
- shared→小程序采用轻量一次性同步脚本（构建后拷贝），本功能验收一次冒烟即可；持续 watch 不在范围。
- 种子数据目录 `database/` 本阶段可为空目录或仅含说明文件，不要求导入云库。
- 根目录 README 非本功能强制验收项；若便于打开工程可附带最小说明，但不替代 `docs/constitution.md`。

## Constitution Alignment _(mandatory)_

### In Scope / Out of Scope

- **In scope**: monorepo 分层与根工具链；`packages/shared|miniprogram|web|cloudfunctions` 骨架；`database/`、`docs/`；四 Tab 小程序壳；官网四页静态壳；宪章文档落盘；统一测试/规范/构建入口；shared→小程序轻量同步；云函数 1 个占位可编译函数；官网 workspace 依赖 shared 并做占位引用冒烟。
- **Out of scope**: 动作/器材/计划/饮食等业务功能；用户登录与私有数据；云数据库真实数据与权限配置落地；Web 功能复刻小程序；真实 BMI/热量计算器；社区/运营后台；SSR/自建后端/跨端框架；云函数本地模拟调用与真实部署；shared 持续 watch 同步。

### Stack & Shared Logic

- **Language**: TypeScript 优先（新增业务/共享逻辑默认 `.ts`；无充分理由不新增纯 JS）
- **Target package(s)**: shared / miniprogram / web / cloudfunctions（外加 database、docs）
- **Shared extraction**: 本阶段建立纯逻辑包骨架与冒烟示例；小程序经轻量同步脚本接入；官网经 workspace 直接依赖并做占位引用冒烟；真实计算算法留给后续功能并强制进 shared；不做完整 watch/增量同步
- **Backend usage**: 云函数目录骨架 + 1 个可编译占位函数；不实现业务云函数、不接密钥、不做本地模拟调用；纯计算永不走云函数

### Compliance Checklist

- [x] No medical/treatment claims; disclaimer required on calculators/guidance（本功能无计算器/指导文案）
- [x] Privacy: minimum necessary data only; privacy policy implications noted（本功能不采集用户数据）
- [x] No extreme diet / overload training recommendations（无内容推荐）
- [x] Platform rules: WeChat category/content alignment (if miniprogram)（仅工程骨架，无业务类目内容；后续功能再对齐）
