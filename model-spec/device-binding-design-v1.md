# 设备模板与真实设备绑定机制 —— 设计研究与方案

> 版本：v1.0  
> 日期：2026-03-26  
> 背景：Aqara Builder MVP — 虚拟设备与 AIOT 真实设备映射问题

---

## 1. 问题定义

当前 Aqara Builder 在"AIOT 设备同步"阶段，存在一个根本性的设计挑战：

> **设备模板（DeviceTemplate）与真实设备（Real Device）之间不是 1:1 关系，而是 M:N（多对多）关系。**

具体体现在：

- 一台真实的 Aqara 设备（如 H1 温控联动开关）可能同时暴露：继电器控制、温度测量、按键事件、能耗监测等多组能力
- 一个虚拟"灯光"模板只需要 `OnOff + Brightness`，一个虚拟"温感"模板只需要 `CurrentTemperature`
- 一台真实设备的能力点，可以同时服务于 BXML 中多个不同的虚拟设备

这导致朴素的"虚拟设备 → 真实设备"整体匹配策略，在多数场景下：

- 要么过于严苛（要求全能力匹配），导致大量虚拟设备标记为"未映射"
- 要么过于宽松（类别近似就算匹配），导致能力缺口被隐藏，运行时出错

---

## 2. Loxone Config 的解法研究

Loxone 是目前行业内在**设备物理层与逻辑层解耦**方面做得最彻底的系统之一，值得深度借鉴。

### 2.1 三层架构

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer（自动生成）                                     │
│  - 基于 Function Block 自动生成可视化界面                 │
├─────────────────────────────────────────────────────────┤
│  Logic Layer（Function Blocks）                          │
│  - AutomaticBlinds / LightingController / HVACUnit      │
│  - 每个 Block 有类型化输入输出 Pin（红方块=输入，绿箭头=输出）│
│  - 代表"这个空间里有一个逻辑窗帘控制器"                   │
├─────────────────────────────────────────────────────────┤
│  Periphery Layer（物理设备）                              │
│  - 真实接入的传感器、执行器、开关面板、模块               │
│  - 每个设备暴露若干原子 I/O Pin（数字/模拟输入输出）        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心机制：Pin-Level Wiring（引脚级连接）

Loxone **从不把"物理设备"整体映射到"逻辑模板"**。它的做法是：

1. 物理设备（Periphery）暴露**原子 I/O Pin**：
   - 数字输入 → 对应一个开关信号
   - 模拟输出 → 对应一个调光信号
   - 传感器点 → 对应一个测量值

2. Function Block 拥有**类型化输入连接器（Connector）**：
   - 每个连接器声明它期望接收什么类型的信号

3. 用户或自动配置工具**按 Pin 类型手动连接**：
   - `物理设备.binary_out[1]` → `LightingController.switch_input`
   - `物理设备.analog_out[1]` → `LightingController.dim_level`

4. **一台物理设备的 Pin 可以同时连接多个 Function Block**

### 2.3 设备模板（Library Template）的作用

Loxone 提供"Works with Loxone"认证的设备模板库（`.xml` 格式）：

- 模板不替代 Pin-level wiring
- 模板的作用是：**预配置设备在 Periphery Tree 中暴露的 Pin 结构**
- 即：加载模板后，设备自动出现正确的 Pin 列表，省去手动配置协议层
- 用户仍然需要手动（或自动）把 Pin 连接到 Logic Layer

### 2.4 关键启示

| Loxone 做法 | 映射到 Aqara Builder |
|---|---|
| 物理设备暴露原子 Pin | AIOT 真实设备暴露 ElementType 点位 |
| Function Block 声明需要什么 Pin | DeviceTemplate 声明需要什么 ElementType |
| Pin 类型匹配 → 建立连接 | ElementType 匹配 → 建立能力绑定 |
| 一个设备可连接多个 Block | 一台真实设备可服务多个虚拟设备 |
| 未连接 Pin → 标记为"未配置" | 未匹配 ElementType → 标记为"能力缺口" |

---

## 3. W3C WoT 与 SmartThings 的补充视角

### 3.1 W3C Web of Things（WoT）

WoT 核心思想：**把设备描述（语义）与协议绑定（实现）彻底分开**。

- 每台设备用 **Thing Description（TD）** 描述它能做什么：
  - `Properties`（可读写的状态属性）
  - `Actions`（可执行的命令）
  - `Events`（可上报的事件）
- 上层逻辑引用 TD 中的抽象属性/动作，而不是具体协议地址

这与 Aqara Builder 的 `ElementType` 体系高度吻合：
- `trait` ≈ WoT `Property`
- `command` ≈ WoT `Action`
- `event` ≈ WoT `Event`

### 3.2 SmartThings Capabilities

SmartThings 用 **Capability** 作为设备能力抽象单元：
- 每个 Capability = 一组 Attributes（状态）+ Commands（控制）
- 设备 Profile = 若干 Capability 的组合
- App/Automation 引用 Capability，而不是具体设备型号

> **结论：行业主流方案都在往"能力点级别绑定"方向收敛，而不是"设备整体映射"。**

---

## 4. Aqara Builder 当前架构的优势与问题

### 4.1 现有架构已有的正确基础

| 层次 | 对应文件 | 状态 |
|---|---|---|
| 最小能力点定义 | `ElementType`（`element-type-v1.md`） | ✅ 已建立 |
| 可复用能力组合 | `CapabilityObjectType` | ✅ 已建立 |
| 设备类型模板 | `DeviceTemplate`（`device-semantic-model.xml`） | ✅ 已建立 |
| 空间实例模型 | `BXML` | ✅ 已建立 |
| 自动化独立层 | `AutomationModel` | ✅ 已建立 |

架构层次已经与 Loxone 的思路一致。

### 4.2 当前绑定层的问题

当前 `lib/aiot-sync.ts` 的映射逻辑（MVP 版本）使用了"设备整体匹配"策略：

```
虚拟设备 (BXMLObject) → 打分 → 最佳匹配真实设备
评分维度：模型完全一致 / 类别近似 / 空间名称相近
```

**问题所在：**

1. **粒度太粗** — 匹配的是整台设备，不是能力点
2. **缺口被掩盖** — 一台设备类别匹配但能力不全，被标记为 `mapped`，App 端运行时才发现缺失功能
3. **一对多无法表达** — 一台真实设备可以服务多个虚拟设备，当前模型无法描述
4. **缺少能力差异报告** — 用户不知道具体缺哪些能力，只知道"映射不上"

---

## 5. 解决方案：能力点级绑定（Capability-Level Binding）

### 5.1 核心原则

> **绑定的最小单位应该是 ElementType（能力点），而不是整台设备。**

### 5.2 绑定模型设计

```
虚拟设备（BXML DeviceInstance）
  └── 需要的能力点列表（derived from DeviceTemplate）
        ├── ElementType: Output.OnOff (required)
        ├── ElementType: BrightnessLevel (optional)
        └── ElementType: ColorTemperature (optional)

                      ↕ Capability-Level Binding

真实设备（AIOT Device）
  └── 暴露的能力点列表（from DeviceSemanticModel or AIOT capability query）
        ├── functionCode: OnOff → traitCode: OnOff
        ├── functionCode: LevelControl → traitCode: BrightnessLevel
        └── functionCode: ColorControl → traitCode: ColorTemperature
```

每个 ElementType 独立判断绑定状态：

| ElementType 绑定状态 | 含义 |
|---|---|
| `bound` | 真实设备有该能力点，且已映射 |
| `unbound_optional` | 该能力点可选，真实设备没有，不影响核心功能 |
| `unbound_required` | 该能力点必需，真实设备没有 → 功能缺失 |
| `conflicted` | 多个真实设备都能提供，需要用户选择 |

### 5.3 设备绑定结果的五种状态

| 虚拟设备绑定状态 | 判断条件 | App 侧处理 |
|---|---|---|
| `fully_bound` | 所有 required ElementType 均已 bound | 可完整控制 |
| `partially_bound` | required 全部 bound，optional 有缺失 | 可基本控制，部分功能不可用 |
| `degraded` | 部分 required unbound | 有限控制，明确标注能力缺口 |
| `unbound` | 无任何 required ElementType 被 bound | 显示"设备缺失" + 购买引导 |
| `conflicted` | 有 ElementType 对应多个候选真实设备 | 需要人工确认映射关系 |

---

## 6. 第一期推荐方案：Aqara 原生设备模板

### 6.1 策略：先"收窄"，再"放开"

用户提出的直觉完全正确：**第一期定义一批与绿米设备精确匹配的设备模板**。

这可以将 M:N 问题临时简化为近似 1:1，原因：

- 每个 Aqara 产品型号的能力集是固定且已知的
- Aqara Builder 用户群体的主要设备来自绿米生态
- 模板直接用型号码索引，匹配逻辑退化为精确查表

### 6.2 Aqara 原生设备模板目录（第一期 ~20 种）

按使用频率排序，覆盖住宅场景 80% 的设备需求：

**照明类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `SmartBulb.Color` | ZNLDP13LM / L-BL01D | OnOff, Brightness, ColorTemp, ColorRGB |
| `SmartBulb.WhiteTemp` | ZNLDP12LM / L-BUL | OnOff, Brightness, ColorTemp |
| `SmartBulb.Dimmable` | 通用可调光球泡 | OnOff, Brightness |
| `SmartBulb.OnOff` | 通用不可调球泡 | OnOff |

**开关/继电器类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `WallSwitch.Single` | H1 单键 / QBKG03LM | OnOff |
| `WallSwitch.Double` | H1 双键 / QBKG04LM | OnOff × 2 |
| `WallSwitch.Triple` | H1 三键 | OnOff × 3 |
| `Dimmer.Wall` | ZNQBKG38LM | OnOff, Brightness |
| `RelayModule` | 普通继电器模块 | OnOff |

**传感器类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `MotionSensor` | MS-S02 / RTCGQ11LM | Occupancy, IlluminanceLevel, Battery |
| `ContactSensor` | DS-S01 / MCCGQ11LM | ContactState, Battery |
| `TempHumiditySensor` | TH-S02D / WSDCGQ01LM | CurrentTemperature, CurrentHumidity, Battery |
| `AirQualitySensor` | AAQS-S01 | CO2Density, TVOCDensity, CurrentTemp, CurrentHumidity |
| `WaterLeakSensor` | WL-S01D | WaterLeakDetected, Battery |
| `SmokeSensor` | JY-S01LM | SmokeDetected, Battery |

**窗帘/遮阳类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `CurtainMotor.Roller` | CM-M01 / ZNCLDJ11LM | OpenClose, PositionLevel, MovingState |
| `CurtainMotor.Tubular` | AM-M01 | OpenClose, PositionLevel |

**暖通类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `ACController` | KTBL11LM (空调伴侣) | OnOff, TargetTemperature, ACMode, FanSpeed |

**门锁类**

| 模板名称 | 主要对应 Aqara 型号 | 核心 ElementType |
|---|---|---|
| `SmartLock` | A100 / D100 系列 | LockState, BatteryLevel, DoorAlarm |

### 6.3 模板 → 真实设备匹配策略（第一期）

```
优先级 1：型号精确匹配
  virtual.model == real.model → score = 100，直接 fully_bound

优先级 2：模板代码与官方型号族匹配
  virtual.templateCode in AQARA_MODEL_FAMILY[real.model] → score = 90

优先级 3：能力点集合包含关系
  real.elementTypes ⊇ virtual.requiredElementTypes → score = 70，partially/fully bound

优先级 4：类别近似 + 空间名称相近
  → score < 50，标记为 conflicted，等待人工确认
```

### 6.4 人工介入节点设计

**不需要人工介入的场景：**
- 型号精确匹配 → 自动 fully_bound
- 空间内同类设备唯一存在 → 自动单向映射

**需要人工介入的场景：**

| 场景 | 触发条件 | 建议交互 |
|---|---|---|
| 同一空间内多台同类真实设备 | 例如客厅有 2 个人体传感器 | 显示候选列表，用户点选 |
| 模板需要多个真实设备拼合 | 例如虚拟"带温感的开关"需要 H1 + TH-S02 | 显示多设备组合建议 |
| 能力部分缺失（optional 缺口） | Brightness 无法映射 | 提示"该功能不可用"，用户确认接受 |
| 型号从未出现在已知库中 | AIOT 返回未知型号 | 触发 AI 推断 + 人工确认 |

---

## 7. 架构层次调整建议

### 7.1 新增：DeviceCapabilityProfile（设备能力画像）

在 `device-semantic-model.xml` 的 `DeviceTemplate` 中增加一个可选子节点：

```xml
<DeviceTemplate id="SmartBulb.Color" ...>
  ...
  <AqaraModelProfile>
    <!-- 精确对应的 Aqara 型号列表 -->
    <Model code="ZNLDP13LM" region="CN" />
    <Model code="L-BL01D" region="Global" />
    <!-- 每个型号暴露的 ElementType 能力集（可从 AIOT 能力查询或内置） -->
    <ExposedCapabilities>
      <ElementTypeRef code="OnOff" functionCode="OnOff" required="true" />
      <ElementTypeRef code="BrightnessLevel" functionCode="LevelControl" required="false" />
      <ElementTypeRef code="ColorTemperature" functionCode="ColorControl" required="false" />
      <ElementTypeRef code="ColorRGB" functionCode="ColorControl" required="false" />
    </ExposedCapabilities>
  </AqaraModelProfile>
</DeviceTemplate>
```

### 7.2 修改：DeviceBinding 数据结构（BXML 层）

当前 `DeviceBinding` 结构：
```typescript
interface DeviceBinding {
  bindingStatus: "unmapped" | "mapped" | "conflicted";
  realDeviceId?: string;
  ...
}
```

建议升级为能力点级绑定：
```typescript
interface ElementTypeBinding {
  elementTypeCode: string;       // 对应 ElementType.code
  required: boolean;             // 来自 DeviceTemplate 定义
  status: "bound" | "unbound" | "conflicted";
  realDeviceId?: string;         // 提供该能力点的真实设备 ID
  realEndpointId?: string;
  realFunctionCode?: string;
  realTraitCode?: string;
}

interface DeviceBinding {
  // 整体状态（从各能力点状态聚合计算）
  bindingStatus: "fully_bound" | "partially_bound" | "degraded" | "unbound" | "conflicted";
  
  // 能力点级别的绑定明细
  elementBindings: ElementTypeBinding[];
  
  // 向后兼容：快速访问字段
  primaryRealDeviceId?: string;   // 提供 required 能力的主设备
  missingCapabilities?: string[]; // unbound required ElementType 列表
  purchaseSku?: string;           // 推荐购买的设备 SKU
}
```

### 7.3 修改：App 插件侧的分级处理

```
fully_bound      → 完整控制 UI（所有功能可用）
partially_bound  → 基本控制 UI + 灰色的不可用功能 + tooltip 说明缺少什么
degraded         → 有限控制 UI + 黄色警告 + 能力缺口列表
unbound          → 灰色卡片 + "设备缺失" + 推荐购买链接
conflicted       → 橙色卡片 + "需要确认" + 配置引导
```

---

## 8. AI 辅助配置的边界

基于以上分析，明确 AI 可以自动做和需要人参与的边界：

### AI 可以自动完成

- 从 DeviceTemplate 推导出虚拟设备需要的 ElementType 列表
- 从 AIOT 或内置模型库查出真实设备暴露的 ElementType 列表
- 执行能力点级别的匹配评分
- 对 `fully_bound` 和 `unbound` 场景直接做出决策
- 生成能力缺口报告（哪些功能无真实设备支持）
- 对缺口设备生成推荐购买方案

### 需要人参与

- 同空间多候选设备冲突时的选择（`conflicted`）
- `partially_bound` / `degraded` 时，用户接受"部分功能不可用"的确认
- 不在内置模型库的新设备型号，需要人工配置能力画像
- 跨空间的能力拼合（一台设备服务两个虚拟设备的 ElementType）

---

## 9. 实施路线

### 第一期（MVP 阶段）：Aqara 原生模板 + 简化整体匹配

**目标：** 演示核心流程可跑通

- [ ] 建立约 20 种 Aqara 原生 `DeviceTemplate`（含 `AqaraModelProfile`）
- [ ] `aiot-sync.ts` 增加型号精确匹配优先级
- [ ] `DeviceBinding` 增加 `missingCapabilities[]` 字段（简单版）
- [ ] App 插件侧增加 `partially_bound` 的灰色功能展示

### 第二期（能力点绑定升级）：

**目标：** 真正解决 M:N 问题

- [ ] 升级 `DeviceBinding` 为 `ElementTypeBinding[]` 结构
- [ ] 实现 ElementType 级别的评分匹配引擎
- [ ] 实现"一台真实设备服务多个虚拟设备"的绑定图结构
- [ ] 冲突解决 UI（候选设备选择界面）

### 第三期（自动配置 + 知识积累）：

**目标：** 减少人工介入

- [ ] 从历史配置数据中学习常见映射模式
- [ ] 引入"空间语义相似度"提升模糊匹配准确率
- [ ] 对第三方设备（非 Aqara）建立开放式能力画像

---

## 10. 结论与建议

1. **Loxone 的核心经验是：分离"物理设备 Pin"与"逻辑功能 Block"，在 Pin 级别建立连接。** Aqara Builder 已有类似的 ElementType 体系，但绑定层还停留在整台设备级别。

2. **第一期应走 Aqara 原生模板路线**，用型号精确匹配把 M:N 问题收窄为近似 1:1，快速跑通端到端演示。

3. **但数据结构要为第二期预留升级空间**：`DeviceBinding` 中至少加入 `missingCapabilities[]`，为后续能力点级绑定铺路。

4. **人工介入节点应该被明确设计进产品流程**，而不是依赖 AI 自动猜测——尤其是"同空间多设备冲突"和"部分能力缺失接受"这两个决策点。

5. **App 插件侧的分级 UI**（fully_bound / partially_bound / degraded / unbound）比简单的"可控/缺失"二元状态更能帮助用户理解系统状态，也更能驱动购买转化。
