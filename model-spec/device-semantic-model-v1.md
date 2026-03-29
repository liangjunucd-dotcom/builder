# DeviceSemanticModel V1 规范

## 1. 定义

`DeviceSemanticModel` 是空间智能系统中的设备模板层模型，用于统一定义“一个设备类型由哪些 `ElementType` 和能力对象构成”。

它的核心目标不是描述某一台真实设备当前装在什么房间、具有什么实例 ID，也不是直接保存用户空间中的实例化结果，而是提供设备模板、能力组合和实例生成依据。

它优先参考以下来源：

- `aqara-spec/aqara_spec_definition.json`
- `model-spec/element-type-v1.md`
- `model-spec/element-type-standard-catalog-v1.md`
- `model-spec/object-type-template-data-v1.json`
- `model-spec/space-semantic-model.xml`

设计目标：

- 统一不同设备类型的模板表达方式
- 明确设备由哪些 `ElementType` 组合构成
- 沉淀可复用的能力对象定义
- 为 BXML 实例生成提供模板输入
- 为后续 UI、关系推理和独立自动化层提供稳定的能力边界
- 保持与原始协议和中间映射过程可追溯

## 2. 模型定位

`DeviceSemanticModel` 的定位是“模板层设备模型”，不直接承担实例层职责。

可以把它理解为：

- `ElementType`：最小能力点定义层
- `CapabilityObjectType`：可复用能力组合层
- `DeviceTemplate`：面向真实设备类型的模板层
- `BXML`：面向真实空间和真实设备的实例层
- `AutomationModel`：独立于设备模板层的自动化编排层

因此，`DeviceSemanticModel` 回答的问题是：

- 某类设备通常具备哪些能力
- 这些能力由哪些 `trait` / `command` / `event` 构成
- 哪些能力是必需的，哪些是可选的
- 哪些空间类型适合承载该类设备

它不直接回答的问题是：

- 某一台设备的真实 `deviceId` 是什么
- 它当前安装在哪一个具体房间或墙面
- 用户家里到底有几台该类设备
- 某条自动化规则最终是否启用
- 某个实例当前实时值是多少

## 3. 职责边界

### 3.1 `DeviceSemanticModel` 负责的内容

- 定义全局可引用的 `ElementTypes`
- 定义可复用的 `CapabilityObjectTypes`
- 定义设备模板 `DeviceTemplate`
- 定义模板级 `FunctionBindings`
- 定义模板级 `Traits` / `Commands` / `Events`
- 定义与空间实例生成相关的 `BxmlHints`
- 提供从模板到 BXML 的组合规则入口

### 3.2 `DeviceSemanticModel` 不负责的内容

- 不保存真实设备实例数据
- 不保存用户空间中的最终设备清单
- 不保存用户确认后的空间安装坐标和实例关系
- 不保存最终下发到终端的 BXML 运行结果
- 不作为完整的自动化实例文件
- 不直接保存自动化规则绑定、触发器、条件和动作编排结果
- 不完整保留原始映射推理过程

### 3.3 中间文件与最终文件分工

- `aqara-spec/aqara_spec_definition.json`
  原始协议输入源，尽量保持原样
- `model-spec/object-type-template-data-v1.json`
  设备模板生成中间层，保存原始结构、映射结果、未解决项、发射策略
- `device-semantic-model.xml`
  模板层最终产物，用于设备模板查询、实例生成和后续编译引用
- `BXML`
  用户空间中的实例化对象结果文件
- `AutomationModel`
  自动化单独层，负责保存自动化候选、规则编排和最终自动化实例

## 4. 核心术语

### 4.1 `ElementType`

`ElementType` 是最小能力单元，用于定义一个设备点位或动作的标准语义。

典型包括：

- 一个可读取的状态点
- 一个可写入的配置点
- 一个可调用的命令点
- 一个可上报的事件点

`DeviceSemanticModel` 中的所有设备模板最终都由一组 `ElementType` 组合而成。

### 4.2 `CapabilityObjectType`

`CapabilityObjectType` 是可复用能力组合对象，用于把一组高相关 `ElementType` 打包成稳定能力模块。

例如：

- 开关能力
- 温度测量能力
- 窗帘控制能力
- 风速控制能力

它的价值在于：

- 避免不同设备模板重复定义同一组能力
- 提高模板组合效率
- 为后续 UI、独立自动化层和实例展开提供统一能力块

### 4.3 `DeviceTemplate`

`DeviceTemplate` 是具体设备类型模板，例如：

- `Light`
- `Switch`
- `TemperatureSensor`
- `WindowCovering`

它表达的是“这一类设备通常有哪些功能组和能力点”，而不是某一台真实设备实例。

### 4.4 `FunctionBinding`

`FunctionBinding` 用于把原始协议中的 `functionCode` 绑定到一个 `CapabilityObjectType`。

它主要解决：

- 原始协议功能组和标准能力对象之间的连接关系
- 一个设备模板如何由多个功能组拼装出来

### 4.5 `TraitRef`

`TraitRef` 表示设备模板中引用的属性类能力点。

典型包括：

- 当前温度
- 开关状态
- 目标亮度
- 电池电量

它用于表达设备“能读什么、能写什么、能上报什么”。

### 4.6 `CommandRef`

`CommandRef` 表示设备模板中引用的动作类能力点。

典型包括：

- 打开
- 关闭
- 停止
- 设置目标位置

它用于表达设备“能执行什么动作”。

### 4.7 `EventRef`

`EventRef` 表示设备模板中引用的事件类能力点。

它用于表达：

- 某个离散事件是否会发生
- 事件是否应被保留为模板层能力描述

当前如果某些协议事件尚未稳定映射，也可以在中间层保留而暂不发射到最终模板。

### 4.8 `BxmlHints`

`BxmlHints` 是模板到实例生成过程中的提示信息。

它不是实例本身，而是帮助生成器回答：

- 该类设备通常安装在什么空间类型中
- 该类设备更适合使用哪些空间关系
- 端点应如何默认展开

`BxmlHints` 的目标是“帮助生成 BXML”，而不是替代 BXML。

## 5. 文件结构说明

`device-semantic-model.xml` 建议保持以下结构层次：

```text
DeviceSemanticModel
  Metadata
  ElementTypes
  CapabilityObjectTypes
  DeviceTemplates
  BxmlCompositionModel
```

约束：

- 不应在 `DeviceTemplate` 中继续固化 `AutomationBindings`
- 不应在 `TraitRef` / `CommandRef` 中继续扩展自动化专用派生字段作为模板层主字段
- 设备模板层只保留“能力定义”与“实例生成提示”

### 5.1 `Metadata`

用于描述当前模型的元信息，例如：

- 模型名称
- 模型版本
- 输入来源
- 生成器信息
- 编译统计信息

`Metadata` 的目标是帮助理解该文件如何生成，而不是承载设备语义本体。

### 5.2 `ElementTypes`

用于集中定义所有可被模板引用的最小能力点。

要求：

- 每个 `ElementType` 应可独立被引用
- 必须保持全局稳定标识
- 尽量和 `element-type-v1.md` 的建模规范一致

### 5.3 `CapabilityObjectTypes`

用于定义可复用的能力组合对象。

要求：

- 应能表达一组相对稳定的功能组合
- 应优先承载高频复用能力
- 不应混入具体实例信息

### 5.4 `DeviceTemplates`

用于定义具体设备模板，是 `DeviceSemanticModel` 的主体。

每个 `DeviceTemplate` 建议至少包含：

- 模板标识
- 模板分类
- 来源对象编码
- `FunctionBindings`
- `Traits`
- `Commands`
- `Events`
- `BxmlHints`
- 说明性 `Notes`

不建议继续包含：

- `AutomationBindings`
- 面向某个自动化引擎的规则脚本片段
- 自动化实例引用

### 5.5 `BxmlCompositionModel`

用于描述模板层到实例层的组合规则。

它的职责是说明：

- BXML 生成依赖哪些输入
- 设备模板如何展开成实例对象
- 能力对象如何参与实例化
- 模板如何和空间模型联动

它不应直接保存具体实例结果。

## 6. 建模原则

### 6.1 模板优先，不混入实例

`device-semantic-model.xml` 中只定义“某类设备具备什么能力”，不定义“某台设备当前是什么状态、在什么位置”。

### 6.2 以 `ElementType` 为最小组成单位

设备模板最终应能追溯到一组明确的 `ElementType`。

换句话说：

- 设备能力不是自由描述文本
- 设备能力不是只靠设备名称推断
- 设备能力必须能拆解到可引用的 element 层

### 6.3 优先复用 `CapabilityObjectType`

当多个设备都共享某一组能力时，应优先沉淀为 `CapabilityObjectType`，再由设备模板进行组合引用。

### 6.4 保留原始协议可追溯性

即使引入了标准语义，也应尽量保留：

- `sourceSpec`
- `sourceObjectCode`
- `functionCode`
- raw element 或 command 引用线索

这样后续才能继续 enrich、纠偏和回溯。

### 6.5 未解决项优先留在中间层

对于映射置信度不足、语义尚不稳定、需要后续确认的内容，应优先保留在：

- `model-spec/object-type-template-data-v1.json`

而不是把不稳定推断直接固化为最终模板定义。

## 7. 与 BXML 的关系

`DeviceSemanticModel` 是 BXML 的模板来源之一，但不是 BXML 本身。

它为 BXML 提供的核心输入包括：

- 可选设备模板集合
- 每类设备的能力点集合
- 端点展开依据
- 设备与空间的默认放置提示
- 模板层可引用的能力对象

基于用户文本生成 BXML 时，通常需要联合以下输入：

- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- 用户的空间文本描述
- 用户的设备清单、型号信息或图片信息

因此，比较合理的流程是：

1. 从用户文本中抽取空间、设备、关系和意图
2. 用空间语义模型补齐空间对象骨架
3. 用设备模板模型为每个设备选择 `DeviceTemplate`
4. 展开成设备实例、端点实例和点位实例
5. 结合 `BxmlHints` 生成默认关系
6. 输出 BXML 初稿

## 8. 与自动化的关系

`DeviceSemanticModel` 可以为自动化生成提供能力边界，但自动化应作为独立层构建，不直接内嵌在设备模板文件中。

模板层主要提供：

- 哪些能力点可被读取
- 哪些能力点可被写入
- 哪些命令可被调用
- 哪些事件或状态适合作为后续自动化候选输入

需要注意：

- “可参与自动化”是模板层能力描述
- “最终生成了哪条自动化规则”是实例层结果
- 自动化实例应在模板层之上生成，而不是混入设备模板本体
- 自动化触发器、条件、动作映射应由独立 `AutomationModel` 或自动化编译层负责
- `device-semantic-model.xml` 只需要输出足够支撑自动化层判定的能力基础信息

## 9. 当前推进建议

围绕 `device-semantic-model.xml`，建议按以下顺序推进：

1. 先稳定模板层职责说明，避免继续混入实例层语义和自动化编排语义
2. 检查 `DeviceTemplate` 是否都能明确追溯到 `ElementType`
3. 检查 `CapabilityObjectType` 是否足够承载高频能力复用
4. 检查 `BxmlHints` 是否足够支撑“从文本到 BXML 初稿”的默认放置逻辑
5. 把实例生成、关系补全、自动化编排放到后续独立步骤处理
6. 后续从 `device-semantic-model.xml` 中逐步移出自动化派生字段和 `AutomationBindings`

## 10. 最小判断标准

一个合格的 `DeviceTemplate`，至少应满足以下判断标准：

- 能说清自己是什么设备类型
- 能说清由哪些功能组组成
- 能列出关键 `TraitRef`
- 能列出关键 `CommandRef`
- 能说明哪些能力是必需的
- 能给出基础的 BXML 放置提示
- 能追溯到原始协议或中间映射层

如果做不到这些，就说明它还不是稳定的模板层定义。

## 11. 总结

`DeviceSemanticModel` 的本质不是“设备实例描述文件”，而是“设备模板能力模型”。

它的核心价值在于：

- 用 `ElementType` 统一定义设备的最小能力点
- 用 `CapabilityObjectType` 复用高频能力组合
- 用 `DeviceTemplate` 表达真实设备类型
- 为 BXML 生成提供模板依据

后续所有实例化、自动化、交互配置的生成，都应建立在这个模板层之上，而不是反过来把实例层信息直接塞回模板层。
