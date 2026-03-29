/**
 * online-studio.ts
 *
 * Online Studio (Cloud Studio) session management.
 *
 * MVP implementation uses in-memory storage with a server-side Map.
 * Production: replace storageGet/storageSet with Vercel Blob or a DB.
 *
 * An Online Studio session represents a cloud-hosted instance of the
 * Aqara Studio runtime that holds a deployed BXML configuration.
 * It provides the "run environment" for users without physical M300 hardware.
 */

import type { BXMLDocument } from "@/lib/bxml";

/* ══════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════ */

export type OnlineStudioStatus =
  | "provisioning"
  | "running"
  | "stopped"
  | "deploying"
  | "error";

export interface OnlineStudioDevice {
  deviceId: string;
  name: string;
  model: string;
  spaceRef?: string;
  spaceName?: string;
  protocol: string;
  /** Current simulated state of the device */
  state: Record<string, unknown>;
}

export interface OnlineStudioSession {
  onlineStudioId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  /** 24-hour TTL — session expires after this timestamp */
  expiresAt: string;
  status: OnlineStudioStatus;
  bxmlRevision: number;
  /** Deployed device list derived from BXML topology */
  devices: OnlineStudioDevice[];
  /** Topology summary for display */
  topology: { spaceId: string; spaceName: string; deviceCount: number }[];
  /** Error message if status === "error" */
  error?: string;
}

export interface DeployResult {
  onlineStudioId: string;
  status: OnlineStudioStatus;
  deviceCount: number;
  topology: OnlineStudioSession["topology"];
  expiresAt: string;
}

/* ══════════════════════════════════════════════
   In-memory store (MVP)
   Uses Node.js global to survive Next.js hot reloads.
   Replace with persistent storage in production.
   ══════════════════════════════════════════════ */

declare global {
  // eslint-disable-next-line no-var
  var __onlineStudioSessions: Map<string, OnlineStudioSession> | undefined;
  // eslint-disable-next-line no-var
  var __projectToSession: Map<string, string> | undefined;
}

function getSessionStore(): Map<string, OnlineStudioSession> {
  if (!global.__onlineStudioSessions) global.__onlineStudioSessions = new Map();
  return global.__onlineStudioSessions;
}

function getProjectMap(): Map<string, string> {
  if (!global.__projectToSession) global.__projectToSession = new Map();
  return global.__projectToSession;
}

const SESSION_STORE = {
  get: (id: string) => getSessionStore().get(id),
  set: (id: string, s: OnlineStudioSession) => getSessionStore().set(id, s),
};
const PROJECT_TO_SESSION = {
  get: (id: string) => getProjectMap().get(id),
  set: (pid: string, sid: string) => getProjectMap().set(pid, sid),
};

function generateStudioId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "os-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/* ══════════════════════════════════════════════
   Core operations
   ══════════════════════════════════════════════ */

/**
 * Deploy a BXML document to a (new or existing) Online Studio session.
 * If the project already has an active session, it is updated in place.
 * If the session is expired, a new one is provisioned.
 */
export async function deployBxmlToOnlineStudio(
  bxml: BXMLDocument,
  projectName: string,
): Promise<DeployResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // Check existing session
  const existingId = PROJECT_TO_SESSION.get(bxml.projectId);
  const existing = existingId ? SESSION_STORE.get(existingId) : undefined;
  const isExpired = existing ? new Date(existing.expiresAt) < now : false;

  const onlineStudioId = (!isExpired && existing) ? existing.onlineStudioId : generateStudioId();

  // Build topology from BXML
  const spaces = bxml.objects.filter((o) => o.type === "space");
  const devices = bxml.objects.filter((o) => o.type === "device");
  const automations = bxml.objects.filter((o) => o.type === "automation");

  const topology = spaces.map((space) => ({
    spaceId: space.id,
    spaceName: space.name,
    deviceCount: devices.filter((d) => d.parentId === space.id).length,
  })).filter((t) => t.deviceCount > 0);

  const studioDevices: OnlineStudioDevice[] = devices.map((d) => {
    const model = d.properties.find((p) => p.key === "model")?.value ?? "unknown";
    const protocol = d.properties.find((p) => p.key === "protocol")?.value ?? "zigbee";
    const spaceName = spaces.find((s) => s.id === d.parentId)?.name;
    return {
      deviceId: d.id,
      name: d.name,
      model,
      spaceRef: d.parentId,
      spaceName,
      protocol,
      // Simulate initial device states
      state: buildInitialDeviceState(model),
    };
  });

  const session: OnlineStudioSession = {
    onlineStudioId,
    projectId: bxml.projectId,
    createdAt: existing?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: isExpired ? expiresAt : (existing?.expiresAt ?? expiresAt),
    status: "running",
    bxmlRevision: bxml.revision,
    devices: studioDevices,
    topology,
  };

  SESSION_STORE.set(onlineStudioId, session);
  PROJECT_TO_SESSION.set(bxml.projectId, onlineStudioId);

  // Simulate async deployment delay
  await new Promise((r) => setTimeout(r, 80));

  return {
    onlineStudioId,
    status: "running",
    deviceCount: studioDevices.length,
    topology,
    expiresAt: session.expiresAt,
  };
}

/** Get an existing Online Studio session by ID */
export function getOnlineStudioSession(onlineStudioId: string): OnlineStudioSession | null {
  const session = SESSION_STORE.get(onlineStudioId);
  if (!session) return null;
  // Mark as stopped if expired
  if (new Date(session.expiresAt) < new Date()) {
    SESSION_STORE.set(onlineStudioId, { ...session, status: "stopped" });
    return { ...session, status: "stopped" };
  }
  return session;
}

/** Get the active session for a project (if any) */
export function getSessionForProject(projectId: string): OnlineStudioSession | null {
  const id = PROJECT_TO_SESSION.get(projectId);
  if (!id) return null;
  return getOnlineStudioSession(id);
}

/** Update the device state (for simulated control commands) */
export function updateDeviceState(
  onlineStudioId: string,
  deviceId: string,
  patch: Record<string, unknown>,
): boolean {
  const session = SESSION_STORE.get(onlineStudioId);
  if (!session) return false;
  const device = session.devices.find((d) => d.deviceId === deviceId);
  if (!device) return false;
  device.state = { ...device.state, ...patch };
  SESSION_STORE.set(onlineStudioId, { ...session, devices: [...session.devices] });
  return true;
}

/* ══════════════════════════════════════════════
   Initial state simulation
   ══════════════════════════════════════════════ */

function buildInitialDeviceState(model: string): Record<string, unknown> {
  const modelLower = model.toLowerCase();
  if (modelLower.includes("light") || modelLower.includes("ceiling") || modelLower.includes("down")) {
    return { OnOff: false, CurrentLevel: 100, ColorTemperature: 4000 };
  }
  if (modelLower.includes("airconditioner") || modelLower.includes("thermostat")) {
    return { OnOff: false, HeaterCoolerMode: "cool", CoolingTemperature: 26, CurrentTemperature: 28, FanMode: "auto" };
  }
  if (modelLower.includes("motion") || modelLower.includes("presence")) {
    return { Occupancy: false, OccupancySensorType: "PIR" };
  }
  if (modelLower.includes("contact") || modelLower.includes("door") || modelLower.includes("window")) {
    return { ContactSensorState: false };
  }
  if (modelLower.includes("curtain") || modelLower.includes("roller")) {
    return { OnOff: false, CurrentPosition: 0 };
  }
  if (modelLower.includes("smoke")) {
    return { SmokeDetected: false };
  }
  if (modelLower.includes("lock")) {
    return { LockState: "locked" };
  }
  return { OnOff: false };
}
