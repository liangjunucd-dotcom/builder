import type { BXMLDocument, BXMLObject } from "./bxml";

export interface Asset {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: "comfort" | "safety" | "energy" | "convenience" | "health";
  spaceId?: string;
  spaceName?: string;
  deviceIds: string[];
  automationIds: string[];
  status: "active" | "inactive" | "partial";
  metrics?: { label: string; value: string }[];
}

const ASSET_TEMPLATES: {
  match: (auto: BXMLObject) => boolean;
  name: string;
  icon: string;
  description: string;
  category: Asset["category"];
}[] = [
  {
    match: (a) => {
      const cat = a.properties.find(p => p.key === "category")?.value;
      const trigger = a.properties.find(p => p.key === "trigger")?.value?.toLowerCase() ?? "";
      return cat === "presence" || trigger.includes("presence") || trigger.includes("person") || trigger.includes("fp2");
    },
    name: "Presence Automation",
    icon: "👁",
    description: "Auto-control lights and climate based on room occupancy",
    category: "comfort",
  },
  {
    match: (a) => {
      const cat = a.properties.find(p => p.key === "category")?.value;
      const trigger = a.properties.find(p => p.key === "trigger")?.value?.toLowerCase() ?? "";
      return cat === "safety" || trigger.includes("smoke") || trigger.includes("leak") || trigger.includes("intrusion");
    },
    name: "Safety Monitor",
    icon: "🛡",
    description: "Smoke, water leak, and intrusion detection with alerts",
    category: "safety",
  },
  {
    match: (a) => {
      const action = a.properties.find(p => p.key === "action")?.value?.toLowerCase() ?? "";
      return action.includes("curtain") || action.includes("blind");
    },
    name: "Daylight Management",
    icon: "🪟",
    description: "Automated curtain/blind control based on time and light",
    category: "energy",
  },
  {
    match: (a) => {
      const action = a.properties.find(p => p.key === "action")?.value?.toLowerCase() ?? "";
      const trigger = a.properties.find(p => p.key === "trigger")?.value?.toLowerCase() ?? "";
      return action.includes("ac") || action.includes("temperature") || trigger.includes("temp") || trigger.includes("humidity");
    },
    name: "Climate Control",
    icon: "🌡",
    description: "Temperature and humidity management for optimal comfort",
    category: "comfort",
  },
  {
    match: (a) => {
      const action = a.properties.find(p => p.key === "action")?.value?.toLowerCase() ?? "";
      return action.includes("lock") || action.includes("door");
    },
    name: "Access Control",
    icon: "🔒",
    description: "Smart lock management and entry automation",
    category: "safety",
  },
  {
    match: (a) => {
      const cat = a.properties.find(p => p.key === "category")?.value;
      return cat === "schedule";
    },
    name: "Scheduled Tasks",
    icon: "⏰",
    description: "Time-based automations for daily routines",
    category: "convenience",
  },
];

export function generateAssetsFromBXML(bxmlDoc: BXMLDocument): Asset[] {
  const automations = bxmlDoc.objects.filter(o => o.type === "automation");
  const devices = bxmlDoc.objects.filter(o => o.type === "device");
  const spaces = bxmlDoc.objects.filter(o => o.type === "space");

  if (automations.length === 0) return [];

  const usedAutomationIds = new Set<string>();
  const assets: Asset[] = [];

  for (const template of ASSET_TEMPLATES) {
    const matched = automations.filter(a => !usedAutomationIds.has(a.id) && template.match(a));
    if (matched.length === 0) continue;

    matched.forEach(a => usedAutomationIds.add(a.id));

    const relatedDeviceIds = new Set<string>();
    for (const auto of matched) {
      const actionStr = auto.properties.find(p => p.key === "action")?.value ?? "";
      const triggerStr = auto.properties.find(p => p.key === "trigger")?.value ?? "";
      for (const dev of devices) {
        if (actionStr.toLowerCase().includes(dev.name.toLowerCase()) ||
            triggerStr.toLowerCase().includes(dev.name.toLowerCase())) {
          relatedDeviceIds.add(dev.id);
        }
      }
    }

    const spaceId = matched[0]?.parentId;
    const space = spaces.find(s => s.id === spaceId);

    assets.push({
      id: `asset-${template.category}-${assets.length}`,
      name: template.name,
      icon: template.icon,
      description: template.description,
      category: template.category,
      spaceId: space?.id,
      spaceName: space?.name,
      deviceIds: [...relatedDeviceIds],
      automationIds: matched.map(a => a.id),
      status: "active",
      metrics: [
        { label: "Rules", value: String(matched.length) },
        { label: "Devices", value: String(relatedDeviceIds.size) },
      ],
    });
  }

  const unmatched = automations.filter(a => !usedAutomationIds.has(a.id));
  if (unmatched.length > 0) {
    assets.push({
      id: `asset-custom-${assets.length}`,
      name: "Custom Automations",
      icon: "⚡",
      description: `${unmatched.length} additional automation rule${unmatched.length > 1 ? "s" : ""}`,
      category: "convenience",
      deviceIds: [],
      automationIds: unmatched.map(a => a.id),
      status: "active",
      metrics: [{ label: "Rules", value: String(unmatched.length) }],
    });
  }

  return assets;
}

export function getAssetsBySpace(assets: Asset[]): Map<string, Asset[]> {
  const map = new Map<string, Asset[]>();
  for (const asset of assets) {
    const key = asset.spaceName ?? "Global";
    const existing = map.get(key) ?? [];
    existing.push(asset);
    map.set(key, existing);
  }
  return map;
}
