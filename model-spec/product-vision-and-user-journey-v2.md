# Aqara Builder 产品愿景 · 用户旅程 · 商业护城河

> 版本：v2.9（精简版）  
> 日期：2026-03-30  
> 定位：战略文档——空间可视化、商业飞轮、产品执行口径

---

## 前言：核心洞察

> *"用户购买的不是自动化规则，而是空间体验。"*

建筑师给业主看的是效果图，不是结构计算公式。  
Aqara Builder 的核心转变：从"配置工具"升级为**空间智能设计平台**。

---

## 第一章：六层空间智能栈

```
Layer 6  空间可视化 & 方案呈现（设备落位图 · 联动动画 · 可交付图纸）
Layer 5  App UI 资产层（Asset 卡片 · 场景入口 · 状态仪表盘）
Layer 4  自动化逻辑层（原子逻辑块 · 触发/条件/动作）
Layer 3  设备实例层（Aqara 设备 + BACnet/Modbus + Matter）
Layer 2  空间语义层（空间图谱 · 房间功能 · 区域关系）
Layer 1  物理空间层（户型图 / CAD / BIM / 拍照扫描）
```

**v1 已覆盖：** Layer 2–5（XML(Builder) 支撑）  
**v2 补足：** Layer 1（物理空间输入）和 Layer 6（可视化输出）——用户感知最强的两端

| 能力范围 | 主要载体 |
|---|---|
| Layer 1–2 设计语义 | **Aqara Builder**（Workspace 为计费/协作边界） |
| Layer 3–5 运行绑定 | **Studio Core**（M300 / Cloud Studio，同一 Runtime） |
| 工程实施 GUI | **Studio Web** |
| Layer 5–6 日常呈现 | **Aqara Life**（插件引擎） |
| 纳管 / 中继 / 推送 | **Studio Cloud**（按 Workspace 区域部署） |

---

## 第二章：Layer 6——空间可视化

### 用户要的是"设计图"，不是"规则列表"

Aqara Builder 生成的 XML(Builder)，应能自动产出专业的智能化施工图：

- **设备落位平面图**：房间轮廓 + 设备图标按真实位置标注 + 联动关系彩色连线 → 可打印 PDF
- **自动化逻辑图**：场景触发路径可视化（回家 / 安防 / 节能）
- **3D 方案漫游**（后期）：基于空间语义生成简单 3D，可切换日/夜/场景模式

### 为什么是护城河

1. **设备落位知识**来自 Aqara 多年安装经验，竞争者无法快速复制
2. **提升方案可交付性**：方案商展示专业图纸 → 业主看懂 → 当场签单
3. **图纸即施工依据**：安装商按图作业，减少返工
4. **视觉资产进入传播链**：漂亮的方案图天然适合小红书等平台传播

---

## 第三章：商业护城河——六层壁垒

| 壁垒 | 描述 |
|---|---|
| **硬件生态深度** | Aqara 是 HomeKit / Matter 覆盖最全的供应商；设备知识内化在 Builder 推荐中 |
| **空间设计专有知识** | 传感器安装规范、布线建议、设备↔空间映射、照明设计规范 |
| **XML(Builder) 方案语料库** | 每份真实部署的方案都是结构化、有标注的空间智能训练数据 |
| **Builder-Studio-Life 闭环** | 三端各产生不同数据，合并才构成完整的空间智能数据 |
| **社区网络效应** | Builder 越多 → 方案越丰富 → AI 越好 → 更多 Builder → 硬件销量增加 → 循环 |
| **世界模型时代结构性准备** | XML(Builder) 是人类可读、机器可执行、世界模型可理解的三合一格式 |

---

## 第四章：面向世界模型时代

### 三阶段演进

| 阶段 | 时间 | AI 角色 |
|---|---|---|
| LLM 时代 | 当下 ~2027 | 意图理解 + XML(Builder) 生成；依赖模板推理 |
| 多模态感知时代 | 2027–2030 | 户型图照片 → AI 识别房间 → 直接输出方案 |
| 世界模型时代 | 2030+ | 理解物理约束 + 行为模式；方案从"人工配置"变为"空间理解产物" |

### Aqara 的独特位置

Aqara 的设备网络是全球规模最大的、有语义标注的真实家庭物理感知数据来源之一。  
这些数据 + XML(Builder) 方案语料，将是训练空间智能世界模型的顶级数据集。

---

## 第五章：用户旅程

### 双轨并行

| 轨道 | 典型用户 | 关键路径 |
|---|---|---|
| **B 端交付轨** | 方案商 → 安装商 → 业主 | Builder 出方案 → 部署 M300 → Studio Web 上云绑定 → Life 扫码装插件 |
| **C 端自驱轨** | 已有 Aqara 设备的个人用户 | Builder 注册 → Personal Workspace → 领取 Cloud Studio → AIOT 同步 → Life 登录实控 → M300 转化 |

### B 端完整旅程（摘要）

```
① 方案商（Builder）
   户型图 / 描述 → AI 30秒生成：空间图谱 + 设备落位图 + 自动化路径图 + BOM 清单
   [演示给业主] → 业主在平面图上点设备，看联动动画 → 签单

② 安装商（Installer）
   拿到 XML(Builder) 方案包 + 落位图 → 按图安装设备
   进入 Studio Web → AIOT 设备发现 → AI 自动匹配虚拟设备 → 15 分钟完成交付

③ 终端用户（住户）
   登录 Aqara 账号 → 扫码 / 市场安装插件
   日常：资产卡片 · 场景入口 · 空间地图视图 · 异常告警

④ 生态共创（Moments / 方案市场）
   方案商发布方案 → 被发现 → AI Remix → 部署 → 数据回流 → 质量迭代
```

---

## 第六章：四产品定位与商业飞轮

### 产品分层

| 产品 | 核心定位 | 主要用户 |
|---|---|---|
| **Aqara Builder** | 空间智能方案的 AI 设计工具 | 方案商 · 安装商 · DIY 用户 |
| **Studio Core（M300 / Cloud Studio）** | 空间本地运行时 + 知识图谱引擎 | 所有有 Aqara 设备的用户 |
| **Studio Web** | Studio Core 的工程实施 GUI | 安装商 · IT 管理员 |
| **Aqara Life App** | 空间操作系统 + 商业转化入口 | 终端用户（C 端） |

### Workspace 定义

| 类型 | 说明 | 邀请 | 删除 |
|---|---|---|---|
| **Personal Workspace** | 每账号唯一，系统自动创建；**免费 Cloud Studio 默认挂载点** | 不允许 | 不允许 |
| **协作 Workspace** | 用户主动新建；支持 RBAC；无 Studio 时可删除 | 允许 | 允许（无 Studio 时） |

**Life App 与 Workspace 的关系：**
- 默认聚合 **Personal Workspace 下的 Studio** + **LAN 发现的 Studio** + **已安装插件**
- 协作 Workspace 下有权限的 Studio，在 Personal 为空时须在 Life 中展示（协作者护栏）
- Life 界面不显示"Workspace"名词，后台按 `workspaceId` 路由

### 商业飞轮

```
[Builder 免费设计] → [Cloud Studio 5天试用] → [Life App 实控]
        ↑                      ↓                      ↓
[社区方案共享]          [M300 购买转化]          [商城设备复购]
        ↑                      ↓                      ↓
[Creator 生态]          [更好本地体验]           [更大方案需求]
                               └──────────────────────┘
                                          ↓
                                 [升级 Builder Pro / 发布方案到市场]
```

### 分行业价值主张

| 行业 | 核心痛点 | Builder 价值 |
|---|---|---|
| 住宅精装交付 | 每套户型手工出方案 | 标准模板批量实例化 → 统一施工图 |
| 酒店 / 民宿 | 每家门店重新配置，质量参差 | 品牌定义标准方案 → 每家门店按方案部署 |
| 商业办公 | 楼控系统与智能家居割裂 | XML(Builder) 统一逻辑层，覆盖 BACnet/Modbus |
| 医养 / 适老 | 老人对复杂 App 无感 | 一键生成极简 UI + 安全告警 + 照护者远程看板 |

---

## 第七章：核心判断

| 编号 | 判断 | 行动方向 |
|---|---|---|
| 七 | **空间可视化是必做**，不是锦上添花 | 设备落位 SVG → 联动动画 → 户型图叠加，作为 AI Build 默认输出 |
| 八 | Studio Web 要做到**施工图级工程交付** | 安装进度追踪 + 绑定完成率 + 验收报告 + 售后工单 |
| 九 | Life App 要有**空间地图视图** | 户型平面图上显示实时设备状态，异常有位置感 |
| 十 | 从第一天开始为**世界模型准备数据结构** | XML(Builder) 增加 `geometry` 字段；设备 XYZ 坐标；行为轨迹匿名聚合 |
| 十一 | **统一 Aqara 账号 + Life 四 Tab** 是商业闭环必要条件 | 登录后才能访问云 Studio、推送、商城购买、历史数据互通 |
| 十二 | **Personal / 协作 Workspace 分工**，Life 默认聚合 Personal | 见第六章 Workspace 定义 |

---

## 第八章：产品路线图

| 阶段 | 时间 | 核心目标 |
|---|---|---|
| Sprint 1 | 1–2 月 | 设备落位 SVG 图（Layer 6 Phase 1） |
| Sprint 2 | 2–3 月 | Studio Web 工程化：绑定进度 + 验收报告 |
| Sprint 3 | 3–4 月 | Life App 空间地图视图 |
| Sprint 4 | 4–6 月 | 户型图导入 + AI 识别房间轮廓 |
| Sprint 5 | 6–12 月 | Moments / 灵感广场 + Remix + 方案市场 |
| Sprint 6 | 12 月+ | Vision LM 接入，照片 → 设备落位建议 |
| 长期 | 2028+ | 世界模型接入，空间智能自主推断 |

---

## 第九章：对外话术

**给个人用户说：**
> "描述你家的需求，AI 自动生成智能方案。不是一堆设备，是你家自己跑的空间。"

**给方案商说：**
> "30 秒出方案，一张专业平面图让业主当场签单。"

**给安装商说：**
> "拿着设备落位图上门，AI 帮你做设备绑定，15 分钟完成交付。"

**给行业说：**
> "从方案草图到用户手机，全程 XML(Builder) 打通，Builder-Studio-Life 数据飞轮越转越快。"

---

## 第十章：Life App 架构设计

### 核心原则：三元素解耦

| 元素 | 职责 | 关键特性 |
|---|---|---|
| **XML(Builder)** | 方案的灵魂：空间图谱 + 设备定义 + 自动化逻辑 | 可部署到任意 Studio |
| **Studio** | 方案的身体：本地运行时 + 真实设备网关 | 可运行任意 XML(Builder) |
| **Plugin** | 方案的眼睛：特定角色的 App UI 视角 | 运行时动态发现 Studio，不在构建时绑定 |

**三者是"多对多"松耦合：**
- 一个 XML(Builder) → 部署到多台 Studio（如连锁酒店 100 间客房）
- 一个 XML(Builder) → 构建多个插件变体（业主 / 家人 / 访客 / 运维）
- 一个插件 → 运行时动态连接 Studio（不在 QR 里写死 studioId）

### Plugin 五状态机

```
State 1  预览模式    完整 UI 渲染，设备状态为默认值，顶部横幅标注"预览"
State 2  发现中      后台静默运行 mDNS 扫描 + 云端注册表查询
             ↓ 0个→留预览   ↓ 1个→自动连接   ↓ N个→弹出选择器
State 3  连接认证    Life App → Studio 发送 { pluginId, accessToken }，Studio 签发 Session Token
State 4a 已连接-LAN  同局域网直连，延迟 <50ms，断外网不影响
State 4b 已连接-云中继 外网经 Aqara Cloud 隧道，延迟 100–500ms
State 5  离线        显示最后已知状态（本地缓存），自动重连
```

**预览模式是核心竞争力，不是"未完成态"**：无需任何硬件，打开插件即完整演示方案 UI，是销售转化的关键工具。

### 权限架构：三层防御

| 层 | 问题 | 手段 |
|---|---|---|
| 连接权限 | 这个 Life App 是否有权连接此 Studio？ | Role Token（扫码时获得，有时效和撤销） |
| UI 范围权限 | 这个角色可以看到哪些页面/设备？ | Plugin 配置文件（构建时固化） |
| 指令执行权限 | 这条命令是否被允许执行？ | Studio 端命令级 ACL（服务端，不可绕过） |

### Life App 底部四 Tab

| Tab | 内容 | 商业价值 |
|---|---|---|
| **生活** | 已安装插件的主控界面 + 设备状态总览 | 日留存 · 用户粘性 |
| **市场** | 插件市场 · XML(Builder) 方案模板 · Moments / 灵感广场 | 内容生态 · Creator 分成 |
| **商城** | 设备销售 · 基于 XML(Builder) 的个性化推荐 · M300 升级引导 | 直接 GMV · 硬件转化 |
| **我** | 账号管理 · 我的 Studio · 套餐账单 · 已购方案 | 续费 · 进阶治理 |

### 插件类型

| 类型 | 是否需要 Studio | 典型场景 |
|---|---|---|
| **空间插件** | 是（Preview 不需要） | 我的家 · 酒店客房 · 公司楼层 |
| **服务插件** | 否 | 天气 · AI 助手 · 能耗报告 |
| **组态插件** | 是 | 用户自定义控制大屏（Pro 用户） |

---

## 第十一章：商业模型

### 四类用户与变现路径

| 用户类型 | 使用路径 | 主要收入 |
|---|---|---|
| B 端方案商/安装商 | Builder → XML(Builder) → M300 → 客户 Life 装插件 | Workspace 套餐 + 方案授权 + 硬件 |
| C 端个人用户 | Personal Workspace → Cloud Studio 试用 → Life 实控 → M300 转化 | 云续费 + M300 + 设备复购 |
| B2B2C 企业（酒店/长租） | 标准方案 → 多 Studio 部署 → 访客 Token | 硬件协议 + Token API |
| Prosumer（DIY 极客） | Builder 设计 → 自建插件/组态 Dashboard | 订阅 + 设备 + Creator 分成 |

### 核心商业逻辑

**XML(Builder) 是软件资产**：可售卖、可订阅、可授权  
**Studio Core 是数字底座**：M300 硬件 / Cloud Studio 云订阅  
**Life App 是转化入口**：[市场] 卖方案内容，[商城] 卖硬件 GMV

### Creator 生态分层

| 层级 | 套餐 | 权益 |
|---|---|---|
| 入门 | 免费 | 基础 AI 生成 · 单项目 |
| 活跃 | Pro ¥99/月 | 无限项目 · 高级 AI · 组态 Dashboard · 方案发布（50% 分成） |
| 创作者 | Creator ¥199/月 | 认证标识 · 优先资源 · 80% 分成 · 联合营销 |

---

## 第十二章：执行口径——下一步做什么

### 一句话战略定位

> Builder 引流 → 云 Studio 试用激活 → M300 硬件转化 → 设备商城复购 → 方案社区扩散

### 五阶段商业漏斗

**阶段 1 发现**：Builder 免费注册 → AI 助手引导 → 生成方案可视化效果 → 产生兴趣

**阶段 2 试用激活**：  
领取 5 天免费 Cloud Studio（挂在 Personal Workspace）→ 部署 XML(Builder) → AIOT 账号同步设备 → Builder 构建插件 → 引导打开 Life App

**阶段 3 首次激活（关键时刻）**：  
Life App 登录 → 自动拉取 Personal 下 Cloud Studio → 控制第一盏真实的灯 ←

**阶段 4 付费转化**：  
试用到期 → 弹出选择：[推荐 M300 购买] 或 [续费云 Studio]  
M300 到货 → 一键迁移方案 → LAN 直连延迟从 200ms 降至 <10ms → 用户感受质变

**阶段 5 扩展留存**：设备扩展 → 方案升级 → 角色扩展（家人/访客插件）→ 社区贡献（发布方案）

### 分阶段落地

**Phase 1 MVP（当前 → 6 个月）**

核心验证路径：  
用户注册 Builder → 领取云 Studio → 同步 AIOT 设备 → Life App 控制第一个真实设备

关键交付：
- Builder：AI XML(Builder) 生成 + 一键部署云 Studio + 插件构建
- Studio Core：Cloud Studio 实例（5 天试用）+ AIOT 账号同步插件
- Life App：账号登录 + Cloud Studio 自动发现 + 插件 Preview + 实控 + 底部四 Tab 基础版
- Studio Cloud：中继隧道 + 到期提醒 + M300 购买引导

验证指标：5 天试用到期的 M300/续费转化率目标 20%

**Phase 2 生态初建（6–12 个月）**
- 多角色插件 + 角色订阅过滤
- Moments / 灵感广场 v1 + 方案包发布 + Creator 分成
- 商城智能推荐（基于 XML(Builder) 推荐设备）
- 首个酒店/长租企业客户落地

**Phase 3 规模化（12–24 个月）**
- 组态 Dashboard 插件构建工具
- Token API（PMS/业务系统集成）
- Builder Pro 分层 + XML(Builder) Open Schema 对外发布

### 现阶段不做

- ❌ 白标 Life App
- ❌ Life App SDK
- ❌ XML(Builder) Open Schema 对外发布
- ❌ 全面替换 Aqara Home App
- ❌ AI Plugin Generator

### 现阶段必须做

- ✅ XML(Builder) 语义 ID 体系（所有功能的基础）
- ✅ Studio Core 插件架构（一旦确定不大改）
- ✅ Personal Workspace + 协作 Workspace + Data Region
- ✅ Life 默认 Personal 聚合 + 协作者护栏
- ✅ Life App 插件引擎（扫码 → 安装 → Preview → 实控）
- ✅ Studio-Life App 连接协议（LAN + Cloud Relay）
- ✅ Builder → XML(Builder) → Studio 完整链路（流程通即可，UI 可粗）

---

## 附录：功能优先级

| 功能 | 优先级 | 理由 |
|---|---|---|
| 设备落位 SVG 平面图（自动生成） | **P0** | 方案签单核心 |
| 自动化联动路径动画 | **P0** | 让业主理解运行时效果 |
| XML(Builder) 版本管理 | **P0** | 方案演化可追溯 |
| Plugin 三元素解耦架构 | **P0** | 支持链式复制 / Preview Mode / 开放生态 |
| Plugin 预览模式 | **P0** | 无硬件即可完整演示，销售关键工具 |
| Studio 知识图谱 API（语义 ID） | **P0** | Plugin UI 的数据基础 |
| Personal Workspace（唯一·不可删·不可邀） | **P0** | 账号锚点；试用云 Studio 挂载点 |
| Workspace + Data Region | **P0** | 合规边界；Studio Cloud 路由 |
| accessToken 权限体系 + 指令级 ACL | **P0** | 安全底线 |
| LAN 直连（mDNS 发现） | **P0** | 断网可控，本地闭环 |
| Life App 欢迎页 + 登录主路径 | **P1** | 与 AIOT 账号互通入口 |
| 插件多角色构建 | **P1** | B 端场景必需 |
| 云中继路径 / LAN 云自动切换 | **P1** | 外出时保持控制 |
| Life App 空间地图视图 | **P1** | 住户情感连接 |
| 协作 Workspace（可邀·可删空） | **P1** | 团队计费与项目隔离 |
| 空间方案包（XML(Builder) + 插件 + BOM + 文档） | **P1** | 可售卖的方案单元 |
| 户型图导入（PNG/PDF） | **P1** | 精确设备落位前提 |
| 商城智能推荐（基于 XML(Builder)） | **P1** | 硬件 GMV 核心驱动 |
| Moments / 灵感广场 | **P2** | 生态飞轮起点 |
| 方案市场 + Creator 付费分成 | **P2** | 验证货币化路径 |
| 组态 Dashboard 插件构建 | **P2** | Prosumer 终极工具 |
| 多 Studio 管理（连锁酒店） | **P2** | B 端规模化场景 |
| Token API（PMS 集成） | **P2** | 酒店/长租企业集成 |
| XML(Builder) Open Schema 对外 | P3 | 第三方生态接入 |
| Vision LM（照片 → 方案） | P3 | Layer 6 Phase 3 |
| 白标 Life App / SDK | P3 | 大型企业客户 |
| 世界模型接入 | Roadmap | 空间智能自主推断 |

---

> 文档版本：v2.9 | 更新：2026-03-30 | 总章节：前言 + 12章 + 附录
