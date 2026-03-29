/**
 * aiot-sync.ts
 *
 * AIOT Platform ↔ Online Studio device synchronisation and
 * virtual-to-real device mapping logic.
 *
 * Architecture:
 *   1. fetchUserAiotDevices()  — pulls real devices from AIOT platform
 *   2. mapVirtualToRealDevices() — matches BXML virtual devices to real ones
 *   3. Returns mapped / unmapped / conflicted lists
 *
 * MVP: uses a mock AIOT provider. Real integration replaces AIOT_PROVIDER.fetch().
 * Mapping algorithm:
 *   Priority 1 — exact model code match in same space
 *   Priority 2 — model category match (e.g., Light) in same space
 *   Priority 3 — model category match anywhere
 *   Conflicted  — 2+ candidates with equal score
 */

import type { BXMLDocument, BXMLObject, DeviceBinding } from "@/lib/bxml";
import { getPurchaseUrl } from "@/lib/catalog-links";

/* ══════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════ */

export interface AiotRealDevice {
  /** Unique device ID from AIOT platform */
  deviceId: string;
  /** Product model code, e.g. "RTCGQ13LM" */
  model: string;
  /** Friendly name set by the user */
  name: string;
  /** AIOT space ID (may not match BXML space IDs) */
  spaceId?: string;
  /** Human-readable space name from AIOT */
  spaceName?: string;
  /** Device capabilities from AIOT */
  capabilities: string[];
  /** Aqara Zigbee protocol type */
  protocol: "zigbee" | "ble" | "wifi" | "matter" | "other";
  /** Whether device is currently online */
  online: boolean;
}

export interface MappingResult {
  /** Virtual device ID from BXML */
  virtualDeviceId: string;
  virtualName: string;
  virtualModel: string;
  virtualSpaceId?: string;
  binding: DeviceBinding;
}

export interface AiotSyncResult {
  syncedAt: string;
  aiotDeviceCount: number;
  mapped: MappingResult[];
  unmapped: MappingResult[];
  conflicted: MappingResult[];
  /** Summary for UI display */
  summary: {
    total: number;
    mappedCount: number;
    unmappedCount: number;
    conflictedCount: number;
    coveragePercent: number;
  };
}

/* ══════════════════════════════════════════════
   AIOT Provider (mock for MVP)
   Replace this class with a real HTTP client
   that calls the Aqara AIOT OpenAPI.
   ══════════════════════════════════════════════ */

class MockAiotProvider {
  /** Returns a plausible set of real devices the user owns */
  async fetchDevices(userId?: string): Promise<AiotRealDevice[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 120));

    // Demo dataset — a typical "three-bedroom home" user
    // Intentionally missing some device types to showcase the unmapped flow
    return [
      // Lights (partial — only living room + master bedroom)
      {
        deviceId: "real.lumi.light.001",
        model: "ZNLDP13LM",
        name: "客厅主灯",
        spaceId: "aiot.living_room",
        spaceName: "客厅",
        capabilities: ["OnOff", "Brightness", "ColorTemp"],
        protocol: "zigbee",
        online: true,
      },
      {
        deviceId: "real.lumi.light.002",
        model: "ZNLDP13LM",
        name: "主卧灯",
        spaceId: "aiot.master_bedroom",
        spaceName: "主卧",
        capabilities: ["OnOff", "Brightness"],
        protocol: "zigbee",
        online: true,
      },
      // Air conditioners (living room + master bedroom only)
      {
        deviceId: "real.lumi.ac.001",
        model: "KTWKQ03ES",
        name: "客厅空调",
        spaceId: "aiot.living_room",
        spaceName: "客厅",
        capabilities: ["OnOff", "Mode", "Temperature", "Fan"],
        protocol: "zigbee",
        online: true,
      },
      {
        deviceId: "real.lumi.ac.002",
        model: "KTWKQ03ES",
        name: "主卧空调",
        spaceId: "aiot.master_bedroom",
        spaceName: "主卧",
        capabilities: ["OnOff", "Mode", "Temperature"],
        protocol: "zigbee",
        online: false,
      },
      // Motion sensors (living room + master bedroom only)
      {
        deviceId: "real.lumi.motion.001",
        model: "RTCGQ13LM",
        name: "客厅人体传感器",
        spaceId: "aiot.living_room",
        spaceName: "客厅",
        capabilities: ["Occupancy"],
        protocol: "zigbee",
        online: true,
      },
      {
        deviceId: "real.lumi.motion.002",
        model: "RTCGQ13LM",
        name: "主卧人体传感器",
        spaceId: "aiot.master_bedroom",
        spaceName: "主卧",
        capabilities: ["Occupancy"],
        protocol: "zigbee",
        online: true,
      },
      // Contact sensors (entrance door + master window)
      {
        deviceId: "real.lumi.contact.001",
        model: "MCCGQ14LM",
        name: "入户门窗磁",
        spaceId: "aiot.entrance",
        spaceName: "门厅",
        capabilities: ["ContactSensor"],
        protocol: "zigbee",
        online: true,
      },
      {
        deviceId: "real.lumi.contact.002",
        model: "MCCGQ14LM",
        name: "主卧窗磁",
        spaceId: "aiot.master_bedroom",
        spaceName: "主卧",
        capabilities: ["ContactSensor"],
        protocol: "zigbee",
        online: true,
      },
    ];
  }
}

const AIOT_PROVIDER = new MockAiotProvider();

/* ══════════════════════════════════════════════
   Mapping algorithm
   ══════════════════════════════════════════════ */

/** Extract the template category from a model string or BXML templateRef */
function getDeviceCategory(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("light") || m.includes("ceiling") || m.includes("down")) return "light";
  if (m.includes("airconditioner") || m.includes("ac") || m.includes("thermostat") || m.includes("ktwkq")) return "ac";
  if (m.includes("motion") || m.includes("rtcgq") || m.includes("presence")) return "motion";
  if (m.includes("contact") || m.includes("mccgq") || m.includes("door") || m.includes("window")) return "contact";
  if (m.includes("curtain") || m.includes("roller")) return "curtain";
  if (m.includes("smoke")) return "smoke";
  if (m.includes("lock")) return "lock";
  if (m.includes("hub") || m.includes("gateway")) return "hub";
  if (m.includes("camera")) return "camera";
  return "other";
}

/** Normalise an AIOT space name to match BXML space names (fuzzy) */
function normaliseSpaceName(name: string): string {
  return name.replace(/\s+/g, "").toLowerCase();
}

/**
 * Core mapping: for each virtual BXML device, find the best matching real device.
 * Returns a map of virtualDeviceId → binding.
 */
function computeMapping(
  virtualDevices: BXMLObject[],
  spaces: BXMLObject[],
  realDevices: AiotRealDevice[],
): Map<string, DeviceBinding> {
  const result = new Map<string, DeviceBinding>();
  const usedRealIds = new Set<string>();

  for (const vd of virtualDevices) {
    const vModel = vd.properties.find((p) => p.key === "model")?.value ?? vd.name;
    const vCategory = getDeviceCategory(vModel);
    const vSpaceName = spaces.find((s) => s.id === vd.parentId)?.name ?? "";
    const vSpaceNorm = normaliseSpaceName(vSpaceName);

    // Candidates sorted by match score (higher = better)
    const scored = realDevices
      .filter((r) => !usedRealIds.has(r.deviceId))
      .map((r) => {
        const rCategory = getDeviceCategory(r.model);
        const rSpaceNorm = normaliseSpaceName(r.spaceName ?? "");
        let score = 0;
        if (rCategory === vCategory) score += 10;
        if (rSpaceNorm === vSpaceNorm && vSpaceNorm) score += 5;
        // Partial space name match (e.g., "主卧" in "主卧室")
        if (vSpaceNorm && rSpaceNorm && (rSpaceNorm.includes(vSpaceNorm) || vSpaceNorm.includes(rSpaceNorm))) {
          score += 2;
        }
        return { real: r, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // No candidate found
      result.set(vd.id, {
        bindingStatus: "unmapped",
        missingReason: `没有找到匹配的 ${vCategory} 设备`,
        purchaseSku: vModel,
      });
      continue;
    }

    const topScore = scored[0].score;
    const topCandidates = scored.filter((c) => c.score === topScore);

    if (topCandidates.length > 1) {
      // Multiple equally-scored candidates → conflicted
      result.set(vd.id, {
        bindingStatus: "conflicted",
        missingReason: "多个设备匹配，需手动确认",
        conflictCandidates: topCandidates.map((c) => c.real.deviceId),
        purchaseSku: vModel,
      });
    } else {
      // Unique best match → mapped
      const winner = topCandidates[0].real;
      usedRealIds.add(winner.deviceId);
      result.set(vd.id, {
        bindingStatus: "mapped",
        realDeviceId: winner.deviceId,
        realModel: winner.model,
      });
    }
  }

  return result;
}

/* ══════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════ */

/** Fetch real devices from AIOT platform for a user */
export async function fetchUserAiotDevices(userId?: string): Promise<AiotRealDevice[]> {
  return AIOT_PROVIDER.fetchDevices(userId);
}

/**
 * Sync AIOT devices → map virtual BXML devices to real physical devices.
 * Returns a full AiotSyncResult with mapped/unmapped/conflicted lists.
 */
export async function mapVirtualToRealDevices(
  bxml: BXMLDocument,
  userId?: string,
): Promise<AiotSyncResult> {
  const realDevices = await fetchUserAiotDevices(userId);
  const virtualDevices = bxml.objects.filter((o) => o.type === "device");
  const spaces = bxml.objects.filter((o) => o.type === "space");

  const bindingMap = computeMapping(virtualDevices, spaces, realDevices);

  const mapped: MappingResult[] = [];
  const unmapped: MappingResult[] = [];
  const conflicted: MappingResult[] = [];

  for (const vd of virtualDevices) {
    const binding = bindingMap.get(vd.id) ?? { bindingStatus: "unmapped" as const, missingReason: "未处理" };
    const vModel = vd.properties.find((p) => p.key === "model")?.value ?? "unknown";
    const spaceName = spaces.find((s) => s.id === vd.parentId)?.name;

    // Enrich binding with purchase URL for unmapped/conflicted
    const enrichedBinding: DeviceBinding = {
      ...binding,
      purchaseSku: binding.purchaseSku ?? vModel,
    };

    const entry: MappingResult = {
      virtualDeviceId: vd.id,
      virtualName: vd.name,
      virtualModel: vModel,
      virtualSpaceId: vd.parentId,
      binding: enrichedBinding,
    };

    if (enrichedBinding.bindingStatus === "mapped") {
      mapped.push(entry);
    } else if (enrichedBinding.bindingStatus === "conflicted") {
      conflicted.push(entry);
    } else {
      unmapped.push(entry);
    }
  }

  const total = virtualDevices.length;
  const mappedCount = mapped.length;
  const unmappedCount = unmapped.length;
  const conflictedCount = conflicted.length;

  return {
    syncedAt: new Date().toISOString(),
    aiotDeviceCount: realDevices.length,
    mapped,
    unmapped,
    conflicted,
    summary: {
      total,
      mappedCount,
      unmappedCount,
      conflictedCount,
      coveragePercent: total > 0 ? Math.round((mappedCount / total) * 100) : 0,
    },
  };
}

/**
 * Resolve a conflicted device by choosing one of the candidates.
 * Returns the updated binding.
 */
export function resolveConflict(
  virtualDeviceId: string,
  chosenRealDeviceId: string,
  realDevices: AiotRealDevice[],
): DeviceBinding {
  const real = realDevices.find((r) => r.deviceId === chosenRealDeviceId);
  if (!real) return { bindingStatus: "unmapped", missingReason: "选择的设备不存在" };
  return {
    bindingStatus: "mapped",
    realDeviceId: chosenRealDeviceId,
    realModel: real.model,
  };
}
