# Aqara Space Intelligence Platform 白皮书（Palantir 方法论对标版）

**从 Studio 本地空间操作内核，到 Studio Cloud / Builder 云端控制面，再到 Aqara Life 的终端空间体验容器**

- **面向**：核心管理层、产品负责人、技术架构师、平台与生态负责人  
- **版本**：V1.0  
- **日期**：2026-03  

**一句话主张**：Aqara 不应只被定义为智能家居设备公司，而应被建设为「面向真实物理空间的 Space Intelligence Platform / Physical Space Data & Service Platform」。

---

## 执行摘要

本白皮书的核心判断是：**Aqara 可以借鉴 Palantir，但不应复制 Palantir**。Palantir 提供的是一种极具解释效率的方法论锚点：把分散的数据、逻辑、动作和安全治理组织成一个可被人和 AI 共同使用的 operational layer。Aqara 的机会，则是把这套方法论落到真实物理空间之中，形成面向住宅、商业空间与楼宇的**空间操作栈**。

基于现有业务形态，Aqara 的系统不应再被理解为几款孤立产品，而应被定义为一套**分层协同系统**：

- **Studio Core + Runtime** 是本地空间操作内核  
- **Studio Web、Graph、Dashboard、App Designer** 是专业创作与交付客户端  
- **Studio Cloud / Builder** 是站点管理、分发、协作与生态控制面  
- **Aqara Life App** 是终端用户消费空间能力的运行容器  

在这个框架下，Palantir 对 Aqara 的意义不是品牌背书，而是**架构参照**。对外，Aqara 可采用「Space Intelligence Platform」这一稳健表达；对内，应进一步明确为「**Physical Space Data & Service Platform**」。这一判断与既有战略文档中「从 Device-centric 升级为 Space-centric、以图谱和 AI 为引擎、以服务 + 数据双轮驱动」为核心方向保持一致。

---

## 一、战略定位：Aqara 为什么要全面借鉴 Palantir

Palantir 最值得借鉴的不是行业标签，而是**系统骨架**。Palantir 官方把 **Ontology** 定义为其架构的 heart，用来把 enterprise 的 data、logic、action 和 security 组织成直观的 operational system，使 humans 与 AI agents 能围绕同一对象世界协作。Aqara 则需要把这套骨架迁移到「**空间**」而不是「企业」之上。

因此，Aqara 的目标不应是做「更强的 Home Assistant」或「卖更多设备的品牌」，而应是构建一套**空间智能基础设施**：

- 以**物理空间服务**为入口  
- 以**真实世界数据**为资产  
- 以**图数据库 / Physical Space Graph** 为事实层  
- 以 **AI 和规则**共同完成推理、编排和执行  
- 以**开发者与伙伴生态**完成放大  

从战略叙事上看：

| 维度 | Palantir | Aqara |
|------|----------|--------|
| **共性** | 多源异构数据、复杂实体关系、连续变化场景、服务与决策闭环 | 同左 |
| **差异** | 面向 **enterprise operations** | 面向 **space operations** |

---

## 二、Aqara 的系统母定义：不是多个产品，而是一套空间操作栈

要对标 Palantir，Aqara 必须先把自身定义清楚。现阶段最准确的定义是：

- **Studio** = 空间对象世界的**本地运行内核**  
- **Studio Cloud / Builder** = **云端控制面**  
- **Aqara Life App** = 用户消费空间能力的**应用容器**  

三者共同构成一个统一的 **Space Intelligence Stack**。

- **Studio Core** 底层以图数据库为中心，所有对象均以 entity 方式建模，这天然适合承载 **Space Ontology** 和 **Physical Space Graph**。  
- **Studio Web** 当前可视为专业用户与 Studio Core 交互的 Web 客户端；未来 Aqara Life App、Builder，乃至更多第三方应用，都应该成为和 Studio Core / Studio Cloud 交互的**不同客户端**。  
- 在真实物理世界中，一个空间可能只有一台 Studio，也可能有多台 Studio；同一 Studio 又可能纳管多个网关与协议域。未来当网关也接入 Studio Cloud 后，Builder 不仅可以面向 Studio 进行项目设计、逻辑编程与能力分发，也可以面向**网关层**进行更细粒度的逻辑下发和运行编排。

---

## 三、Palantir 方法论与 Aqara 的逐层映射

对标 Palantir，不能只说「我们也有 Ontology」。真正要对标的是**整套逐层结构**。

**Palantir 结构**：底部是 digital assets 和 models → 中间是 Ontology → 往上是 actions、functions、object-aware applications、AIP → 贯穿始终的是 security / governance。

**对应到 Aqara**：

| 层级 | Aqara 对应 |
|------|------------|
| **底部** | 真实世界入口：传感器、网关、执行器、协议和空间结构 |
| **中间** | Studio Core + Runtime + **Space Ontology** + **Physical Space Graph** |
| **再往上** | Actions、Functions、Skills、虚拟传感器、Agent-callable capabilities |
| **更上层** | Studio Web、Graph、Dashboard、Aqara Life、Builder |
| **横切全栈** | Policy、Permission、Audit、Versioning 与多租户治理 |

这意味着 Aqara 真正对标的，不是 Palantir 某个产品页面，而是：**以本体为心脏、以动作与函数为动脉、以应用与 AI 为器官、以治理为免疫系统**的系统逻辑。

---

## 四、目标架构：Studio Core 作为本地空间操作内核

**Studio Core + Runtime** 应被定义为 Aqara 的 **local operational kernel**。它不是单纯的连接器，也不是单纯的自动化引擎，而是空间操作栈的**本地执行心脏**。

**职责包括**：

- 多协议接入  
- 设备能力抽象  
- 状态同步  
- 事件流处理  
- Actions 执行  
- Functions / Skills 运行  
- Graph 与 App 的渲染支撑  
- Agent 的上下文与动作承载  

当 **Space Ontology** 建好之后，Studio Web、Aqara Life App、Builder 等上层应用都**不应直接面向底层设备和协议编程**，而应通过 Studio Core 所暴露的**对象模型、动作模型、事件模型和查询能力**来工作。GUI 不是不重要，但它应退居为 **view / client layer**，而不是系统的真中心。

**系统约束**：任何新能力都应优先回答四个问题：

1. 它使用哪些**对象**？  
2. 修改哪些**对象或关系**？  
3. 属于哪类 **action / function / skill**？  
4. 如何被**权限和审计系统**约束？  

只有这样，Aqara 的能力才会不断沉淀到**平台本体**里，而不是散落在前端页面和项目脚本中。

---

## 五、Studio Cloud / Builder：云端控制面，而非单纯社区网站

Builder 当前虽然内容还不够丰盈，但方向很清楚：它**不应**被理解为「一个开发者社区网站」，而应被定义为 **Studio Cloud 之上的 cloud control plane + ecosystem plane**。它负责的不是单一内容展示，而是：

- 站点接入  
- 项目协作  
- 能力分发  
- 运营分析  
- 伙伴共创与生态增长  

当 Studio 和网关接入 Studio Cloud 后，Builder 就具备了**四重价值**：

| 价值 | 说明 |
|------|------|
| **第一** | 多站点管理与协同控制面 |
| **第二** | 插件 / Skill / 模板 / App 的分发面 |
| **第三** | 项目设计、方案复制、现场交付与运维回流的协作面 |
| **第四** | 社区共创和商业化增值服务的生态面 |

更重要的是，Builder 可以把每个 Studio 的**空间本体数据**有选择地提取、聚合与分析，形成：

- 空间资产画像  
- 运维诊断  
- 服务结果诊断  
- 行业模板  
- 可复制场景包  

等更高阶资产。这一点与既有文档中「把点状数据提升为关系化、语义化、可复用资产」的目标完全一致。

---

## 六、Aqara Life App：终端用户的空间能力运行容器

Aqara Life App **不应**被继续定义为普通设备控制 App。更准确的定义是：**user-facing spatial application runtime**。它面向终端用户**消费**由 Studio Core 所生成的页面、玩法、插件、策略与空间体验。

**Studio 与 Life 的关系**：

- **Studio**：负责建模、运行、编排和**交付**空间能力  
- **Life**：负责让用户真正**消费**这些能力  

未来一人一面的空间体验、房间专属界面、场景化服务入口、插件化交互，都应在 **Life 侧**被体验，而不是停留在专业控制台中。

这也意味着 Aqara 的上层应用体系，会比 Palantir 多一层更靠近消费者的 **experience layer**：

- **Palantir**：主要是 object-aware applications  
- **Aqara**：既有 operational applications，也有 **end-user spatial experiences**  

---

## 七、商业模式：从卖设备，走向「入口 + 服务结果 + 平台工具链」三层收入

全面对标 Palantir 的商业模式，不意味着照搬企业软件收费方式，而是要把 Aqara 自身的优势重新排列组合。未来最合理的商业模式应至少包含**三层**。

| 层级 | 内容 | 对应价值 |
|------|------|----------|
| **第一层** | 基础硬件与现场部署收入：设备、Studio、网关、安装交付 | **入口**：进入真实世界，与现实世界持续交互 |
| **第二层** | 服务与运营收入：舒适度优化、能耗优化、照护、安全、异常诊断、运维协同、项目交付模板、行业方案包等 | **服务结果**：把平台能力显式交付给用户和空间运营方 |
| **第三层** | 平台与生态收入：插件市场、Skill 市场、付费模板、App 能力包、增值云服务、分析与诊断服务、Builder 团队协作与多站点管理、项目复制与交付工具链等 | **数据资产 + 开放平台 + 开发者飞轮** |

**总结**：Aqara 的未来收入结构，不应是「硬件附带软件」，而应是：

- **硬件** → 提供入口  
- **服务** → 提供结果  
- **平台工具链** → 提供复利  

---

## 八、开发者生态：每个 Builder 都应能与 Studio 交互并创建自己的应用

从平台逻辑上看，未来**每个 Builder 开发者**都应可以和 Studio 交互，并在受控治理之下创建自己的应用、页面、Skill 或方案包。官方需要提供更高质量、更高效率的应用与工具，这是增值服务和规模化交付的来源；但**平台不能把创造力垄断在官方手中**。

这要求 Aqara 的开放平台能力不能只停留在 OpenAPI 文档，而要逐步形成**完整的开发者工具链**：

- 统一认证  
- 环境模拟  
- 事件订阅  
- 数据回放  
- 测试沙箱  
- 版本治理  
- Skill SDK  
- 插件机制  
- 分发与回滚能力  
- 可观察性  
- 项目交付模板  

**理想形态**：Builder 生态不是「大家帮 Aqara 卖货」，而是「**大家围绕 Studio 的空间本体操作层创造新增价值**」。官方提供高质量默认应用和高效率交付工具，伙伴和开发者则在其上创造行业场景和差异化体验。

---

## 九、必须补上的关键短板：否则只能「像」，还不能「成立」

| 短板 | 要求 |
|------|------|
| **1. Space Ontology** | 必须成为**集团级标准资产**，而不是概念。需要统一对象模型、设备能力模型、事件模型、关系模型和服务结果模型，形成跨产品、跨项目、跨地区的统一语言与事实层。 |
| **2. Physical Space Graph / Home Graph** | 做成真正的**统一数据层**，让 Studio、App、边缘节点与云端服务围绕同一事实基础工作。图数据库是良好起点，但还需要补齐对象视图、查询语义、事件历史、版本治理和跨站点复用机制。 |
| **3. Service Outcome** | 必须**显式建模**。只记录动作成功与否还不够，还要记录结果是否达成、体验是否改善、能耗是否下降、异常是否减少。没有结果层，就难以形成闭环优化和服务化商业模式。 |
| **4. 治理能力** | 必须从早期就设计好。Palantir 的启发之一是：security 不是挂在最上面的标签，而是深嵌在 objects、actions、functions 和 applications 之中。Aqara 也需要逐步建立 Policy、Permission、Audit、Versioning、Approval、Rollback 与多租户隔离。 |

---

## 十、分阶段路线图

| 阶段 | 重点 |
|------|------|
| **阶段一：统一模型** | 以 Space Ontology、Device Capability、Event、Person / Role、Service Outcome 为核心，建立集团级标准对象语言。让 Studio Core、Studio Web、Life App、Builder 对齐到同一对象世界。 |
| **阶段二：统一事实层** | 以图谱 + 事件流为中枢，建设可承载状态、事件、关系、历史与上下文的统一数据层。让本地与云端围绕同一事实层工作。 |
| **阶段三：跑通服务闭环** | 优先选择家庭舒适度优化、照护、异常告警、门店设计与运维、楼宇节能等少量高价值场景，形成「数据 - 推理 - 执行 - 结果」闭环样板。 |
| **阶段四：开放生态** | 开放 Builder 生态所需的 SDK、模板、测试工具、市场与治理机制，让开发者和伙伴真正围绕 Studio 创造新增量。 |

---

## 十一、结论：Aqara 该如何对外讲，如何对内做

- **对外**：Aqara 最稳健的表达是 **Space Intelligence Platform**。它足够好懂，也能承接开发者社区、行业伙伴与市场叙事。  
- **对内**：则应更明确地将目标定义为 **Physical Space Data & Service Platform**，以便牵引架构、数据、服务和生态建设。  

**一句话概括**：借鉴 Palantir 的系统骨架，但把它**重构为面向真实物理空间、本地优先执行、开发者可扩展、用户可消费的空间操作栈**。

**真正的胜负手**，不在于 GUI 是否最精美，而在于：

1. **Studio** 是否已经成为空间对象世界的真实心脏  
2. **Builder** 是否能成为生态与分发的控制面  
3. **Life** 是否能成为空间能力被用户消费的容器  
4. 这一切是否能沉淀为**可复制、可治理、可商业化**的资产  

---

## 图 1：Aqara 对标 Palantir 的目标系统骨架

- **Studio Core + Runtime**：本地空间操作内核  
- **Studio Cloud / Builder**：云端控制面  
- **Aqara Life App**：终端空间体验容器  
- **Policy / Permission / Audit / Versioning**：横切治理织网  

---

## 附录 A：Palantir 与 Aqara 的对标速览

| Palantir 核心骨架 | Aqara 对应层 | 判断 |
|-------------------|--------------|------|
| Foundry digital assets / models | 设备、网关、空间、事件、边缘与云端信号 | 真实世界入口更强，但数据治理需统一 |
| Ontology | Space Ontology + Physical Space Graph | 已有图数据库基础，需把对象体系标准化 |
| Actions / Functions | Actions + Functions + Skills + 虚拟传感器 | 需进一步产品化与可治理 |
| Object-aware applications | Studio Web / Graph / Dashboard / Aqara Life / Builder | 要共享同一对象世界，而非各自直连设备 |
| AIP | Agent + MCP + OpenAPI + Agent-callable skills | 应确保 AI 建立在对象、动作和权限之上 |
| Security / governance | Policy / Permission / Audit / Versioning / 多租户 | 必须作为横切织网逐步补齐 |

---

## 附录 B：平台飞轮

- 更多**空间入口** → 更多真实世界数据  
- 更好的**空间本体与图谱** → 提升可复用对象资产密度  
- 更好的**服务结果** → 更多客户、伙伴与项目复制  
- **Builder 与 Studio Cloud** 作为生态与控制面 → 使上述价值持续放大  

---

## 附录 C：参考来源

1. Palantir Foundry / Ontology Overview  
2. Palantir Architecture Center / The Ontology system  
3. Palantir AIP Overview  
4. Palantir Ontology-aware applications / Object Views / Action types / Functions on objects  
5. Aqara 内部战略文档《Space Intelligence Platform：Aqara 作为物理空间数据与服务平台的下一代架构》
