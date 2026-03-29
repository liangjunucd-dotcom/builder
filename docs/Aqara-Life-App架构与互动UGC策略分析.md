# Aqara Life App 架构、应用生态与 OEM 策略

> **文档性质**：商业模式分析与产品架构设计  
> **关联文档**：[工作空间与订阅模型-产品策略.md](./工作空间与订阅模型-产品策略.md)、[Aqara-空间本体-落地计划.md](./Aqara-空间本体-落地计划.md)  
> **核心议题**：Aqara Life App 的平台定位 / App 独立创作与部署闭环 / 应用生态运营 / OEM App 白标架构 / 同构渲染框架 / 用户旅程全链路

---

## 一、架构演进：从「Blueprint 渲染器」到「空间操作系统」

### 1.1 关键架构决策回顾

在 v3.5 架构中，发生了如下关键变化：

| 变更 | 原方案 | 新方案 |
|------|--------|--------|
| **Space Package 最小单元** | Space + Devices + Automation + Dashboard + App | **Space + Devices + Automation**（仅空间方案核心） |
| **App 创作归属** | 嵌入在 Space Package 内（App Blueprint 作为方案的一部分） | **独立在 Dev Console → App Launchpad**（独立创作物） |
| **App 与 Space 的关系** | 1:1 绑定（一个方案内含一个 App） | **多:多解耦**（一个 Studio 可运行多个 App，一个 App 可服务多个 Studio） |
| **Life App 角色** | Blueprint 渲染终端 | **空间操作系统**——从 Studio 获取空间本体 + 加载/管理多个 App |
| **Studio Life 面板** | 在方案编辑器中管理 Life 连接 | Studio 模式专注运行管理；Life 连接由 Life App 自身完成 |

### 1.2 新定位：Aqara Life = 空间操作系统（Space OS）

```
┌──────────────────────────────────────────────────────────────────┐
│                     Aqara Life App = Space OS                     │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │     空间本体层       │  │     应用生态层       │                │
│  │  (Spatial Ontology)  │  │  (App Ecosystem)    │                │
│  │                     │  │                     │                │
│  │  · 从 Studio 获取   │  │  · Default App     │                │
│  │    空间结构/设备/    │  │    (随空间方案部署)  │                │
│  │    自动化/状态       │  │  · Extension Apps   │                │
│  │  · 实时状态同步      │  │    (用户从应用市场   │                │
│  │  · 控制指令下发      │  │     安装/激活)      │                │
│  │                     │  │  · OEM Custom Apps  │                │
│  └─────────────────────┘  └─────────────────────┘                │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │     渲染引擎层       │  │     个性化层         │                │
│  │  (Rendering Engine)  │  │  (Personalization)  │                │
│  │                     │  │                     │                │
│  │  · 同构渲染框架      │  │  · Theme 切换       │                │
│  │  · 组件库 + 数据绑定 │  │  · 布局微调         │                │
│  │  · 跨平台 (iOS/     │  │  · Tab 配置         │                │
│  │    Android/Web)     │  │  · AI 推荐          │                │
│  └─────────────────────┘  └─────────────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

**一句话**：Aqara Life 不再是「渲染某个 Builder 方案」的工具，而是**一个连接到 Studio 后自动构建空间体验、并允许用户安装和管理多种应用的空间操作系统**。

---

## 二、完整用户旅程（六步闭环）

### 2.1 旅程全景

```
Step 1                Step 2              Step 3
创作者创作 App ───→ 部署到 Studio ───→ 用户下载 Life App
(Builder Dev Console)  (Assign to Studio)   (App Store / Google Play)

Step 4                Step 5              Step 6
添加 Studio ────→ 浏览应用生态 ────→ 个性化与持续使用
(扫描/输码)         (安装/激活 Apps)    (Theme/Layout/Tab 定制)
```

### 2.2 各步骤详细分析

#### Step 1：创作者在 Builder 中完成 App 创作

| 要素 | 说明 |
|------|------|
| **创作入口** | Dev Console → My Apps → New App |
| **创作方式** | AI 对话 + 可视化编辑（类似 Space Package 创作流程） |
| **App 类型** | Dashboard / Control App / Industry App |
| **创作物包含** | 页面结构、组件树、数据绑定声明、交互逻辑、默认 Theme |
| **发布选项** | Public on Marketplace（公开）/ Private to My Studios（私有）/ OEM White-Label（白标授权） |
| **审核机制** | 公开发布需经平台审核（安全性、兼容性、体验质量） |

**关键设计原则**：App 的数据绑定是**声明式**的——App 声明「我需要哪些空间数据」（如 rooms、devices、automations、sensor values），而非硬编码特定设备。这确保同一个 App 可以运行在不同的 Studio 上。

#### Step 2：部署到 Studio

```
App (Published) ──→ Assign to Studio ──→ Studio 完成 OTA 安装
                                          │
                                          ├── 注册 App 到 Studio 的 App Registry
                                          ├── 建立数据绑定映射（声明 → 实际设备）
                                          └── 标记为 "Available for Life App"
```

- 一个 Studio 可以安装多个 App
- 一个 App 可以被 Assign 到多台 Studio（受 License 数量限制）
- Studio 首次安装 App 时，需完成**数据绑定映射**：将 App 声明的抽象数据需求映射到 Studio 中的实际设备和空间结构
- 映射过程可以由 AI 自动完成（根据空间本体语义匹配），也允许手动调整

#### Step 3：用户下载 Aqara Life App

- 公版 Aqara Life App 从 App Store / Google Play 下载
- 首次启动显示引导页 → 注册/登录 → 进入「添加 Studio」流程
- Life App 本身是一个**轻量容器**——核心功能（设备控制、自动化查看）内置，扩展功能通过 App 生态提供

#### Step 4：添加 Studio（核心连接动作）

```
Aqara Life App
    │
    ├── 局域网自动发现（mDNS / Bonjour）
    ├── 手动输入 Studio ID / 扫描二维码
    └── 云端远程连接（需账号绑定）
    
    ▼ 发现 Studio 后
    
    ├── 1. 获取空间本体数据
    │      · 空间结构（户型、房间列表）
    │      · 设备清单与实时状态
    │      · 自动化规则列表
    │      · 空间关系图（ORAP）
    │
    ├── 2. 获取已部署的 Apps 列表
    │      · Default App（创作者部署的主应用）
    │      · 其他已安装 Apps
    │
    ├── 3. 渲染首页
    │      · 使用 Default App 的页面结构和组件
    │      · 填充实时空间本体数据
    │      · 应用 Default Theme
    │
    └── 4. 进入可交互的空间体验
```

**关键技术要求**：
- Studio 必须暴露统一的 **Spatial Ontology API**（基于 ORAP 模型）
- API 包含：`GET /space`（空间结构）、`GET /devices`（设备列表与状态）、`GET /automations`（自动化规则）、`GET /apps`（已安装 App 列表）、`WS /realtime`（实时状态推送）、`POST /control`（设备控制）
- Life App 使用同构渲染引擎解析 App 的组件树 + 数据绑定 → 渲染为原生 UI

#### Step 5：浏览应用生态（Apps 模块）

Life App 中的 **Apps** 标签页（或模块）：

```
┌───────────────────────────────────────────────────┐
│  Apps                                    Search   │
│                                                   │
│  ── Installed ──────────────────────────────       │
│  [Default Home App] ✓ Active                      │
│  [Energy Dashboard] ✓ Active                      │
│  [Security Monitor] · Inactive                    │
│                                                   │
│  ── Recommended ────────────────────────────       │
│  [🌡 Climate Control Pro]      [Install]          │
│  [🎵 Multi-Room Audio]         [Install]          │
│  [👶 Baby Monitor Panel]       [Install]          │
│  [📊 Weekly Report]            [Install]          │
│                                                   │
│  ── Categories ─────────────────────────────       │
│  Control   Dashboard   Lifestyle   Industry       │
└───────────────────────────────────────────────────┘
```

**App 安装与激活的影响范围**：

| 影响类型 | 说明 | 示例 |
|----------|------|------|
| **功能扩展** | 安装后提供新的页面和服务入口 | Energy Dashboard 安装后可查看能耗数据 |
| **Theme 变化** | 某些 App 自带 Theme，安装后可改变 Home 页面视觉风格 | "Kids Space" App 安装后提供彩色卡通风格 Theme |
| **布局变化** | 某些 App 可以在 Home 页面注入卡片或 Widget | "Weather" App 在 Home 顶部注入天气卡片 |
| **Tab 变化** | 高级 App 可以注册为底部 Tab 页 | "Security" App 注册为独立的底部 Tab |
| **数据服务** | 后台运行的 App 提供数据处理服务 | "Energy Analytics" App 后台计算能耗趋势 |

**技术实现方式**：
- App 通过声明式 Manifest 声明自己的影响范围：`{ "inject_home_widget": true, "register_tab": false, "theme_override": "optional" }`
- Life App 的 Shell（外壳）负责统一管理 Tab 注册、Home Widget 注入、Theme 覆盖
- 用户可以在 Settings 中控制每个 App 的权限（是否允许修改 Home、是否显示为 Tab 等）

#### Step 6：个性化与持续使用

- **Theme 切换**：从 Theme Store 选择或 AI 生成
- **布局微调**：拖拽 Home 页面的卡片顺序、增减 Widget
- **Tab 配置**：自定义底部 Tab 栏显示哪些 App
- **场景快捷**：将常用场景固定到 Home 或 Widget

---

## 三、App 生态的四层架构

### 3.1 App 分层模型

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: OEM Custom Shell                                    │
│  · OEM 定制外壳（品牌/启动页/Tab 结构/应用市场范围）           │
│  · 使用同一套渲染引擎和 Studio API                            │
│  · OEM 可限定其用户只能安装经 OEM 审核的 Apps                  │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Extension Apps (第三方生态)                          │
│  · 开发者通过 App Launchpad 创作并发布                         │
│  · 经审核后上架 Marketplace                                   │
│  · 用户在 Life App 内发现、安装、激活                          │
│  · 可以注入 Widget、Tab、Theme，提供独立服务页面               │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: Default App (随空间方案部署)                         │
│  · 创作者为 Studio 部署的主应用                                │
│  · 首次连接 Studio 时自动加载                                  │
│  · 定义 Home 页面的初始结构和默认 Theme                        │
│  · 用户可以更换，但 Studio 总有一个 Default App                │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Life Shell (平台基础能力)                            │
│  · 设备发现与 Studio 连接                                     │
│  · 空间本体数据获取与缓存                                     │
│  · 同构渲染引擎（解析 App 组件树 → 原生 UI）                  │
│  · Tab 管理器 + Widget 容器 + Theme 引擎                      │
│  · 基础设备控制（即使无 Default App 也能控制设备）             │
│  · 通知 / 安防 / 用户账号                                     │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 各层的商业定位

| 层级 | 商业模式 | 价值创造者 |
|------|---------|-----------|
| **Life Shell** | 免费（随 Studio 使用） | Aqara 自研 |
| **Default App** | 包含在 Space Package 中（免费/付费） | Space Builder |
| **Extension Apps** | Marketplace 单独定价（免费/付费/订阅） | App Developer |
| **OEM Shell** | 白标授权费 + 持续服务费 | Aqara（平台能力输出） |

---

## 四、OEM App 白标架构

### 4.1 OEM 场景分析

当第三方公司（如酒店集团、地产开发商、智能家居品牌商）不希望使用 Aqara Life 品牌时：

```
OEM 客户需求：
  · 自有品牌 App（名称、Logo、启动页、品牌色）
  · 连接 Aqara Studio 硬件获取数据
  · 定制化的 Home 体验和功能范围
  · 可控的应用生态（不要所有第三方 App）
  · 可能需要接入自己的云服务
```

### 4.2 同构框架的技术实现

```
┌────────────────────────────────────────────────────────┐
│               Isomorphic App Framework                  │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Aqara Life   │  │ OEM App A    │  │ OEM App B    │ │
│  │ (公版)       │  │ (酒店品牌)    │  │ (地产品牌)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           ▼                            │
│              Shared Rendering Engine                    │
│           (同构组件库 + 数据绑定层)                       │
│                           │                            │
│                           ▼                            │
│              Shared Studio API Layer                    │
│           (Spatial Ontology API / ORAP)                 │
│                           │                            │
│                           ▼                            │
│                   Aqara Studio (M300 / Cloud)           │
└────────────────────────────────────────────────────────┘
```

### 4.3 OEM App 与公版 Life App 的差异

| 维度 | Aqara Life（公版） | OEM App（白标） |
|------|-------------------|----------------|
| **品牌** | Aqara 品牌 | OEM 客户品牌 |
| **应用市场** | 完整的 Marketplace 生态 | OEM 审核后的子集，或自有应用市场 |
| **底部 Tab** | 标准（Home + Rooms + Apps + Me） | OEM 自定义（可增减 Tab） |
| **Theme** | 全量 Theme Store | OEM 预设 + 有限选择 |
| **更新节奏** | Aqara 统一更新 | 基础框架跟随更新 + OEM 自主更新品牌层 |
| **商业模式** | 免费使用 + App 内购 | **白标授权费 + 年服务费** |
| **数据归属** | 用户数据在 Aqara 平台 | 可选：OEM 私有云 / Aqara 托管 |

### 4.4 OEM 授权定价模型

```
┌───────────────────────────────────────────────────────┐
│  OEM 白标授权                                          │
│                                                       │
│  一次性费用                                            │
│  · 品牌定制开发费（Logo/启动页/品牌色/Tab 结构）        │
│  · App Store 上架支持                                  │
│                                                       │
│  年服务费                                              │
│  · 同构框架持续更新（渲染引擎、组件库、安全补丁）       │
│  · Studio API 兼容性维护                               │
│  · 基础运维支持                                        │
│                                                       │
│  按量计费（可选）                                       │
│  · 云端 Studio 托管（Cloud Studio）                    │
│  · AI 功能调用（Credits 体系）                          │
│  · 每活跃设备 / 每空间 月费                             │
│                                                       │
│  生态分润                                              │
│  · OEM 自有应用市场中的 App 交易，Aqara 抽成 10-15%     │
│  · OEM 可在其市场中设置自己的抽成（如 30%）             │
└───────────────────────────────────────────────────────┘
```

---

## 五、同构渲染框架技术规范

### 5.1 框架目标

同一套 App 代码（声明式组件 + 数据绑定）能在以下环境渲染：

| 环境 | 技术实现 |
|------|---------|
| **Aqara Life (iOS)** | Swift/SwiftUI 原生渲染 |
| **Aqara Life (Android)** | Kotlin/Compose 原生渲染 |
| **OEM App (iOS/Android)** | 同上，品牌层不同 |
| **Builder 预览** | WebView / React 渲染（已在 App Launchpad 中实现） |
| **Web Dashboard** | React / Next.js 渲染 |

### 5.2 App Manifest 规范

每个 App 发布时包含一个声明式 Manifest：

```json
{
  "app_id": "com.builder.energy-dashboard",
  "name": "Energy Dashboard",
  "version": "1.2.0",
  "type": "dashboard",
  "author": "@energy_expert",
  
  "capabilities": {
    "inject_home_widget": true,
    "register_tab": false,
    "theme_override": "optional",
    "background_service": true
  },
  
  "data_requirements": {
    "devices": ["sensor.power", "sensor.energy"],
    "spaces": ["room.*"],
    "automations": false
  },
  
  "screens": [
    { "id": "overview", "type": "dashboard", "is_home_widget": true },
    { "id": "detail", "type": "detail" },
    { "id": "settings", "type": "settings" }
  ],
  
  "default_theme": "dark-gradient",
  "min_studio_version": "2.0.0"
}
```

### 5.3 数据绑定层

App 不直接访问设备——通过**数据绑定声明**由 Life Shell 完成映射：

```
App 声明                          Life Shell 映射
─────────                        ──────────────
"rooms.*.temperature"      →     Studio API → GET /space/rooms → temperature sensors
"devices.light.brightness" →     Studio API → GET /devices?type=light → brightness attribute
"scenes.trigger(id)"       →     Studio API → POST /control/scene/{id}
```

这种解耦确保：
- 同一个 App 可以在不同 Studio 上运行（设备不同但语义相同）
- App 无需感知具体协议（Zigbee/Matter/Wi-Fi）
- 安全边界清晰（App 只能访问声明的数据范围）

---

## 六、App 生态对 Life App UI 的影响机制

### 6.1 Home 页面的动态组合

Life App 的 Home 页面不是一个固定 UI，而是由多层来源**动态组合**：

```
Home Page Composition
│
├── Base: Default App 的 Home Screen（空间概览、设备控制）
│
├── Injected Widgets（按安装顺序/用户排序）
│   ├── Weather Widget (from "Weather" App)
│   ├── Energy Ring (from "Energy Dashboard" App)
│   └── Baby Camera (from "Baby Monitor" App)
│
├── Theme Layer（当前激活的 Theme）
│   └── 覆盖色彩方案、字体、卡片样式、动效
│
└── User Customization（用户微调）
    └── Widget 顺序调整 + 显示/隐藏 + 收藏场景
```

### 6.2 Tab 栏的动态管理

```
默认 Tab：  Home    Rooms    Apps    Me

安装 "Security" App 后：
            Home    Rooms    🔒Security    Apps    Me

安装 "Energy" App 后（用户启用 Tab）：
            Home    Rooms    🔒Security    ⚡Energy    Apps    Me

用户在设置中可以：
  · 调整 Tab 顺序
  · 隐藏不常用的 Tab
  · 最多显示 5 个 Tab
```

### 6.3 Theme 影响范围

| Theme 类型 | 影响范围 | 来源 |
|-----------|---------|------|
| **Global Theme** | 整个 Life App（Home + 所有 App 页面） | Theme Store / AI 生成 |
| **App Theme** | 仅该 App 的页面内 | App 自带 |
| **Home Theme Override** | 仅 Home 页面的视觉风格 | 某些 App 安装时可选启用 |

用户可在 Settings → Appearance 中管理 Theme 优先级。

---

## 七、行业场景扩展与教育愿景

### 7.1 行业垂直应用

| 行业 | App 类型 | 典型场景 |
|------|---------|---------|
| **酒店** | Industry App (OEM) | 客房控制（灯光/窗帘/空调/DND）、客房服务请求、退房引导 |
| **教育** | Control App + Dashboard | 教室环境管理（照明/投影/空调）、出勤感知（FP2）、课堂数据看板 |
| **养老** | Control App | 健康监测看板、紧急呼叫、活动检测、药物提醒 |
| **办公** | Dashboard + Control App | 工位环境控制、会议室预约、能耗管理、人员密度分析 |
| **零售** | Dashboard | 门店客流分析、照明场景管理、能耗优化 |

### 7.2 儿童教育与 STEM

App Launchpad 的一个重要场景是**教育**：

```
教育场景想象：

1. STEM 教学 App
   · 学生在 Builder 中创作「我的智能教室」空间方案
   · AI 辅助理解传感器原理、自动化逻辑
   · 方案部署到教室 Studio → 真实运行
   · Aqara Life 中查看运行效果 → 学习成果可视化

2. 创客空间 App
   · 学校提供 Studio + 传感器/执行器套件
   · 学生通过 App Launchpad 创作控制面板
   · 作品发布到学校的「创作展示墙」（Explore）
   · 学生间互相 Remix，形成创意飞轮

3. 科学实验 App
   · 温湿度传感器 + 光照传感器 → 数据采集 Dashboard
   · 学生自己设计数据可视化面板
   · 生成实验报告（基于空间数据）
```

这些场景下，**创作本身就是学习过程**——Builder 和 App Launchpad 成为 STEM 教育工具，Aqara Life 成为学习成果的展示窗口。

### 7.3 灵感涌现的生态愿景

```
┌─────────────────────────────────────────────────────────┐
│                    创作 × 玩法 × 传播                     │
│                                                         │
│  Builder 平台                    Aqara Life              │
│  ┌───────────┐                  ┌──────────────┐        │
│  │ 空间创作   │ ──部署──→       │ 空间体验      │        │
│  │ App 创作   │ ──部署──→       │ App 使用      │        │
│  │ Plugin 开发│ ──市场──→       │ 能力增强      │        │
│  │ Theme 设计 │ ──市场──→       │ 个性化       │        │
│  └───────────┘                  └──────────────┘        │
│       │                               │                 │
│       └──── Remix ←── Explore ←── Share ←──┘            │
│                                                         │
│  每个 App 都是一个可安装的体验                            │
│  每个空间都是一个可分享的故事                              │
│  每个创作者都在构建生态的一块拼图                          │
│                                                         │
│  从学校教室到酒店客房，                                   │
│  从家庭客厅到养老公寓——                                   │
│  空间智能的民主化，从这里开始。                            │
└─────────────────────────────────────────────────────────┘
```

---

## 八、空间预览与互动 UGC（沿用并更新）

### 8.1 空间预览技术路径

| 阶段 | 技术 | 状态 |
|------|------|------|
| **近期（0–6 月）** | 自研 2D 户型图引擎（SVG/Canvas + 设备状态映射 + 交互式 Walkthrough） | ✅ 已实现基础版 |
| **中期（6–12 月）** | 2.5D / 等距视角轻量 3D（Three.js + 设备模型库） | 🔲 待实现 |
| **远期（12–24 月）** | AI 辅助 3D 空间生成 + 世界模型（营销级内容） | 🔲 待实现 |

### 8.2 Loopit 式互动 UGC 策略

核心理念不变：**每个空间方案都是可预览、可体验、可魔改、可部署、可传播的「Playable Space」**。

新增维度：**每个 App 也是可安装、可体验、可 Fork、可定制的「Playable App」**。

App 创作者的作品通过 Marketplace 流通，用户安装后可以在 Life App 中直接体验。如果用户有 Builder 账号，还可以 Fork 该 App 进行二次创作。

---

## 九、商业模式全景更新

### 9.1 收入来源矩阵

```
┌──────────────────────────────────────────────────────────────┐
│                    Builder Marketplace                         │
│  Space Packages（空间方案）       → 平台抽成 15-30%           │
│  Capability Assets（能力插件）    → 平台抽成 15-30%           │
│  Apps（应用）                     → 平台抽成 15-30%  ★NEW     │
│  Themes（主题皮肤）               → 平台抽成 30%              │
├──────────────────────────────────────────────────────────────┤
│                    Life App 内购                               │
│  Premium Apps（付费应用）          → 平台抽成 30%              │
│  App 订阅（持续服务型 App）        → 平台抽成 30%              │
│  Theme Store（视觉主题购买）       → 平台抽成 30%              │
│  AI 功能（AI Theme 生成等）        → Credits 消耗              │
├──────────────────────────────────────────────────────────────┤
│                    OEM 白标                                    │
│  一次性品牌定制费                                              │
│  年框架更新与运维服务费                                        │
│  按活跃设备/空间的月费（可选）                                  │
│  OEM 应用市场交易抽成（10-15%）                                │
├──────────────────────────────────────────────────────────────┤
│                    平台订阅（Builder 侧）                      │
│  Starter / Explorer / Builder / Master / Team                 │
│  Credits 月度配额 + 按需充值                                   │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 创作者类型更新

| 创作者类型 | 平台 | 创作物 | 收入来源 |
|-----------|------|--------|---------|
| **Space Builder** | Builder | Space Package（空间 + 设备 + 自动化） | Marketplace 方案销售 |
| **App Developer** | Builder (Dev Console → App Launchpad) | Dashboard / Control App / Industry App | Marketplace + Life 内购 |
| **Plugin Developer** | Builder (Dev Console → My Plugins) | 协议/逻辑/AI/体验 插件 | Marketplace 能力销售 |
| **Theme Designer** | Builder 或 Life | App Theme / Global Theme | Theme Store 销售 |
| **Content Creator** | Life / Explore | 空间体验分享、评测、教程 | 社区影响力 → 带货 |

---

## 十、实施优先级

| 优先级 | 事项 | 依赖 | 阶段 | 状态 |
|--------|------|------|------|------|
| **P0** | App Launchpad 创作流程（AI 对话 + 预览 + 发布） | Dev Console | Phase 1 | ✅ 已实现基础交互 |
| **P0** | App Assign to Studio + Life 可用标记 | Studio API | Phase 1 | ✅ 已在编辑器中实现 |
| **P0** | 同构渲染框架 MVP（Web 端 + 数据绑定） | - | Phase 1 | 🔲 框架设计中 |
| **P1** | Life App Shell（Studio 连接 + 基础控制 + App 容器） | 渲染框架 | Phase 2 | 🔲 待实现 |
| **P1** | App Manifest 规范 + 审核流程 | - | Phase 2 | 🔲 待实现 |
| **P1** | Home Widget 注入 + Tab 注册机制 | Life Shell | Phase 2 | 🔲 待实现 |
| **P1** | Theme Engine + Theme Store | Life Shell | Phase 2 | 🔲 待实现 |
| **P2** | OEM 白标构建工具 + 品牌定制层 | 渲染框架成熟 | Phase 3 | 🔲 待实现 |
| **P2** | OEM 应用市场（子集管理 + 审核） | OEM 框架 | Phase 3 | 🔲 待实现 |
| **P2** | App 间通信协议（Widget 数据共享） | Life Shell | Phase 3 | 🔲 待实现 |
| **P3** | AI Theme Generator + AI App 推荐 | AI 能力 | Phase 4 | 🔲 待实现 |
| **P3** | App Fork/Remix 机制（从 Life 到 Builder） | 全链路 | Phase 4 | 🔲 待实现 |

---

## 十一、总结

**Aqara Life App 的本质是空间操作系统（Space OS）。** 它连接 Studio 获取空间本体，加载由 Builder 生态创作的应用，提供可个性化的空间体验。App 不再是 Space Package 的附属品，而是**独立的、可安装的、可流通的创作物**——通过 Marketplace 分发，在 Life App 中运行，为终端用户创造价值。

**OEM App 是同一框架的白标输出。** 技术上共享同构渲染引擎和 Studio API，商业上通过授权费 + 服务费 + 生态分润实现多方共赢。

**从学校教室到酒店客房，从家庭客厅到养老公寓——每一个空间都有属于它的操作系统，每一个 App 都是这个操作系统上可安装的体验。** 这就是 Aqara Builder + Life 生态的终极图景。

---

*文档版本：v3.0 | 2026-03-16*  
*v3.0 核心变更：*  
*- 架构升级：Life App 从「Blueprint 渲染器」升级为「空间操作系统（Space OS）」*  
*- App 独立化：App 从 Space Package 中解耦，在 Dev Console App Launchpad 独立创作*  
*- 完整六步用户旅程：创作 → 部署 → 下载 → 添加 Studio → 应用生态 → 个性化*  
*- OEM 白标架构：同构框架 + 品牌定制层 + 独立应用市场 + 授权定价模型*  
*- App 生态四层模型：Life Shell → Default App → Extension Apps → OEM Shell*  
*- App Manifest 规范：声明式能力声明（Widget 注入 / Tab 注册 / Theme 覆盖）*  
*- 行业场景扩展：酒店 / 教育 / 养老 / 办公 / 零售的具体 App 想象*  
*- 收入来源更新：新增 Apps 交易抽成 + OEM 白标授权 + Life 内购*
