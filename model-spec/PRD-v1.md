# Aqara Builder — 产品需求文档（PRD）

> 版本：v1.0  
> 日期：2026-03-26  
> 状态：可执行开发版  
> 适用范围：前端 / 后端 / AI / 产品

---

## 目录

1. [产品定位与目标](#1-产品定位与目标)
2. [目标用户与核心场景](#2-目标用户与核心场景)
3. [功能模块详细说明](#3-功能模块详细说明)
4. [数据模型与核心概念](#4-数据模型与核心概念)
5. [分阶段实施 Roadmap](#5-分阶段实施-roadmap)
6. [技术架构说明](#6-技术架构说明)
7. [成功指标（OKR / KPI）](#7-成功指标)
8. [当前代码状态评估](#8-当前代码状态评估)

---

## 1. 产品定位与目标

### 1.1 一句话定义

> **Aqara Builder 是面向智能空间方案商、安装商和终端用户的 AI 创作与交付平台，让智能空间方案从创意到落地全链路可操作、可分享、可复用。**

### 1.2 三层价值主张

| 角色 | 旧痛点 | Aqara Builder 带来的改变 |
|---|---|---|
| 方案商 / 服务商 | 手工出方案 2-3 天，无法规模复制 | AI 30 秒生成 BXML + 演示，方案即文档 |
| 安装商 / 集成商 | 需要懂协议才能配置，门槛高 | BXML + AI 辅助绑定，2 小时完成交付 |
| 终端用户 | App 是设备列表，自己配置费解 | App 是"能力资产视图"，无感知空间智能 |

### 1.3 产品核心循环

```
AI Vibe Design → BXML 方案 → 预览演示 → Studio 部署 → 设备绑定
     ↑                                                      ↓
     └──────────── 提取 BXML ← Life App 日常使用 ←──────────┘
                       ↕
              社区灵感广场 / 方案市场
```

---

## 2. 目标用户与核心场景

### 2.1 用户角色（Persona）

#### Persona A：方案商（Builder）
- **身份**：智能家居集成商、装修设计师、品牌方案部门
- **主要任务**：为客户设计并演示智能空间方案
- **核心诉求**：快速出方案、方案可演示、可修改迭代
- **使用频率**：每周多次
- **技术水平**：不需要了解协议细节，但懂业务场景

#### Persona B：安装商（Installer）
- **身份**：现场施工、调试工程师
- **主要任务**：将 BXML 方案部署到真实 Studio，完成设备绑定交付
- **核心诉求**：有清单、AI 能帮做映射、异常处理有引导
- **使用频率**：每次上门安装时
- **技术水平**：懂 Aqara 设备，不懂高级编程

#### Persona C：终端用户（Resident / Operator）
- **身份**：住宅业主、酒店运营、办公空间管理员
- **主要任务**：日常使用智能空间，偶尔调整配置
- **核心诉求**：一键控制场景、状态摘要清晰、不用理解设备
- **使用频率**：每天多次
- **技术水平**：普通用户，不懂智能家居技术

---

### 2.2 核心使用场景

| 场景 ID | 场景名称 | 主要角色 | 优先级 |
|---|---|---|---|
| UC-01 | AI Build：从自然语言生成 BXML 方案 | Builder | P0 |
| UC-02 | 方案预览：空间可视化 + 自动化演示 + App UI | Builder | P0 |
| UC-03 | 方案导出：BOM 清单 + BXML 文件 | Builder | P0 |
| UC-04 | Life App 预览：生成 QR，手机扫码预览插件 | Builder | P0 |
| UC-05 | 项目管理：创建、编辑、归档项目 | Builder | P0 |
| UC-06 | Studio 部署：将 BXML 下发到 Cloud Studio | Installer | P1 |
| UC-07 | 设备绑定：AIOT 同步 + 虚拟设备映射 | Installer | P1 |
| UC-08 | 能力缺口报告：显示哪些功能需要补购设备 | Installer | P1 |
| UC-09 | 方案发布：发布到社区灵感广场 | Builder | P2 |
| UC-10 | 方案浏览 / Remix：从社区发现并改造方案 | Builder | P2 |
| UC-11 | 方案商业化：付费方案发布与分成 | Builder | P3 |
| UC-12 | BACnet/Modbus 设备接入 | Installer | P3 |
| UC-13 | Life App 日常使用：资产视图控制 | Resident | P1 |
| UC-14 | BXML 二次创作：从 Studio 提取 BXML 到 Builder | Builder | P2 |

---

## 3. 功能模块详细说明

### M1. AI Build 模块（创作入口）

#### M1.1 对话式创作

**输入方式：**
- 自然语言文本框（主入口）
- 快速提示 Chip（Residential / Hotel / Office / Elderly Care 等）
- 未来：图片上传（户型图参考）

**AI 处理流程：**
```
用户输入 → IntentParser 提取意图 → AgentOrchestrator 调用技能链：
  1. space-modeling：生成 SpaceInstances + StructureInstances
  2. device-resolve：根据空间类型推荐设备，生成 DeviceInstances
  3. automation-gen：基于空间语义生成自动化规则（BXML Automation）
  4. scene-gen：生成默认场景（回家 / 睡眠 / 离家）
  5. app-ui-gen：生成 Life App 资产卡片配置
  6. bom-estimate：统计设备清单和估算费用
→ 生成完整 BXML Document
```

**生成结果展示：**
- 实时流式输出 AI 思考过程（步骤进度条）
- 生成完成后进入项目编辑器

**约束：**
- 单次 AI Build 消耗积分（Coins），免费用户每天 3 次，付费无限制
- 生成过程中不可中断，完成后可继续追加指令

---

#### M1.2 追加对话（In-canvas Chat）

进入项目编辑器后，用户可继续用自然语言修改方案：

| 示例指令 | AI 操作 |
|---|---|
| "给主卧增加一个空气质量传感器" | 在主卧 DeviceInstances 中新增 AirQualitySensor |
| "把睡眠模式改成 23 点触发" | 修改对应 AutomationRule 的时间条件 |
| "帮我加一个回家一键场景" | 在 SceneDefs 中新增场景，关联客厅设备 |
| "移除次卧的空调" | 从 DeviceInstances 中删除指定实例 |

每次修改产生新的 BXML Revision，支持撤销回退。

---

### M2. 项目编辑器（Canvas）

#### M2.1 标签结构

```
项目编辑器
├── Space（空间视图）     — BXML 空间图谱可视化
├── Automation（自动化）  — 规则链可视化
├── App（应用预览）       — Life App 插件效果预览
└── Studio（部署面板）    — 部署 + 设备绑定 + 发布
```

---

#### M2.2 Space 视图

**功能要求：**
- 从 BXML SpaceInstances 渲染房间层次结构
- 每个房间卡片显示：房间名 + 设备类型图标 + 设备数量
- 点击房间展开设备列表（DeviceInstances）
- 设备显示：名称 + 模板类型 + 绑定状态（未部署时为 unbound）
- 支持拖拽调整房间顺序（修改 BXML parentRef）
- 支持手动添加/删除设备（触发 AI 建议或手动选型）

**BXML 数据驱动：**
- 所有显示内容从 `BXMLDocument.objects` 读取，不使用 mock 数据
- 统计数据从 `getBXMLStats()` 获取

---

#### M2.3 Automation 视图

**功能要求：**
- 从 BXML 自动化实例 JSON 渲染规则链
- 每条规则展示：触发条件 → 判断条件 → 执行动作
- 节点样式：Trigger（橙色）/ Condition（蓝色）/ Action（绿色）
- 支持点击节点编辑参数（触发时间、阈值、目标设备）
- 支持通过 AI 追加新规则

---

#### M2.4 App 视图

**功能要求：**
- 模拟 Aqara Life App 的手机界面
- 渲染 Asset 卡片：湿度管理 / 睡眠环境 / 安防 等
- 显示场景快捷按钮：回家 / 睡眠 / 离家
- 无 Studio 模式：静态展示
- 有 Studio 模式：实时状态（来自 Online Studio）
- 底部显示"扫码在手机上预览"QR 码按钮

---

#### M2.5 Studio 面板（部署与交付）

包含 4 个子步骤（参见 UC-06 ~ UC-08）：

**Step 1：部署到 Cloud Studio**
- 触发 `POST /api/online-studio/deploy`
- 显示 Studio ID、状态（running）、24 小时过期倒计时
- 显示空间拓扑摘要（N 个空间，M 台设备）

**Step 2：同步 AIOT 设备**
- 触发 `POST /api/aiot/sync`
- 显示绑定进度：总计 N 台设备，已映射 M 台，未映射 K 台
- 展示已映射设备列表（绿色）和未映射设备（橙色 + 推荐购买链接）
- 能力缺口报告：某设备缺少 BrightnessLevel 功能，对应真实设备无法调光

**Step 3：构建插件包**
- 触发 `POST /api/plugin/build`
- 显示构建进度（云端沙箱验证 → 安全扫描 → 打包 → CDN 分发）
- 输出：QR 码 + Life App 预览链接 + 绑定统计

**Step 4：下发 DSL 到 M300（可选）**
- 仅当用户持有 M300 时显示
- 输入 M300 的内网 IP，触发推送
- 推送状态反馈

---

### M3. 项目列表（My Projects）

**功能要求：**
- 卡片 / 列表两种视图
- 排序：最近编辑 / 创建时间 / 字母
- 筛选：空间类型 / 创建方式 / 可见性 / 状态
- 项目卡片信息：缩略图 / 项目名 / 空间类型 / 设备数量 / 最后编辑时间 / 部署状态
- 卡片右键菜单：编辑 / 复制 / 构建插件 / 发布到社区 / 删除
- 支持从卡片直接生成 QR 码（快捷操作）

---

### M4. 灵感广场（Community Explore）

> P2 功能，Sprint 3 实现

**首页展示：**
- 精选方案（编辑推荐）
- 热门分类：住宅 / 酒店 / 办公室 / 精品民宿 / 养老
- 最新发布 / 热门 / 高部署量 排序切换
- 搜索：关键词 + 空间类型 + 设备组合

**方案卡片信息：**
- 缩略图（空间可视化截图）
- 方案名 / 创作者（Builder 昵称 + 认证状态）
- 空间类型标签 / 设备数量
- 部署次数 / 点赞数 / 收藏数
- 是否可免费 Remix / 是否付费

**方案详情页：**
- 完整的空间 + 自动化 + App 预览
- BOM 清单（设备类型和数量）
- 评论区
- "Remix 这个方案" 按钮

**Remix 流程：**
```
用户点击 Remix
→ 在 AI 对话框中显示原方案摘要
→ 用户可输入差异描述（"我是两房一厅，没有阳台"）
→ AI 基于差异自动调整 BXML（删减/合并房间，调整设备）
→ 得到新的 BXML Draft，进入项目编辑器
→ 原方案 attribution 信息自动保留
```

**发布流程：**
```
方案商点击"发布到社区"
→ 填写：方案名称 / 描述 / 空间类型标签 / 可见性（公开/仅邀请）
→ 选择：免费 Remix / 付费 Remix（需要 Builder 级认证）
→ 预览发布效果
→ 提交审核（认证 Builder 可直接发布，普通用户需人工审核）
```

---

### M5. 方案市场（Marketplace）

> P3 功能，Sprint 5 实现

**核心概念：**
- 付费购买的方案包（含 BXML + BOM + 部署指南 + 安装商视频）
- 认证 Builder 发布，Aqara Builder 平台收取分成（建议 30%）
- 购买后可直接 Remix / 部署

**列表功能：**
- 按空间类型、价格区间、评分筛选
- 显示：已购买 N 次 / 评分 / 价格
- 免费方案（精选）也在市场展示（引流）

---

### M6. Builder 主页（Profile）

> P2 功能

**内容：**
- Builder 头像 / 昵称 / 认证标签（Verified Builder / Partner Builder）
- 作品集：已发布的方案列表
- 统计数据：总发布方案 N 个 / 累计被部署 M 次 / 获得点赞 K 个
- 关注者 / 关注数

**认证机制：**
| 认证级别 | 条件 | 权益 |
|---|---|---|
| 普通 Builder | 注册即得 | AI Build 每天 3 次，基础功能 |
| Verified Builder | 完善资料 + 发布 3 个方案 | AI Build 无限，方案直接发布无需审核 |
| Partner Builder | Aqara 官方认证 | Marketplace 发布权限，专属支持 |

---

### M7. 认证与计费

**认证方案（MVP 阶段使用 Clerk 或 Google OAuth）：**
- 邮箱 + 密码
- Google / GitHub 第三方登录
- 企业 SSO（P3）

**计费计划（Coins 积分 + 订阅双轨）：**

| 计划 | 价格 | AI Build 次数 | 高级功能 |
|---|---|---|---|
| Free | 免费 | 3 次/天 | 基础预览 |
| Pro | $29/月 | 无限 | BACnet/Modbus 接入，高级分析 |
| Team | $99/月 | 无限（5 席位） | 协作，版本管理，私有方案库 |
| Enterprise | 联系报价 | 无限 | 白标，私有部署，专属支持 |

---

## 4. 数据模型与核心概念

### 4.1 核心实体关系

```
Builder（用户）
  ├── Projects[]（项目）
  │     ├── BXMLDocument（空间图谱实例）
  │     │     ├── SpaceInstances[]
  │     │     ├── StructureInstances[]
  │     │     ├── DeviceInstances[]
  │     │     └── Relations[]
  │     ├── AutomationInstance（自动化实例）
  │     │     ├── metadata.scope[]（触发器设备引用）
  │     │     └── automations[]（规则链）
  │     ├── PluginBundle（App 插件包）
  │     │     ├── deviceCards[]（含绑定状态）
  │     │     └── bindingStats
  │     └── BXMLVersionStore（版本历史）
  │
  ├── Studios[]（绑定的 Studio 实例）
  │
  └── PublishedSolutions[]（发布到社区的方案）
        ├── 原始 BXMLDocument（模板化，无真实设备 ID）
        ├── 发布元数据（标题/描述/标签/价格）
        └── 统计数据（部署次数/点赞/收藏）
```

### 4.2 BXML 与自动化的关系

```
BXMLDocument               AutomationInstance
──────────────────         ─────────────────────────────
SpaceInstances      ──→    metadata.scope[].deviceId 引用
DeviceInstances     ──→    starters[].source.deviceId 引用
  └── PointInstances──→    traitCode / functionCode 引用
```

自动化实例必须只引用 BXML 中已存在的设备实例和点位实例。  
部署时，虚拟 deviceId → 真实设备 deviceId 的映射由 `DeviceBinding` 层处理。

### 4.3 ElementType Capability Pool（能力池）

部署后，所有真实设备的能力点汇聚到一个统一能力视图：

```typescript
interface CapabilityPoint {
  pointId: string;              // 唯一标识
  deviceId: string;             // 真实设备 ID
  spaceId: string;              // 所在空间
  elementTypeCode: string;      // 统一能力编码（OnOff / CurrentTemperature 等）
  protocol: "aqara" | "bacnet" | "modbus";
  accessMode: string;           // read_only / read_write / invoke
  currentValue?: unknown;       // 由 Studio 运行时维护
}
```

---

## 5. 分阶段实施 Roadmap

> 每阶段 10 天，共 5 个阶段（50 天）

---

### Sprint 0（Day 1–10）：MVP 核心演示链路

**目标：端到端跑通"AI Build → 方案预览 → Life App QR"，可对外演示。**

**验收标准：**
- [ ] 用户输入自然语言，AI 真实调用 6 个技能生成完整 BXML
- [ ] Space 视图从 BXML 渲染房间卡片（不是 mock）
- [ ] Automation 视图从自动化实例渲染规则链（不是 mock）
- [ ] App 视图显示 Asset 卡片（基于 BXML 推导）
- [ ] 点击"生成 QR"调用 `/api/plugin/build`，H5 页面可预览
- [ ] 项目列表保存并显示 BXML 统计（房间数/设备数）
- [ ] 本地 dev 服务器稳定运行无崩溃

**任务清单：**

| Task ID | 任务 | 模块 | 预估天 |
|---|---|---|---|
| T0-01 | 修复 AI Build：orchestrator 真实调用 6 个 skill，返回真实 BXML | Agent | 2 |
| T0-02 | Space 视图：从 BXMLDocument 渲染 SpaceInstances，每个房间显示设备列表 | Canvas | 2 |
| T0-03 | Automation 视图：从自动化实例 JSON 渲染 RuleChain 节点图 | Canvas | 2 |
| T0-04 | App 视图：基于 BXML 设备组合推导 Asset 卡片，渲染 Life App 手机模拟器 | Canvas | 2 |
| T0-05 | Plugin Build API + H5 页面：确保 bindingStats / controllable 字段正确 | API | 1 |
| T0-06 | 项目列表：展示 BXML stats（spaceCnt / deviceCnt），持久化到 localStorage | Projects | 1 |

---

### Sprint 1（Day 11–20）：Studio 部署与设备绑定

**目标：安装商可以拿到 BXML，完成 Cloud Studio 部署、AIOT 同步、插件构建完整流程。**

**验收标准：**
- [ ] Studio 面板 4 个步骤 UI 完整可操作
- [ ] Online Studio 部署返回 Studio ID 和拓扑摘要
- [ ] AIOT 同步展示 mapped/unmapped/conflicted 详情（设备名称、型号、能力）
- [ ] 能力缺口报告：显示哪些 ElementType 无法从现有设备提供，附购买链接
- [ ] 绑定完成后，Life App H5 页面中 `fully_bound` 设备可控，`unbound` 设备显示购买引导
- [ ] 插件 QR 码链接到带 `?onlineStudioId=xxx` 的 H5 页面

**任务清单：**

| Task ID | 任务 | 模块 | 预估天 |
|---|---|---|---|
| T1-01 | Studio 面板 Step 1：UI + 调用 deploy API + 状态显示（过期倒计时） | Studio | 2 |
| T1-02 | Studio 面板 Step 2：AIOT 同步 UI，展示设备绑定明细表 | Studio | 2 |
| T1-03 | 能力缺口报告：从 DeviceBinding.missingCapabilities 生成缺口清单 + 购买 URL | Binding | 2 |
| T1-04 | Studio 面板 Step 3：插件构建 + QR 展示 + 预览链接（含 onlineStudioId） | Studio | 1 |
| T1-05 | H5 插件页：按 fully_bound / partially_bound / unbound 分级渲染 | Plugin | 2 |
| T1-06 | 设备命令回路：H5 点击控制 → POST /api/plugin/[id] → Online Studio 状态更新 | Plugin | 1 |

---

### Sprint 2（Day 21–30）：BXML 版本管理 + BOM + 导出

**目标：方案可以版本化管理，可以导出 BOM 清单和 BXML 文件，支持二次创作。**

**验收标准：**
- [ ] 版本历史面板：展示所有 Revision，支持查看 diff 和一键回退
- [ ] BOM 清单导出：按空间分组展示设备类型 + 数量 + 推荐型号 + 估算费用
- [ ] BXML 文件导出（XML + JSON 双格式）
- [ ] BXML 文件导入（从本地 Studio 提取后导入）
- [ ] 方案分享链接（只读预览 URL）

**任务清单：**

| Task ID | 任务 | 模块 | 预估天 |
|---|---|---|---|
| T2-01 | 版本历史面板 UI：列表展示 Revisions，显示时间戳和变更摘要 | Canvas | 2 |
| T2-02 | BXML Diff 可视化：新增（绿）/ 删除（红）/ 修改（黄）高亮 | Canvas | 2 |
| T2-03 | BOM 生成器：从 DeviceInstances + DeviceTemplate 生成 BOM，匹配推荐 Aqara 型号 | BOM | 2 |
| T2-04 | 导出：BXML XML 文件 + 自动化 JSON + BOM CSV | Export | 1 |
| T2-05 | 导入：上传 BXML XML 文件，解析后创建新项目 | Import | 1 |
| T2-06 | 方案分享链接：生成只读访问 token，允许预览 Space + Automation + App | Share | 2 |

---

### Sprint 3（Day 31–40）：社区灵感广场

**目标：Builder 可以发布方案，其他 Builder 可以浏览和 Remix。**

**验收标准：**
- [ ] 发布流程：填写方案元数据 → 预览 → 一键发布
- [ ] 灵感广场展示：按热度/最新/空间类型筛选浏览
- [ ] 方案详情页：完整预览 + BOM + 评论
- [ ] Remix 流程：AI 辅助适配差异，进入新项目
- [ ] Attribution 信息在 Remixed 项目中保留
- [ ] 方案主页（Builder Profile）：作品集 + 统计

**任务清单：**

| Task ID | 任务 | 模块 | 预估天 |
|---|---|---|---|
| T3-01 | 发布流程 UI：从项目编辑器触发，填写元数据，预览并提交 | Community | 2 |
| T3-02 | 灵感广场列表：卡片网格，筛选 + 排序，接入真实社区数据 | Community | 2 |
| T3-03 | 方案详情页：Space / Automation / App 预览 + BOM + 评论区 | Community | 2 |
| T3-04 | Remix 功能：进入 AI 对话 + 差异描述 + 自动适配 → 新项目 | Remix | 2 |
| T3-05 | Builder 主页：作品集列表 + 部署统计 + 关注功能 | Profile | 2 |

---

### Sprint 4（Day 41–50）：认证体系 + 计费 + Marketplace

**目标：真实用户认证，付费计划上线，方案市场可交易。**

**验收标准：**
- [ ] 真实 Auth（Clerk）：邮箱注册 + Google 登录
- [ ] 付费订阅：Free / Pro / Team 三个计划，Stripe 支付
- [ ] Coins 积分系统：AI Build 消耗 + 订阅奖励 + 购买充值
- [ ] Marketplace：付费方案发布 + 购买流程
- [ ] 收益结算：Builder 可查看方案收益（模拟分成）
- [ ] 使用分析：Builder 查看方案访问量 / 部署量 / 收藏量

**任务清单：**

| Task ID | 任务 | 模块 | 预估天 |
|---|---|---|---|
| T4-01 | Clerk Auth 集成：邮箱 + Google 登录，替换现有 AccountContext mock | Auth | 2 |
| T4-02 | 订阅计划 + Stripe 支付：Free/Pro/Team 升级流程 | Billing | 2 |
| T4-03 | Coins 积分逻辑：消耗 / 充值 / 订阅奖励 | Billing | 1 |
| T4-04 | Marketplace 发布流程：设置价格 + 上架 + 购买 | Marketplace | 2 |
| T4-05 | Builder 收益看板：方案销售额 / 分成 | Analytics | 1 |
| T4-06 | 使用分析仪表盘：单个方案的访问 / 部署 / 收藏趋势 | Analytics | 2 |

---

### Sprint 5（Day 51-60）：BACnet / Modbus + 企业版

**目标：支持第三方设备接入，打通商业楼宇场景；企业版基础能力。**

**验收标准：**
- [ ] BACnet 设备添加：输入地址 + 扫描对象 + AI 推断 ElementType + 人工确认
- [ ] Modbus 设备添加：配置寄存器表 + ElementType 映射 + 读值测试
- [ ] 第三方设备与 Aqara 设备在同一 ElementType Pool 中显示
- [ ] 企业版 SSO 登录（基础）
- [ ] 协作功能：项目成员邀请 + 权限管理（editor / viewer）
- [ ] 私有方案库：企业内部不公开的方案资产

---

## 6. 技术架构说明

### 6.1 技术栈

```
前端框架：Next.js 14（App Router）
样式：Tailwind CSS
UI 组件：shadcn/ui（已部分使用）
状态管理：React Context（AccountContext / ProjectsContext / BillingContext）
AI：Gemini / Claude（通过 Agent Orchestrator 抽象调用）
数据库（MVP 阶段）：localStorage / 内存 global（需 Sprint 4 升级到真实 DB）
认证（Sprint 4+）：Clerk
支付（Sprint 4+）：Stripe
部署：Vercel
```

### 6.2 核心目录结构

```
app/
  (main)/
    page.tsx              — 首页（AI Build 入口）
    projects/
      page.tsx            — 项目列表
      [id]/page.tsx       — 项目编辑器（Canvas）
    explore/
      page.tsx            — 灵感广场列表
      [id]/page.tsx       — 方案详情
    marketplace/page.tsx  — 方案市场
    square/page.tsx       — 社区广场（Moment）
    studio-live/page.tsx  — Studio 实时监控
    builders/[username]/  — Builder 主页
  plugin/[id]/page.tsx    — Life App H5 插件运行页
  api/
    online-studio/deploy/ — 部署到 Cloud Studio
    aiot/sync/            — AIOT 设备同步
    plugin/build/         — 构建插件包
    plugin/[id]/          — 获取 / 控制插件

lib/
  bxml.ts                 — BXML 数据模型（核心）
  aiot-sync.ts            — AIOT 同步逻辑
  online-studio.ts        — Online Studio 管理
  plugin-store.ts         — 插件包存储
  catalog-links.ts        — 设备购买链接
  agent/
    orchestrator.ts       — Agent 主调度
    intent-parser.ts      — 意图解析
    compiler.ts           — BXML → Plugin 编译
    skills/               — 6 个核心 Skill
```

### 6.3 数据持久化升级路线

| 阶段 | 持久化方案 | 适用范围 |
|---|---|---|
| Sprint 0-2 | localStorage + React Context + 内存 global | 单用户 Demo |
| Sprint 3 | 引入 Vercel KV（Redis）存储 Project + BXML | 多用户持久化 |
| Sprint 4 | 引入 Neon Postgres（via Vercel）存储用户 / 方案 / 计费 | 生产数据 |
| Sprint 5 | Vercel Blob 存储 BXML 文件 / 媒体资产 | 大文件 |

---

## 7. 成功指标

### 7.1 Sprint 0 验收指标
- AI Build 成功率（生成有效 BXML）≥ 90%
- 生成耗时（端到端）≤ 15 秒
- Canvas 3 个视图均从 BXML 真实渲染（无 mock 数据）
- 本地服务器连续运行 4 小时无崩溃

### 7.2 产品 OKR（3 个月）

**O1: 打磨核心 Demo 链路，可用于对外演示**
- KR1: AI Build → App QR 端到端成功率 ≥ 95%
- KR2: 演示时间 ≤ 5 分钟（从打开浏览器到手机扫码看到效果）
- KR3: 至少 10 位外部方案商体验后给出正面反馈

**O2: 建立社区内容基础**
- KR1: 上线灵感广场后 30 天内，发布方案 ≥ 50 个
- KR2: Remix 使用率 ≥ 20%（查看过方案的用户中有 20% 触发 Remix）
- KR3: 社区方案平均被部署次数 ≥ 3 次

**O3: 验证商业变现可行性**
- KR1: 至少 1 位 Builder 在 Marketplace 发布付费方案
- KR2: 至少 5 笔方案购买交易
- KR3: Pro 计划付费用户 ≥ 20 人

---

## 8. 当前代码状态评估

### 8.1 已实现（可直接使用）

| 模块 | 状态 | 说明 |
|---|---|---|
| 首页 AI Build UI | ✅ 完成 | 对话框、快速提示 Chip、积分显示均已实现 |
| 项目列表页 | ✅ 完成 | 卡片/列表视图、筛选排序均已实现 |
| 项目编辑器骨架 | ✅ 完成 | 4 个标签页骨架已实现 |
| Studio 部署面板 | ✅ 完成 | 4 步骤 UI 已实现（数据为 mock） |
| BXML 数据模型 | ✅ 完成 | `lib/bxml.ts` 含版本管理完整实现 |
| Agent Orchestrator | ✅ 完成 | 6 个 Skill 骨架已实现，需接真实 AI |
| AIOT Sync API | ✅ 完成 | mock 逻辑完整，评分匹配算法已有 |
| Online Studio API | ✅ 完成 | in-memory 实现，含设备状态管理 |
| Plugin Build API | ✅ 完成 | 编译逻辑完整，bindingStats 正确 |
| Life App H5 页 | ✅ 完成 | 基础控制 UI，按 bindingStatus 分级渲染 |
| 灵感广场 / Explore | ✅ 骨架 | 页面存在，内容为 gallery mock 数据 |
| Marketplace | ✅ 骨架 | 页面存在，内容为 mock |

### 8.2 需要改造（Sprint 0 优先）

| 模块 | 问题 | 改造方向 |
|---|---|---|
| AI Build 响应 | 返回 mock 文本，不生成真实 BXML | 接入真实 Gemini/Claude API，Skills 真实执行 |
| Space 视图渲染 | 显示 mock 房间图，不读 BXMLDocument | 从 `bxmlDoc.objects` 读取并渲染 |
| Automation 视图 | 显示 `MOCK_FLOW` 常量数据 | 从自动化实例 JSON 渲染真实节点图 |
| App 视图 | 静态 mock 卡片 | 从 BXML 推导 Asset 卡片内容 |
| 数据持久化 | 项目存储于 React Context，刷新丢失 | Sprint 0 先用 localStorage，Sprint 3 升级 DB |

### 8.3 需要新建（Sprint 1+）

| 功能 | Sprint | 新建内容 |
|---|---|---|
| BXML → Asset 推导 | Sprint 0 | `lib/asset-generator.ts` |
| 版本历史 UI 面板 | Sprint 2 | `app/(main)/projects/[id]/VersionPanel.tsx` |
| BOM 生成器 | Sprint 2 | `lib/bom-generator.ts` |
| 社区发布流程 | Sprint 3 | `app/(main)/projects/[id]/PublishModal.tsx` |
| Remix 流程 | Sprint 3 | Explore 详情页 + AI 适配逻辑 |
| Clerk Auth | Sprint 4 | 替换 AccountContext mock |
| Stripe 支付 | Sprint 4 | `app/api/billing/` |
| BACnet 接入 | Sprint 5 | `lib/bacnet-discovery.ts` + UI |
