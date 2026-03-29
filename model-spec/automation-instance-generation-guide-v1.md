# Automation Instance Generation Guide V1

## 1. 定义

本说明用于指导 AI 基于以下输入，稳定生成一份可被 `aqara-mcp-automation` 复用的自动化实例化数据：

- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- BXML 实例文件
- `aqara-mcp-automation/references/AUTOMATION_CONFIG_GUIDE.md`
- 用户补充的自动化偏好或场景目标

这里的“自动化实例化数据”优先直接对齐 `aqara-mcp-automation` 的 `create_automation.data.config` 结构。

也就是说，输出目标不是重新定义一套自动化 DSL，而是生成一份已经符合当前 MCP 自动化配置规范的 JSON。

## 2. 职责边界

### 2.1 本层负责

- 从 BXML 中读取真实的 `deviceId`、`endpointId`、`functionCode`、`traitCode`
- 基于空间实例、结构实例和安装关系，推导自动化候选
- 生成 `metadata.scope`
- 生成 `automations`
- 形成可直接下发到 `aqara-mcp-automation` 的候选 `config`

### 2.2 本层不负责

- 不重新定义设备模板
- 不在 `device-semantic-model.xml` 中固化自动化字段
- 不替代 BXML 保存空间和设备实例
- 不跳过 `aqara-mcp-automation` 的能力查询流程

## 3. 输出目标

输出 JSON 顶层结构应与 `aqara-mcp-automation` 保持一致：

```json
{
  "metadata": {
    "name": "示例自动化包",
    "description": "从 BXML 推导得到的自动化实例配置",
    "scope": []
  },
  "automations": []
}
```

后续真正调用 MCP 时，应作为：

```json
{
  "data": {
    "config": {
      "...": "..."
    }
  }
}
```

其中 `config` 就是本层生成的自动化实例化数据。

## 4. 输入约束

### 4.1 设备能力必须来自实例层

自动化只能引用 BXML 中已经实例化出来的设备点位。

例如：

- `dev.master_bedroom.motion` 的 `OccupancySensing.Occupancy`
- `dev.master_bedroom.light` 的 `Output.OnOff`
- `dev.master_bedroom.ac` 的 `Output.OnOff`

如果某个设备或点位没有出现在 BXML 中，就不能直接出现在自动化实例数据里。

### 4.2 自动化关系应优先基于同空间推导

最常见的自动化配对规则应优先按以下顺序推导：

1. 同一个 `spaceRef`
2. 明确的 `isInstalledOn` / `isInstalledIn`
3. 结构实例的 `parentRef`
4. 用户显式描述

例如：

- 卧室人体传感器优先联动同卧室灯光
- 卧室窗磁优先联动同卧室空调
- 阳台门磁优先联动与之相邻的客厅灯光

## 5. BXML 到自动化的映射规则

### 5.1 Trigger 来源

常见触发器映射如下：

| BXML 设备点位 | 自动化触发器 |
| --- | --- |
| `MotionSensor` 的 `OccupancySensing.Occupancy` | `property.event` |
| `ContactSensor` 的 `Contact.ContactSensorState` | `property.event` |
| 时间策略 | `time.schedule` |
| 手动场景 | `manual` |

推荐做法：

- 传感器类触发器优先放入 `metadata.scope`
- `starters[].source` 优先通过 `data.ref` 引用 `scope`

### 5.2 Condition 来源

常见条件映射如下：

| 语义条件 | 自动化条件 |
| --- | --- |
| 设备当前开关状态 | `property.state` |
| 时间窗 | `time.between` |
| 多条件组合 | `and` / `or` / `not` |

### 5.3 Action 来源

常见动作映射如下：

| BXML 设备点位 | 自动化动作 |
| --- | --- |
| `Light.Output.OnOff` | `device.trait.write` |
| `AirConditioner.Output.OnOff` | `device.trait.write` |
| 可执行命令点位 | `device.command.call` |
| 等待时间 | `delay` |

## 6. 推荐生成流程

1. 读取 BXML 中的 `SpaceInstances`
2. 读取 BXML 中的 `StructureInstances`
3. 读取 BXML 中的 `DeviceInstances`
4. 为每个设备实例建立能力索引：
   - `deviceId`
   - `spaceRef`
   - `structureRef`
   - `endpointId`
   - `functionCode`
   - `traitCode`
   - `commandCode`
5. 基于 `Relations` 和 `spaceRef` 推导“传感器 -> 目标设备”的候选配对
6. 把触发器来源写入 `metadata.scope`
7. 为每个候选配对生成一条或一组 `automations`
8. 用 `aqara-mcp-automation` 的配置约束校验字段完整性
9. 在真正下发前调用 `list_automation_capabilities` 再做一次能力对齐

## 7. 常用推导策略

### 7.1 人体传感器 -> 同空间灯光

适用条件：

- 房间内同时存在人体传感器与灯光实例

推荐自动化：

- 有人且处于夜间时开灯
- 无人持续一段时间后关灯

### 7.2 门窗传感器 -> 同空间空调

适用条件：

- 房间内同时存在窗磁与空调实例

推荐自动化：

- 开窗时关闭空调

### 7.3 阳台门磁 -> 相邻空间灯光

适用条件：

- 门磁安装在阳台门
- 门的 `parentRef` 位于客厅或与客厅相邻

推荐自动化：

- 晚间打开阳台门时打开客厅灯

## 8. 与 aqara-mcp-automation 的衔接方式

后续真正执行创建自动化时，建议固定采用以下流程：

1. 生成自动化实例候选 JSON
2. 调用 `list_automation_capabilities`
3. 校验候选 JSON 中的 `deviceId`、`endpointId`、`functionCode`、`traitCode`、`CommandCode`
4. 只保留当前环境里确实可用的能力
5. 作为 `create_automation.data.config` 提交

因此，本层输出应被理解为：

- 面向运行时的自动化实例候选
- 与 `aqara-mcp-automation` 配置格式对齐
- 但在真正下发前仍需做一次能力确认

## 9. 当前场景的默认推导假设

针对“三房一厅，两卫，一个大阳台，每个房间都有单独的灯光空调控制，且安装人体和门窗等传感设备”这类文本，默认可推导出：

- 每个卧室和客厅都具备“人体传感器联动灯光”
- 两个卫生间具备“无人关灯”
- 每个带窗的主要居住空间具备“开窗关空调”
- 阳台门可联动客厅灯光

如果用户没有进一步说明，应把这些规则作为默认推荐自动化集合，而不是直接假设所有自动化都必须创建。

### 9.1 当前示例的状态值语义假设

当前示例为了生成可运行的 MCP 自动化 JSON，采用以下默认假设：

- `OccupancySensing.Occupancy = true` 表示检测到有人
- `OccupancySensing.Occupancy = false` 表示持续无人
- `Contact.ContactSensorState = true` 表示门或窗处于打开状态
- `Contact.ContactSensorState = false` 表示门或窗处于关闭状态

如果后续真实设备能力查询返回的状态值语义与此不一致，应在下发前统一改写。

## 10. 生成约束

- 不要引用 BXML 中不存在的设备实例
- 不要跳过 `metadata.scope` 直接随意拼接复杂引用
- 不要把模板层信息误当成实例层 `deviceId`
- 不要生成与 `aqara-mcp-automation` 结构不兼容的自定义字段
- 如果某个传感器状态值语义仍不确定，应在说明文档中写明假设

## 11. 推荐提示词约束

后续如果要让 AI 稳定生成自动化实例数据，建议在提示中固定加入以下约束：

```text
请基于给定的 BXML、device-semantic-model.xml、space-semantic-model.xml 和 aqara-mcp-automation/references/AUTOMATION_CONFIG_GUIDE.md，生成一份自动化实例化 JSON。

要求：
1. 输出结构必须兼容 aqara-mcp-automation 的 create_automation.data.config。
2. 只能使用 BXML 中已经存在的设备实例、endpoint 和点位。
3. 自动化候选优先按同空间配对推导。
4. 生成 metadata.scope、automations，并补充必要的时间条件和状态条件。
5. 如果存在不确定语义，请在说明中明确写出推导假设。
```

## 12. 当前建议

当前仓库建议采用以下固定链路：

1. 用户文本 -> `intent.json`
2. `intent.json` -> BXML
3. BXML -> 自动化实例候选 JSON
4. 自动化实例候选 JSON -> `aqara-mcp-automation` `create_automation`

这样可以保证：

- BXML 专注真实实例
- 自动化层专注编排与实例化
- 最终输出直接复用现有 MCP 自动化能力
