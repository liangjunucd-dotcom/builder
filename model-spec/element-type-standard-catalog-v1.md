# ElementType 高频标准库 V1

## 1. 目的

本文基于 `model-spec/element-type-v1.md`，沉淀一组可复用的高频标准 `ElementType`，优先覆盖家庭空间智能与楼宇空间智能中的常见能力点。

本标准库用于：

- 作为 `ObjectType` 组合建模的基础素材库
- 作为设备协议映射时的目标能力库
- 作为 XML/BXML 生成时的标准字段来源
- 作为 UI、自动化、知识推理的统一能力词表

## 2. 使用约定

除非单条记录另有说明，本标准库默认采用以下公共约定：

- `sourceSpec`: `standard_element_library_v1`
- `version`: `1.0.0`
- `code`: 使用 `PascalCase`
- `kind`: `trait` / `command` / `event`
- `semanticRole`: `property` / `telemetry` / `config` / `action` / `event`
- `accessMode`: 采用 `ElementType V1` 中定义的标准枚举

说明：

- `command` 默认不设置 `defaultValue`
- `event` 默认不设置 `defaultValue`
- `event` 的 `payloadSpec` 在后续版本扩展，一期默认不定义
- `command` 如有参数，使用 `inputSpec`

本文共沉淀 `92` 个高频标准 `ElementType`。

## 3. 环境感知类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10001` | `CurrentTemperature` | `trait` | `telemetry` | `float` | `read_reportable` | `℃` | `air,temp,sensor,point` | 当前实时温度 |
| `10002` | `TargetTemperature` | `trait` | `config` | `float` | `read_write` | `℃` | `air,temp,sp,point` | 目标设定温度 |
| `10003` | `CurrentHumidity` | `trait` | `telemetry` | `float` | `read_reportable` | `%` | `air,humidity,sensor,point` | 当前实时湿度 |
| `10004` | `TargetHumidity` | `trait` | `config` | `float` | `read_write` | `%` | `air,humidity,sp,point` | 目标设定湿度 |
| `10005` | `AirPressure` | `trait` | `telemetry` | `float` | `read_reportable` | `Pa` | `air,pressure,sensor,point` | 当前气压值 |
| `10006` | `CO2Density` | `trait` | `telemetry` | `float` | `read_reportable` | `ppm` | `air,co2,concentration,sensor,point` | 二氧化碳浓度 |
| `10007` | `TVOCDensity` | `trait` | `telemetry` | `float` | `read_reportable` | `ppb` | `air,tvoc,concentration,sensor,point` | TVOC 浓度 |
| `10008` | `PM25Density` | `trait` | `telemetry` | `float` | `read_reportable` | `ug/m3` | `air,pm25,concentration,sensor,point` | PM2.5 浓度 |
| `10009` | `PM10Density` | `trait` | `telemetry` | `float` | `read_reportable` | `ug/m3` | `air,pm10,concentration,sensor,point` | PM10 浓度 |
| `10010` | `IlluminanceLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `lux` | `light,illuminance,sensor,point` | 环境照度值 |
| `10011` | `NoiseLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `dB` | `sound,sensor,point` | 环境噪声值 |
| `10012` | `WindSpeed` | `trait` | `telemetry` | `float` | `read_reportable` | `m/s` | `air,velocity,sensor,point` | 风速值 |

## 4. 气候与暖通控制类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10101` | `HvacMode` | `trait` | `config` | `enum {0:off,1:auto,2:cool,3:heat,4:dry,5:fan}` | `read_write` |  | `hvacMode,sp,point` | HVAC 工作模式 |
| `10102` | `FanMode` | `trait` | `config` | `enum {0:auto,1:low,2:medium,3:high}` | `read_write` |  | `fan,mode,sp,point` | 风机模式 |
| `10103` | `FanSpeedLevel` | `trait` | `config` | `float` | `read_write` | `%` | `fan,speed,sp,point` | 风速档位或百分比 |
| `10104` | `SwingMode` | `trait` | `config` | `enum {0:off,1:vertical,2:horizontal,3:both}` | `read_write` |  | `air,swing,sp,point` | 摆风模式 |
| `10105` | `HeatingEnabled` | `trait` | `property` | `bool` | `read_write` |  | `heat,enable,point` | 是否启用制热 |
| `10106` | `CoolingEnabled` | `trait` | `property` | `bool` | `read_write` |  | `cool,enable,point` | 是否启用制冷 |
| `10107` | `DefrostEnabled` | `trait` | `property` | `bool` | `read_write` |  | `defrost,enable,point` | 是否启用除霜 |
| `10108` | `ValvePosition` | `trait` | `property` | `float` | `read_write_reportable` | `%` | `valve,position,point` | 阀门当前位置 |
| `10109` | `CurrentAirQualityLevel` | `trait` | `telemetry` | `enum {0:unknown,1:excellent,2:good,3:fair,4:poor}` | `read_reportable` |  | `air,quality,sensor,point` | 空气质量等级 |
| `10110` | `FilterLife` | `trait` | `telemetry` | `float` | `read_reportable` | `%` | `filter,life,sensor,point` | 滤芯剩余寿命 |
| `10111` | `FilterReplacementNeeded` | `event` | `event` | `-` | `reportable` |  | `filter,event,point` | 滤芯更换提醒事件 |
| `10112` | `FreshAirEnabled` | `trait` | `property` | `bool` | `read_write` |  | `air,enable,point` | 是否启用新风功能 |

## 5. 照明与遮阳类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10201` | `PowerSwitch` | `trait` | `property` | `bool` | `read_write_reportable` |  | `light,run,cmd,point` | 开关状态 |
| `10202` | `BrightnessLevel` | `trait` | `config` | `float` | `read_write_reportable` | `%` | `light,level,sp,point` | 亮度值 |
| `10203` | `ColorTemperature` | `trait` | `config` | `float` | `read_write_reportable` | `K` | `light,temp,sp,point` | 色温值 |
| `10204` | `Hue` | `trait` | `config` | `float` | `read_write_reportable` | `deg` | `light,hue,sp,point` | 色相值 |
| `10205` | `Saturation` | `trait` | `config` | `float` | `read_write_reportable` | `%` | `light,saturation,sp,point` | 饱和度 |
| `10206` | `ColorMode` | `trait` | `property` | `enum {0:white,1:ct,2:xy,3:hsv,4:effect}` | `read_write` |  | `light,mode,point` | 当前颜色模式 |
| `10207` | `SceneSelector` | `trait` | `config` | `enum {0:none,1:reading,2:movie,3:sleep,4:party}` | `read_write` |  | `scene,sp,point` | 场景选择 |
| `10208` | `EffectSelector` | `trait` | `config` | `enum {0:none,1:breath,2:rainbow,3:flash,4:natural}` | `read_write` |  | `light,effect,sp,point` | 灯效选择 |
| `10209` | `TransitionTime` | `trait` | `config` | `float` | `read_write` | `s` | `light,transition,sp,point` | 过渡时间 |
| `10210` | `CurtainPosition` | `trait` | `property` | `float` | `read_write_reportable` | `%` | `shade,position,point` | 窗帘位置 |
| `10211` | `CurtainTiltAngle` | `trait` | `property` | `float` | `read_write_reportable` | `deg` | `shade,angle,point` | 叶片角度 |
| `10212` | `ShadeMode` | `trait` | `config` | `enum {0:manual,1:auto,2:sunTracking}` | `read_write` |  | `shade,mode,sp,point` | 遮阳模式 |

## 6. 存在感知与安防类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10301` | `OccupancyState` | `trait` | `telemetry` | `bool` | `read_reportable` |  | `occupancy,sensor,point` | 占用状态 |
| `10302` | `PresenceState` | `trait` | `telemetry` | `bool` | `read_reportable` |  | `presence,sensor,point` | 存在状态 |
| `10303` | `PresenceProbability` | `trait` | `telemetry` | `float` | `read_reportable` | `%` | `presence,sensor,point` | 存在概率 |
| `10304` | `MotionState` | `trait` | `telemetry` | `bool` | `read_reportable` |  | `motion,sensor,point` | 运动检测状态 |
| `10305` | `ContactState` | `trait` | `telemetry` | `enum {0:closed,1:open}` | `read_reportable` |  | `contact,sensor,point` | 门窗磁接触状态 |
| `10306` | `LockState` | `trait` | `property` | `enum {0:unlocked,1:locked,2:jammed,3:unknown}` | `read_reportable` |  | `lock,sensor,point` | 锁状态 |
| `10307` | `TamperState` | `event` | `event` | `-` | `reportable` |  | `tamper,event,point` | 拆卸防护事件 |
| `10308` | `SmokeAlarmState` | `event` | `event` | `-` | `reportable` |  | `smoke,alarm,event,point` | 烟雾告警事件 |
| `10309` | `GasAlarmState` | `event` | `event` | `-` | `reportable` |  | `gas,alarm,event,point` | 燃气告警事件 |
| `10310` | `WaterLeakState` | `event` | `event` | `-` | `reportable` |  | `water,leak,event,point` | 漏水告警事件 |
| `10311` | `SosState` | `event` | `event` | `-` | `reportable` |  | `alarm,event,point` | 紧急求助事件 |
| `10312` | `ArmMode` | `trait` | `config` | `enum {0:disarmed,1:home,2:away,3:sleep}` | `read_write` |  | `alarm,mode,sp,point` | 布撤防模式 |

## 7. 电力、能耗与设备状态类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10401` | `VoltageLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `V` | `elec,volt,sensor,point` | 电压值 |
| `10402` | `CurrentLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `A` | `elec,current,sensor,point` | 电流值 |
| `10403` | `PowerConsumption` | `trait` | `telemetry` | `float` | `read_reportable` | `W` | `elec,power,sensor,point` | 实时功率 |
| `10404` | `EnergyConsumption` | `trait` | `telemetry` | `float` | `read_reportable` | `kWh` | `energy,sensor,point` | 累计能耗 |
| `10405` | `PowerFactor` | `trait` | `telemetry` | `float` | `read_reportable` |  | `elec,pf,sensor,point` | 功率因数 |
| `10406` | `FrequencyLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `Hz` | `elec,freq,sensor,point` | 频率值 |
| `10407` | `BatteryLevel` | `trait` | `telemetry` | `float` | `read_reportable` | `%` | `battery,level,sensor,point` | 电池电量 |
| `10408` | `BatteryChargingState` | `trait` | `property` | `bool` | `read_reportable` |  | `battery,charge,sensor,point` | 电池充电状态 |
| `10409` | `ChargingState` | `trait` | `property` | `enum {0:idle,1:waiting,2:charging,3:paused,4:completed,5:fault}` | `read_reportable` |  | `evse,evseStatus,sensor,point` | 充电状态 |
| `10410` | `RelayOutputState` | `trait` | `property` | `bool` | `read_write_reportable` |  | `relay,cmd,point` | 继电器输出状态 |
| `10411` | `DeviceOnlineState` | `trait` | `telemetry` | `bool` | `read_reportable` |  | `device,networking,sensor,point` | 设备在线状态 |
| `10412` | `FaultState` | `event` | `event` | `-` | `reportable` |  | `alarm,fault,event,point` | 故障事件 |

## 8. 媒体与界面交互类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10501` | `VolumeLevel` | `trait` | `config` | `float` | `read_write_reportable` | `%` | `audio,level,sp,point` | 音量值 |
| `10502` | `MuteState` | `trait` | `property` | `bool` | `read_write_reportable` |  | `audio,cmd,point` | 静音状态 |
| `10503` | `MediaInputSource` | `trait` | `config` | `enum {0:hdmi1,1:hdmi2,2:tv,3:bluetooth,4:usb}` | `read_write` |  | `media,input,sp,point` | 媒体输入源 |
| `10504` | `ChannelNumber` | `trait` | `config` | `int` | `read_write` |  | `media,channel,sp,point` | 当前频道号 |
| `10505` | `PlaybackState` | `trait` | `property` | `enum {0:stopped,1:playing,2:paused,3:buffering}` | `read_reportable` |  | `media,state,sensor,point` | 播放状态 |
| `10506` | `ScreenBrightness` | `trait` | `config` | `float` | `read_write` | `%` | `screen,light,sp,point` | 屏幕亮度 |
| `10507` | `ScreenPageIndex` | `trait` | `property` | `int` | `read_write_reportable` |  | `screen,page,point` | 当前页面索引 |
| `10508` | `ThemeSelector` | `trait` | `config` | `enum {0:light,1:dark,2:auto}` | `read_write` |  | `screen,theme,sp,point` | 主题选择 |

## 9. 高通用命令类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10601` | `TurnOn` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 打开对象 |
| `10602` | `TurnOff` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 关闭对象 |
| `10603` | `Toggle` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 切换对象开关状态 |
| `10604` | `Open` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 执行打开动作 |
| `10605` | `Close` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 执行关闭动作 |
| `10606` | `Stop` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 停止当前动作 |
| `10607` | `Lock` | `command` | `action` | `inputSpec {}` | `invoke` |  | `lock,cmd,point` | 执行上锁动作 |
| `10608` | `Unlock` | `command` | `action` | `inputSpec {}` | `invoke` |  | `lock,cmd,point` | 执行解锁动作 |
| `10609` | `Start` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 启动对象或流程 |
| `10610` | `Pause` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 暂停对象或流程 |
| `10611` | `Resume` | `command` | `action` | `inputSpec {}` | `invoke` |  | `cmd,point` | 恢复对象或流程 |
| `10612` | `SetLevel` | `command` | `action` | `inputSpec {Level:float,TransitionTime:float}` | `invoke` |  | `level,cmd,point` | 设定目标等级值 |

## 10. 高通用事件类

| ID | Code | Kind | Role | Type/Spec | Access | Unit | Tags | Description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `10701` | `MotionDetected` | `event` | `event` | `-` | `reportable` |  | `motion,event,point` | 检测到运动事件 |
| `10702` | `PresenceDetected` | `event` | `event` | `-` | `reportable` |  | `presence,event,point` | 检测到存在事件 |
| `10703` | `ContactOpened` | `event` | `event` | `-` | `reportable` |  | `contact,event,point` | 门窗打开事件 |
| `10704` | `ContactClosed` | `event` | `event` | `-` | `reportable` |  | `contact,event,point` | 门窗关闭事件 |
| `10705` | `DoorbellPressed` | `event` | `event` | `-` | `reportable` |  | `button,event,point` | 门铃按下事件 |
| `10706` | `ButtonPressed` | `event` | `event` | `-` | `reportable` |  | `button,event,point` | 按键触发事件 |
| `10707` | `SmokeAlarmTriggered` | `event` | `event` | `-` | `reportable` |  | `smoke,alarm,event,point` | 烟雾告警触发事件 |
| `10708` | `GasAlarmTriggered` | `event` | `event` | `-` | `reportable` |  | `gas,alarm,event,point` | 燃气告警触发事件 |
| `10709` | `WaterLeakDetected` | `event` | `event` | `-` | `reportable` |  | `water,leak,event,point` | 漏水触发事件 |
| `10710` | `LockJamDetected` | `event` | `event` | `-` | `reportable` |  | `lock,event,point` | 门锁卡滞事件 |
| `10711` | `PowerRestored` | `event` | `event` | `-` | `reportable` |  | `power,event,point` | 供电恢复事件 |
| `10712` | `DeviceFaultOccurred` | `event` | `event` | `-` | `reportable` |  | `device,fault,event,point` | 设备故障事件 |

### 一期事件说明

当前第一期事件模型不定义 `payloadSpec` 结构，因此标准库中的事件项在 `Type/Spec` 列统一写为 `-`。

当前约束如下：

- 事件时间不作为 `payloadSpec` 的固定字段定义
- 时间取值依赖接收到设备报文的时间
- `source` 当前不作为标准事件字段，暂不定义
- 后续如果协议适配层已经稳定提供事件负载，再在下一版本中补充 `payloadSpec`

### 建议的 payloadSpec 结构参数

虽然第一期不正式落 `payloadSpec`，但为了后续版本统一，建议事件负载优先考虑以下字段：

| 字段 | 类型 | 是否建议必带 | 说明 |
| --- | --- | --- | --- |
| `OccurredAt` | `string` | 否 | 事件发生时间；仅当协议原始报文明确提供时使用 |
| `ReceivedAt` | `string` | 是 | 平台接收到事件报文的时间 |
| `SourceDeviceCode` | `string` | 否 | 事件来源设备编码 |
| `SourceObjectCode` | `string` | 否 | 事件来源对象编码 |
| `SourceElementCode` | `string` | 否 | 事件来源 element 编码 |
| `Severity` | `enum` | 否 | 事件等级，建议：`{0:info,1:warning,2:error,3:critical}` |
| `TriggerValue` | `string` | 否 | 触发事件时对应的关键值 |
| `Message` | `string` | 否 | 面向日志或界面的简短文本 |

建议规则：

- 如果设备协议没有提供事件发生时间，则 `OccurredAt` 不写，统一使用 `ReceivedAt`
- 如果一期还没有稳定的来源模型，则先不写 `SourceDeviceCode`、`SourceObjectCode`、`SourceElementCode`
- `Severity` 只在告警、故障、安全类事件中建议携带
- `TriggerValue` 适合烟雾、燃气、漏水、门锁故障等事件

建议的后续通用格式：

```text
{ReceivedAt:string,Severity:enum,TriggerValue:string}
```

如果后续来源链路稳定，可增强为：

```text
{OccurredAt:string,ReceivedAt:string,SourceDeviceCode:string,SourceObjectCode:string,SourceElementCode:string,Severity:enum,TriggerValue:string,Message:string}
```

按事件类型推荐的简化模板：

- 通用状态变化事件：`{ReceivedAt:string}`
- 安防触发事件：`{ReceivedAt:string,Severity:enum}`
- 告警故障事件：`{ReceivedAt:string,Severity:enum,TriggerValue:string,Message:string}`
- 按键事件：`{ReceivedAt:string,TriggerValue:string}`

## 11. 推荐优先落库的首批 20 个

如果只先落一批高价值能力，建议优先选以下 20 个：

- `CurrentTemperature`
- `TargetTemperature`
- `CurrentHumidity`
- `PowerSwitch`
- `BrightnessLevel`
- `ColorTemperature`
- `CurtainPosition`
- `OccupancyState`
- `PresenceState`
- `MotionState`
- `ContactState`
- `LockState`
- `SmokeAlarmState`
- `WaterLeakState`
- `VoltageLevel`
- `CurrentLevel`
- `PowerConsumption`
- `EnergyConsumption`
- `BatteryLevel`
- `DeviceOnlineState`

## 12. 后续落地建议

下一步建议按以下顺序推进：

1. 先把本文中的 `92` 个标准 `ElementType` 转成结构化 JSON 或 XML
2. 建立 `aqara-spec` 到本标准库的映射表
3. 在 `ObjectType V1` 中直接引用本文的标准 `ElementType`
4. 在事件负载来源稳定后，再为高频 `event` 补充 `payloadSpec`
