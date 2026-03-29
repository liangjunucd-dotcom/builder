import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";
import type { BXMLObject, BXMLRelation, BXMLDocument } from "@/lib/bxml";

let _uid = 300;
const uid = (prefix: string) => `${prefix}-${++_uid}`;

interface AutomationTemplate {
  name: string;
  icon: string;
  triggerCapability: string;
  triggerDesc: string;
  actionDesc: string;
  actionCapability: string;
  category: "presence" | "safety" | "comfort" | "schedule" | "energy";
  priority: "high" | "medium" | "low";
  cooldownSec?: number;
  enabledByDefault: boolean;
}

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  { name: "人来灯亮", icon: "⚡", triggerCapability: "presence", triggerDesc: "检测到有人", actionDesc: "开启灯光 80%", actionCapability: "on_off", category: "presence", priority: "high", cooldownSec: 10, enabledByDefault: true },
  { name: "人走灯灭", icon: "⚡", triggerCapability: "presence", triggerDesc: "无人超过 5 分钟", actionDesc: "关闭全部灯光 + 空调", actionCapability: "on_off", category: "presence", priority: "high", cooldownSec: 300, enabledByDefault: true },
  { name: "走廊感应灯", icon: "💡", triggerCapability: "motion", triggerDesc: "走廊检测到移动", actionDesc: "开启走廊灯 60%，无人 2 分钟后关闭", actionCapability: "on_off", category: "presence", priority: "medium", cooldownSec: 5, enabledByDefault: true },
  { name: "开门欢迎", icon: "🚪", triggerCapability: "contact", triggerDesc: "门窗打开", actionDesc: "开启玄关灯 + 播放欢迎语", actionCapability: "on_off", category: "presence", priority: "medium", enabledByDefault: true },
  { name: "烟雾报警", icon: "🚨", triggerCapability: "smoke_alarm", triggerDesc: "烟雾浓度超标", actionDesc: "推送通知 + 关闭燃气阀 + 打开窗户", actionCapability: "alarm", category: "safety", priority: "high", enabledByDefault: true },
  { name: "天然气报警", icon: "🔥", triggerCapability: "gas_alarm", triggerDesc: "燃气浓度超标", actionDesc: "推送通知 + 关闭燃气阀 + 开启排气扇", actionCapability: "alarm", category: "safety", priority: "high", enabledByDefault: true },
  { name: "水浸报警", icon: "💧", triggerCapability: "water_leak", triggerDesc: "检测到漏水", actionDesc: "推送通知 + 关闭水阀", actionCapability: "alarm", category: "safety", priority: "high", enabledByDefault: true },
  { name: "入侵告警", icon: "🔐", triggerCapability: "contact", triggerDesc: "离家模式下门窗被打开", actionDesc: "推送告警 + 开启摄像头 + 触发警笛", actionCapability: "alarm", category: "safety", priority: "high", enabledByDefault: false },
  { name: "日出开窗帘", icon: "🌅", triggerCapability: "schedule", triggerDesc: "每日日出时刻", actionDesc: "打开窗帘 100%", actionCapability: "open_close", category: "schedule", priority: "low", enabledByDefault: true },
  { name: "夜间节能", icon: "🌙", triggerCapability: "schedule", triggerDesc: "每日 23:00", actionDesc: "灯光降至 20% + 空调调至节能模式", actionCapability: "on_off", category: "energy", priority: "medium", enabledByDefault: true },
  { name: "温度过高预警", icon: "🌡️", triggerCapability: "temperature", triggerDesc: "室温超过 35°C", actionDesc: "开启空调制冷 + 推送通知", actionCapability: "ir_ac_control", category: "comfort", priority: "medium", enabledByDefault: false },
  { name: "湿度过高通风", icon: "💦", triggerCapability: "humidity", triggerDesc: "湿度超过 75%", actionDesc: "开启排气扇 + 推送提醒", actionCapability: "on_off", category: "comfort", priority: "low", cooldownSec: 600, enabledByDefault: false },
  { name: "光线自适应", icon: "🔆", triggerCapability: "illuminance", triggerDesc: "环境光照度低于 100 lux", actionDesc: "自动调节灯光亮度到 70%", actionCapability: "on_off", category: "comfort", priority: "low", enabledByDefault: false },
  { name: "用电异常告警", icon: "⚡", triggerCapability: "power_metering", triggerDesc: "功率超过阈值", actionDesc: "推送通知 + 可选断电", actionCapability: "on_off", category: "safety", priority: "medium", enabledByDefault: false },
];

export const automationGenSkill: AgentSkillExecutor = {
  id: "automation_gen",
  name: "Automation Generation",
  description: "Create smart automation rules based on device capabilities",
  icon: "⚡",
  supportedIntents: ["create_automation", "generate_full"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const devices = input.currentBXML.objects.filter((o) => o.type === "device");
    if (devices.length === 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "暂时没有设备数据，请先为空间配置设备再创建自动化。",
        skillId: "automation_gen",
      };
    }

    _uid = Math.max(300, ...input.currentBXML.objects.map((o) => {
      const n = parseInt(o.id.split("-").pop() ?? "0");
      return isNaN(n) ? 0 : n;
    }));

    const deviceCapabilities = new Set<string>();
    for (const dev of devices) {
      const caps = dev.properties.find((p) => p.key === "capabilities")?.value ?? "";
      caps.split(",").forEach((c) => deviceCapabilities.add(c.trim()));
    }

    const applicableTemplates = AUTOMATION_TEMPLATES.filter((t) => {
      if (t.triggerCapability === "schedule") return true;
      return deviceCapabilities.has(t.triggerCapability);
    });

    const existingAutoNames = new Set(
      input.currentBXML.objects.filter((o) => o.type === "automation").map((o) => o.name)
    );

    const newAutomations: BXMLObject[] = [];
    const newRelations: BXMLRelation[] = [];

    for (const template of applicableTemplates) {
      if (existingAutoNames.has(template.name)) continue;

      const autoId = uid("auto");
      const autoProps: BXMLObject["properties"] = [
        { key: "trigger", value: template.triggerDesc },
        { key: "action", value: template.actionDesc },
        { key: "category", value: template.category },
        { key: "priority", value: template.priority },
        { key: "enabled", value: String(template.enabledByDefault) },
      ];
      if (template.cooldownSec) {
        autoProps.push({ key: "cooldown", value: String(template.cooldownSec), unit: "s" });
      }
      newAutomations.push({
        id: autoId,
        type: "automation",
        name: template.name,
        icon: template.icon,
        properties: autoProps,
      });

      const triggerDevice = devices.find((d) => {
        const caps = d.properties.find((p) => p.key === "capabilities")?.value ?? "";
        return caps.includes(template.triggerCapability);
      });
      if (triggerDevice) {
        newRelations.push({
          id: uid("rel"),
          type: "triggers",
          sourceId: triggerDevice.id,
          targetId: autoId,
          label: template.triggerDesc,
        });
      }
    }

    const updatedBXML: BXMLDocument = {
      ...input.currentBXML,
      objects: [...input.currentBXML.objects, ...newAutomations],
      relations: [...input.currentBXML.relations, ...newRelations],
      updatedAt: new Date().toISOString(),
    };

    const byCategory = new Map<string, string[]>();
    for (const auto of newAutomations) {
      const cat = auto.properties.find((p) => p.key === "category")?.value ?? "other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(`${auto.icon} ${auto.name}`);
    }

    const CATEGORY_LABELS: Record<string, string> = {
      presence: "🏠 到家/离家",
      safety: "🔒 安全防护",
      comfort: "🌙 舒适体验",
      schedule: "⏰ 定时任务",
      energy: "⚡ 节能优化",
    };

    const summary = [...byCategory.entries()]
      .map(([cat, autos]) => `${CATEGORY_LABELS[cat] ?? cat}：${autos.join("、")}`)
      .join("\n");

    return {
      updatedBXML,
      responseText: `已生成 ${newAutomations.length} 条自动化规则：\n\n${summary}\n\n需要我继续创建场景模式吗？`,
      skillId: "automation_gen",
    };
  },
};
