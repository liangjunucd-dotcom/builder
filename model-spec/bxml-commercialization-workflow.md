# BXML Commercialization Workflow

本说明定义如何使用以下两类核心模板输入生成可商业落地的 BXML：

- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`

## 1. 输入职责

### 1.1 设备模型

`device-semantic-model.xml` 现在包含三层：

- `ElementTypes`
  - 原子点位与命令定义。
- `CapabilityObjectTypes`
  - 面向 endpoint/function 的可复用能力对象，适合直接映射到 `ObjectInstance`。
- `DeviceTemplates`
  - 面向产品型号的设备模板，用于把多个 `FunctionBinding` 编译成一个完整设备实例。

### 1.2 空间模型

`model-spec/space-semantic-model.xml` 提供：

- 空间类型：`Space` / `Floor` / `Room` / `Zone`
- 设施和构件类型：`Wall` / `Door` / `Window` / `Cabinet` 等
- 关系类型：`belongsTo` / `isInstalledIn` / `isInstalledOn` / `serves` / `isNear`

## 2. BXML 生成主流程

### 2.1 选择设备模板

按产品型号、对象编码或人工映射选择 `DeviceTemplate`。

优先使用：

- `DeviceTemplate/@id`
- `SourceObjectCode`
- `FunctionBindings/FunctionBinding`

### 2.2 展开 endpoint 对象

对每个 `FunctionBinding`：

- 生成一个 endpoint 内的 `ObjectInstance`
- `functionCode` 使用 `FunctionBinding/@functionCode`
- `objectTypeRef` 使用 `FunctionBinding/@capabilityObjectTypeRef`

### 2.3 展开点位

对每个 `ObjectInstance`：

- 根据 `CapabilityObjectTypes` 找到对应 `TraitRef` / `CommandRef` / `EventRef`
- 再到 `ElementTypes` 获取数据类型、读写能力、单位、默认值、枚举等
- 最终产出 `PointInstance`

### 2.4 放入空间

根据 `DeviceTemplate/BxmlHints`：

- `primarySpaceTypes` 决定优先挂载到 `Room` / `Zone` / `Door` / `Window`
- `relationTypes` 决定实例化哪些关系，如 `isInstalledIn`、`isInstalledOn`、`serves`

## 3. 推荐的 BXML 输出结构

建议一个商业化 BXML 至少包含以下块：

1. `Metadata`
2. `SpaceInstances`
3. `DeviceInstances`
4. `EndpointInstances`
5. `ObjectInstances`
6. `PointInstances`
7. `Relations`
8. `DeliveryProfile`

## 4. 编译约束

- 不允许跳过 `DeviceTemplate -> FunctionBinding -> CapabilityObjectType -> ElementType` 直接拼点位。
- 不允许只生成设备清单而不建立空间关系，商业场景下需要支持房间级与分区级自动化。
- 对 `reviewState="needs_review"` 或 placeholder 元素，允许进入 BXML，但必须打上待确认标记。

## 5. 商业化最小交付要求

一份可交付 BXML 至少需要满足：

- 每台设备可定位到 `Room` 或 `Zone`
- 每个 endpoint 可追溯到一个 `CapabilityObjectType`
- 支持安装关系和服务关系
- 支持增量更新，不因新增设备而重写整份模型

## 6. 当前模型可直接支撑的能力

当前生成后的 `device-semantic-model.xml` 已经可以直接支撑：

- 产品模板选型
- endpoint/function 展开
- point 元数据补全
- 空间挂载提示
- 缺失能力对象的自动补齐

## 7. 下一阶段建议

如果要继续增强商业落地能力，优先补以下内容：

- 为 placeholder `ElementType` 补齐 `dataType`、`permission`、`enumSpec`
- 补 `DeviceTemplate` 到真实产品型号的映射表
- 定义正式 BXML schema
- 增加交付包中的 UI 配置和安装向导描述
