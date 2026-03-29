export interface StudioNode {
  id: string;
  name: string;
  location: string;
  status: "online" | "degraded" | "offline";
  cpuLoad: number;
  memoryUsage: number;
  lat: number;
  lng: number;
  model: "M300" | "M200";
  lastSeen: string;
  registeredAt: string;
  deviceId: string;
  ip: string;
  logicSuccessRate: number;
  graphNodes: number;
  networkLatency: number;
  deviceOnlineRate: number;
  firmware: string;
}

export const STUDIOS_BY_ID: Record<string, StudioNode> = {
  "studio-1": {
    id: "studio-1",
    name: "Beijing HQ - M300",
    location: "Beijing, China",
    status: "online",
    cpuLoad: 45,
    memoryUsage: 60,
    lat: 39.9042,
    lng: 116.4074,
    model: "M300",
    lastSeen: "Just now",
    registeredAt: "2023-01-15T08:00:00Z",
    deviceId: "M300-BJ-001",
    ip: "192.168.1.100",
    logicSuccessRate: 99.9,
    graphNodes: 120,
    networkLatency: 12,
    deviceOnlineRate: 98,
    firmware: "v2.1.0",
  },
  "studio-2": {
    id: "studio-2",
    name: "Shanghai Branch - M200",
    location: "Shanghai, China",
    status: "degraded",
    cpuLoad: 85,
    memoryUsage: 90,
    lat: 31.2304,
    lng: 121.4737,
    model: "M200",
    lastSeen: "2 mins ago",
    registeredAt: "2023-03-22T10:30:00Z",
    deviceId: "M200-SH-002",
    ip: "192.168.1.101",
    logicSuccessRate: 95.5,
    graphNodes: 45,
    networkLatency: 150,
    deviceOnlineRate: 85,
    firmware: "v1.8.5",
  },
  "studio-3": {
    id: "studio-3",
    name: "Shenzhen R&D - M300",
    location: "Shenzhen, China",
    status: "offline",
    cpuLoad: 0,
    memoryUsage: 0,
    lat: 22.5431,
    lng: 114.0579,
    model: "M300",
    lastSeen: "2 days ago",
    registeredAt: "2023-06-10T14:20:00Z",
    deviceId: "M300-SZ-003",
    ip: "192.168.1.102",
    logicSuccessRate: 0,
    graphNodes: 200,
    networkLatency: 0,
    deviceOnlineRate: 0,
    firmware: "v2.0.1",
  },
};

export function getStudiosByIds(ids: string[]): StudioNode[] {
  return ids.map((id) => STUDIOS_BY_ID[id]).filter(Boolean);
}

export function getStudioById(id: string): StudioNode | undefined {
  return STUDIOS_BY_ID[id];
}

export function getAllStudioIds(): string[] {
  return Object.keys(STUDIOS_BY_ID);
}
