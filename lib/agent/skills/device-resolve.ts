import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";
import type { BXMLObject, BXMLRelation, BXMLDocument } from "@/lib/bxml";

let _uid = 200;
const uid = (prefix: string) => `${prefix}-${++_uid}`;

interface DeviceTemplate {
  name: string;
  icon: string;
  model: string;
  sku: string;
  protocol: string;
  capabilities: string;
  installLocation: string;
  powerSource: "ac" | "battery" | "poe" | "usb";
  forRoomTypes: string[];
  priority: "essential" | "recommended" | "optional";
}

const DEVICE_CATALOG: DeviceTemplate[] = [
  { name: "Hub M3", icon: "📡", model: "HM3-G01", sku: "HM3-G01", protocol: "Zigbee 3.0 + Thread", capabilities: "gateway,matter_bridge", installLocation: "shelf", powerSource: "ac", forRoomTypes: ["客厅", "大厅", "living room"], priority: "essential" },
  { name: "FP2 人体存在传感器", icon: "👁️", model: "RTCZCGQ12LM", sku: "RTCZCGQ12LM", protocol: "Wi-Fi", capabilities: "presence,zone_detection,illuminance", installLocation: "ceiling", powerSource: "usb", forRoomTypes: ["客厅", "卧室", "主卧", "开放办公区", "大厅", "living room", "bedroom"], priority: "essential" },
  { name: "智能吸顶灯", icon: "💡", model: "YLXD76YL", sku: "YLXD76YL", protocol: "Zigbee", capabilities: "on_off,brightness,color_temp", installLocation: "ceiling", powerSource: "ac", forRoomTypes: ["客厅", "卧室", "主卧", "次卧", "儿童房", "客房", "客房A", "客房B", "客房C", "大厅", "living room", "bedroom"], priority: "essential" },
  { name: "LED 筒灯 (x4)", icon: "💡", model: "DL-2C", sku: "DL-2C", protocol: "Zigbee", capabilities: "on_off,brightness", installLocation: "ceiling_recessed", powerSource: "ac", forRoomTypes: ["客厅", "餐厅", "走廊", "前台", "大厅", "living room"], priority: "recommended" },
  { name: "智能窗帘电机", icon: "🪟", model: "ZNCLDJ14LM", sku: "ZNCLDJ14LM", protocol: "Zigbee", capabilities: "open_close,position", installLocation: "window_rail", powerSource: "ac", forRoomTypes: ["客厅", "主卧", "次卧", "客房", "客房A", "客房B", "客房C", "会议室A", "主卧套房", "书房", "living room", "bedroom"], priority: "recommended" },
  { name: "墙壁开关 (双键)", icon: "🔲", model: "WS-EUK02", sku: "WS-EUK02", protocol: "Zigbee", capabilities: "on_off_2ch", installLocation: "wall", powerSource: "ac", forRoomTypes: ["次卧", "儿童房", "走廊", "茶水间", "书房", "bedroom"], priority: "essential" },
  { name: "门窗传感器", icon: "🚪", model: "MCCGQ14LM", sku: "MCCGQ14LM", protocol: "Zigbee", capabilities: "contact", installLocation: "door_frame", powerSource: "battery", forRoomTypes: ["玄关", "客房", "车库"], priority: "recommended" },
  { name: "烟雾报警器", icon: "🔥", model: "JY-GZ-01AQ", sku: "JY-GZ-01AQ", protocol: "Zigbee", capabilities: "smoke_alarm", installLocation: "ceiling", powerSource: "battery", forRoomTypes: ["厨房", "kitchen"], priority: "essential" },
  { name: "天然气报警器", icon: "🔥", model: "JT-BZ-01AQ", sku: "JT-BZ-01AQ", protocol: "Zigbee", capabilities: "gas_alarm", installLocation: "wall", powerSource: "ac", forRoomTypes: ["厨房", "kitchen"], priority: "recommended" },
  { name: "水浸传感器", icon: "💧", model: "SJCGQ13LM", sku: "SJCGQ13LM", protocol: "Zigbee", capabilities: "water_leak", installLocation: "floor", powerSource: "battery", forRoomTypes: ["卫生间", "厨房", "茶水间", "主卫", "客卫", "公共卫生间", "bathroom"], priority: "recommended" },
  { name: "温湿度传感器", icon: "🌡️", model: "WSDCGQ12LM", sku: "WSDCGQ12LM", protocol: "Zigbee", capabilities: "temperature,humidity", installLocation: "wall", powerSource: "battery", forRoomTypes: ["儿童房", "卧室", "客房", "客房A", "客房B", "客房C", "书房"], priority: "optional" },
  { name: "空调伴侣 P3", icon: "❄️", model: "ARIR2-GL01", sku: "ARIR2-GL01", protocol: "Wi-Fi", capabilities: "ir_ac_control,power_metering", installLocation: "socket", powerSource: "ac", forRoomTypes: ["客厅", "主卧", "客房", "客房A", "客房B", "客房C", "开放办公区", "会议室A", "主卧套房", "经理办公室", "大厅", "living room", "bedroom"], priority: "recommended" },
  { name: "智能门锁 D100", icon: "🔐", model: "ZNMS17LM", sku: "ZNMS17LM", protocol: "Zigbee + BLE", capabilities: "lock,fingerprint,nfc,password", installLocation: "door", powerSource: "battery", forRoomTypes: ["玄关", "客房", "客房A", "客房B", "客房C", "前台"], priority: "optional" },
  { name: "场景面板 S1", icon: "🎛️", model: "ZNCJMB14LM", sku: "ZNCJMB14LM", protocol: "Zigbee", capabilities: "scene_4btn", installLocation: "wall", powerSource: "ac", forRoomTypes: ["餐厅", "客厅", "主卧", "客房", "大厅", "主卧套房"], priority: "optional" },
  { name: "智能插座", icon: "🔌", model: "ZNCZ15LM", sku: "ZNCZ15LM", protocol: "Zigbee", capabilities: "on_off,power_metering", installLocation: "socket", powerSource: "ac", forRoomTypes: ["书房", "卧室", "经理办公室"], priority: "optional" },
  { name: "人体传感器 P2", icon: "🏃", model: "RTCGQ14LM", sku: "RTCGQ14LM", protocol: "Zigbee", capabilities: "motion,illuminance", installLocation: "wall", powerSource: "battery", forRoomTypes: ["走廊", "玄关", "卫生间", "主卫", "客卫", "公共卫生间", "车库", "hallway"], priority: "recommended" },
  { name: "无线按钮 (mini)", icon: "⚪", model: "WXKG13LM", sku: "WXKG13LM", protocol: "Zigbee", capabilities: "button_single,button_double,button_long", installLocation: "bedside", powerSource: "battery", forRoomTypes: ["主卧", "主卧套房", "客房A", "客房B", "客房C"], priority: "optional" },
  { name: "摄像头 G3", icon: "📷", model: "CH-H03D", sku: "CH-H03D", protocol: "Wi-Fi", capabilities: "camera,motion_detect,two_way_audio", installLocation: "wall", powerSource: "usb", forRoomTypes: ["花园", "庭院", "车库", "玄关"], priority: "optional" },
];

export const deviceResolveSkill: AgentSkillExecutor = {
  id: "device_resolve",
  name: "Device Resolution",
  description: "Match and place optimal devices for each space",
  icon: "📡",
  supportedIntents: ["add_devices", "generate_full"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const spaces = input.currentBXML.objects.filter((o) => o.type === "space");
    if (spaces.length === 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "暂时没有空间数据，请先创建空间拓扑再添加设备。",
        skillId: "device_resolve",
      };
    }

    _uid = Math.max(200, ...input.currentBXML.objects.map((o) => {
      const n = parseInt(o.id.split("-").pop() ?? "0");
      return isNaN(n) ? 0 : n;
    }));

    const newDevices: BXMLObject[] = [];
    const newRelations: BXMLRelation[] = [];

    for (const space of spaces) {
      const roomName = space.name.toLowerCase();
      const matchedDevices = DEVICE_CATALOG.filter((d) =>
        d.forRoomTypes.some((rt) => roomName.includes(rt.toLowerCase()) || rt.toLowerCase().includes(roomName))
      ).filter((d) => d.priority !== "optional");

      for (const dt of matchedDevices) {
        const existing = input.currentBXML.objects.find(
          (o) => o.type === "device" && o.parentId === space.id &&
            o.properties.some((p) => p.key === "model" && p.value === dt.model)
        );
        if (existing) continue;

        const devId = uid("dev");
        newDevices.push({
          id: devId,
          type: "device",
          name: dt.name,
          icon: dt.icon,
          parentId: space.id,
          properties: [
            { key: "model", value: dt.model },
            { key: "sku", value: dt.sku },
            { key: "protocol", value: dt.protocol },
            { key: "capabilities", value: dt.capabilities },
            { key: "installLocation", value: dt.installLocation },
            { key: "powerSource", value: dt.powerSource },
            { key: "priority", value: dt.priority },
          ],
        });
        newRelations.push({
          id: uid("rel"),
          type: "contains",
          sourceId: space.id,
          targetId: devId,
        });
      }
    }

    const updatedBXML: BXMLDocument = {
      ...input.currentBXML,
      objects: [...input.currentBXML.objects, ...newDevices],
      relations: [...input.currentBXML.relations, ...newRelations],
      updatedAt: new Date().toISOString(),
    };

    const byRoom = new Map<string, string[]>();
    for (const dev of newDevices) {
      const room = spaces.find((s) => s.id === dev.parentId)?.name ?? "Unknown";
      if (!byRoom.has(room)) byRoom.set(room, []);
      byRoom.get(room)!.push(`${dev.icon} ${dev.name}`);
    }

    const summary = [...byRoom.entries()]
      .map(([room, devs]) => `**${room}**：${devs.join("、")}`)
      .join("\n");

    return {
      updatedBXML,
      responseText: `已为 ${spaces.length} 个空间配置 ${newDevices.length} 个设备：\n\n${summary}\n\n需要我继续创建自动化规则吗？`,
      skillId: "device_resolve",
    };
  },
};
