import type { AgentSkillExecutor, SkillInput, SkillOutput } from "../types";
import type { BXMLObject, BXMLDocument } from "@/lib/bxml";

let _uid = 500;
const uid = (prefix: string) => `${prefix}-${++_uid}`;

export const appUiGenSkill: AgentSkillExecutor = {
  id: "app_ui_gen",
  name: "App UI Generation",
  description: "Generate Life App pages with device cards, scene buttons, and room navigation",
  icon: "📱",
  supportedIntents: ["generate_app_ui", "generate_full"],

  async execute(input: SkillInput): Promise<SkillOutput> {
    const spaces = input.currentBXML.objects.filter((o) => o.type === "space");
    const scenes = input.currentBXML.objects.filter((o) => o.type === "scene");
    const devices = input.currentBXML.objects.filter((o) => o.type === "device");

    if (spaces.length === 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "暂无空间数据，请先创建空间再生成 App 界面。",
        skillId: "app_ui_gen",
      };
    }

    _uid = Math.max(500, ...input.currentBXML.objects.map((o) => {
      const n = parseInt(o.id.split("-").pop() ?? "0");
      return isNaN(n) ? 0 : n;
    }));

    const existingWidgets = input.currentBXML.objects.filter((o) => o.type === "widget");
    if (existingWidgets.length > 0) {
      return {
        updatedBXML: input.currentBXML,
        responseText: "App UI 已存在，如需调整请告诉我具体修改内容。",
        skillId: "app_ui_gen",
      };
    }

    const widgets: BXMLObject[] = [];

    widgets.push({
      id: uid("wgt"),
      type: "widget",
      name: "首页",
      icon: "🏠",
      properties: [
        { key: "pageType", value: "home" },
        { key: "sections", value: "scene_grid,room_list,quick_actions" },
      ],
    });

    if (scenes.length > 0) {
      widgets.push({
        id: uid("wgt"),
        type: "widget",
        name: "场景面板",
        icon: "🎭",
        properties: [
          { key: "widgetType", value: "scene_grid" },
          { key: "sceneCount", value: String(scenes.length) },
          { key: "layout", value: "2x2_grid" },
        ],
      });
    }

    for (const space of spaces) {
      const roomDevices = devices.filter((d) => d.parentId === space.id);
      if (roomDevices.length > 0) {
        widgets.push({
          id: uid("wgt"),
          type: "widget",
          name: `${space.name} 控制`,
          icon: space.icon ?? "📱",
          parentId: space.id,
          properties: [
            { key: "widgetType", value: "room_card" },
            { key: "deviceCount", value: String(roomDevices.length) },
            { key: "layout", value: "device_list" },
          ],
        });
      }
    }

    widgets.push({
      id: uid("wgt"),
      type: "widget",
      name: "设备总览",
      icon: "📊",
      properties: [
        { key: "widgetType", value: "device_overview" },
        { key: "totalDevices", value: String(devices.length) },
        { key: "layout", value: "category_grid" },
      ],
    });

    const updatedBXML: BXMLDocument = {
      ...input.currentBXML,
      objects: [...input.currentBXML.objects, ...widgets],
      updatedAt: new Date().toISOString(),
    };

    const pageList = widgets.map((w) => `  ${w.icon} ${w.name}`).join("\n");

    return {
      updatedBXML,
      responseText: `已生成 Life App 界面，包含 ${widgets.length} 个页面/组件：\n\n${pageList}\n\n用户通过 Aqara Life App 扫码即可加载此界面。`,
      skillId: "app_ui_gen",
    };
  },
};
