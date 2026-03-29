import type { ElementType } from "react";

export type CategoryId = "all" | "automation" | "dashboard" | "space" | "scene" | "template";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All Builds" },
  { id: "automation", label: "Automation" },
  { id: "dashboard", label: "Dashboard" },
  { id: "space", label: "Space Design" },
  { id: "scene", label: "Scene" },
  { id: "template", label: "Template" },
];

export type BuildMode = "automation" | "dashboard" | "space";

export interface DeviceBOMItem {
  name: string;
  model: string;
  qty: number;
  unitPrice: number;
  category: "hub" | "sensor" | "light" | "switch" | "curtain" | "lock" | "camera" | "climate" | "other";
}

export interface GalleryItem {
  id: string;
  title: string;
  author: string;
  avatar: string;
  category: Exclude<CategoryId, "all">;
  likes: number;
  views: number;
  prompt: string;
  visual: string;
  layers: string[];
  tall?: boolean;
  description: string;
  buildMode: BuildMode;
  devices: string[];
  /** Mock YAML/code for the Code tab */
  code: string;

  /** Device BOM for this package — drives the main revenue engine */
  bom?: DeviceBOMItem[];
  /** Total estimated device cost (CNY) for deploying this package */
  estimatedDeviceCost?: number;
  /** Number of times this package has been deployed to real Studios */
  deployCount?: number;
  /** Package commercial license price (CNY/year, 0 = free for personal use) */
  commercialPrice?: number;
  /** Total device revenue attributed to this package (CNY) */
  attributedDeviceRevenue?: number;
  /** Builder's earned commission from device sales (CNY) */
  builderCommission?: number;
  /** Average client rating (1-5) */
  clientRating?: number;
  /** Industry vertical tags */
  verticals?: string[];
  /** Difficulty: beginner / intermediate / advanced */
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface RemixIdea {
  label: string;
  prompt: string;
}

export const REMIX_IDEAS: RemixIdea[] = [
  { label: "🗣 Add Voice Control", prompt: "Add voice assistant control to this space" },
  { label: "👴 Adapt for Elderly", prompt: "Adapt this for elderly-friendly living with safety features" },
  { label: "📊 Turn into Dashboard", prompt: "Convert this into a visual control dashboard" },
  { label: "⚡ Add Energy Monitor", prompt: "Add energy usage tracking and efficiency optimization" },
  { label: "🔒 Enhance Security", prompt: "Add intrusion detection and security alarm integration" },
  { label: "🌙 Add Sleep Mode", prompt: "Add night sleep mode with light and climate automation" },
  { label: "🏢 Adapt for Office", prompt: "Adapt this space for a commercial office environment" },
  { label: "🧒 Child Safety", prompt: "Add child safety features and parent notifications" },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1", title: "Smart Living Room", author: "Alex", avatar: "A",
    category: "automation", likes: 128, views: 1420,
    prompt: "Auto lights, curtains, and AC when I come home",
    visual: "linear-gradient(135deg, #1a1207 0%, #2d1e0e 25%, #3d2b14 50%, #271a0c 75%, #0f0a05 100%)",
    layers: ["🛋", "💡", "🪟"], tall: true,
    description: "FP2 presence-based living room automation — lights, curtains, and AC linked to occupancy.",
    buildMode: "automation",
    devices: ["FP2 Presence Sensor", "Smart Bulb × 2", "Curtain Motor", "AC Companion"],
    code: `trigger:\n  type: presence\n  device: aqara.fp2\n  zone: living_room\n  condition: person_detected\n\nactions:\n  - device: light.living_room\n    action: turn_on\n    params:\n      brightness: 100\n      color_temp: 4000K\n  - device: curtain.living_room\n    action: open\n  - device: ac.living_room\n    action: set_temperature\n    params: { temp: 24, mode: auto }\n\ntimeout:\n  duration: 5m\n  condition: no_presence\n  actions:\n    - device: light.living_room\n      action: turn_off\n    - device: ac.living_room\n      action: turn_off`,
    bom: [
      { name: "FP2 Presence Sensor", model: "PS-S02D", qty: 1, unitPrice: 499, category: "sensor" },
      { name: "LED Bulb T2", model: "ZNLDP13LM", qty: 2, unitPrice: 79, category: "light" },
      { name: "Curtain Driver E1", model: "CM-M01", qty: 1, unitPrice: 399, category: "curtain" },
      { name: "AC Companion P3", model: "KTBL12LM", qty: 1, unitPrice: 249, category: "climate" },
    ],
    estimatedDeviceCost: 1305,
    deployCount: 89,
    commercialPrice: 0,
    attributedDeviceRevenue: 116_145,
    builderCommission: 13_937,
    clientRating: 4.7,
    verticals: ["residential"],
    difficulty: "beginner",
  },
  {
    id: "g2", title: "Whole-Home Dashboard · Dark", author: "Mia", avatar: "M",
    category: "dashboard", likes: 95, views: 890,
    prompt: "Dark-themed control panel for a 3-bedroom home",
    visual: "linear-gradient(160deg, #070d1a 0%, #0c1628 30%, #101e3a 60%, #0a1222 100%)",
    layers: ["📊", "🌡", "💡"],
    description: "Dark-themed whole-home dashboard with light switches, climate gauges, security status, and scene panels.",
    buildMode: "dashboard",
    devices: ["Light × 4", "Temp/Humidity Sensor × 2", "Motion Sensor", "Door Lock"],
    code: `dashboard:\n  theme: dark\n  grid: 3x3\n  widgets:\n    - type: switch\n      device: light.living_room\n      label: Living Room Light\n    - type: switch\n      device: light.bedroom\n      label: Bedroom Light\n    - type: gauge\n      device: sensor.temperature\n      label: Temperature\n    - type: gauge\n      device: sensor.humidity\n      label: Humidity\n    - type: scene\n      name: Home Mode\n      icon: home\n    - type: scene\n      name: Away Mode\n      icon: lock`,
    estimatedDeviceCost: 2_180,
    deployCount: 67,
    commercialPrice: 0,
    clientRating: 4.5,
    verticals: ["residential"],
    difficulty: "beginner",
  },
  {
    id: "g3", title: "3-Bed Apartment · Standard", author: "Builder_Wang", avatar: "W",
    category: "space", likes: 203, views: 2340,
    prompt: "120 sqm 3-bedroom smart home layout",
    visual: "linear-gradient(145deg, #0a0a1a 0%, #0f1530 30%, #141d42 55%, #0d1228 80%, #080810 100%)",
    layers: ["🏠", "📐", "🔌"], tall: true,
    description: "Standard 120 sqm 3-bedroom layout with full smart device placement and 3D preview.",
    buildMode: "space",
    devices: ["Hub M3", "Bulb × 8", "FP2 × 2", "Curtain Motor × 4", "Temp/Humidity × 3", "Door Lock"],
    code: `space:\n  name: 3-Bedroom Apartment\n  area: 120sqm\n  rooms:\n    - name: Living Room\n      devices: [hub.m3, light.ceiling, sensor.fp2]\n    - name: Dining Room\n      devices: [light.pendant, sensor.temp]\n    - name: Master Bedroom\n      devices: [light.x2, curtain.motor, sensor.fp2]\n    - name: Second Bedroom\n      devices: [light.x1, sensor.temp]\n    - name: Study\n      devices: [light.desk, plug.smart]\n    - name: Kitchen\n      devices: [sensor.smoke, sensor.gas]\n    - name: Bathroom\n      devices: [sensor.water, light.mirror]`,
    bom: [
      { name: "Hub M3", model: "HM-M3", qty: 1, unitPrice: 999, category: "hub" },
      { name: "LED Bulb T2", model: "ZNLDP13LM", qty: 8, unitPrice: 79, category: "light" },
      { name: "FP2 Presence Sensor", model: "PS-S02D", qty: 2, unitPrice: 499, category: "sensor" },
      { name: "Curtain Driver E1", model: "CM-M01", qty: 4, unitPrice: 399, category: "curtain" },
      { name: "Temp/Humidity Sensor", model: "TH-S02D", qty: 3, unitPrice: 99, category: "sensor" },
      { name: "Smart Door Lock D100", model: "ZNMS20LM", qty: 1, unitPrice: 1999, category: "lock" },
    ],
    estimatedDeviceCost: 6_924,
    deployCount: 156,
    commercialPrice: 199,
    attributedDeviceRevenue: 1_080_144,
    builderCommission: 129_617,
    clientRating: 4.9,
    verticals: ["residential"],
    difficulty: "intermediate",
  },
  {
    id: "g4", title: "Away Security Mode", author: "Chen", avatar: "C",
    category: "scene", likes: 76, views: 650,
    prompt: "Auto-lock, lights off, cameras armed when I leave",
    visual: "linear-gradient(135deg, #1a0505 0%, #2a0a0a 30%, #1f0f0f 60%, #0f0505 100%)",
    layers: ["🔒", "📹", "🚨"],
    description: "One-tap away mode: lights off, door locked, cameras armed, alarm ready.",
    buildMode: "automation",
    devices: ["Smart Door Lock", "Camera G3", "Bulb × 6", "Siren"],
    code: `scene:\n  name: Away Security\n  trigger: door_lock.locked\n  actions:\n    - group: lights\n      action: turn_off_all\n    - device: camera.g3\n      action: enable_motion_detection\n    - device: alarm.siren\n      action: arm\n    - notification:\n        to: owner\n        message: "Away mode activated"`,
    estimatedDeviceCost: 3_876,
    deployCount: 45,
    commercialPrice: 0,
    clientRating: 4.6,
    verticals: ["residential"],
    difficulty: "beginner",
  },
  {
    id: "g5", title: "Hotel Room Panel", author: "HotelTech", avatar: "H",
    category: "dashboard", likes: 167, views: 1800,
    prompt: "Hotel guest room check-in/out panel",
    visual: "linear-gradient(150deg, #051210 0%, #0a2220 30%, #0e2e2a 55%, #071816 80%, #040e0d 100%)",
    layers: ["🏨", "🛎", "🔑"], tall: true,
    description: "Hotel room management panel: check-in/out, lighting & AC, SOS alarm, and room service.",
    buildMode: "dashboard",
    devices: ["Keycard Reader", "Light × 3", "AC Panel", "Curtain", "SOS Button"],
    code: `dashboard:\n  theme: hotel_dark\n  grid: 3x2\n  widgets:\n    - type: status\n      source: card_reader\n      label: Room Status\n    - type: switch\n      device: light.main\n    - type: switch\n      device: light.night\n    - type: slider\n      device: ac.room\n      range: [16, 30]\n    - type: scene\n      name: Welcome Mode\n    - type: scene\n      name: Checkout Mode`,
    bom: [
      { name: "Hub M3", model: "HM-M3", qty: 1, unitPrice: 999, category: "hub" },
      { name: "Scene Panel S1", model: "MFCZQ12LM", qty: 1, unitPrice: 599, category: "switch" },
      { name: "LED Panel Light", model: "LGYCQ01LM", qty: 3, unitPrice: 299, category: "light" },
      { name: "AC Companion P3", model: "KTBL12LM", qty: 1, unitPrice: 249, category: "climate" },
      { name: "Curtain Driver E1", model: "CM-M01", qty: 1, unitPrice: 399, category: "curtain" },
    ],
    estimatedDeviceCost: 3_143,
    deployCount: 312,
    commercialPrice: 299,
    attributedDeviceRevenue: 980_616,
    builderCommission: 147_092,
    clientRating: 4.8,
    verticals: ["hotel"],
    difficulty: "advanced",
  },
  {
    id: "g6", title: "Smart Office", author: "OfficeAI", avatar: "O",
    category: "space", likes: 89, views: 720,
    prompt: "100 sqm smart office with open area and meeting rooms",
    visual: "linear-gradient(140deg, #0a0d18 0%, #0e152a 35%, #121c38 60%, #0b1020 100%)",
    layers: ["🏢", "💼", "☕"],
    description: "100 sqm smart office layout with open workspace, meeting room, and pantry device placement.",
    buildMode: "space",
    devices: ["Hub M3", "FP2 × 3", "Light Panel × 6", "Temp/Humidity × 2", "Air Quality Sensor"],
    code: `space:\n  name: Smart Office\n  area: 100sqm\n  rooms:\n    - name: Open Area\n      devices: [fp2.x2, light_panel.x4, sensor.air]\n    - name: Meeting Room\n      devices: [fp2, light_panel.x2, sensor.temp]\n    - name: Pantry\n      devices: [sensor.smoke, plug.x2]`,
  },
  {
    id: "g7", title: "Green Energy Saver", author: "GreenTech", avatar: "G",
    category: "automation", likes: 145, views: 1100,
    prompt: "Auto energy saving when rooms are empty",
    visual: "linear-gradient(135deg, #060f08 0%, #0c1e10 30%, #112a16 55%, #0a180c 80%, #050c06 100%)",
    layers: ["🌿", "⚡", "📉"],
    description: "Whole-home energy saving: presence-based auto-off for lights and AC in empty zones, with energy logging.",
    buildMode: "automation",
    devices: ["FP2 × 3", "Smart Plug × 4", "Bulb × 6", "AC Companion × 2"],
    code: `trigger:\n  type: zone_clear\n  device: aqara.fp2\n  duration: 5m\n\nactions:\n  - scope: zone\n    devices: [lights, ac]\n    action: turn_off\n  - log:\n      type: energy\n      save: true`,
  },
  {
    id: "g8", title: "Cinema Mode", author: "MovieFan", avatar: "F",
    category: "scene", likes: 112, views: 980,
    prompt: "Movie mode: dim lights, close curtains, set the mood",
    visual: "linear-gradient(150deg, #0f0818 0%, #1a0e2a 30%, #22143a 55%, #140c22 80%, #0a0610 100%)",
    layers: ["🎬", "🍿", "🔈"], tall: true,
    description: "One-tap cinema mode: main light off, ambient at 10%, curtains closed. Auto-restore on exit.",
    buildMode: "automation",
    devices: ["Smart Bulb × 3", "Curtain Motor", "IR Remote"],
    code: `scene:\n  name: Cinema Mode\n  actions:\n    - device: light.main\n      action: turn_off\n    - device: light.ambient\n      action: set_brightness\n      params: { brightness: 10 }\n    - device: curtain.living\n      action: close\n    - device: ir.tv\n      action: power_on`,
  },
  {
    id: "g9", title: "Meeting Room Panel", author: "WorkSpace", avatar: "W",
    category: "dashboard", likes: 110, views: 950,
    prompt: "Meeting room booking and environment control panel",
    visual: "linear-gradient(135deg, #080d18 0%, #0e1830 40%, #121e3c 65%, #0b1425 100%)",
    layers: ["📋", "🖥", "🌡"],
    description: "Enterprise meeting room: booking calendar, occupancy status, temperature/CO2 data, and screen sharing.",
    buildMode: "dashboard",
    devices: ["FP2", "Temp/Humidity Sensor", "CO2 Sensor", "Screen Controller"],
    code: `dashboard:\n  theme: corporate\n  widgets:\n    - type: calendar\n      source: room_booking\n    - type: status\n      device: fp2\n      label: Occupancy\n    - type: gauge\n      device: sensor.co2\n    - type: gauge\n      device: sensor.temperature`,
  },
  {
    id: "g10", title: "Sunrise Wake-Up", author: "SunChaser", avatar: "S",
    category: "automation", likes: 62, views: 480,
    prompt: "Gentle sunrise wake-up with curtains and lights",
    visual: "linear-gradient(135deg, #1a1005 0%, #2e1c08 30%, #3c280f 55%, #241708 80%, #100c04 100%)",
    layers: ["🌅", "🪟", "💡"],
    description: "Sunrise-triggered slow curtain open + gradual light brightening for a natural wake-up experience.",
    buildMode: "automation",
    devices: ["Curtain Motor", "Smart Bulb"],
    code: `trigger:\n  type: sunrise\n  offset: 0m\n\nactions:\n  - device: curtain.bedroom\n    action: open\n    params: { duration: 60s }\n  - device: light.bedroom\n    action: brightness_transition\n    params: { from: 0, to: 50, duration: 60s }`,
  },
  {
    id: "g11", title: "Installer Delivery Template", author: "Pro_Builder", avatar: "P",
    category: "template", likes: 189, views: 2100,
    prompt: "Standard residential installation delivery template",
    visual: "linear-gradient(140deg, #0c0c0e 0%, #151518 35%, #1c1c22 60%, #121215 100%)",
    layers: ["📦", "✅", "📋"], tall: true,
    description: "Installer-ready residential template: BOM, wiring guide, automation rules, and acceptance checklist.",
    buildMode: "space",
    devices: ["Hub M3", "Bulb × 12", "Switch Panel × 8", "Curtain Motor × 4", "Door Lock", "Camera × 2"],
    code: `template:\n  name: Standard Residential Delivery\n  version: 1.0\n  includes:\n    - bom: device_list.yaml\n    - automations: rules.yaml\n    - checklist: acceptance.yaml\n  devices: 28\n  rooms: 7\n  automations: 12`,
    bom: [
      { name: "Hub M3", model: "HM-M3", qty: 1, unitPrice: 999, category: "hub" },
      { name: "LED Bulb T2", model: "ZNLDP13LM", qty: 12, unitPrice: 79, category: "light" },
      { name: "Smart Wall Switch H1", model: "WS-EUK03", qty: 8, unitPrice: 199, category: "switch" },
      { name: "Curtain Driver E1", model: "CM-M01", qty: 4, unitPrice: 399, category: "curtain" },
      { name: "Smart Door Lock D100", model: "ZNMS20LM", qty: 1, unitPrice: 1999, category: "lock" },
      { name: "Camera Hub G3", model: "CH-H03D", qty: 2, unitPrice: 599, category: "camera" },
    ],
    estimatedDeviceCost: 8_538,
    deployCount: 423,
    commercialPrice: 399,
    attributedDeviceRevenue: 3_611_574,
    builderCommission: 541_736,
    clientRating: 4.9,
    verticals: ["residential"],
    difficulty: "advanced",
  },
  {
    id: "g12", title: "Kids' Room Safety", author: "SafeHome", avatar: "S",
    category: "space", likes: 78, views: 560,
    prompt: "Child-safe room with sensors and night light",
    visual: "linear-gradient(135deg, #18080f 0%, #2a0e1a 30%, #221018 60%, #120810 100%)",
    layers: ["🧒", "🚪", "🌙"],
    description: "Kids' room safety setup: door/window sensors, temp/humidity monitoring, and automatic night light.",
    buildMode: "space",
    devices: ["Door/Window Sensor × 2", "Temp/Humidity Sensor", "Night Light", "FP2"],
    code: `space:\n  name: Kids Room\n  safety_mode: true\n  devices:\n    - sensor.door_window:\n        alert: child_open_door\n    - sensor.temp_humidity:\n        range: [20, 26]\n    - light.night:\n        trigger: fp2.bed_leave\n    - sensor.fp2:\n        zones: [bed, play_area]`,
  },
  {
    id: "g13", title: "Gym Climate Control", author: "FitSpace", avatar: "F",
    category: "automation", likes: 91, views: 780,
    prompt: "Auto ventilation and temperature for a gym",
    visual: "linear-gradient(140deg, #0a100a 0%, #142014 35%, #1a2e1a 60%, #0d180d 100%)",
    layers: ["🏋", "💨", "🌡"],
    description: "Smart gym environment: auto-boost ventilation when crowded, maintain 20°C, and shut down 15 min after empty.",
    buildMode: "automation",
    devices: ["FP2 × 2", "Ventilation System", "AC", "Temp/Humidity Sensor"],
    code: `trigger:\n  type: occupancy_high\n  threshold: 5\nactions:\n  - device: ventilation\n    action: set_speed\n    params: { level: high }`,
  },
  {
    id: "g14", title: "Retail Lighting", author: "ShopPro", avatar: "S",
    category: "dashboard", likes: 134, views: 1250,
    prompt: "Retail store ambient lighting control panel",
    visual: "linear-gradient(135deg, #12080a 0%, #221015 30%, #2a1520 55%, #180c10 80%, #0c0608 100%)",
    layers: ["💡", "🛍", "✨"],
    description: "Retail lighting dashboard: zone dimming, brand-color ambiance, open/close schedule modes.",
    buildMode: "dashboard",
    devices: ["LED Strip Controller × 8", "Dimmer Panel × 4", "Timer"],
    code: `dashboard:\n  theme: retail_warm\n  zones:\n    - name: Storefront\n      devices: [led_strip.x2]\n    - name: Main Aisle\n      devices: [panel_light.x4]`,
  },
  {
    id: "g15", title: "Warehouse Monitor", author: "LogiTech", avatar: "L",
    category: "dashboard", likes: 88, views: 670,
    prompt: "Warehouse climate and security monitoring dashboard",
    visual: "linear-gradient(145deg, #080a10 0%, #0e1520 35%, #121e30 60%, #0a1018 100%)",
    layers: ["📦", "🌡", "📹"],
    description: "Warehouse dashboard: real-time temp/humidity, smoke alerts, entrance cameras, and energy stats.",
    buildMode: "dashboard",
    devices: ["Temp/Humidity × 6", "Smoke Detector × 4", "Camera × 8", "Energy Meter Gateway"],
    code: `dashboard:\n  grid: 4x3\n  widgets:\n    - type: map\n      source: warehouse_zones\n    - type: alert_panel\n      devices: [smoke.x4]`,
  },
  {
    id: "g16", title: "Airbnb Quick Deploy", author: "HostPro", avatar: "H",
    category: "template", likes: 215, views: 2800,
    prompt: "Short-term rental quick smart home template",
    visual: "linear-gradient(135deg, #100808 0%, #201410 30%, #2a1c14 55%, #181008 80%, #0c0804 100%)",
    layers: ["🏡", "🔑", "📱"], tall: true,
    description: "Airbnb/rental template: passcode lock linked to lights & AC, auto checkout cleanup, energy logging.",
    buildMode: "automation",
    devices: ["Passcode Lock", "Bulb × 5", "AC Companion", "Curtain Motor", "Camera"],
    code: `template:\n  name: Airbnb Deploy\n  triggers:\n    - lock.password_unlock -> welcome_mode\n    - lock.locked + 30min_vacant -> checkout_mode`,
    bom: [
      { name: "Smart Door Lock N200", model: "ZNMS24LM", qty: 1, unitPrice: 1299, category: "lock" },
      { name: "LED Bulb T2", model: "ZNLDP13LM", qty: 5, unitPrice: 79, category: "light" },
      { name: "AC Companion P3", model: "KTBL12LM", qty: 1, unitPrice: 249, category: "climate" },
      { name: "Curtain Driver E1", model: "CM-M01", qty: 1, unitPrice: 399, category: "curtain" },
      { name: "Camera Hub G3", model: "CH-H03D", qty: 1, unitPrice: 599, category: "camera" },
    ],
    estimatedDeviceCost: 2_941,
    deployCount: 287,
    commercialPrice: 149,
    attributedDeviceRevenue: 844_067,
    builderCommission: 101_288,
    clientRating: 4.6,
    verticals: ["hotel", "residential"],
    difficulty: "intermediate",
  },
  {
    id: "g17", title: "Smart Classroom", author: "EduTech", avatar: "E",
    category: "space", likes: 102, views: 890,
    prompt: "Smart classroom with eye-care lighting and air quality",
    visual: "linear-gradient(140deg, #08080f 0%, #101025 35%, #181838 60%, #0c0c1c 100%)",
    layers: ["🏫", "📖", "💡"],
    description: "Smart classroom: eye-care lighting modes, projector-linked curtains, CO2 ventilation alerts, auto-off after class.",
    buildMode: "space",
    devices: ["Eye-Care Panel Light × 8", "CO2 Sensor", "FP2", "IR Remote"],
    code: `space:\n  name: Smart Classroom\n  modes:\n    - class: lights_100, curtain_closed\n    - break: lights_50, ventilation_on\n    - off: all_off`,
  },
  {
    id: "g18", title: "Pet Comfort", author: "PetLover", avatar: "🐾",
    category: "automation", likes: 156, views: 1350,
    prompt: "Keep pets comfortable when I'm away from home",
    visual: "linear-gradient(135deg, #100a08 0%, #201810 30%, #2a2015 55%, #18140a 80%, #0c0a05 100%)",
    layers: ["🐱", "🌡", "📹"],
    description: "Pet care automation: maintain comfortable temperature, water reminders, remote camera, and behavior alerts.",
    buildMode: "automation",
    devices: ["Temp/Humidity Sensor", "Smart Plug", "Camera G3", "FP2"],
    code: `trigger:\n  type: schedule\n  time: "owner_away"\nactions:\n  - device: ac\n    action: maintain_temp\n    params: { range: [22, 26] }\n  - device: camera\n    action: start_monitoring`,
  },
];

export const CAT_COLORS: Record<string, string> = {
  automation: "text-amber-400 bg-amber-500/10",
  dashboard: "text-cyan-400 bg-cyan-500/10",
  space: "text-indigo-400 bg-indigo-500/10",
  scene: "text-purple-400 bg-purple-500/10",
  template: "text-zinc-400 bg-zinc-500/10",
};

export function findGalleryItem(id: string): GalleryItem | undefined {
  return GALLERY_ITEMS.find((item) => item.id === id);
}

export function getTotalBOMCost(bom: DeviceBOMItem[]): number {
  return bom.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function getTopPackagesByDeploys(count = 6): GalleryItem[] {
  return [...GALLERY_ITEMS]
    .filter((i) => (i.deployCount ?? 0) > 0)
    .sort((a, b) => (b.deployCount ?? 0) - (a.deployCount ?? 0))
    .slice(0, count);
}

export function getPackagesByVertical(vertical: string): GalleryItem[] {
  return GALLERY_ITEMS.filter((i) => i.verticals?.includes(vertical));
}
