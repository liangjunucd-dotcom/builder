# BXML Generation Guide V1

## 1. 目的

本说明用于指导 AI 基于以下输入，稳定生成一份可推演、可持续修订的 BXML：

- 用户的自然语言空间描述
- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- `model-spec/element-type-v1.md`
- `model-spec/element-type-standard-catalog-v1.md`
- `model-spec/object-type-template-data-v1.json`
- `model-spec/bxml-intent-extraction-v1.md`

目标不是一步到位生成“永远正确”的最终交付文件，而是先生成：

- 一份中间抽取 JSON
- 结构完整的 BXML 初稿
- 带有推断依据和待确认项的实例文件
- 可持续迭代的实例化结果

## 2. 输入职责

### 2.1 用户自然语言描述

用户文本负责提供：

- 户型规模
- 空间类型和数量
- 设备需求
- 控制需求
- 传感需求
- 特殊区域需求

例如：

```text
帮我构建一个三房一厅，2卫，一个大阳台，每个房间都有单独的灯光空调控制，且安装人体和门窗等传感设备
```

### 2.2 `device-semantic-model.xml`

负责提供：

- 设备模板 `DeviceTemplate`
- 设备功能组 `FunctionBindings`
- 设备能力点 `TraitRef` / `CommandRef` / `EventRef`
- 模板到空间实例的 `BxmlHints`

它回答的是：

- 某种设备有哪些能力
- 这些能力由哪些 element 组成

### 2.3 `space-semantic-model.xml`

负责提供：

- `Space` / `Floor` / `Room` / `Zone`
- `Door` / `Window` / `Wall` 等结构对象
- `belongsTo` / `isInstalledIn` / `isInstalledOn` / `serves` 等关系类型

它回答的是：

- 空间实例可以长成什么样
- 设备和空间之间允许建立哪些关系

### 2.4 `ElementType` 相关文档

负责提供：

- 点位和命令的最小语义定义
- 数据类型、单位、访问能力、枚举等补充信息

它用于指导：

- `PointInstance` 该带哪些字段
- 哪些点位适合作为实例化输出中的核心点

## 3. 推荐生成流程

推荐采用两段式流程：

1. 用户文本 -> `BxmlIntentExtraction` JSON
2. `BxmlIntentExtraction` JSON -> BXML

这样做比直接从文本生成 BXML 更稳定，也更便于校验和修订。

### 3.1 第一步：从文本抽取空间骨架

先把用户文本转成基础空间图。

本项目推荐优先抽取：

- 住宅主体：`Space`
- 楼层：`Floor`
- 房间：`Room`
- 特殊功能区：`Zone`
- 结构对象：`Door` / `Window`

例如：

- `三房一厅` -> `主卧`、`次卧一`、`次卧二`、`客厅`
- `2卫` -> `卫生间一`、`卫生间二`
- `一个大阳台` -> `大阳台`

### 3.2 第二步：从文本抽取设备需求

把用户描述拆成“设备需求规则”。

对于示例文本，可提炼为：

- 每个主要房间需要独立灯光控制
- 每个主要房间需要独立空调控制
- 需要人体传感器
- 需要门窗传感设备

### 3.3 第三步：把需求映射到设备模板

把自然语言需求映射到 `DeviceTemplate`：

| 用户需求 | 推荐模板 |
| --- | --- |
| 灯光控制 | `Light` |
| 空调控制 | `AirConditioner` |
| 人体传感 | `MotionSensor` |
| 门窗传感 | `ContactSensor` |
| 窗帘控制 | `WindowCovering` |

约束：

- 只能选择 `device-semantic-model.xml` 中已存在的模板
- 不要绕过 `DeviceTemplate` 直接手写点位

### 3.4 第四步：展开实例对象

每个选中的 `DeviceTemplate` 应按以下链路展开：

1. `DeviceTemplate`
2. `FunctionBindings`
3. `ObjectInstance`
4. `PointInstance`

例如 `Light`：

- `Output`
- `LevelControl`

例如 `AirConditioner`：

- `Output`
- `HeaterCooler`
- `FanControl`

### 3.5 第五步：建立空间与设备关系

按 `BxmlHints` 和文本语义建立：

- `belongsTo`
- `isInstalledIn`
- `isInstalledOn`
- `serves`

推荐规则：

- 房间灯、空调、人体传感器 -> `isInstalledIn Room`
- 门磁、窗磁 -> `isInstalledOn Door/Window`
- 阳台设备 -> `isInstalledIn Zone`

### 3.6 第六步：附加推断说明与待确认项

自然语言生成 BXML 时，必须允许推断，但每个关键推断都应可回溯。

因此建议在 BXML 中补：

- `Notes`
- `ValidationSummary`
- `PendingConfirmations`

### 3.7 第七步：先输出中间抽取层

在真正生成 BXML 之前，建议先输出一份：

- `BxmlIntentExtraction` JSON

它至少应包含：

- `spaceSkeleton`
- `structureSkeleton`
- `deviceRequirements`
- `deviceInstantiationPlan`
- `relationsPlan`
- `pendingConfirmations`

当前对应规范见：

- `model-spec/bxml-intent-extraction-v1.md`

## 4. 默认推断规则

当用户文本不够细时，推荐按以下默认规则补齐。

### 4.1 户型规则

- `三房一厅` 默认拆成 `主卧`、`次卧一`、`次卧二`、`客厅`
- `2卫` 默认拆成 `卫生间一`、`卫生间二`
- `大阳台` 优先建成 `Zone`

### 4.2 灯光规则

- 每个房间和主要区域至少生成一盏主灯
- 卫生间和阳台默认也生成照明实例

### 4.3 空调规则

- 默认给卧室和客厅生成独立空调实例
- 卫生间和阳台不默认生成空调，除非用户明确提出

### 4.4 人体传感规则

- 每个房间和主要区域至少生成一个 `MotionSensor`

### 4.5 门窗传感规则

最小生成集推荐为：

- 入户门 1 个门磁
- 每个主要居住空间至少 1 个外窗磁
- 客厅通往阳台的门至少 1 个门磁

如果用户后续补充了更多门窗信息，再扩展实例数量。

## 5. 输出结构建议

一份面向当前项目的 BXML 建议至少包含：

1. `Metadata`
2. `InferenceSummary`
3. `SpaceInstances`
4. `StructureInstances`
5. `DeviceInstances`
6. `Relations`
7. `ValidationSummary`
8. `PendingConfirmations`

## 6. 设备实例展开建议

为了让输出既完整又可控，建议按“核心运行点优先”展开 `PointInstance`。

### 6.1 `Light`

核心建议保留：

- `OnOff`
- `CurrentLevel`
- `On`
- `Off`

### 6.2 `AirConditioner`

核心建议保留：

- `OnOff`
- `HeaterCoolerMode`
- `CoolingTemperature`
- `HeatingTemperature`
- `CurrentTemperature`
- `FanMode`

说明：

- 如果模板中的某些功能组并非当前场景必需，可在实例层做裁剪
- 但裁剪原因必须在 `Notes` 中说明

### 6.3 `MotionSensor`

核心建议保留：

- `Occupancy`
- `OccupancySensorType`

### 6.4 `ContactSensor`

核心建议保留：

- `ContactSensorState`

## 7. 验证清单

生成后至少验证以下内容：

### 7.1 空间完整性

- 是否有 `Space`
- 是否有 `Floor`
- 房间数是否和文本描述一致
- 特殊区域是否已生成

### 7.2 模板合法性

- 每个 `DeviceInstance` 是否引用了有效的 `DeviceTemplate`
- 每个 `ObjectInstance` 是否引用了有效的 `FunctionBinding`
- 每个 `PointInstance` 是否能追溯到模板中的 `TraitRef` / `CommandRef`

### 7.3 关系完整性

- 每个设备是否安装到一个空间或结构对象
- 每个门窗传感器是否挂到实际 `Door` / `Window`
- 每个空间实例是否纳入 `belongsTo` 层级

### 7.4 用户需求覆盖度

- 每个主要房间是否有独立灯光控制
- 每个主要房间是否有独立空调控制
- 是否存在人体传感器
- 是否存在门窗传感器

## 8. 示例文件

当前仓库已给出一份参考示例：

- `device-instance/demo-three-bedroom-home.intent.json`
- `device-instance/demo-three-bedroom-home.bxml.xml`

它展示了如何将：

- `三房一厅，2卫，一个大阳台`
- `每个房间都有单独的灯光空调控制`
- `安装人体和门窗等传感设备`

转成一份可继续修订的 BXML 初稿。

## 9. 推荐输出策略

当后续 AI 根据用户要求生成 BXML 时，建议始终遵循以下策略：

1. 先输出空间骨架
2. 再输出设备实例
3. 再输出设备与空间关系
4. 最后输出验证结果和待确认项

这样做的好处是：

- 用户能快速看懂生成结果
- 后续能增量修改，而不是整份重写
- 更适合持续 enrich 和后续自动化层编排

## 10. 生成指令模板

后续如果要让 AI 稳定生成 BXML，建议在提示中固定加入以下约束：

```text
请基于用户的空间文本描述，结合 device-semantic-model.xml、space-semantic-model.xml、element-type-v1.md、element-type-standard-catalog-v1.md 和 object-type-template-data-v1.json，生成一份 BXML 初稿。

要求：
1. 必须先抽取空间骨架，再抽取设备需求，再映射 DeviceTemplate。
2. 不允许绕过 DeviceTemplate 直接手写点位。
3. 设备实例必须能追溯到 FunctionBindings、TraitRef、CommandRef。
4. 对不确定的推断必须写入 PendingConfirmations。
5. 优先生成可运行的最小闭环实例，不追求一次性补齐所有细节。
```

## 11. 总结

后续只要同时提供：

- 本指导文档
- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- `model-spec/element-type-v1.md`
- `model-spec/element-type-standard-catalog-v1.md`
- `model-spec/object-type-template-data-v1.json`

就已经具备了从用户自然语言要求生成 BXML 初稿的基础条件。

如果用户再补充：

- 设备型号
- 具体门窗数量
- 户型图
- 安装偏好

则可以进一步把 BXML 从“推断草稿”提升到“交付级实例文件”。
