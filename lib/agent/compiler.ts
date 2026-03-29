import type { BXMLDocument, BXMLObject, DeviceBinding } from "@/lib/bxml";
import { getPurchaseUrl } from "@/lib/catalog-links";

/* ══════════════════════════════════════════════
   BXML → Studio DSL Compiler
   Compiles BXML into M300-executable DSL format
   ══════════════════════════════════════════════ */

export interface StudioDSL {
  version: string;
  projectId: string;
  compiledAt: string;
  topology: StudioDSLSpace[];
  rules: StudioDSLRule[];
  scenes: StudioDSLScene[];
}

export interface StudioDSLSpace {
  id: string;
  name: string;
  area: number;
  devices: StudioDSLDevice[];
}

export interface StudioDSLDevice {
  id: string;
  model: string;
  name: string;
  protocol: string;
  capabilities: string[];
}

export interface StudioDSLRule {
  id: string;
  name: string;
  trigger: { deviceId?: string; type: string; condition: string };
  actions: { deviceId?: string; command: string; params?: Record<string, unknown> }[];
}

export interface StudioDSLScene {
  id: string;
  name: string;
  icon: string;
  actions: { deviceId?: string; command: string; params?: Record<string, unknown> }[];
}

export function compileToDSL(bxml: BXMLDocument): StudioDSL {
  const spaces = bxml.objects.filter((o) => o.type === "space");
  const devices = bxml.objects.filter((o) => o.type === "device");
  const automations = bxml.objects.filter((o) => o.type === "automation");
  const scenes = bxml.objects.filter((o) => o.type === "scene");

  const topology: StudioDSLSpace[] = spaces.map((space) => {
    const roomDevices = devices.filter((d) => d.parentId === space.id);
    return {
      id: space.id,
      name: space.name,
      area: parseInt(space.properties.find((p) => p.key === "area")?.value ?? "0"),
      devices: roomDevices.map((d) => ({
        id: d.id,
        model: d.properties.find((p) => p.key === "model")?.value ?? "unknown",
        name: d.name,
        protocol: d.properties.find((p) => p.key === "protocol")?.value ?? "zigbee",
        capabilities: (d.properties.find((p) => p.key === "capabilities")?.value ?? "").split(",").map((c) => c.trim()),
      })),
    };
  });

  const rules: StudioDSLRule[] = automations.map((auto) => {
    const triggerRel = bxml.relations.find((r) => r.targetId === auto.id && r.type === "triggers");
    return {
      id: auto.id,
      name: auto.name,
      trigger: {
        deviceId: triggerRel?.sourceId,
        type: auto.properties.find((p) => p.key === "category")?.value ?? "custom",
        condition: auto.properties.find((p) => p.key === "trigger")?.value ?? "",
      },
      actions: [{
        command: auto.properties.find((p) => p.key === "action")?.value ?? "",
      }],
    };
  });

  const dslScenes: StudioDSLScene[] = scenes.map((scene) => {
    const controlRels = bxml.relations.filter((r) => r.sourceId === scene.id && r.type === "controls");
    return {
      id: scene.id,
      name: scene.name,
      icon: scene.icon ?? "🎭",
      actions: controlRels.map((r) => ({
        deviceId: r.targetId,
        command: r.label ?? "execute",
      })),
    };
  });

  return {
    version: "1.0",
    projectId: bxml.projectId,
    compiledAt: new Date().toISOString(),
    topology,
    rules,
    scenes: dslScenes,
  };
}

/* ══════════════════════════════════════════════
   BXML → Plugin Bundle Compiler
   Compiles BXML into Life App plugin package
   ══════════════════════════════════════════════ */

export interface PluginManifest {
  pluginId: string;
  name: string;
  version: string;
  compiledAt: string;
  permissions: string[];
  pages: PluginPage[];
  deviceCount: number;
  sceneCount: number;
  automationCount: number;
}

export interface PluginPage {
  id: string;
  title: string;
  icon: string;
  type: "home" | "room" | "scene_grid" | "device_list" | "overview";
  config: Record<string, unknown>;
}

export interface PluginBundle {
  manifest: PluginManifest;
  uiDSL: PluginUIDSL;
  automationRules: PluginAutomationRule[];
  sceneDefs: PluginSceneDef[];
  /** Flat list of all device cards with binding/controllable status for Life App UI */
  deviceCards: PluginDeviceCard[];
  /** Stats: mapped vs unmapped devices */
  bindingStats: {
    total: number;
    mapped: number;
    unmapped: number;
    conflicted: number;
  };
}

export interface PluginUIDSL {
  pages: PluginUIPage[];
}

export interface PluginUIPage {
  id: string;
  title: string;
  sections: PluginUISection[];
}

export interface PluginUISection {
  type: "scene_grid" | "device_cards" | "room_card" | "status_bar";
  data: Record<string, unknown>;
}

export interface PluginDeviceCard {
  id: string;
  name: string;
  icon?: string;
  model: string;
  spaceId?: string;
  spaceName?: string;
  /** Whether this device can be controlled (has a real device bound) */
  controllable: boolean;
  bindingStatus: "mapped" | "unmapped" | "conflicted";
  realDeviceId?: string;
  /** URL to buy this device if not mapped */
  purchaseUrl?: string;
  missingReason?: string;
}

export interface PluginAutomationRule {
  id: string;
  name: string;
  trigger: Record<string, unknown>;
  actions: Record<string, unknown>[];
  enabled: boolean;
}

export interface PluginSceneDef {
  id: string;
  name: string;
  icon: string;
  actions: Record<string, unknown>[];
}

export function compileToPlugin(bxml: BXMLDocument, projectName: string): PluginBundle {
  const spaces = bxml.objects.filter((o) => o.type === "space");
  const devices = bxml.objects.filter((o) => o.type === "device");
  const automations = bxml.objects.filter((o) => o.type === "automation");
  const scenes = bxml.objects.filter((o) => o.type === "scene");
  const widgets = bxml.objects.filter((o) => o.type === "widget");

  const protocols = new Set<string>();
  for (const d of devices) {
    const proto = d.properties.find((p) => p.key === "protocol")?.value ?? "";
    proto.split(/[+,]/).map((p) => p.trim().toLowerCase()).forEach((p) => { if (p) protocols.add(p); });
  }

  const permissions = [...protocols].map((p) => `protocol.${p}`);
  permissions.push("notification.push", "storage.local");
  if (automations.length > 0) permissions.push("automation.execute");

  const pages: PluginPage[] = [];

  pages.push({
    id: "page-home",
    title: projectName,
    icon: "🏠",
    type: "home",
    config: { sceneCount: scenes.length, roomCount: spaces.length },
  });

  if (scenes.length > 0) {
    pages.push({
      id: "page-scenes",
      title: "场景",
      icon: "🎭",
      type: "scene_grid",
      config: { scenes: scenes.map((s) => ({ id: s.id, name: s.name, icon: s.icon })) },
    });
  }

  for (const space of spaces) {
    const roomDevices = devices.filter((d) => d.parentId === space.id);
    if (roomDevices.length > 0) {
      pages.push({
        id: `page-${space.id}`,
        title: space.name,
        icon: space.icon ?? "📱",
        type: "room",
        config: { devices: roomDevices.map((d) => ({ id: d.id, name: d.name, icon: d.icon })) },
      });
    }
  }

  const uiDSL: PluginUIDSL = {
    pages: pages.map((p) => ({
      id: p.id,
      title: p.title,
      sections: buildSections(p, bxml),
    })),
  };

  const automationRules: PluginAutomationRule[] = automations.map((auto) => ({
    id: auto.id,
    name: auto.name,
    trigger: {
      type: auto.properties.find((p) => p.key === "category")?.value ?? "custom",
      condition: auto.properties.find((p) => p.key === "trigger")?.value ?? "",
    },
    actions: [{
      command: auto.properties.find((p) => p.key === "action")?.value ?? "",
    }],
    enabled: true,
  }));

  const sceneDefs: PluginSceneDef[] = scenes.map((scene) => {
    const rels = bxml.relations.filter((r) => r.sourceId === scene.id && r.type === "controls");
    return {
      id: scene.id,
      name: scene.name,
      icon: scene.icon ?? "🎭",
      actions: rels.map((r) => ({
        deviceId: r.targetId,
        command: r.label ?? "execute",
      })),
    };
  });

  // Build device cards with binding/controllable metadata
  const spaceMap = new Map(spaces.map((s) => [s.id, s.name]));
  const deviceCards: PluginDeviceCard[] = devices.map((d) => {
    const binding = d.binding;
    const model = d.properties.find((p) => p.key === "model")?.value ?? "unknown";
    const sku = binding?.purchaseSku ?? model;
    const isMapped = binding?.bindingStatus === "mapped";
    const status = binding?.bindingStatus ?? "unmapped";
    const spaceName = d.parentId ? spaceMap.get(d.parentId) : undefined;
    return {
      id: d.id,
      name: d.name,
      icon: d.icon,
      model,
      spaceId: d.parentId,
      spaceName,
      controllable: isMapped,
      bindingStatus: status as "mapped" | "unmapped" | "conflicted",
      realDeviceId: binding?.realDeviceId,
      purchaseUrl: isMapped ? undefined : getPurchaseUrl(sku),
      missingReason: binding?.missingReason,
    };
  });

  const bindingStats = {
    total: deviceCards.length,
    mapped: deviceCards.filter((c) => c.bindingStatus === "mapped").length,
    unmapped: deviceCards.filter((c) => c.bindingStatus === "unmapped").length,
    conflicted: deviceCards.filter((c) => c.bindingStatus === "conflicted").length,
  };

  return {
    manifest: {
      pluginId: `plugin-${bxml.projectId}`,
      name: projectName,
      version: `1.0.${bxml.revision}`,
      compiledAt: new Date().toISOString(),
      permissions,
      pages,
      deviceCount: devices.length,
      sceneCount: scenes.length,
      automationCount: automations.length,
    },
    uiDSL,
    automationRules,
    sceneDefs,
    deviceCards,
    bindingStats,
  };
}

function buildSections(page: PluginPage, bxml: BXMLDocument): PluginUISection[] {
  const sections: PluginUISection[] = [];
  const scenes = bxml.objects.filter((o) => o.type === "scene");

  if (page.type === "home") {
    if (scenes.length > 0) {
      sections.push({
        type: "scene_grid",
        data: { scenes: scenes.map((s) => ({ id: s.id, name: s.name, icon: s.icon })) },
      });
    }
    sections.push({ type: "status_bar", data: { label: "All devices" } });
  } else if (page.type === "room") {
    sections.push({ type: "device_cards", data: page.config });
  } else if (page.type === "scene_grid") {
    sections.push({ type: "scene_grid", data: page.config });
  }

  return sections;
}

/* ══════════════════════════════════════════════
   Compilation stats (for UI display)
   ══════════════════════════════════════════════ */

export function getCompilationStats(bxml: BXMLDocument) {
  const devices = bxml.objects.filter((o) => o.type === "device");
  const protocols = new Set<string>();
  for (const d of devices) {
    const proto = d.properties.find((p) => p.key === "protocol")?.value ?? "";
    proto.split(/[+,]/).forEach((p) => { if (p.trim()) protocols.add(p.trim()); });
  }

  return {
    spaces: bxml.objects.filter((o) => o.type === "space").length,
    devices: devices.length,
    automations: bxml.objects.filter((o) => o.type === "automation").length,
    scenes: bxml.objects.filter((o) => o.type === "scene").length,
    widgets: bxml.objects.filter((o) => o.type === "widget").length,
    protocols: [...protocols],
    estimatedBundleSizeKB: Math.round(12 + devices.length * 0.8 + bxml.relations.length * 0.3),
  };
}
