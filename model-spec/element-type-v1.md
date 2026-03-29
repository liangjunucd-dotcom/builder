# ElementType V1 规范

## 1. 定义

`ElementType` 是空间智能模型中的最小能力单元，用于统一表达设备的属性点、测量点、配置点、命令点和事件点。

它优先参考以下来源：

- `aqara-spec/aqara_spec_definition.json`
- `haystack/haystack.csv`

设计目标：

- 统一不同品牌、协议和设备类型的最小能力表达
- 作为 `ObjectType` 的组合基础
- 支撑 XML/BXML 生成、自动化编排、能力映射和 UI 生成
- 保持与原始协议定义可追溯

## 2. 字段定义

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `int` | 是 | 全局唯一整数标识，主键 |
| `code` | `string` | 是 | 全局唯一英文标识，便于查阅、检索、引用和代码生成 |
| `kind` | `string` | 是 | 元素类别：`trait` / `command` / `event` |
| `semanticRole` | `string` | 是 | 语义角色：`property` / `telemetry` / `config` / `action` / `event` |
| `description` | `string` | 是 | 对该 element 的功能、用途、典型使用场景的说明 |
| `dataType` | `string` | 否 | 值类型：`bool` / `int` / `float` / `string` / `enum` / `object` / `array` |
| `inputSpec` | `string` | 否 | 命令入参定义，格式见第 3.8 节 |
| `outputSpec` | `string` | 否 | 命令返回定义，格式见第 3.8 节 |
| `payloadSpec` | `string` | 否 | 事件负载定义，格式见第 3.8 节 |
| `enumSpec` | `string` | 否 | 枚举定义，格式：`{0:unknown,1:off,2:on}` |
| `unit` | `string` | 否 | 单位，如 `℃`、`%`、`ppm`、`Pa` |
| `defaultValue` | `string` | 否 | 默认值 |
| `minValue` | `float` | 否 | 最小值 |
| `maxValue` | `float` | 否 | 最大值 |
| `stepValue` | `float` | 否 | 步长 |
| `accessMode` | `string` | 是 | 访问能力，见第 4 节 |
| `requiredLevel` | `string` | 否 | `required` / `optional` |
| `tags` | `string[]` | 否 | 语义标签，优先采用 Haystack 词汇 |
| `sourceSpec` | `string` | 是 | 来源规范，如 `aqara_spec_definition` |
| `sourcePath` | `string` | 否 | 原始协议路径或点位路径，如 `1.1.85`、`dp.switch` |
| `version` | `string` | 是 | 模型版本，如 `1.0.0` |

## 3. 字段约束

### 3.1 `id`

- 必须为正整数
- 全局唯一
- 一旦发布不可复用、不可重排

### 3.2 `code`

- 必须全局唯一
- 只允许英文字符和数字，不使用下划线
- 统一使用首字母大写驼峰格式，即 `PascalCase`
- 作为模型引用主键，优先级高于显示名称

### 3.3 `name`

`ElementType V1` 不设置 `name` 为标准字段。

原因：

- 当前需求中 `name` 与 `code` 一致，独立价值不足
- 后续若需要展示名称，建议新增 `displayName`

### 3.4 `kind`

- `trait`：表示属性、测量、配置、状态类能力点
- `command`：表示可执行动作
- `event`：表示离散发生的通知类能力点

### 3.5 `semanticRole`

推荐取值：

- `property`：可读写状态属性
- `telemetry`：上报型测量值
- `config`：可配置设定值
- `action`：可调用动作
- `event`：事件型能力

约束：

- `trait` 只允许使用 `property` / `telemetry` / `config`
- `command` 固定对应 `action`
- `event` 固定对应 `event`

### 3.6 `description`

必须明确表达以下内容：

- 该 element 是什么
- 表达什么能力
- 典型被哪些对象使用
- 常用于显示、控制、告警还是自动化

### 3.7 `dataType`

推荐取值：

- `bool`
- `int`
- `float`
- `string`
- `enum`
- `object`
- `array`

约束：

- `trait` 建议必须有 `dataType`
- `command` 默认不使用 `dataType`，优先使用 `inputSpec` / `outputSpec`
- `event` 默认不使用单一 `dataType`，如携带负载，优先使用 `payloadSpec`

### 3.8 `inputSpec` / `outputSpec` / `payloadSpec`

为了在 `V1` 中表达 `command` 和 `event`，引入轻量结构描述字段：

- `inputSpec`：描述命令入参
- `outputSpec`：描述命令返回值
- `payloadSpec`：描述事件负载

格式统一为：

```text
{FieldA:Type,FieldB:Type}
```

示例：

```text
{TargetTemperature:float,TransitionTime:int}
```

```text
{UserId:string,Method:enum}
```

约束：

- `command` 可定义 `inputSpec`，如有返回结果可定义 `outputSpec`
- 无参命令可写 `{}`，也可省略
- `event` 如仅表示“发生过一次”，可不定义 `payloadSpec`
- `event` 如携带上下文数据，必须定义 `payloadSpec`
- `V1` 只支持一层平铺结构，不支持复杂嵌套 schema

### 3.9 `enumSpec`

格式固定为：

```text
{0:unknown,1:off,2:on}
```

约束：

- key 必须为整数 ordinal
- value 必须为稳定英文 tag
- 不直接写中文文案

### 3.10 数值范围字段

`minValue`、`maxValue`、`stepValue` 统一定义为 `float`。

即使逻辑上是整数，也允许写成：

- `1.0`
- `100.0`
- `0.01`

这样可以统一温度、湿度、亮度、气压、风速等数值类点位的表达方式。

### 3.11 `defaultValue`

`defaultValue` 表示该 `ElementType` 在没有实例值、没有用户配置、没有设备上报时的默认语义起点。

典型使用场景：

- 新建对象实例时作为初始化值
- 生成默认 UI 时作为默认展示值
- 配置型 element 在用户未配置时作为兜底值
- 自动化模板生成时作为默认参数
- 承接原始协议规格中的默认值定义

约束：

- `defaultValue` 不是设备实时值
- `defaultValue` 最适合 `property` 和 `config`
- `telemetry` 可选使用，但通常不作为实时依据
- `command` 不应设置 `defaultValue`
- `event` 不应设置 `defaultValue`

### 3.12 `tags`

`tags` 优先采用 `haystack/haystack.csv` 中已有词汇和组合。

约束：

- 全部使用英文小写
- 每个 tag 必须是稳定语义词
- 不写自然语言句子

推荐 tag 维度：

- 介质：`air`、`water`、`elec`
- 物理量：`temp`、`humidity`、`pressure`、`power`
- 功能：`sensor`、`cmd`、`sp`
- 类型：`point`
- 对象：`fan`、`light`、`damper`

示例：

```json
["air", "temp", "sensor", "point"]
```

```json
["fan", "run", "cmd", "point"]
```

## 4. accessMode 规范

`accessMode` 用于表达该 element 的能力契约，不描述底层通信动作。

标准枚举如下：

- `read`
- `write`
- `read_write`
- `reportable`
- `read_reportable`
- `write_reportable`
- `read_write_reportable`
- `invoke`

约束：

- `trait` 类型使用 `read` / `write` / `read_write` / `reportable` / `read_reportable` / `write_reportable` / `read_write_reportable`
- `command` 类型固定使用 `invoke`
- `event` 类型固定使用 `reportable`
- 不再单独设置 `reportable` 布尔字段，避免重复定义

说明：

- `reportable` 比 `notify` 更准确，强调该 element 支持主动上报
- `accessMode` 描述的是能力语义，而不是传输机制

## 5. 映射原则

### 5.1 与 Aqara 原始定义的映射

建议映射关系：

- `id` <- 原始 `id`
- `code` <- 原始 `code`
- `dataType` <- `args.dataType`
- `unit` <- `args.unit`
- `defaultValue` <- `args.default`
- `minValue` <- `args.min`
- `maxValue` <- `args.max`
- `stepValue` <- `args.step`
- `accessMode` <- `args.access` 经过标准映射转换
- `enumSpec` <- `args.enums`
- `inputSpec` / `outputSpec` / `payloadSpec` <- 来自原始命令或事件 payload 定义

### 5.2 与 Haystack 标签的映射

`tags` 不要求完整复制 Haystack 的整行定义，而是复用其成熟词汇体系，用于表达：

- 这是哪类点
- 测什么或控什么
- 属于什么对象、介质或场景

## 6. 示例

### 6.1 `CurrentTemperature`

```json
{
  "id": 32952,
  "code": "CurrentTemperature",
  "kind": "trait",
  "semanticRole": "telemetry",
  "description": "表示对象当前测得的实时温度值，通常由温度传感器周期上报，用于显示、告警判断和自动化条件触发。",
  "dataType": "float",
  "unit": "℃",
  "defaultValue": "26",
  "minValue": -50.0,
  "maxValue": 100.0,
  "stepValue": 0.01,
  "accessMode": "read_reportable",
  "requiredLevel": "required",
  "tags": ["air", "temp", "sensor", "point"],
  "sourceSpec": "aqara_spec_definition",
  "sourcePath": "Temperature.CurrentTemperature",
  "version": "1.0.0"
}
```

### 6.2 `Open`

```json
{
  "id": 40001,
  "code": "Open",
  "kind": "command",
  "semanticRole": "action",
  "description": "表示对对象执行开启动作，常用于阀门、窗帘、门锁或其他可开闭执行器。",
  "inputSpec": "{}",
  "accessMode": "invoke",
  "requiredLevel": "optional",
  "tags": ["cmd", "point"],
  "sourceSpec": "aqara_spec_definition",
  "sourcePath": "ValveControl.Open",
  "version": "1.0.0"
}
```

### 6.3 `DoorOpened`

```json
{
  "id": 90001,
  "code": "DoorOpened",
  "kind": "event",
  "semanticRole": "event",
  "description": "表示门对象发生了一次打开事件，常用于告警、日志和自动化触发。",
  "payloadSpec": "{Source:string,Timestamp:string}",
  "accessMode": "reportable",
  "requiredLevel": "optional",
  "tags": ["door", "event", "point"],
  "sourceSpec": "normalized_model",
  "sourcePath": "Door.Opened",
  "version": "1.0.0"
}
```

## 7. 设计依据

这套规范主要基于以下原则：

- 类型定义先于实例化
- 能力建模优先于设备型号建模
- 语义标签优先采用成熟行业词汇
- 每个标准字段都必须可回溯到原始协议来源

外部参考思想包括：

- Matter 的 `Attribute / Command / Event`
- Google Home 的 `Device Type + Traits`
- Alexa 的 `Capability Interface + Property / Directive`
- Project Haystack 的 `point / sensor / cmd / sp / unit / tags`
- OPC UA 的 `Type Definition / Variable / Method / Reference`

## 8. V1 范围

`ElementType V1` 先冻结以下能力边界：

- 定义最小能力点结构
- 定义访问模式和标签规则
- 支持从 Aqara 规格抽取
- 支持用轻量结构表达 `command` 入参、返回值和 `event` 负载
- 支持后续被 `ObjectType` 组合引用

以下内容暂不纳入 V1：

- 多语言名称
- 复杂嵌套命令 schema
- 复杂事件 payload schema
- 时序采样策略
- 校验表达式
- UI 控件元数据
