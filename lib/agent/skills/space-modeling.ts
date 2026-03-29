import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";
import type { BXMLObject, BXMLRelation, BXMLDocument } from "@/lib/bxml";

let _uid = 100;
const uid = (prefix: string) => `${prefix}-${++_uid}`;

type RoomFunction = "living" | "sleeping" | "working" | "utility" | "circulation" | "dining" | "recreation";

interface RoomTemplate {
  name: string;
  icon: string;
  area: number;
  function: RoomFunction;
  floor?: number;
  deviceSuggestions: string[];
}

const RESIDENTIAL_TEMPLATES: Record<string, RoomTemplate[]> = {
  "一室一厅": [
    { name: "客厅", icon: "🛋️", area: 22, function: "living", deviceSuggestions: ["主灯", "传感器", "空调控制"] },
    { name: "卧室", icon: "🛏️", area: 14, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "传感器"] },
    { name: "厨房", icon: "🍳", area: 6, function: "utility", deviceSuggestions: ["烟雾传感器", "燃气传感器"] },
    { name: "卫生间", icon: "🚿", area: 5, function: "utility", deviceSuggestions: ["水浸传感器"] },
    { name: "玄关", icon: "🚪", area: 3, function: "circulation", deviceSuggestions: ["门磁", "感应灯"] },
  ],
  "两室一厅": [
    { name: "客厅", icon: "🛋️", area: 28, function: "living", deviceSuggestions: ["主灯", "传感器", "空调控制"] },
    { name: "主卧", icon: "🛏️", area: 15, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "传感器"] },
    { name: "次卧", icon: "🛏️", area: 12, function: "sleeping", deviceSuggestions: ["灯", "窗帘"] },
    { name: "厨房", icon: "🍳", area: 8, function: "utility", deviceSuggestions: ["烟雾传感器", "燃气传感器"] },
    { name: "卫生间", icon: "🚿", area: 6, function: "utility", deviceSuggestions: ["水浸传感器", "排气扇"] },
    { name: "玄关", icon: "🚪", area: 4, function: "circulation", deviceSuggestions: ["门磁", "感应灯"] },
  ],
  "三室两厅": [
    { name: "客厅", icon: "🛋️", area: 35, function: "living", deviceSuggestions: ["主灯", "传感器", "空调控制"] },
    { name: "餐厅", icon: "🍽️", area: 15, function: "dining", deviceSuggestions: ["灯", "场景面板"] },
    { name: "主卧", icon: "🛏️", area: 18, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "传感器"] },
    { name: "次卧", icon: "🛏️", area: 12, function: "sleeping", deviceSuggestions: ["灯", "窗帘"] },
    { name: "儿童房", icon: "🧒", area: 10, function: "sleeping", deviceSuggestions: ["灯", "温湿度传感器"] },
    { name: "厨房", icon: "🍳", area: 10, function: "utility", deviceSuggestions: ["烟雾传感器", "燃气传感器"] },
    { name: "卫生间", icon: "🚿", area: 6, function: "utility", deviceSuggestions: ["水浸传感器"] },
    { name: "玄关", icon: "🚪", area: 5, function: "circulation", deviceSuggestions: ["门磁", "感应灯"] },
  ],
  "四室两厅": [
    { name: "客厅", icon: "🛋️", area: 40, function: "living", deviceSuggestions: ["主灯", "传感器", "空调控制", "场景面板"] },
    { name: "餐厅", icon: "🍽️", area: 18, function: "dining", deviceSuggestions: ["灯", "场景面板"] },
    { name: "主卧", icon: "🛏️", area: 22, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "传感器", "空调控制"] },
    { name: "次卧", icon: "🛏️", area: 14, function: "sleeping", deviceSuggestions: ["灯", "窗帘"] },
    { name: "儿童房", icon: "🧒", area: 12, function: "sleeping", deviceSuggestions: ["灯", "温湿度传感器"] },
    { name: "书房", icon: "📚", area: 10, function: "working", deviceSuggestions: ["灯", "窗帘", "智能插座"] },
    { name: "厨房", icon: "🍳", area: 12, function: "utility", deviceSuggestions: ["烟雾传感器", "燃气传感器"] },
    { name: "主卫", icon: "🚿", area: 8, function: "utility", deviceSuggestions: ["水浸传感器", "镜前灯"] },
    { name: "客卫", icon: "🚿", area: 5, function: "utility", deviceSuggestions: ["水浸传感器"] },
    { name: "玄关", icon: "🚪", area: 6, function: "circulation", deviceSuggestions: ["门磁", "感应灯", "门锁"] },
    { name: "阳台", icon: "🌿", area: 8, function: "recreation", deviceSuggestions: ["灯", "晾衣架"] },
  ],
  "别墅": [
    { name: "客厅", icon: "🛋️", area: 50, function: "living", floor: 1, deviceSuggestions: ["主灯", "传感器", "空调控制", "场景面板"] },
    { name: "餐厅", icon: "🍽️", area: 25, function: "dining", floor: 1, deviceSuggestions: ["灯", "场景面板"] },
    { name: "厨房", icon: "🍳", area: 20, function: "utility", floor: 1, deviceSuggestions: ["烟雾传感器", "燃气传感器", "水浸传感器"] },
    { name: "玄关", icon: "🚪", area: 8, function: "circulation", floor: 1, deviceSuggestions: ["门磁", "感应灯", "门锁", "摄像头"] },
    { name: "主卧套房", icon: "🛏️", area: 30, function: "sleeping", floor: 2, deviceSuggestions: ["灯", "窗帘", "传感器", "空调控制"] },
    { name: "次卧", icon: "🛏️", area: 18, function: "sleeping", floor: 2, deviceSuggestions: ["灯", "窗帘"] },
    { name: "儿童房", icon: "🧒", area: 15, function: "sleeping", floor: 2, deviceSuggestions: ["灯", "温湿度传感器"] },
    { name: "书房", icon: "📚", area: 15, function: "working", floor: 2, deviceSuggestions: ["灯", "窗帘"] },
    { name: "家庭影院", icon: "🎬", area: 25, function: "recreation", floor: -1, deviceSuggestions: ["灯", "窗帘", "投影控制"] },
    { name: "车库", icon: "🚗", area: 35, function: "utility", floor: -1, deviceSuggestions: ["灯", "门磁", "摄像头"] },
    { name: "花园", icon: "🌳", area: 60, function: "recreation", floor: 1, deviceSuggestions: ["灯", "灌溉", "摄像头"] },
  ],
  "酒店客房": [
    { name: "客房", icon: "🏨", area: 30, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "空调", "门锁"] },
    { name: "卫生间", icon: "🚿", area: 8, function: "utility", deviceSuggestions: ["镜前灯", "排气扇"] },
    { name: "走廊", icon: "🚶", area: 4, function: "circulation", deviceSuggestions: ["感应灯"] },
  ],
  "民宿": [
    { name: "大厅", icon: "🏡", area: 40, function: "living", floor: 1, deviceSuggestions: ["主灯", "传感器", "空调控制", "背景音乐"] },
    { name: "前台", icon: "🏢", area: 10, function: "working", floor: 1, deviceSuggestions: ["灯", "门禁"] },
    { name: "客房A", icon: "🛏️", area: 20, function: "sleeping", floor: 2, deviceSuggestions: ["灯", "窗帘", "空调", "门锁"] },
    { name: "客房B", icon: "🛏️", area: 20, function: "sleeping", floor: 2, deviceSuggestions: ["灯", "窗帘", "空调", "门锁"] },
    { name: "客房C", icon: "🛏️", area: 18, function: "sleeping", floor: 3, deviceSuggestions: ["灯", "窗帘", "空调", "门锁"] },
    { name: "公共卫生间", icon: "🚿", area: 8, function: "utility", floor: 1, deviceSuggestions: ["水浸传感器"] },
    { name: "庭院", icon: "🌿", area: 30, function: "recreation", floor: 1, deviceSuggestions: ["灯", "摄像头"] },
  ],
  "办公空间": [
    { name: "开放办公区", icon: "💼", area: 80, function: "working", deviceSuggestions: ["灯组", "传感器", "空调控制"] },
    { name: "会议室A", icon: "📊", area: 20, function: "working", deviceSuggestions: ["灯", "窗帘", "投影控制"] },
    { name: "会议室B", icon: "📊", area: 15, function: "working", deviceSuggestions: ["灯", "窗帘"] },
    { name: "茶水间", icon: "☕", area: 10, function: "utility", deviceSuggestions: ["灯", "水浸传感器"] },
    { name: "前台", icon: "🏢", area: 15, function: "circulation", deviceSuggestions: ["灯", "门禁", "传感器"] },
    { name: "经理办公室", icon: "👔", area: 18, function: "working", deviceSuggestions: ["灯", "窗帘", "空调控制"] },
  ],
  "样板间": [
    { name: "客厅", icon: "🛋️", area: 35, function: "living", deviceSuggestions: ["主灯", "传感器", "空调控制", "场景面板", "背景音乐"] },
    { name: "餐厅", icon: "🍽️", area: 15, function: "dining", deviceSuggestions: ["灯", "场景面板"] },
    { name: "主卧", icon: "🛏️", area: 20, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "传感器", "空调控制", "场景面板"] },
    { name: "儿童房", icon: "🧒", area: 12, function: "sleeping", deviceSuggestions: ["灯", "窗帘", "温湿度传感器"] },
    { name: "厨房", icon: "🍳", area: 10, function: "utility", deviceSuggestions: ["烟雾传感器", "燃气传感器"] },
    { name: "卫生间", icon: "🚿", area: 6, function: "utility", deviceSuggestions: ["水浸传感器", "镜前灯"] },
    { name: "玄关", icon: "🚪", area: 5, function: "circulation", deviceSuggestions: ["门磁", "感应灯", "门锁"] },
  ],
  default: [
    { name: "Living Room", icon: "🛋️", area: 30, function: "living", deviceSuggestions: ["light", "sensor", "ac"] },
    { name: "Bedroom", icon: "🛏️", area: 15, function: "sleeping", deviceSuggestions: ["light", "curtain"] },
    { name: "Kitchen", icon: "🍳", area: 10, function: "utility", deviceSuggestions: ["smoke sensor"] },
    { name: "Bathroom", icon: "🚿", area: 7, function: "utility", deviceSuggestions: ["water leak sensor"] },
    { name: "Hallway", icon: "🚪", area: 5, function: "circulation", deviceSuggestions: ["door sensor", "motion light"] },
  ],
};

function resolveTemplate(prompt: string): RoomTemplate[] {
  const lower = prompt.toLowerCase();
  for (const [key, template] of Object.entries(RESIDENTIAL_TEMPLATES)) {
    if (key === "default") continue;
    if (lower.includes(key)) return template;
  }
  if (lower.includes("一室") || lower.match(/1\s*(?:bedroom|室)/)) return RESIDENTIAL_TEMPLATES["一室一厅"];
  if (lower.includes("两室") || lower.match(/2\s*(?:bedroom|室)/)) return RESIDENTIAL_TEMPLATES["两室一厅"];
  if (lower.includes("三室") || lower.match(/3\s*(?:bedroom|室)/)) return RESIDENTIAL_TEMPLATES["三室两厅"];
  if (lower.includes("四室") || lower.match(/4\s*(?:bedroom|室)/)) return RESIDENTIAL_TEMPLATES["四室两厅"];
  if (lower.includes("别墅") || lower.includes("villa")) return RESIDENTIAL_TEMPLATES["别墅"];
  if (lower.includes("民宿") || lower.includes("bnb") || lower.includes("homestay")) return RESIDENTIAL_TEMPLATES["民宿"];
  if (lower.includes("酒店") || lower.includes("hotel")) return RESIDENTIAL_TEMPLATES["酒店客房"];
  if (lower.includes("办公") || lower.includes("office")) return RESIDENTIAL_TEMPLATES["办公空间"];
  if (lower.includes("样板") || lower.includes("showroom") || lower.includes("demo")) return RESIDENTIAL_TEMPLATES["样板间"];
  if (lower.includes("apartment") || lower.includes("家") || lower.includes("公寓")) return RESIDENTIAL_TEMPLATES["两室一厅"];
  return RESIDENTIAL_TEMPLATES["default"];
}

export const spaceModelingSkill: AgentSkillExecutor = {
  id: "space_modeling",
  name: "Space Modeling",
  description: "Create spatial topology from natural language description",
  icon: "🏗️",
  supportedIntents: ["create_space", "generate_full"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const template = resolveTemplate(input.userPrompt);
    const areaOverride = input.intent.entities.area ? parseInt(input.intent.entities.area) : null;

    const totalTemplateArea = template.reduce((s, r) => s + r.area, 0);
    const scale = areaOverride ? areaOverride / totalTemplateArea : 1;

    _uid = Math.max(100, ...input.currentBXML.objects.map((o) => {
      const n = parseInt(o.id.split("-").pop() ?? "0");
      return isNaN(n) ? 0 : n;
    }));

    const newSpaces: BXMLObject[] = template.map((room) => {
      const props: BXMLObject["properties"] = [
        { key: "area", value: String(Math.round(room.area * scale)), unit: "m²" },
        { key: "function", value: room.function },
        { key: "deviceSuggestions", value: room.deviceSuggestions.join(", ") },
      ];
      if (room.floor !== undefined) {
        props.push({ key: "floor", value: String(room.floor) });
      }
      return {
        id: uid("sp"),
        type: "space" as const,
        name: room.name,
        icon: room.icon,
        properties: props,
      };
    });

    const newRelations: BXMLRelation[] = [];
    const circulation = newSpaces.filter((s) =>
      s.properties.some((p) => p.key === "function" && p.value === "circulation")
    );
    for (const hall of circulation) {
      for (const room of newSpaces) {
        if (room.id === hall.id) continue;
        const hallFloor = hall.properties.find((p) => p.key === "floor")?.value;
        const roomFloor = room.properties.find((p) => p.key === "floor")?.value;
        if (hallFloor && roomFloor && hallFloor !== roomFloor) continue;
        newRelations.push({
          id: uid("rel"),
          type: "linked_to",
          sourceId: hall.id,
          targetId: room.id,
          label: "adjacent",
        });
      }
    }

    const totalArea = newSpaces.reduce((s, sp) => {
      const a = parseInt(sp.properties.find((p) => p.key === "area")?.value ?? "0");
      return s + a;
    }, 0);

    const updatedBXML: BXMLDocument = {
      ...input.currentBXML,
      objects: [...input.currentBXML.objects, ...newSpaces],
      relations: [...input.currentBXML.relations, ...newRelations],
      updatedAt: new Date().toISOString(),
    };

    const floors = new Map<string, BXMLObject[]>();
    for (const sp of newSpaces) {
      const f = sp.properties.find((p) => p.key === "floor")?.value ?? "1";
      if (!floors.has(f)) floors.set(f, []);
      floors.get(f)!.push(sp);
    }

    const FLOOR_LABELS: Record<string, string> = { "-1": "B1", "1": "1F", "2": "2F", "3": "3F" };
    let roomList: string;
    if (floors.size > 1) {
      roomList = [...floors.entries()]
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([f, rooms]) => {
          const label = FLOOR_LABELS[f] ?? `${f}F`;
          const items = rooms.map((s) => {
            const area = s.properties.find((p) => p.key === "area")?.value;
            return `    ${s.icon} ${s.name} (${area}m²)`;
          }).join("\n");
          return `  **${label}**\n${items}`;
        }).join("\n");
    } else {
      roomList = newSpaces.map((s) => {
        const area = s.properties.find((p) => p.key === "area")?.value;
        return `  • ${s.icon} ${s.name} (${area}m²)`;
      }).join("\n");
    }

    return {
      updatedBXML,
      responseText: `已创建 ${newSpaces.length} 个空间（总面积 ~${totalArea}m²）：\n${roomList}\n\n接下来为这些空间推荐设备…`,
      thinkingTrace: `Template matched: ${template.length} rooms, scale factor: ${scale.toFixed(2)}, area override: ${areaOverride ?? "none"}`,
      skillId: "space_modeling",
    };
  },
};
