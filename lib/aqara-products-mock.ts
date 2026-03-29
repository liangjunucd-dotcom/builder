/**
 * Mock device list, integration approach: https://us.aqara.com/ store
 * Can be replaced with API calls in production
 */

export type ProductCategory = "gateway" | "sensor" | "lighting" | "security" | "climate" | "power" | "camera";

export interface AqaraProduct {
  sku: string;
  name: string;
  unitPrice: number;
  iconId?: string;
  category: ProductCategory;
  description: string;
  specs?: string[];
  badge?: string;
}

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
  { id: "gateway", label: "Gateway", icon: "📡" },
  { id: "sensor", label: "Sensor", icon: "👁" },
  { id: "lighting", label: "Lighting & Switch", icon: "💡" },
  { id: "security", label: "Security & Lock", icon: "🔒" },
  { id: "climate", label: "Climate Control", icon: "❄️" },
  { id: "power", label: "Power & Plug", icon: "🔌" },
  { id: "camera", label: "Camera", icon: "📹" },
];

export const AQARA_PRODUCTS_MOCK: AqaraProduct[] = [
  {
    sku: "M3",
    name: "Hub M3",
    unitPrice: 69.99,
    iconId: "radio",
    category: "gateway",
    description: "Matter gateway supporting Zigbee 3.0 + Thread, connects up to 128 sub-devices",
    specs: ["Zigbee 3.0", "Thread", "Matter", "128 sub-devices"],
    badge: "Best Seller",
  },
  {
    sku: "E1-Hub",
    name: "Hub E1",
    unitPrice: 29.99,
    iconId: "radio",
    category: "gateway",
    description: "USB portable gateway, ideal for quick deployment in small spaces",
    specs: ["Zigbee 3.0", "USB-C", "32 sub-devices"],
  },
  {
    sku: "G5-Pro",
    name: "Camera Hub G5 Pro",
    unitPrice: 199.99,
    iconId: "video",
    category: "camera",
    description: "2K camera + gateway combo, AI facial recognition + Zigbee gateway",
    specs: ["2K", "AI Face ID", "Zigbee Gateway", "Local Storage"],
    badge: "Pro",
  },
  {
    sku: "G4-Doorbell",
    name: "Video Doorbell G4",
    unitPrice: 119.99,
    iconId: "video",
    category: "camera",
    description: "Smart video doorbell, 1080P + facial recognition + two-way talk",
    specs: ["1080P", "Face ID", "Two-way Talk"],
  },
  {
    sku: "FP2",
    name: "Presence Sensor FP2",
    unitPrice: 59.99,
    iconId: "scan",
    category: "sensor",
    description: "mmWave presence sensor with zone detection + fall detection",
    specs: ["mmWave", "Multi-zone", "Fall Detection", "Wi-Fi"],
    badge: "Recommended",
  },
  {
    sku: "Motion-P2",
    name: "Motion & Light Sensor P2",
    unitPrice: 24.99,
    iconId: "activity",
    category: "sensor",
    description: "Thread motion and light sensor",
    specs: ["Thread", "Light Sensing", "170° FOV"],
  },
  {
    sku: "Motion-P1",
    name: "Motion Sensor P1",
    unitPrice: 19.99,
    iconId: "activity",
    category: "sensor",
    description: "Zigbee motion sensor with low power consumption, 2-year battery life",
    specs: ["Zigbee 3.0", "170°", "2-Year Battery"],
  },
  {
    sku: "Door-Window",
    name: "Door and Window Sensor",
    unitPrice: 17.99,
    iconId: "door-open",
    category: "sensor",
    description: "Door and window contact sensor, triggers automation on open/close",
    specs: ["Zigbee 3.0", "2-Year Battery", "Compact"],
  },
  {
    sku: "T-H-P2",
    name: "Temperature & Humidity Sensor",
    unitPrice: 19.99,
    iconId: "activity",
    category: "sensor",
    description: "Temperature and humidity sensor with E-Ink display",
    specs: ["Zigbee 3.0", "E-Ink Display", "2-Year Battery"],
  },
  {
    sku: "Water-Leak",
    name: "Water Leak Sensor",
    unitPrice: 17.99,
    iconId: "activity",
    category: "sensor",
    description: "Water leak sensor, essential near pipes and washing machines",
    specs: ["Zigbee 3.0", "IP67", "2-Year Battery"],
  },
  {
    sku: "Light-H2",
    name: "Light Switch H2 US",
    unitPrice: 39.99,
    iconId: "lightbulb",
    category: "lighting",
    description: "No-neutral smart wall switch, supports 1/2/3 gang",
    specs: ["Zigbee 3.0", "No Neutral", "Decora"],
  },
  {
    sku: "Dimmer-T1",
    name: "Dimmer Controller T1 Pro",
    unitPrice: 44.99,
    iconId: "lightbulb",
    category: "lighting",
    description: "Knob dimmer controller, supports 0-100% LED dimming",
    specs: ["Zigbee 3.0", "0-100%", "LED Compatible"],
  },
  {
    sku: "LED-Panel",
    name: "Ceiling Light T1M",
    unitPrice: 89.99,
    iconId: "lightbulb",
    category: "lighting",
    description: "Smart ceiling light, adjustable color temperature 2700K-6500K",
    specs: ["Wi-Fi", "2700K-6500K", "24W", "HomeKit"],
  },
  {
    sku: "U100",
    name: "Smart Lock U100",
    unitPrice: 149.99,
    iconId: "lock",
    category: "security",
    description: "Fingerprint smart lock with Apple Home Key support",
    specs: ["Fingerprint", "Apple Home Key", "Matter", "IFTTT"],
    badge: "Best Seller",
  },
  {
    sku: "Smoke-Detector",
    name: "Smoke Detector",
    unitPrice: 39.99,
    iconId: "activity",
    category: "security",
    description: "Smart smoke detector with local + remote dual alerts",
    specs: ["Zigbee 3.0", "85dB", "10-Year Battery"],
  },
  {
    sku: "Roller-E1",
    name: "Roller Shade Driver E1",
    unitPrice: 59.99,
    iconId: "lightbulb",
    category: "climate",
    description: "Roller shade driver, retrofit existing roller shades",
    specs: ["Zigbee 3.0", "Solar Optional", "Silent"],
  },
  {
    sku: "Curtain-B1",
    name: "Curtain Controller B1",
    unitPrice: 89.99,
    iconId: "lightbulb",
    category: "climate",
    description: "Curtain controller B1 with Zigbee + HomeKit support",
    specs: ["Zigbee 3.0", "HomeKit", "Silent"],
  },
  {
    sku: "Smart-Plug",
    name: "Smart Plug",
    unitPrice: 24.99,
    iconId: "plug",
    category: "power",
    description: "Smart plug with power monitoring + scheduling + automation",
    specs: ["Zigbee 3.0", "Power Monitor", "15A"],
  },
  {
    sku: "Plug-T2",
    name: "Dual Plug T2",
    unitPrice: 34.99,
    iconId: "plug",
    category: "power",
    description: "Dual-outlet smart plug with independent control + energy tracking",
    specs: ["Matter", "Dual Independent Control", "15A x2"],
  },
];

export const AQARA_STORE_URL = "https://us.aqara.com/";
