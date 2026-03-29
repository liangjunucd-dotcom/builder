# ElementType 与 Matter、BACnet、Zigbee 的对应关系说明

## 1. 目的

本文用于说明 `ElementType` 作为统一能力抽象层，与 `Matter`、`BACnet`、`Zigbee` 三套标准之间的对应关系，以及当前 `ElementType V1` 设计的合理性边界。

参考来源：

- `matter-spec/Matter-1.5-Application-Cluster-Specification.pdf`
- `matter-spec/Matter-1.5-Device-Library-Specification.pdf`
- `zigbee-spec/Zigbee-Cluster-Library-1.pdf`
- `bacnet-spec/ASHRAE-D-86445.pdf`

## 2. 基本判断

`ElementType` 不是任何单一协议的原生定义，而是三套标准共同存在的“最小能力元素层”的归一化表达。

它位于以下层级之间：

- `ObjectType` 之下
- 原始协议点位之上

因此，`ElementType` 的作用不是替代协议，而是统一表达协议中反复出现的：

- 状态或属性
- 测量值
- 配置值
- 可调用命令
- 可上报事件

## 3. 与 Matter 的对应关系

### 3.1 Matter 的原生结构

Matter 的主要层级是：

- `Device Type`
- `Endpoint`
- `Cluster`
- `Attribute`
- `Command`
- `Event`

在设备库中，还明确存在：

- `Cluster Requirements`
- `Element Requirements`

这说明在 `Matter` 内部，设备类型的组成已经被拆解到“元素要求”这一层。

### 3.2 对应关系

| ElementType | Matter 对应 |
| --- | --- |
| `kind=trait` | `Attribute` |
| `kind=command` | `Command` |
| `kind=event` | `Event` |
| `semanticRole=property` | 可读写状态类 `Attribute` |
| `semanticRole=telemetry` | 上报型或订阅型测量 `Attribute` |
| `semanticRole=config` | 配置型 `Attribute` |
| `accessMode=invoke` | `Invoke` 交互 |
| `accessMode=*reportable` | `Report Transactions` / subscriptions |
| `inputSpec/outputSpec` | Command payload / response payload |
| `payloadSpec` | Event fields |

### 3.3 结论

`Matter` 明确区分 `Attribute / Command / Event`，因此 `ElementType V1` 中把 `event` 提升为和 `trait`、`command` 并列的 `kind` 是合理的。

## 4. 与 Zigbee 的对应关系

### 4.1 Zigbee 的原生结构

Zigbee ZCL 的主要层级是：

- `Device`
- `Cluster`
- `Attribute`
- `Command`
- `Reporting`

ZCL 中大量命令 payload 字段直接和同名 attribute 对应，说明“命令”和“属性”虽然不同，但它们共享一组最小语义字段。

### 4.2 对应关系

| ElementType | Zigbee 对应 |
| --- | --- |
| `kind=trait` | `Attribute` |
| `kind=command` | `Command` |
| `kind=event` | `Reporting` 或通知类命令 |
| `dataType` | ZCL attribute data type |
| `enumSpec` | enum / bitmap 等离散值映射 |
| `unit` | 属性定义中的工程单位 |
| `minValue/maxValue/stepValue` | 属性值范围或步长约束 |
| `inputSpec/outputSpec` | Command payload format |
| `payloadSpec` | Notification payload format |
| `accessMode=reportable` | Reporting capability |

### 4.3 结论

对 Zigbee 而言，`ElementType` 把 `Attribute`、`Command`、`Reporting` 拉平到同一能力层，是合理的统一抽象。

## 5. 与 BACnet 的对应关系

### 5.1 BACnet 的原生结构

BACnet 的主要层级是：

- `Object Type`
- `Property`
- `Service`
- `COV`
- `Event`

BACnet 本身把控制设备建模为“对象的集合”，对象下再定义大量属性和服务。

### 5.2 对应关系

| ElementType | BACnet 对应 |
| --- | --- |
| `kind=trait` | `Property` |
| `kind=command` | `Service` 写入或调用动作 |
| `kind=event` | `Event Notification` / `COV Notification` |
| `semanticRole=property` | `Present_Value`、`Status_Flags` 等属性 |
| `semanticRole=telemetry` | 可读测量属性 |
| `semanticRole=config` | 可配置属性、阈值、默认值 |
| `accessMode=read/write` | `ReadProperty` / `WriteProperty` |
| `accessMode=reportable` | `SubscribeCOV` / `COV Notification` |
| `unit` | `Units` |
| `minValue/maxValue` | `Min_Pres_Value` / `Max_Pres_Value` |
| `stepValue` | `Resolution` |

### 5.3 结论

BACnet 虽然不像 Matter/Zigbee 那样直接写成 `Attribute / Command / Event`，但其 `Property / Service / COV / Event` 在统一建模时完全可以映射到 `ElementType`。

## 6. 为什么当前 ElementType 是合理的

### 6.1 它抓住了三套标准的公共最小结构

三套标准虽然术语不同，但都有以下稳定结构：

- 一个较大的对象或设备定义层
- 一个更细的能力点层
- 数据类型与单位
- 读写或调用方式
- 上报或通知机制

`ElementType` 正是在抽取这个公共子集。

### 6.2 它适合作为空间智能系统的协议中间层

你的系统不是单纯做协议透传，而是要做：

- 空间对象组合
- 自动化推理
- 多协议归一
- 可视化生成

因此必须有一个协议之上的中间层。`ElementType` 正好承担这个角色。

### 6.3 它和 ObjectType 分层清晰

- `ElementType` 回答“最小能力是什么”
- `ObjectType` 回答“一个对象由哪些能力组成”

这与 `Matter Device Type + Cluster Element`、`BACnet Object Type + Property` 的建模方向一致。

## 7. 为什么 command 和 event 需要单独处理

### 7.1 command 不能只当作普通 trait

原因：

- command 有独立调用语义
- command 常带输入参数
- command 可能带返回结果
- command 的访问方式是 `invoke`，而不是 `read/write`

因此 `ElementType V1` 增加：

- `kind=command`
- `inputSpec`
- `outputSpec`
- `accessMode=invoke`

这是必要的，不然命令只能被误降级成“可写属性”。

### 7.2 event 不能继续混在 trait 里

原因：

- event 表达“发生过一次”，不是当前状态值
- event 可能只携带一次性上下文
- event 一般天然是 `reportable`
- Matter、BACnet、Zigbee 都把 event/notification 和属性分开

因此 `ElementType V1` 中将 `event` 提升为独立 `kind` 是合理的。

## 8. 当前 V1 的边界

### 8.1 已解决的问题

- 可以统一表达属性、测量、配置、命令、事件
- 可以表达基本数据类型、单位、范围、枚举
- 可以表达命令入参和事件负载的轻量结构
- 可以保留协议来源和原始路径

### 8.2 仍然保留的简化

`V1` 仍然是中间层简化模型，不等同于协议原生 schema，当前仍有以下简化：

- `inputSpec` / `outputSpec` / `payloadSpec` 只支持一层平铺结构
- 不表达复杂嵌套对象、数组成员约束、条件字段
- 不表达协议级事务状态、确认机制、订阅生命周期
- 不表达完整事件算法和告警路由

这些能力可以在后续 `V2` 或协议适配层补齐。

## 9. 最终结论

当前 `ElementType V1` 是合理的，因为它并没有试图替代 Matter、BACnet、Zigbee，而是在这三套标准之上抽取了共同稳定存在的“最小能力元素层”。

这个抽象层足以支撑：

- 设备能力统一表达
- `ObjectType` 组合建模
- XML/BXML 生成
- 语义标签增强
- 空间智能 agent 的能力理解与编排

同时，通过把 `command` 和 `event` 从普通 `trait` 中分离出来，`V1` 的表达已经比最初版本更接近协议真实结构，也更适合后续扩展。
