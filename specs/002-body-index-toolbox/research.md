# Research: 002-body-index-toolbox

**Date**: 2026-07-23  
**Spec**: [spec.md](./spec.md)

## R1. BMI 公式与双标准分级

- **Decision**:
  - 数值：`BMI = weightKg / (heightM)^2`，`heightM = heightCm / 100`；结果保留 1 位小数（展示层可再格式化，内核返回 number + 已舍入策略在 shared 固定）
  - 中国成人常用分级（kg/m²）：偏瘦 `<18.5`；正常 `18.5–23.9`；超重 `24.0–27.9`；肥胖 `≥28.0`
  - WHO 分级：偏瘦 `<18.5`；正常 `18.5–24.9`；超重 `25.0–29.9`；肥胖 `≥30.0`
  - 内核同时返回两套 `category` 枚举与区间表，页面并列展示并标注来源文案
- **Rationale**: 澄清结论要求双对照；公式无争议；国内产品常用 24/28 阈值
- **Alternatives considered**:
  - 仅中国或仅 WHO — 澄清已否决
  - 亚洲 WHO 额外切点表 — 增加复杂度，本版用中国成人常用 + WHO 通用即可

## R2. BMR 公式

- **Decision**: Mifflin–St Jeor（与 Constitution 热量缺口描述一致）
  - 男：`10*weightKg + 6.25*heightCm - 5*age + 5`
  - 女：`10*weightKg + 6.25*heightCm - 5*age - 161`
  - 输出整数 kcal/日（四舍五入）；附带相对「同性别参考区间」的高低标签由 shared 给出枚举，文案在页面
- **Rationale**: 业界常用、与项目既定热量路径一致，避免多公式并存
- **Alternatives considered**: Harris–Benedict — 较旧；Katch–McArdle — 依赖体脂，本页无强制体脂

## R3. 体脂双模式算法

- **Decision**:
  - **围度法**：U.S. Navy 方法（公制换算）
    - 男：身高、颈围、腰围
    - 女：身高、颈围、腰围、臀围
    - shared 返回百分比（1 位小数）+ `method: 'navy'` + 误差/局限 code
  - **简易估算**：YMCA 腰围-体重法（公制→公式所需英制在 shared 内转换，页面对外只见 cm/kg）
    - 入参：性别、腰围、体重；**年龄**为必填，用于成年适用性校验（建议 18–65，超出给警告或拒绝策略在实现时选「友好提示仍可算」或「阻止」——默认：**超出给出注意事项但仍计算**，非法年龄如 ≤0 阻止）
    - 说明：YMCA 主公式不含年龄；年龄用于适用性说明与解读分层，满足规格字段同时保持公式可复现
  - 默认 UI 模式：`simple`；切换清空结果
- **Rationale**: 澄清要求双模式；Navy 为围度法事实标准；YMCA 匹配「无身高」的简易字段集
- **Alternatives considered**:
  - 简易用 Deurenberg（需 BMI→身高）— 与规格字段冲突
  - RFM（需身高）— 同理
  - 仅 Navy — 澄清要求保留简易路径

## R4. 腰臀比与性别风险阈值

- **Decision**:
  - `WHR = waistCm / hipCm`（保留 2 位小数）
  - 科普参考（WHO 常用切点量级）：男性 `≥0.90`、女性 `≥0.85` 视为「偏高风险参考」；低于为「相对较低参考」；中间可设「临界」或二段即可（本版：**偏低参考 / 偏高参考** 两档，阈值上取上述切点）
  - 入参必含性别；文案标注非诊断
- **Rationale**: 澄清要求按性别阈值；二档足够新手友好
- **Alternatives considered**: 三档精细医学分层 — 易越合规线；无性别通用文案 — 澄清已否决

## R5. 1RM 估算

- **Decision**:
  - Epley：`1RM = weightKg * (1 + reps / 30)`
  - 适用次数：**1–12**（含）；`reps === 1` 时 1RM = 重量本身
  - `reps > 12` 或 `< 1`：返回错误码，页面提示调整次数
  - 训练参考：shared 可返回常用强度百分比表（如 估算 1RM 的 60%/70%/80% 重量建议），文案强调循序渐进、禁止超负荷表述
- **Rationale**: Epley 实现简单、测试友好；次数上限避免高次数估算失真
- **Alternatives considered**: Brzycki — 亦可，与 Epley 接近；本版锁定 Epley 保证双端一致

## R6. shared 结果与错误契约

- **Decision**: 统一 `CalcOk<T> | CalcErr` 判别联合，不抛异常做控制流
  - `ok: true` → `value` + 可选 `meta`（分级、方法、警告）
  - `ok: false` → `code`（稳定英文枚举）+ 可选 `messageKey`；**用户可见中文**由小程序文案表映射，shared 可带英文/中文开发消息但不作为唯一 UI 源
- **Rationale**: 纯函数可测；页面易分支；避免 try/catch 散落
- **Alternatives considered**: 抛 Error — 测试与调用啰嗦；只返回 null — 错误原因丢失

## R7. 页面交互与状态

- **Decision**: 各工具页 `data` 含表单字段（string 输入）、`result: T | null`，`errorTip: string`；点击「计算」时 parse → 调 shared → 写 result；`onInput`/`bindinput` 任一相关字段变化将 `result = null` 并清成功态；`onShow`/`onLoad` 重置为空白（不读 storage）
- **Rationale**: 对齐澄清「点击计算 / 改输入失效 / 不预填」
- **Alternatives considered**: 独立结果页、实时计算 — 澄清已否决

## R8. 小程序目录与路由

- **Decision**: 非 Tab 子包路径：
  - `pages/diet/toolbox/index` 聚合
  - `pages/diet/toolbox/{bmi,bmr,body-fat,whr,one-rm}/index`
  - 饮食 Tab `pages/diet/index` 增加入口 `navigator`/`wx.navigateTo`
  - `app.json` `pages` 数组注册上述路径（可放在 diet 之后）
- **Rationale**: 归属饮食清晰；与现有四 Tab 不冲突
- **Alternatives considered**: 顶层 `pages/toolbox` — 弱化饮食归属；分包 — MVP 暂不需要

## R9. sync 声明文件维护

- **Decision**: 增强 `scripts/sync-shared-to-miniprogram.mjs`：在拷贝 `dist-cjs` 后，从 `packages/shared/dist/index.d.ts`（及必要的引用）同步类型到 `utils/shared/`，**禁止**继续硬编码仅 `getPeakMeetPing` 的单行 d.ts
- **Rationale**: 本功能导出面扩大，硬编码必过时；否则 FR-009 类型复用在小程序侧断裂
- **Alternatives considered**: 手写维护 d.ts — 易漂；小程序 npm 构建 — 底座已否决

## R10. 文案与合规

- **Decision**:
  - 免声明常量放 shared（或 shared `DISCLAIMER_ZH`），页面底部统一引用，语义对齐 Constitution：「仅供参考，不构成专业健身指导，请根据自身身体状况量力而行」（规格「不构成专业指导」为同义约束，实现用 Constitution 全文更稳）
  - 解读长文案可放 miniprogram `constants/copy.ts`，按 shared 返回的 `category`/`method` 映射
- **Rationale**: 数值分级进 shared 保证一致；营销/科普句式可在 UI 迭代
- **Alternatives considered**: 全部文案进 shared — 可测但臃肿；全部在页面 — 双端未来 Web 计算器难复用免责声明

## R11. 校验分层

- **Decision**:
  - **页面**：空字符串、非数字 → 中文提示，不调用 shared
  - **shared**：有限数字域（如身高 50–250 cm、体重 20–300 kg、围度 30–200 cm、年龄 1–120、次数 1–12 等）→ `CalcErr`
- **Rationale**: UX 即时反馈 + 内核防脏数据；边界值以 research 表为准写入 data-model
- **Alternatives considered**: 仅页面校验 — 内核仍可能被 Web 误用；仅 shared — 空串体验差

## Resolved NEEDS CLARIFICATION

本计划 Technical Context 无未决 `NEEDS CLARIFICATION`；规格澄清五项均已落入 R1–R8。
