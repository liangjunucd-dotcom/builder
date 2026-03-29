/**
 * Plugin Marketplace Mock Data
 */

export type PluginBadge = "Official" | "Matter" | "Beta" | "Other";
export type PluginCategory =
  | "all"
  | "trending"
  | "Bridge Service"
  | "Communication Protocol"
  | "Device Access"
  | "Low-level Driver";

export interface PluginListItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  price: number | "Free";
  badge: PluginBadge;
  downloads: string;
  likes: string;
  thumbnail?: string;
  categories: PluginCategory[];
}

export interface PluginDetail extends PluginListItem {
  version: string;
  fileSize: string;
  description: string;
  adaptedProducts: { id: string; name: string; price: number; icon?: string }[];
  changelog: { version: string; fileSize: string; updated: string; bullets: string[] };
}

const PLUGINS_LIST: PluginListItem[] = [
  {
    id: "homekit-pro",
    title: "HomeKit Advanced Integration Pro",
    author: "Courtney",
    price: 9.99,
    badge: "Official",
    downloads: "8.1k",
    likes: "12 k",
    categories: ["all", "trending", "Device Access"],
  },
  {
    id: "matter-bridge",
    title: "Matter Protocol Bridging Service",
    author: "Courtney",
    price: "Free",
    badge: "Matter",
    downloads: "5.2k",
    likes: "8 k",
    categories: ["all", "trending", "Bridge Service"],
  },
  {
    id: "log-exporter",
    title: "Advanced Log Exporter",
    author: "Courtney",
    price: "Free",
    badge: "Beta",
    downloads: "3.1k",
    likes: "4 k",
    categories: ["all", "Low-level Driver"],
  },
  {
    id: "automation-plugin",
    title: "Automation plugin",
    author: "Courtney",
    price: 9.99,
    badge: "Other",
    downloads: "6.8k",
    likes: "9 k",
    categories: ["all", "Communication Protocol"],
  },
  {
    id: "zigbee-bridge",
    title: "Zigbee 3.0 Bridge",
    author: "Courtney",
    price: "Free",
    badge: "Official",
    downloads: "4.5k",
    likes: "7 k",
    categories: ["all", "Bridge Service"],
  },
  {
    id: "ble-driver",
    title: "BLE Mesh Low-level Driver",
    author: "Courtney",
    price: 4.99,
    badge: "Beta",
    downloads: "2.1k",
    likes: "3 k",
    categories: ["all", "Low-level Driver"],
  },
];

const ADAPTED_PRODUCTS = [
  { id: "pkg", name: "Package", price: 299.99 },
  { id: "m200", name: "Hub M200", price: 129.99 },
  { id: "m100", name: "Hub M100", price: 129.99 },
  { id: "m3", name: "Hub M3", price: 129.99 },
];

export function getPluginsList(category: PluginCategory = "all"): PluginListItem[] {
  if (category === "all") return [...PLUGINS_LIST];
  return PLUGINS_LIST.filter((p) => p.categories.includes(category));
}

export function getPluginById(id: string): PluginDetail | null {
  const base = PLUGINS_LIST.find((p) => p.id === id);
  if (!base) return null;
  const isHomeKit = id === "homekit-pro";
  return {
    ...base,
    version: isHomeKit ? "2.4.0" : "1.0.0",
    fileSize: isHomeKit ? "5.72MB" : "2.1MB",
    description: isHomeKit
      ? "Advanced HomeKit mapping functionality, supporting custom Characteristics and complex device types. Deep compatibility with the HomeKit smart ecosystem, adaptation to all types of complex device models, breaking configuration limitations. Seamless integration of complex smart devices for a more flexible and user-centric whole-home smart automation experience. Enables intuitive, on-demand control of smart devices."
      : "Plugin description and features.",
    adaptedProducts: ADAPTED_PRODUCTS,
    changelog: {
      version: isHomeKit ? "2.4.0" : "1.0.0",
      fileSize: isHomeKit ? "5.72MiB" : "2.1MiB",
      updated: "2026-03-01",
      bullets: isHomeKit
        ? [
            "Optimized device discovery speed",
            "Fixed network reconnection issues",
            "Added 3 types of custom Characteristic types",
          ]
        : ["Initial release"],
    },
  };
}

export const PLUGIN_CATEGORIES: { id: PluginCategory; label: string; badge?: number }[] = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending", badge: 2 },
  { id: "Bridge Service", label: "Bridge Service" },
  { id: "Communication Protocol", label: "Communication Protocol" },
  { id: "Device Access", label: "Device Access" },
  { id: "Low-level Driver", label: "Low-level Driver" },
];
