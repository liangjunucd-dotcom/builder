/**
 * BXML — Builder XML
 *
 * The single source of truth for any Aqara Builder project.
 * All Agent skills output into this format; all renderers consume it.
 *
 * BModel: the base XML schema (object types, property slots, relation templates).
 * BXML:   an instantiated document = one deployable project.
 *
 * Flow:   User NL  ──► Agent + Skills ──► BXML draft
 *         User edit ──► Agent mutates BXML (new revision)
 *         Deploy    ──► BXML → Studio DSL  OR  BXML → Life App Plugin
 */

/* ══════════════════════════════════════════════
   Object types
   ══════════════════════════════════════════════ */

export type BXMLObjectType =
  | "space"
  | "device"
  | "scene"
  | "automation"
  | "widget"
  | "group";

export type BXMLRelationType =
  | "contains"
  | "triggers"
  | "controls"
  | "depends_on"
  | "linked_to";

export type BXMLAgentStep =
  | "describe"
  | "generate"
  | "refine"
  | "deploy";

/* ══════════════════════════════════════════════
   Core types
   ══════════════════════════════════════════════ */

export interface BXMLProperty {
  key: string;
  value: string;
  unit?: string;
}

/* Device-to-real-world binding metadata (populated after AIOT sync) */
export type DeviceBindingStatus = "unmapped" | "mapped" | "conflicted";

export interface DeviceBinding {
  /** Whether this virtual device has been bound to a real physical device */
  bindingStatus: DeviceBindingStatus;
  /** Real device ID from AIOT platform (set when mapped/conflicted) */
  realDeviceId?: string;
  /** Actual physical model code matched from AIOT (may differ from virtual model) */
  realModel?: string;
  /** Human-readable reason why the device cannot be mapped */
  missingReason?: string;
  /** SKU identifier used to build a purchase URL for this device */
  purchaseSku?: string;
  /** Conflict details when multiple real devices match (bindingStatus = "conflicted") */
  conflictCandidates?: string[];
}

export interface BXMLObject {
  id: string;
  type: BXMLObjectType;
  name: string;
  icon?: string;
  properties: BXMLProperty[];
  parentId?: string;
  /** Only present on objects of type "device"; populated after AIOT sync */
  binding?: DeviceBinding;
}

export interface BXMLRelation {
  id: string;
  type: BXMLRelationType;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface BXMLDocument {
  version: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  objects: BXMLObject[];
  relations: BXMLRelation[];
  summary?: string;
  /** Online Studio session this BXML is deployed to */
  onlineStudioId?: string;
  /** ISO timestamp of last successful deployment to online studio */
  deployedAt?: string;
  /** ISO timestamp of last AIOT sync */
  aiotSyncedAt?: string;
}

/* ══════════════════════════════════════════════
   Revision / Version history
   ══════════════════════════════════════════════ */

export interface BXMLRevision {
  revision: number;
  timestamp: string;
  label: string;
  triggeredBy: "user" | "agent";
  messageId?: string;
  snapshot: BXMLDocument;
  /** Stats delta compared to previous revision */
  delta?: {
    spacesAdded: number;
    devicesAdded: number;
    automationsAdded: number;
    scenesAdded: number;
  };
}

export interface BXMLVersionStore {
  projectId: string;
  currentRevision: number;
  revisions: BXMLRevision[];
}

/* ══════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════ */

export function createEmptyBXML(projectId: string): BXMLDocument {
  const now = new Date().toISOString();
  return {
    version: "1.0",
    projectId,
    createdAt: now,
    updatedAt: now,
    revision: 0,
    objects: [],
    relations: [],
  };
}

export function countByType(doc: BXMLDocument, type: BXMLObjectType): number {
  return doc.objects.filter((o) => o.type === type).length;
}

export function getChildren(doc: BXMLDocument, parentId: string): BXMLObject[] {
  return doc.objects.filter((o) => o.parentId === parentId);
}

export function getRelationsFor(doc: BXMLDocument, objectId: string): BXMLRelation[] {
  return doc.relations.filter((r) => r.sourceId === objectId || r.targetId === objectId);
}

export function getObjectsByType(doc: BXMLDocument, type: BXMLObjectType): BXMLObject[] {
  return doc.objects.filter((o) => o.type === type);
}

export function getBXMLStats(doc: BXMLDocument) {
  return {
    spaces: countByType(doc, "space"),
    devices: countByType(doc, "device"),
    automations: countByType(doc, "automation"),
    scenes: countByType(doc, "scene"),
    widgets: countByType(doc, "widget"),
    groups: countByType(doc, "group"),
    relations: doc.relations.length,
  };
}

export function computeDelta(prev: BXMLDocument | null, next: BXMLDocument) {
  const p = prev ? getBXMLStats(prev) : { spaces: 0, devices: 0, automations: 0, scenes: 0 };
  const n = getBXMLStats(next);
  return {
    spacesAdded: n.spaces - p.spaces,
    devicesAdded: n.devices - p.devices,
    automationsAdded: n.automations - p.automations,
    scenesAdded: n.scenes - p.scenes,
  };
}

/* ══════════════════════════════════════════════
   Version store operations
   ══════════════════════════════════════════════ */

export function createVersionStore(projectId: string): BXMLVersionStore {
  return { projectId, currentRevision: 0, revisions: [] };
}

export function pushRevision(
  store: BXMLVersionStore,
  doc: BXMLDocument,
  label: string,
  triggeredBy: "user" | "agent",
  messageId?: string,
): BXMLVersionStore {
  const prev = store.revisions.length > 0
    ? store.revisions[store.revisions.length - 1].snapshot
    : null;
  const newRev = store.currentRevision + 1;
  const snapshot: BXMLDocument = {
    ...doc,
    revision: newRev,
    updatedAt: new Date().toISOString(),
  };
  const revision: BXMLRevision = {
    revision: newRev,
    timestamp: snapshot.updatedAt,
    label,
    triggeredBy,
    messageId,
    snapshot,
    delta: computeDelta(prev, snapshot),
  };
  return {
    ...store,
    currentRevision: newRev,
    revisions: [...store.revisions, revision],
  };
}

export function revertToRevision(store: BXMLVersionStore, targetRevision: number): BXMLVersionStore {
  const target = store.revisions.find((r) => r.revision === targetRevision);
  if (!target) return store;
  const revertedDoc: BXMLDocument = {
    ...target.snapshot,
    revision: store.currentRevision + 1,
    updatedAt: new Date().toISOString(),
  };
  const revertRevision: BXMLRevision = {
    revision: revertedDoc.revision,
    timestamp: revertedDoc.updatedAt,
    label: `Reverted to v${targetRevision}`,
    triggeredBy: "user",
    snapshot: revertedDoc,
    delta: computeDelta(
      store.revisions[store.revisions.length - 1]?.snapshot ?? null,
      revertedDoc,
    ),
  };
  return {
    ...store,
    currentRevision: revertedDoc.revision,
    revisions: [...store.revisions, revertRevision],
  };
}

export function getCurrentSnapshot(store: BXMLVersionStore): BXMLDocument | null {
  if (store.revisions.length === 0) return null;
  return store.revisions[store.revisions.length - 1].snapshot;
}

/* ══════════════════════════════════════════════
   BXML Diff (structural)
   ══════════════════════════════════════════════ */

export interface BXMLDiffEntry {
  type: "added" | "removed" | "modified";
  objectType?: BXMLObjectType;
  name: string;
  details?: string;
}

export function diffBXML(a: BXMLDocument, b: BXMLDocument): BXMLDiffEntry[] {
  const entries: BXMLDiffEntry[] = [];
  const aMap = new Map(a.objects.map((o) => [o.id, o]));
  const bMap = new Map(b.objects.map((o) => [o.id, o]));

  for (const [id, obj] of bMap) {
    if (!aMap.has(id)) {
      entries.push({ type: "added", objectType: obj.type, name: obj.name });
    } else {
      const old = aMap.get(id)!;
      if (old.name !== obj.name || JSON.stringify(old.properties) !== JSON.stringify(obj.properties)) {
        entries.push({ type: "modified", objectType: obj.type, name: obj.name, details: `Updated from "${old.name}"` });
      }
    }
  }
  for (const [id, obj] of aMap) {
    if (!bMap.has(id)) {
      entries.push({ type: "removed", objectType: obj.type, name: obj.name });
    }
  }
  return entries;
}

/* ══════════════════════════════════════════════
   Device binding helpers
   ══════════════════════════════════════════════ */

/** Apply AIOT mapping results onto the BXML devices in-place. Returns new document. */
export function applyDeviceBindings(
  doc: BXMLDocument,
  bindings: Map<string, DeviceBinding>,
): BXMLDocument {
  return {
    ...doc,
    updatedAt: new Date().toISOString(),
    objects: doc.objects.map((obj) => {
      if (obj.type !== "device") return obj;
      const b = bindings.get(obj.id);
      if (!b) return { ...obj, binding: { bindingStatus: "unmapped", missingReason: "Not found in AIOT" } };
      return { ...obj, binding: b };
    }),
  };
}

/** Count devices by binding status for UI display */
export function getBindingStats(doc: BXMLDocument) {
  const devices = doc.objects.filter((o) => o.type === "device");
  return {
    total: devices.length,
    mapped: devices.filter((d) => d.binding?.bindingStatus === "mapped").length,
    unmapped: devices.filter((d) => !d.binding || d.binding.bindingStatus === "unmapped").length,
    conflicted: devices.filter((d) => d.binding?.bindingStatus === "conflicted").length,
  };
}
