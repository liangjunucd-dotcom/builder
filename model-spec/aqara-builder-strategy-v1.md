# Aqara Builder · 产品战略规划文档

> 版本：v1.0 提炼版 | 日期：2026-03-30
> 用途：管理层汇报 · PRD 定义 · 立项参考
> 原始来源：product-vision-and-user-journey-v2.8

---

## 一、执行摘要

**Aqara Builder 是什么**
一个面向个人用户和智能家居方案商的 AI 驱动空间智能设计平台。用户通过自然语言描述或上传户型图，AI 自动生成完整的智能家居方案，并一键部署到本地或云端运行时，最终通过 Life App 交付给用户日常使用。

**为什么现在做**
当前智能家居市场痛点集中在三点：配置成本高（方案商手工出方案）、交付周期长（安装调试低效）、使用门槛高（终端用户不会用）。Aqara 有设备生态和安装规范知识，Builder 将这些知识 AI 化，形成平台级产品。

**核心商业逻辑**
方案商/个人用户用 Builder 出方案 → 部署到 Studio Runtime → 通过 Life App 使用 → 在 Life 商城购买更多 Aqara 设备和 M300 → 带动硬件 GMV 增长，形成闭环飞轮。

**当前阶段目标**
MVP 打通 C 端个人用户完整路径：注册 Builder → AI 生成方案 → 云 Studio 试用部署 → Life App 实控设备 → 转化购买 M300 或续费。

---

## 二、战略定位

### 2.1 产品定位一句话

> **"30秒出方案，一键部署到家，让每个人都能拥有真正智能的生活空间。"**

### 2.2 三个核心转变

| 从 | 到 |
|---|---|
| 配置工具（手动填规则） | 空间智能设计平台（AI 生成方案） |
| 规则列表展示 | 设备落位平面图 + 联动路径可视化 |
| 方案商专属工具 | 个人用户也能自己设计、部署、使用 |

### 2.3 六层空间智能栈

```
Layer 6  空间可视化 & 方案呈现        ← v2 新增，用户感知最强
Layer 5  App UI 资产层（Life 插件）
Layer 4  自动化逻辑层
Layer 3  设备实例层（虚拟→真实绑定）
Layer 2  空间语义层（房间拓扑图谱）
Layer 1  物理空间层（户型图/拍照输入）← v2 新增，差异化最大
```

**v1 已有**：Layer 2-5（Instance Graph 架构支撑）
**v2 重点补足**：Layer 1（物理空间输入）和 Layer 6（可视化呈现）

---

## 三、产品架构

### 3.1 四产品分工

```
Aqara Builder（Web 控制台）
  ↓ Instance Graph 方案包下发
Studio Core（M300 本地 / Cloud Studio 云端）
  ↓ 工程 GUI
Studio Web（安装商/高级用户）
  ↓ 事件推送 + 中继
Studio Cloud（轻量云平台，纳管/中继/推送）
  ↓ 插件引擎
Aqara Life App（C端住户日常界面）
```

### 3.2 核心数据格式：Instance Graph

Instance Graph（Builder XML）是贯穿全链路的核心数据格式：
- **人类可读**：方案设计师可理解和编辑
- **机器可执行**：Studio Core 直接运行
- **AI 可理解**：大语言模型/世界模型的输入输出格式

每一份真实部署的 Instance Graph，都是有标注的空间智能训练数据，构成长期护城河。

### 3.3 Workspace 双类型

| 类型 | 说明 | 典型用途 |
|---|---|---|
| **Personal Workspace** | 每账号自动创建、唯一、不可删、不可邀 | 个人方案、Cloud Studio 试用默认挂载 |
| **协作 Workspace** | 用户主动新建，可邀成员，RBAC，无 Studio 可删 | 方案公司、项目组、多客户隔离 |

**Life App 聚合规则**：默认仅聚合 Personal Workspace 下的 Studio + LAN 发现 + 已装插件，不默认展示协作 Workspace（避免个人与工作混杂）。

---

## 四、核心用户路径

### 4.1 C 端个人用户路径（当前阶段主线）

```
注册 Aqara 账号
    ↓
进入 Builder → Personal Workspace 自动创建
    ↓
AI 引导："描述你的空间，我来帮你设计"
    ↓
生成 Instance Graph 方案（含设备推荐 + 自动化逻辑 + 可视化图）
    ↓
领取 5 天免费 Cloud Studio（挂在 Personal Workspace）
    ↓
一键部署 Instance Graph → 同步 AIOT 已有设备
    ↓
Builder 生成 Life App 插件
    ↓
打开 Life App → 登录账号 → 自动发现 Cloud Studio
    ↓
控制第一个真实设备 ← 关键激活时刻
    ↓
试用到期 → 选择：购买 M300（推荐）或 续费云 Studio
```

### 4.2 一创 vs 二创两种模式

**一创（从零开始）**
- 用户没有方案，通过自然语言描述需求
- AI 主动引导，一步步构建：家庭结构 → 痛点 → 设备推荐 → 自动化设计
- 典型语料："我家两室一厅，90平，想让家里灯光和窗帘能自动控制"

**二创（已有基础，二次优化）**
- 用户上传已有方案（截图/户型图/已生成方案）
- AI 在已有基础上追加、修改、优化
- 典型语料："这是我现有的方案，帮我加一个睡眠模式"

### 4.3 Life App  Tab 分工

| Tab | 内容定位 | 商业价值 |
|---|---|---|
| **生活** | 已装插件的主控界面，设备状态，通知 | 日留存，用户粘性 |
| **市场** | 插件/方案模板发现，Creator 作品 | 内容生态，Creator 分成 |
| **商城** | 设备销售，Instance Graph 个性化推荐，M300 引导 | 直接 GMV，硬件转化 |
| **我** | 账号，Studio 列表，订阅账单 | 续费，进阶治理 |

---

## 五、竞争护城河

### 5.1 六层壁垒

| 壁垒 | 核心内容 | 强度 |
|---|---|---|
| **硬件生态深度** | Aqara 是 HomeKit/Matter 覆盖最全的设备供应商，设备知识内化到推荐引擎 | 当下最强 |
| **空间智能设计专有知识** | 设备落位规范、安装规则、空间→设备推荐映射图谱 | 中期核心 |
| **Instance Graph 方案语料库** | 真实部署验证的结构化方案数据，每次部署都在积累 | 长期最强 |
| **Builder-Studio-Life 闭环生态** | 三端数据联通，竞争者难以同时复制三个环节 | 中长期 |
| **社区网络效应** | 方案越多→AI 越好→更多用户→更多方案，自我强化飞轮 | 中长期 |
| **世界模型时代结构性准备** | 真实物理感知数据 + Instance Graph 格式设计，为下一代 AI 预留接入口 | 未来最强 |

### 5.2 商业飞轮

```
更多用户进入 Builder
    → 更多 Instance Graph 方案部署
        → 语料库 + 硬件销量增加
            → Aqara 投入更多 AI/设备研发
                → AI 生成更好 → 吸引更多用户 → 循环
```

Layer 6 可视化是**加速签单**的催化剂；Cloud Studio 试用是**触达存量 AIOT 用户**的增量入口。

---

## 六、AI 能力三阶段演进

| 阶段 | 时间 | AI 角色 | 核心能力 |
|---|---|---|---|
| **LLM 时代** | 当下~2027 | "写方案的助手" | 意图理解 + Instance Graph 生成，依赖模板规则推理 |
| **多模态感知时代** | 2027~2030 | "看图画方案的设计师" | 户型图照片 → AI 识别房间 → 直接输出 Instance Graph |
| **世界模型时代** | 2030+ | "理解你家、替你思考的空间智能体" | 物理约束感知 + 行为模式推断 + 自主优化自动化逻辑 |

Instance Graph 格式在三个阶段无需重构，只需接入更强的模型。

---

## 七、优先级与路线图

### 7.1 当前阶段（Phase 1 MVP，0~6个月）

**目标**：C 端用户可完整走通 Builder → Cloud Studio → Life App 路径，5 天试用转化率 ≥ 20%

| 优先级 | 功能 | 说明 |
|---|---|---|
| **P0** | AI Instance Graph 生成 + 一键部署到 Cloud Studio | 核心链路 |
| **P0** | Personal Workspace + Data Region | 账号锚点，试用挂载点 |
| **P0** | Cloud Studio 5 天免费试用实例 | 增长入口 |
| **P0** | AIOT 账号设备同步插件 | 盘活存量用户 |
| **P0** | Life App 登录 + 自动发现 Cloud Studio | 用户激活关键步骤 |
| **P0** | Life App 插件安装 + 实控模式 | 控制第一个真实设备 |
| **P0** | 试用到期 → M300 / 续费引导 | 商业转化 |
| **P1** | 设备落位 SVG 平面图（自动生成） | 方案可视化，签单催化剂 |
| **P1** | Life App 四 Tab 基础版 | 生活/市场/商城/我 |
| **P1** | 协作 Workspace（可邀，RBAC） | B 端基础能力 |

### 7.2 生态初建（Phase 2，6~12个月）

- Life App 多插件管理（单/多模式自动切换）
- 商城智能推荐（基于 Instance Graph 的设备推荐）
- 灵感广场 v1 + 方案发布（免费+付费）
- Creator 分成机制（70/30）
- 首个 B2B2C 企业客户落地（酒店/长租公寓）

**验收指标**：M300 用户 30 天留存率 > 70%，商城 GMV 中方案推荐占比 > 30%

### 7.3 规模化（Phase 3，12~24个月）

- AI Plugin Generator（描述需求→生成插件）
- 多 Studio 管理（连锁酒店/民宿场景）
- Builder Pro 分层（免费/Pro/Enterprise）
- Token API（PMS/业务系统集成）
- Instance Graph Open Schema 对外发布

**验收指标**：一家酒店集团完成 >50 台 Studio 规模化部署，Creator 市场年 GMV >100 万元

---

## 八、当前阶段战略收敛

### 8.1 现阶段必须做

- ✅ Instance Graph 语义 ID 体系（所有后续功能的基础）
- ✅ Studio Core 插件架构（定了不大改）
- ✅ Personal Workspace + 协作 Workspace + Data Region
- ✅ Life App 默认 Personal 聚合 + 协作者护栏
- ✅ Life App 插件引擎（扫码→安装→实控最小流程）
- ✅ Builder → Instance Graph → Studio 完整链路打通

### 8.2 现阶段明确不做

- ❌ 白标 Life App（等 Phase 2 验证后）
- ❌ Life App SDK（等企业客户主动需要）
- ❌ Instance Graph Open Schema 对外发布（先内部稳定）
- ❌ 全面替换 Aqara Home App（渐进迁移）
- ❌ AI Plugin Generator（先把插件框架做稳）
- ❌ Vision LM 接入（Phase 3）

---

## 九、对外表达

**对个人用户说：**
> "不是一堆设备，是你家的空间地图。描述你想要什么，AI 帮你设计好，你只需要享受。"

**对方案商说：**
> "30秒出方案，一张专业平面图让业主当场签单。"

**对行业说：**
> "Aqara Builder 是智能空间的设计-部署-运营闭环平台，从方案草图到用户手机，全程 Instance Graph 打通，数据飞轮越转越快。"

**对未来说：**
> "我们正在构建全球最大的、有真实部署验证的空间智能方案语料库，等待世界模型时代的到来。"

---

## 十、立项关键信息

### 10.1 产品边界

| 产品 | 负责范围 | 不负责 |
|---|---|---|
| Aqara Builder | 方案设计、AI 生成、Workspace 管理、插件构建 | 设备实际运行、网关协议 |
| Studio Core | Instance Graph 执行、设备网关、知识图谱、自动化引擎 | 前端 UI、方案创作 |
| Studio Web | 安装商绑定、组态、工程交付 GUI | 日常用户控制 |
| Studio Cloud | 纳管、中继、推送、区域路由 | 业务状态主存 |
| Life App | 日常控制、商业转化界面、插件消费 | 方案创作、设备管理 |

### 10.2 关键技术依赖

- **Instance Graph 语义 ID 体系**：所有产品互通的唯一标识符系统
- **Studio-Life 连接协议**：LAN mDNS 直连 + Studio Cloud 云中继，协议需先确定
- **Aqara 统一账号**：Builder / Life / AIOT 三端账号互通，Life 商业闭环的枢纽
- **Data Region**：CN/US/EU，Workspace 创建时锁定，驱动 Studio Cloud 区域路由

### 10.3 核心度量指标

| 指标 | Phase 1 目标 |
|---|---|
| 注册→领取 Cloud Studio 转化率 | ≥ 50% |
| 试用→控制第一个真实设备 | ≤ 10 分钟完成 |
| 5 天试用→M300 或续费转化率 | ≥ 20% |
| M300 用户 30 天留存率 | ≥ 70% |

---

> 文档性质：战略提炼版，供管理层汇报和立项使用
> 详细技术设计参考原文：`model-spec/product-vision-and-user-journey-v2.md`
> 维护人：产品团队 | 下次更新：Phase 1 MVP 验证后
