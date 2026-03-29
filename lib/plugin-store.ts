/**
 * Plugin bundle in-memory store (MVP).
 * Uses Node.js global object to persist across hot module reloads in dev.
 * Production: replace with Vercel Blob or database.
 */

import type { PluginBundle } from "@/lib/agent/compiler";

export interface StoredPlugin {
  pluginId: string;
  projectId: string;
  projectName: string;
  storedAt: string;
  bundle: PluginBundle;
}

// Use global to survive Next.js hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __pluginStore: Map<string, StoredPlugin> | undefined;
}

function getStore(): Map<string, StoredPlugin> {
  if (!global.__pluginStore) {
    global.__pluginStore = new Map();
  }
  return global.__pluginStore;
}

export function storePlugin(pluginId: string, plugin: StoredPlugin): void {
  getStore().set(pluginId, plugin);
}

export function getPlugin(pluginId: string): StoredPlugin | undefined {
  return getStore().get(pluginId);
}
