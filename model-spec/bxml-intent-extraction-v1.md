# BXML Intent Extraction V1

## 1. 定义

`BxmlIntentExtraction` 是用户自然语言需求和最终 BXML 之间的中间抽取层。

它的作用不是替代 `BXML`，而是把用户文本中的：

- 空间信息
- 设备需求
- 安装关系
- 推断规则
- 待确认项

先转成结构化 JSON，作为生成 BXML 的直接输入底稿。

## 2. 目标

引入这一层的目标是：

- 提高从自然语言到 BXML 的稳定性
- 让推断结果可检查、可修改、可复用
- 避免每次都直接从文本跳到 XML
- 让后续自动化层也能复用同一份实例化上下文

## 3. 输入输出关系

### 3.1 输入

- 用户自然语言描述
- `device-semantic-model.xml`
- `model-spec/space-semantic-model.xml`
- `model-spec/object-type-template-data-v1.json`

### 3.2 输出

- 一份 `BxmlIntentExtraction` JSON
- 再由该 JSON 生成最终 BXML

## 4. 推荐结构

```json
{
  "meta": {},
  "sourceInput": {},
  "spaceSkeleton": {},
  "structureSkeleton": {},
  "deviceRequirements": [],
  "deviceInstantiationPlan": [],
  "relationsPlan": [],
  "validationChecks": [],
  "pendingConfirmations": []
}
```

## 5. 字段说明

### 5.1 `meta`

用于描述这份中间文件自身。

推荐字段：

- `schema`
- `version`
- `locale`
- `generatedAt`
- `purpose`

### 5.2 `sourceInput`

保存原始用户输入及其来源。

推荐字段：

- `type`
- `text`
- `normalizedSummary`

### 5.3 `spaceSkeleton`

保存从文本中抽取出的空间骨架。

推荐字段：

- `space`
- `floors`
- `rooms`
- `zones`

每个空间对象建议至少包含：

- `id`
- `objectTypeRef`
- `displayName`
- `semanticType`
- `parentRef`
- `inferenceSource`

### 5.4 `structureSkeleton`

保存门、窗、墙等结构对象。

每个结构对象建议至少包含：

- `id`
- `objectTypeRef`
- `displayName`
- `parentRef`
- `inferenceReason`

### 5.5 `deviceRequirements`

保存从文本抽取出的“需求级规则”，还不是最终实例。

例如：

- 每个主要房间 1 个灯
- 每个主要房间 1 个空调
- 每个空间 1 个人体传感器
- 每个主要对外开口 1 个门窗传感器

推荐字段：

- `requirementId`
- `requirementType`
- `scopeSelector`
- `templateRef`
- `countRule`
- `priority`
- `inferenceReason`

### 5.6 `deviceInstantiationPlan`

保存由需求规则展开后的设备实例计划。

每条计划建议至少包含：

- `deviceId`
- `templateRef`
- `displayName`
- `spaceRef`
- `placementRelation`
- `structureRef`
- `endpointStrategy`
- `functionSelection`
- `corePointSelection`
- `inferenceReason`

这是生成 BXML 时最关键的中间层。

### 5.7 `relationsPlan`

保存要写入 BXML 的关系计划。

推荐字段：

- `relationId`
- `relationType`
- `sourceRef`
- `targetRef`
- `reason`

### 5.8 `validationChecks`

保存生成前或生成后的结构性校验项。

推荐字段：

- `checkId`
- `checkType`
- `status`
- `message`

### 5.9 `pendingConfirmations`

保存当前无法从文本稳定确定的信息。

推荐字段：

- `itemId`
- `topic`
- `question`
- `impact`

## 6. 生成原则

### 6.1 先抽需求，再展开实例

不要直接从文本一句话生成一长串设备实例。

推荐流程：

1. 抽空间骨架
2. 抽需求规则
3. 映射模板
4. 展开实例计划
5. 再生成 BXML

### 6.2 推断必须可回溯

每个空间、结构、设备实例计划都应尽量带：

- `inferenceSource`
- `inferenceReason`

### 6.3 待确认项必须留在中间层

如果文本中没有提供：

- 真实设备型号
- 窗户数量
- 结构安装细节

必须进入 `pendingConfirmations`，不能在生成 BXML 时默默吞掉。

## 7. 与 BXML 的映射关系

### 7.1 `spaceSkeleton` -> `SpaceInstances`

### 7.2 `structureSkeleton` -> `StructureInstances`

### 7.3 `deviceInstantiationPlan` -> `DeviceInstances`

### 7.4 `relationsPlan` -> `Relations`

### 7.5 `validationChecks` -> `ValidationSummary`

### 7.6 `pendingConfirmations` -> `PendingConfirmations`

## 8. 推荐使用方式

后续 AI 生成 BXML 时，建议固定采用以下链路：

1. 用户文本
2. 生成 `BxmlIntentExtraction` JSON
3. 用户或系统检查 JSON
4. 再生成 BXML

这样做的价值是：

- 更容易调试生成逻辑
- 更适合后续不断 enrich
- 更适合把空间层、设备层、自动化层解耦
