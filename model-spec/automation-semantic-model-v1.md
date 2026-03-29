# AutomationSemanticModel V1 规范

## 1. 定义

`AutomationSemanticModel` 是空间智能系统中的自动化编排层模型，用于统一定义“如何基于设备实例、空间实例和关系实例，生成可执行的自动化规则”。

它不负责定义设备模板本身，而是消费模板层和实例层的结果，进一步构建：

- 自动化候选能力
- 触发器
- 条件
- 动作
- 自动化实例

它优先参考以下来源：

- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- `BXML`
- `aqara-mcp-automation/references/AUTOMATION_CONFIG_GUIDE.md`

设计目标：

- 将自动化从设备模板层中独立出来
- 基于实例化后的设备和空间关系生成自动化候选
- 统一触发器、条件、动作的编排语义
- 为后续 MCP 自动化下发或其他自动化引擎输出提供稳定中间层

## 2. 模型定位

`AutomationSemanticModel` 的定位是“自动化规则编排层”，位于设备模板层和终端自动化执行层之间。

可以把它理解为：

- `DeviceSemanticModel`：定义设备模板和能力边界
- `BXML`：定义真实空间中的实例对象和关系
- `AutomationSemanticModel`：定义基于这些实例如何形成自动化规则
- `MCP Automation Config`：面向实际接口的下发结构

因此，`AutomationSemanticModel` 回答的问题是：

- 哪些设备实例能力可以作为自动化触发器
- 哪些设备实例能力可以作为条件
- 哪些设备实例能力或命令可以作为动作
- 哪些空间关系可以帮助自动化推荐和编排
- 某条自动化实例最终应如何输出到具体引擎

它不直接回答的问题是：

- 某类设备模板本身由哪些 Element 构成
- 某个能力点的原始协议定义是什么
- 空间语义对象类型本身如何定义

## 3. 职责边界

### 3.1 `AutomationSemanticModel` 负责的内容

- 定义自动化层输入来源
- 定义触发器、条件、动作的候选构造规则
- 定义实例层对象到自动化数据源的映射方式
- 定义自动化模板或自动化实例结构
- 定义面向具体自动化引擎的输出规则

### 3.2 `AutomationSemanticModel` 不负责的内容

- 不重新定义设备模板
- 不重新定义空间对象类型
- 不替代 BXML 保存设备实例和空间实例
- 不替代原始协议定义文件

## 4. 核心术语

### 4.1 自动化候选能力

指从设备实例中筛选出的、可用于自动化编排的能力点或命令。

来源通常包括：

- 设备实例上的 `trait`
- 设备实例上的 `command`
- 空间关系带来的上下文语义

### 4.2 Trigger

`Trigger` 表示自动化启动条件。

常见来源：

- 某个设备状态变化
- 某个传感器值达到阈值
- 某个时间计划到达
- 某个场景或手动动作触发

### 4.3 Condition

`Condition` 表示自动化执行前的附加判断。

它不主动触发自动化，而是在自动化已经被触发后，决定是否继续执行动作。

### 4.4 Action

`Action` 表示自动化执行的动作。

常见形式：

- 写入某个设备实例的属性
- 调用某个设备实例的命令
- 执行延时
- 串联多个动作步骤

### 4.5 AutomationInstance

`AutomationInstance` 表示一条实例化后的自动化规则。

它应建立在真实的空间实例、设备实例和关系实例之上，而不是建立在抽象设备模板之上。

## 5. 输入输出关系

### 5.1 输入

`AutomationSemanticModel` 的主要输入包括：

- `device-semantic-model.xml`
  提供设备模板能力边界
- `model-spec/space-semantic-model.xml`
  提供空间对象类型和关系语义
- `BXML`
  提供真实设备实例、空间实例和实例关系
- 用户意图描述
  提供自动化目标和偏好

### 5.2 输出

`AutomationSemanticModel` 的输出可以包括：

- 自动化模板候选
- 自动化实例中间结构
- 面向 `aqara-mcp-automation` 的 `config`
- 面向其他执行引擎的规则文件

## 6. 与 DeviceSemanticModel 的关系

`DeviceSemanticModel` 负责定义：

- 设备类型
- 功能组
- `TraitRef`
- `CommandRef`
- BXML 默认实例生成提示

`AutomationSemanticModel` 负责在此基础上进一步回答：

- 哪些实例点位能当触发器
- 哪些实例点位能当条件
- 哪些实例点位或命令能当动作
- 如何生成自动化实例

换句话说：

- 设备模板层负责“设备有什么能力”
- 自动化层负责“这些能力如何被组合成自动化”

## 7. 建模原则

### 7.1 自动化必须建立在实例层之上

自动化编排应优先面向设备实例，而不是设备模板。

原因：

- 自动化需要真实 `deviceId`
- 自动化需要真实 `endpointId`
- 自动化需要真实空间位置和关系

### 7.2 不把自动化编排反向塞回设备模板层

设备模板层只保留稳定能力定义。

自动化特有的字段，例如：

- 触发器适配
- 条件适配
- 动作适配
- 自动化引擎映射

都应留在自动化层处理。

### 7.3 优先复用模板层能力，不重复造字段

自动化层应尽量直接消费：

- `TraitRef`
- `CommandRef`
- `FunctionBinding`
- `BxmlHints`

避免在自动化层重复定义一套设备能力清单。

### 7.4 自动化引擎输出是最后一步

自动化层应先形成独立中间语义结构，再生成：

- MCP `create_automation` 配置
- 其他平台规则格式

避免直接从用户输入跳到接口 JSON。

## 8. 推荐工作流

1. 读取 `device-semantic-model.xml`
2. 读取 `BXML`
3. 基于设备实例和空间关系生成自动化候选能力
4. 结合用户意图生成 `Trigger` / `Condition` / `Action`
5. 形成 `AutomationInstance`
6. 最后编译成目标自动化引擎的输出结构

## 9. 当前落地建议

当前仓库建议采用如下分层：

- `device-semantic-model.xml`
  只保留设备模板能力定义
- `BXML`
  只保留空间和设备实例结果
- `AutomationSemanticModel`
  单独负责自动化候选、规则编排和自动化实例输出

这样可以保证：

- 设备模板层更稳定
- BXML 更聚焦实例化
- 自动化层可以独立演进
