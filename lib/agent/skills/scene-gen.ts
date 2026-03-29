import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";
import type { BXMLObject, BXMLRelation, BXMLDocument } from "@/lib/bxml";

let _uid = 400;
const uid = (prefix: string) => `${prefix}-${++_uid}`;

interface SceneTemplate {
  name: string;
  icon: string;
  trigger: string;
  actions: { capability: string; desc: string }[];
  forSpaceTypes: string[];
}

const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    name: "回家模式",
    icon: "🏠",
    trigger: "手动 / 门磁触发",
    actions: [
      { capability: "on_off", desc: "客厅灯光 80%" },
      { capability: "open_close", desc: "打开窗帘" },
      { capability: "ir_ac_control", desc: "空调 24°C" },
    ],
    forSpaceTypes: ["客厅", "玄关", "大厅", "living room"],
  },
  {
    name: "离家模式",
    icon: "🔒",
    trigger: "手动 / 全屋无人 10 分钟",
    actions: [
      { capability: "on_off", desc: "关闭全部灯光" },
      { capability: "open_close", desc: "关闭窗帘" },
      { capability: "ir_ac_control", desc: "关闭空调" },
      { capability: "lock", desc: "确认门锁已上锁" },
    ],
    forSpaceTypes: ["客厅", "玄关", "大厅", "living room"],
  },
  {
    name: "睡眠模式",
    icon: "🌙",
    trigger: "手动 / 23:00 定时",
    actions: [
      { capability: "on_off", desc: "关闭客厅/厨房灯" },
      { capability: "on_off", desc: "卧室灯调至 5%" },
      { capability: "open_close", desc: "关闭窗帘" },
    ],
    forSpaceTypes: ["主卧", "卧室", "主卧套房", "bedroom"],
  },
  {
    name: "影院模式",
    icon: "🎬",
    trigger: "手动 / 场景面板",
    actions: [
      { capability: "on_off", desc: "灯光调至 10%" },
      { capability: "open_close", desc: "关闭窗帘" },
    ],
    forSpaceTypes: ["客厅", "家庭影院", "living room"],
  },
  {
    name: "起床模式",
    icon: "☀️",
    trigger: "手动 / 日出定时",
    actions: [
      { capability: "open_close", desc: "打开窗帘" },
      { capability: "on_off", desc: "卧室灯 50%" },
    ],
    forSpaceTypes: ["主卧", "卧室", "主卧套房", "bedroom"],
  },
  {
    name: "阅读模式",
    icon: "📖",
    trigger: "手动 / 场景面板",
    actions: [
      { capability: "on_off", desc: "调灯至暖色 60%" },
      { capability: "open_close", desc: "窗帘半开" },
    ],
    forSpaceTypes: ["书房", "主卧", "主卧套房"],
  },
  {
    name: "用餐模式",
    icon: "🍽️",
    trigger: "手动 / 场景面板",
    actions: [
      { capability: "on_off", desc: "餐厅灯光 100% 暖白" },
      { capability: "on_off", desc: "客厅灯光 30%" },
    ],
    forSpaceTypes: ["餐厅"],
  },
  {
    name: "派对模式",
    icon: "🎉",
    trigger: "手动",
    actions: [
      { capability: "on_off", desc: "灯光多彩循环" },
      { capability: "on_off", desc: "灯带颜色循环" },
    ],
    forSpaceTypes: ["客厅", "大厅", "living room"],
  },
  {
    name: "会议模式",
    icon: "📊",
    trigger: "手动 / 场景面板",
    actions: [
      { capability: "on_off", desc: "灯光 100%" },
      { capability: "open_close", desc: "关闭窗帘" },
    ],
    forSpaceTypes: ["会议室", "会议室A", "会议室B"],
  },
  {
    name: "午休模式",
    icon: "😴",
    trigger: "手动 / 12:30 定时",
    actions: [
      { capability: "on_off", desc: "灯光降至 10%" },
      { capability: "open_close", desc: "窗帘半关" },
    ],
    forSpaceTypes: ["开放办公区", "经理办公室"],
  },
  {
    name: "入住模式",
    icon: "🏨",
    trigger: "插卡取电",
    actions: [
      { capability: "on_off", desc: "开启房间灯光" },
      { capability: "open_close", desc: "打开窗帘" },
      { capability: "ir_ac_control", desc: "空调 22°C" },
    ],
    forSpaceTypes: ["客房", "客房A", "客房B", "客房C", "hotel"],
  },
  {
    name: "退房模式",
    icon: "🔑",
    trigger: "拔卡断电",
    actions: [
      { capability: "on_off", desc: "关闭全部灯光" },
      { capability: "open_close", desc: "关闭窗帘" },
      { capability: "ir_ac_control", desc: "关闭空调" },
    ],
    forSpaceTypes: ["客房", "客房A", "客房B", "客房C", "hotel"],
  },
];

export const sceneGenSkill: AgentSkillExecutor = {
  id: "scene_gen",
  name: "Scene Generation",
  description: "Create preset scenes with multi-device orchestration",
  icon: "🎭",
  supportedIntents: ["create_scene", "generate_full"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const spaces = input.currentBXML.objects.filter((o) => o.type === "space");
    const devices = input.currentBXML.objects.filter((o) => o.type === "device");

    if (devices.length === 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "暂时没有设备数据，请先配置设备再创建场景。",
        skillId: "scene_gen",
      };
    }

    _uid = Math.max(400, ...input.currentBXML.objects.map((o) => {
      const n = parseInt(o.id.split("-").pop() ?? "0");
      return isNaN(n) ? 0 : n;
    }));

    const spaceNames = new Set(spaces.map((s) => s.name.toLowerCase()));
    const existingSceneNames = new Set(
      input.currentBXML.objects.filter((o) => o.type === "scene").map((o) => o.name)
    );

    const applicable = SCENE_TEMPLATES.filter((t) => {
      if (existingSceneNames.has(t.name)) return false;
      return t.forSpaceTypes.some((st) => {
        const lower = st.toLowerCase();
        return [...spaceNames].some((sn) => sn.includes(lower) || lower.includes(sn));
      });
    });

    const newScenes: BXMLObject[] = [];
    const newRelations: BXMLRelation[] = [];

    for (const template of applicable) {
      const sceneId = uid("sc");
      newScenes.push({
        id: sceneId,
        type: "scene",
        name: template.name,
        icon: template.icon,
        properties: [
          { key: "trigger", value: template.trigger },
          { key: "actions", value: template.actions.map((a) => a.desc).join("; ") },
        ],
      });

      for (const action of template.actions) {
        const targetDevice = devices.find((d) => {
          const caps = d.properties.find((p) => p.key === "capabilities")?.value ?? "";
          return caps.includes(action.capability);
        });
        if (targetDevice) {
          newRelations.push({
            id: uid("rel"),
            type: "controls",
            sourceId: sceneId,
            targetId: targetDevice.id,
            label: action.desc,
          });
        }
      }
    }

    const updatedBXML: BXMLDocument = {
      ...input.currentBXML,
      objects: [...input.currentBXML.objects, ...newScenes],
      relations: [...input.currentBXML.relations, ...newRelations],
      updatedAt: new Date().toISOString(),
    };

    const sceneList = newScenes.map((s) => {
      const trigger = s.properties.find((p) => p.key === "trigger")?.value;
      return `  ${s.icon} **${s.name}** — ${trigger}`;
    }).join("\n");

    return {
      updatedBXML,
      responseText: `已创建 ${newScenes.length} 个场景模式：\n\n${sceneList}\n\n方案已基本完成！你可以继续微调，或直接 Deploy 到 Studio。`,
      skillId: "scene_gen",
    };
  },
};
