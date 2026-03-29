# Automation Logic Block 架构设计 V1

> 版本：v1.0  
> 日期：2026-03-26  
> 关键洞察：自动化逻辑块 + 原子能力池 + AI 空间语义编排 = Asset

---

## 0. 背景与核心问题

### 0.1 与 Loxone 的差异

| 维度 | Loxone Function Block | Aqara Builder Logic Block |
|---|---|---|
| 块的语义 | **设备控制器**（Lighting Controller = 一套灯光控制逻辑） | **自动化原语**（Trigger / Condition / Action 单元） |
| 块的粒度 | 中粒度（包含完整的设备控制状态机） | 原子粒度（单一逻辑职责） |
| UI 生成方式 | 从 Function Block 自动生成 UI 卡片 | UI 卡片（Asset）在自动化原语之上由 AI 独立生成 |
| 用户配置方式 | 拖拽 Pin 连接 | AI 自动编排 + 用户审核 |
| 适合场景 | 楼宇/工业现场，专业集成商配置 | B2B 空间方案，AI 辅助，非专业用户 |

### 0.2 设备来源的双轨制

```
Aqara 设备（AIOT Spec 定义）          第三方设备（BACnet / Modbus）
  ↓                                      ↓
从 aqara_spec_definition.json          手动添加设备
自动推导 ElementType 绑定              发现/配置数据点
  ↓                                      ↓
  ↓————————→ 统一 ElementType 能力池 ←——————↓
                      ↓
            Automation Logic Engine
                      ↓
              AI 基于空间语义编排
                      ↓
                  Asset（资产）
                      ↓
             Life App Plugin UI 卡片
```

---

## 1. 整体分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: App UI（Life App Plugin）                               │
│  Asset 卡片（湿度管理 / 睡眠环境 / 安防）                          │
│  - Studio 感知：实时状态聚合                                       │
│  - 无 Studio：降级静态展示                                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Asset Layer（资产层）                                   │
│  一组有名字的自动化资产                                            │
│  - 由 AI 根据空间语义生成候选                                      │
│  - 每个 Asset = {name, icon, rules[], elementBindings[]}         │
│  - 显示状态从绑定的 ElementType 实时聚合                           │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Automation Logic Blocks（自动化逻辑块）                  │
│  原子级编排单元                                                    │
│  - TriggerBlock / ConditionBlock / ActionBlock                   │
│  - 每个块声明所需 ElementType（输入/输出）                          │
│  - 块与块可以组合成 Rule Chain                                     │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: ElementType Capability Pool（统一能力池）                │
│  所有设备能力的统一原子视图                                         │
│  - Aqara 设备 → 从 Spec 自动映射                                  │
│  - BACnet 设备 → 扫描后 AI 辅助映射                                │
│  - Modbus 设备 → 寄存器表手动映射                                  │
│  每个能力点：{deviceId, endpoint, elementTypeCode, protocol binding}│
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Physical Device Layer（物理设备层）                      │
│  - Aqara AIOT 设备（Zigbee / Wi-Fi / Matter）                    │
│  - BACnet/IP 设备                                                 │
│  - Modbus TCP / Modbus RTU 设备                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1 → Layer 2：设备接入与能力点发现

### 2.1 Aqara 设备（Spec 驱动）

**接入流程：**

```
AIOT 平台设备列表
  → 获取 deviceId + modelCode
  → 查找 aqara_spec_definition.json 中该 modelCode 的 functionGroups
  → 遍历 functionCode → traitCode / commandCode / eventCode
  → 通过 device-semantic-model.xml 中的 DeviceTemplate 推导 ElementType 映射
  → 写入 ElementType Pool
```

**映射示例（Aqara H1 温控开关）：**

```json
{
  "deviceId": "lumi.device.xxx",
  "model": "QBKG41LM",
  "elementBindings": [
    {
      "elementTypeCode": "OnOff",
      "protocol": "aqara",
      "endpointId": "1",
      "functionCode": "OnOff",
      "traitCode": "OnOff",
      "access": "read_write"
    },
    {
      "elementTypeCode": "CurrentTemperature",
      "protocol": "aqara",
      "endpointId": "1",
      "functionCode": "Temperature",
      "traitCode": "CurrentTemperature",
      "access": "read_reportable"
    }
  ]
}
```

**一台物理设备贡献多个 ElementType，服务多个虚拟设备的不同能力需求。**

---

### 2.2 BACnet 设备（扫描发现）

**BACnet 对象类型与 ElementType 映射规则：**

| BACnet Object Type | Present_Value 类型 | AI 推断 ElementType | 需确认条件 |
|---|---|---|---|
| `Analog Input (AI)` | float | 依据 `Units` + `Object_Name` 推断 | 总是需要用户确认 |
| `Analog Output (AO)` | float | 同上 | 总是需要用户确认 |
| `Analog Value (AV)` | float | 同上 | 总是需要用户确认 |
| `Binary Input (BI)` | bool | bool 类传感器（Occupancy / Contact 等） | 依名称推断 |
| `Binary Output (BO)` | bool | OnOff 执行器 | 通常较明确 |
| `Binary Value (BV)` | bool | 同上 | 通常较明确 |
| `Multi-State Value (MSV)` | int enum | 模式类（ACMode / FanSpeed） | 需要映射枚举值 |

**AI 推断规则（BACnet Object_Name → ElementType）：**

```
关键词匹配（不区分大小写）：
  "temp" / "temperature"          → CurrentTemperature（如 access=read_only）
                                    TargetTemperature（如 access=read_write）
  "humidity" / "rh"               → CurrentHumidity / TargetHumidity
  "co2" / "carbon"                → CO2Density
  "occupancy" / "motion" / "pir"  → Occupancy
  "contact" / "door" / "window"   → ContactState
  "brightness" / "level" / "dim"  → BrightnessLevel
  "speed" / "fan"                 → FanSpeed
  "pressure" / "pa" / "kpa"       → AirPressure

Units 匹配：
  "degrees-celsius" / "°C"        → 温度类
  "percent-relative-humidity"     → 湿度类
  "parts-per-million"             → CO2Density / TVOCDensity

置信度不足（object_name 无明显关键词）→ 标记为 needs_human_review
```

**BACnet 接入 UI 流程：**

```
1. 填写 BACnet/IP 设备地址 + Instance Number
2. 点击"扫描数据点" → 调用 ReadPropertyMultiple 拉取所有对象列表
3. AI 自动对每个 Object 生成 ElementType 推荐（含置信度）
4. 展示"数据点映射表"（类似于 Excel 表格）：
   | Object Name         | Object Type | Units    | 推荐 ElementType    | 置信度 | 状态        |
   |---------------------|-------------|----------|---------------------|--------|-------------|
   | Zone_Temp_1         | AI          | °C       | CurrentTemperature  | 高     | ✅ 已接受   |
   | Fan_Speed_Output    | AO          | rpm      | FanSpeed            | 中     | ⚠️ 需确认  |
   | Occupancy_Sensor_3  | BI          | -        | Occupancy           | 高     | ✅ 已接受   |
   | Unknown_Valve_1     | BO          | -        | OnOff               | 低     | ❓ 需人工   |
5. 用户逐行确认或修改
6. 确认后写入 ElementType Pool
```

---

### 2.3 Modbus 设备（寄存器表配置）

**Modbus 无法自动发现** — 用户必须提供寄存器表或设备文档。

**接入配置结构：**

```typescript
interface ModbusPointConfig {
  name: string;                  // 用户给的名称，例如 "室内温度"
  registerType: "coil" | "discrete_input" | "input_register" | "holding_register";
  address: number;               // 寄存器地址（0-65535）
  dataType: "bool" | "uint16" | "int16" | "uint32" | "int32" | "float32";
  byteOrder?: "AB" | "BA" | "ABCD" | "DCBA" | "CDAB"; // 多字节字序
  scaling?: {
    formula: "linear";           // 目前支持线性缩放
    factor: number;              // 乘数，例如 0.1
    offset: number;              // 偏移量，例如 -40
  };
  unit?: string;                 // 例如 "℃"、"%"
  elementTypeCode: string;       // 用户或 AI 选择的 ElementType
}
```

**UI 流程：**
1. 输入设备 IP + Port + Unit ID
2. 选择"从模板导入"（如果有已知品牌模板）或"手动配置"
3. 逐行填写寄存器表
4. AI 根据 `name` + `unit` 推荐 ElementType（与 BACnet 相同的关键词推断）
5. 测试读取（发送 ReadHolding / ReadInput 验证连通性）
6. 确认后写入 ElementType Pool

---

## 3. Layer 2 → Layer 3：ElementType Pool 与 Logic Blocks

### 3.1 ElementType Pool 的结构

```typescript
interface CapabilityPoint {
  // 唯一标识
  pointId: string;                // 全局唯一，例如 "lumi.xxx:1:OnOff"
  
  // 归属信息
  deviceId: string;
  deviceModel: string;
  spaceId?: string;               // 安装在哪个空间
  spaceName?: string;
  
  // 能力抽象
  elementTypeCode: string;        // 统一的 ElementType.code
  
  // 协议绑定
  protocol: "aqara" | "bacnet" | "modbus" | "matter" | "virtual";
  protocolBinding: {
    // Aqara
    endpointId?: string;
    functionCode?: string;
    traitCode?: string;
    // BACnet
    bacnetObjectType?: string;
    bacnetObjectInstance?: number;
    bacnetProperty?: string;
    // Modbus
    modbusRegisterType?: string;
    modbusAddress?: number;
    scaling?: object;
  };
  
  // 状态
  accessMode: "read_only" | "write_only" | "read_write" | "invoke" | "read_reportable";
  currentValue?: unknown;         // 最近一次读取值（由 Studio 运行时维护）
  lastUpdatedAt?: string;
}
```

### 3.2 Automation Logic Blocks 的类型定义

Logic Block 是自动化的原子编排单元，每个块声明它消费哪些 ElementType：

#### TriggerBlock（触发块）

```typescript
type TriggerBlock =
  | { type: "threshold_trigger";    pointId: string; operator: ">" | "<" | ">=" | "<=" | "==" | "!="; value: number | boolean; }
  | { type: "change_trigger";       pointId: string; from?: unknown; to?: unknown; }
  | { type: "event_trigger";        pointId: string; eventType: string; }
  | { type: "time_schedule";        cron: string; timezone?: string; }
  | { type: "manual_trigger";       sceneId?: string; };
```

#### ConditionBlock（条件块）

```typescript
type ConditionBlock =
  | { type: "state_condition";      pointId: string; operator: string; value: unknown; }
  | { type: "time_window";          start: string; end: string; days?: string[]; }
  | { type: "and";                  conditions: ConditionBlock[]; }
  | { type: "or";                   conditions: ConditionBlock[]; }
  | { type: "not";                  condition: ConditionBlock; };
```

#### ActionBlock（动作块）

```typescript
type ActionBlock =
  | { type: "write_action";         pointId: string; value: unknown; }
  | { type: "command_action";       pointId: string; command: string; params?: object; }
  | { type: "delay_action";         seconds: number; }
  | { type: "parallel_actions";     actions: ActionBlock[]; }
  | { type: "sequential_actions";   actions: ActionBlock[]; };
```

#### RuleChain（规则链）= Trigger → Condition → Action

```typescript
interface RuleChain {
  id: string;
  name?: string;
  trigger: TriggerBlock;
  conditions?: ConditionBlock[];
  actions: ActionBlock[];
  enabled: boolean;
}
```

### 3.3 Logic Block 的关键特性

> **Logic Block 本身不感知设备，只感知 `pointId`（ElementType 实例）。**

这意味着：
- 同一套 Logic Block 组合，可以绑定到不同的真实设备
- 当设备被替换（例如从 Aqara 灯换成 BACnet 灯），只需重新绑定 `pointId`，逻辑块本身不变
- AI 可以复用模板化的 Logic Block 组合，只改变 `pointId` 绑定

---

## 4. Layer 3 → Layer 4：AI 基于空间语义生成 Asset

### 4.1 Asset 的定义

```typescript
interface Asset {
  id: string;
  name: string;                     // 例如"湿度管理"
  icon: string;
  description?: string;
  
  // 所属空间
  spaceId: string;
  spaceName: string;
  
  // 核心：规则链组合
  rules: RuleChain[];
  
  // 关联的 ElementType 点位（用于显示状态）
  monitoredPoints: {
    pointId: string;
    role: "primary_display" | "secondary_display" | "trigger_only";
    displayLabel?: string;           // 例如"当前湿度"
    displayUnit?: string;
  }[];
  
  // 状态聚合计算
  statusDerivation: {
    type: "threshold_range" | "boolean" | "mode_label" | "custom";
    primaryPointId: string;
    normalRange?: [number, number];  // 例如 [50, 60]
    labels?: Record<string, string>; // 状态标签
  };
  
  // 当前运行状态（由 Studio 运行时注入）
  runtimeStatus?: {
    statusLabel: string;             // 例如"正常" / "告警" / "待机中"
    statusColor: "green" | "yellow" | "red" | "gray";
    summary: string;                 // 例如"58%·目标50-60%·正常"
    contextLines?: string[];         // 例如["Studio感知：窗户已关", "自动化：本地运行中"]
  };
}
```

### 4.2 AI 空间语义编排流程

```
输入：
  - BXML（空间实例 + 虚拟设备实例）
  - ElementType Pool（真实能力点集合）
  - 空间语义规则库（SpatialSemanticRules）
  - 已有 Asset 模板库（AssetTemplates）

推导过程：
  1. 分析 BXML 中每个空间的设备组合
     例：「主卧」→ 有 [MotionSensor, Light, AC, TempHumiditySensor]
  
  2. 查找空间语义规则库，找到适用规则
     例：「主卧有人体传感器+灯光」→ 适合生成「卧室照明管理」Asset
          「主卧有温湿度传感器」  → 适合生成「睡眠环境监控」Asset
  
  3. 从 ElementType Pool 寻找匹配的真实能力点
     例：「主卧照明管理」需要：
       - Occupancy（主卧有 MotionSensor → 匹配）
       - OnOff（主卧有 Light → 匹配）
       - IlluminanceLevel（可选，无 → 标记为 optional_missing）
  
  4. 填充 Logic Block 中的 pointId 绑定
  
  5. 生成 Asset 候选列表，标注每个 Asset 的绑定完整度
  
  6. 返回给用户审核

输出：
  - Asset 候选列表（已填充 pointId 绑定）
  - 每个 Asset 的绑定完整度报告
  - 缺失能力点的设备推荐购买提示
```

### 4.3 空间语义规则库（SpatialSemanticRules）

这是 AI 编排的知识库，预置常见的空间-设备组合规则：

```yaml
rules:
  - id: "bedroom_lighting_management"
    name: "卧室照明管理"
    applicableSpaceTypes: [Bedroom, MasterBedroom]
    requiredElementTypes: [Occupancy, OnOff]
    optionalElementTypes: [IlluminanceLevel, BrightnessLevel, ColorTemperature]
    defaultRules:
      - trigger: {type: threshold_trigger, element: Occupancy, value: true}
        conditions: [{type: time_window, start: "21:00", end: "07:00"}]
        actions: [{type: write_action, element: OnOff, value: true}]
      - trigger: {type: threshold_trigger, element: Occupancy, value: false}
        conditions: []
        actions: [{type: delay_action, seconds: 300}, {type: write_action, element: OnOff, value: false}]
    statusDerivation:
      type: boolean
      primaryElement: Occupancy
      labels: {true: "有人", false: "无人"}

  - id: "humidity_management"
    name: "湿度管理"
    applicableSpaceTypes: [LivingRoom, Bedroom, MasterBedroom]
    requiredElementTypes: [CurrentHumidity]
    optionalElementTypes: [TargetHumidity, OnOff]  # OnOff → 加湿器/除湿器
    defaultRules:
      - trigger: {type: threshold_trigger, element: CurrentHumidity, operator: ">", value: 65}
        actions: [{type: write_action, element: OnOff, value: true}]  # 开启除湿
      - trigger: {type: threshold_trigger, element: CurrentHumidity, operator: "<", value: 50}
        actions: [{type: write_action, element: OnOff, value: false}]
    statusDerivation:
      type: threshold_range
      primaryElement: CurrentHumidity
      normalRange: [50, 65]
      summaryTemplate: "{value}%·目标50-60%·{statusLabel}"

  - id: "sleep_environment"
    name: "睡眠环境"
    applicableSpaceTypes: [Bedroom, MasterBedroom]
    requiredElementTypes: []
    optionalElementTypes: [OnOff, BrightnessLevel, TargetTemperature, ColorTemperature]
    defaultRules:
      - trigger: {type: time_schedule, cron: "0 22 * * *"}
        actions:
          - {type: write_action, element: BrightnessLevel, value: 0}
          - {type: write_action, element: TargetTemperature, value: 24}
    statusDerivation:
      type: mode_label
      labels: {active: "睡眠中", scheduled: "22:00启动", standby: "待机中"}

  - id: "security_monitoring"
    name: "安防"
    applicableSpaceTypes: [Apartment, Home, Floor]
    requiredElementTypes: [Occupancy]
    optionalElementTypes: [ContactState]
    defaultRules:
      - trigger: {type: change_trigger, element: ContactState, to: true}
        conditions: [{type: state_condition, element: SecurityMode, value: "armed"}]
        actions: [{type: command_action, element: Alarm, command: "trigger"}]
    statusDerivation:
      type: mode_label
      labels: {armed: "已布防", disarmed: "已撤防", triggered: "告警中"}

  - id: "window_ac_linkage"
    name: "开窗节能"
    applicableSpaceTypes: [Bedroom, LivingRoom, Office]
    requiredElementTypes: [ContactState, OnOff]
    optionalElementTypes: []
    defaultRules:
      - trigger: {type: change_trigger, element: ContactState, to: true}  # 开窗
        actions: [{type: write_action, element: OnOff, value: false}]     # 关空调
```

---

## 5. Layer 4 → Layer 5：App Plugin UI 渲染

### 5.1 Asset 卡片的两种渲染模式

参考截图中的设计：

**无 Studio 模式（阶段1）：**
```
┌─────────────────────────────────────┐
│ 湿度管理                            │
│ 当前 58%·目标 50-60%                │
│ ✓ 正常                    查看 →   │
└─────────────────────────────────────┘
```

**有 Studio 模式（阶段2）：**
```
┌─────────────────────────────────────┐
│ ▌ 湿度管理                          │  ← 绿色左边框表示 Studio 激活
│ 58%·目标50-60%·正常                  │
│ Studio感知：窗户已关                 │  ← 来自 Studio 上下文
│ 自动化：本地运行中               → │  ← 来自 Studio 运行状态
└─────────────────────────────────────┘
```

**关键区别：**
- 无 Studio：静态规则显示，状态值来自 AIOT 云端轮询
- 有 Studio：实时状态推送，Studio 提供跨设备上下文感知（"窗户已关" = 综合了窗磁传感器状态）

### 5.2 设备不再单独出现

**截图中重要的设计决策：**

> "设备在资产视图里，不单独列出"

这意味着：
- 原始设备列表在 App 首页隐藏
- 设备状态通过 **Asset 摘要** 聚合展示
- 用户操作对象是"湿度管理"，而不是"加湿器"
- 这是从"设备中心"到**"能力中心"**的 UX 范式转变

---

## 6. 技术实现路线

### 6.1 第一期（MVP）：Aqara + 空间语义 Asset 生成

**目标：打通核心链路**

```
Aqara 设备 → ElementType Pool → AI Asset 生成 → App Plugin 渲染
```

待实现：
- [ ] `CapabilityPoolService`：从 AIOT Sync 结果构建 ElementType Pool
- [ ] `AssetTemplateRegistry`：内置 10 条空间语义规则（见 §4.3）
- [ ] `AssetGenerator`：AI + 规则匹配，生成 Asset 候选
- [ ] App Plugin 的 Asset 卡片 UI（无 Studio / 有 Studio 双模式）

---

### 6.2 第二期：BACnet 接入

**目标：支持商业楼宇场景**

```
BACnet 设备扫描 → AI 推断 ElementType → 人工确认 → Pool → 与 Aqara 统一编排
```

待实现：
- [ ] `BACnetDiscoveryService`：BACnet/IP 对象扫描
- [ ] `BACnetPointMapper`：AI 关键词推断 + 人工确认 UI
- [ ] Builder 中的"添加 BACnet 设备"流程
- [ ] Pool 中标注协议来源，支持混合编排

---

### 6.3 第三期：Modbus 接入 + 开放数据点配置

**目标：支持工业/商业传感器**

```
Modbus 寄存器表配置 → ElementType 映射 → Pool → 统一编排
```

待实现：
- [ ] Builder 中的"Modbus 设备配置"表格 UI
- [ ] 寄存器读取测试（通过 Studio 后端转发）
- [ ] 品牌模板库（常见 Modbus 设备的预设寄存器表）

---

### 6.4 第四期：Logic Block 可视化编排（高级用户）

**目标：让专业集成商可以手动配置**

类似 Loxone Config，但面向 Automation 逻辑：
- [ ] 可视化的 Trigger/Condition/Action Block 编辑器
- [ ] Block 的 ElementType Pin 连接界面
- [ ] 对 AI 生成的 Asset 进行手动微调

---

## 7. 关键设计决策说明

### 7.1 为什么用 Asset 而不是直接用设备列表

传统智能家居 App（包括 Aqara Home 当前的交互）是以**设备为中心**的：
- 你看到的是"灯"、"传感器"、"开关"
- 你操作的是"打开灯"、"查看温度"

Asset 方式是以**能力为中心**：
- 你看到的是"睡眠环境"、"湿度管理"
- 你操作的是"启动睡眠模式"
- 设备是实现这些能力的手段，不需要直接暴露

这对 B2B 场景（酒店/公寓/办公室）尤其重要：**业主不关心用的是哪款传感器，他关心"房间湿度有没有被管理好"。**

### 7.2 AI 的角色边界

| AI 负责 | AI 不负责 |
|---|---|
| 根据空间语义推荐 Asset 候选 | 确认具体哪台设备映射到哪个能力点 |
| 对 BACnet Object Name 推断 ElementType | 寄存器地址的配置（Modbus） |
| 填充 Logic Block 的 pointId 绑定 | 同空间多设备冲突的最终选择 |
| 生成 Asset 的默认名称和描述 | 用户接受"部分能力不可用"的确认 |
| 发现能力缺口并推荐购买 | 任何物理安装决策 |

### 7.3 ElementType Pool 的单例性

在同一个 Studio 实例中，**ElementType Pool 是单例**：
- 不同协议来的设备共享同一个 Pool
- 同一个 `elementTypeCode` 在同一个空间中，如果有多个来源，触发"冲突解决"
- Pool 的变更（添加/删除设备）会触发受影响的 Asset 重新评估绑定完整度

---

## 8. 与现有 model-spec 的关系

| 现有文件 | 在新架构中的角色 |
|---|---|
| `element-type-v1.md` | Layer 2 的"能力点词汇表"，不变 |
| `element-type-standard-catalog-v1.md` | Layer 2 的标准 ElementType 库，不变 |
| `device-semantic-model.xml` | 为 Aqara 设备提供 ElementType 自动映射规则，不变 |
| `automation-instance-generation-guide-v1.md` | 生成 Layer 3 Logic Block 的规则，微调为使用 pointId 而非 deviceId |
| `bxml-generation-guide-v1.md` | Layer 2 入口：BXML 虚拟设备绑定到 Pool 的 pointId |
| `device-binding-design-v1.md` | Layer 2 → Layer 3 的绑定状态描述，升级为 CapabilityPoint 级别 |
| `automation-logic-block-architecture-v1.md`（本文档） | Layer 3-4 的完整架构 |
