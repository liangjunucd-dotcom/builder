/**
 * catalog-links.ts
 *
 * Maps device model codes / SKU identifiers to Aqara store purchase URLs.
 * MVP: covers the 90 device templates from device-semantic-model.xml.
 * Production: replace this with a CMS or API call.
 */

const AQARA_STORE_BASE = "https://www.aqara.com/us/product";

/** model template id → Aqara product page path */
const MODEL_TO_PATH: Record<string, string> = {
  // Lighting
  Light:                    "/light-bulb-t1",
  CeilingLight:             "/ceiling-light-l1",
  DownLight:                "/downlight-l1",
  LightStrip:               "/light-strip-t1",
  // HVAC
  AirConditioner:           "/air-conditioning-controller-p3",
  Thermostat:               "/thermostat-s3",
  VRV:                      "/vrv-controller",
  HumidityController:       "/humidity-controller",
  // Security sensors
  MotionSensor:             "/motion-sensor-p1",
  ContactSensor:            "/door-window-sensor-p2",
  PresenceSensor:           "/presence-sensor-fp2",
  SmokeSensor:              "/smoke-detector",
  WaterLeakSensor:          "/water-leak-sensor",
  // Curtain / blind
  CurtainMotor:             "/curtain-driver-e1",
  RollerShade:              "/roller-shade-driver-e1",
  // Switches / sockets
  WallSwitch:               "/smart-wall-switch-h1",
  WallSocket:               "/smart-plug-us",
  SceneSwitch:              "/wireless-mini-switch",
  // Locks
  DoorLock:                 "/smart-door-lock-a100",
  // Appliances
  Refrigerator:             "/smart-home",
  WashingMachine:           "/smart-home",
  OvenMicrowave:            "/smart-home",
  // Hub / gateway
  Hub:                      "/hub-m3",
  HubMini:                  "/hub-mini-m2",
  // Camera
  Camera:                   "/camera-hub-g5-pro",
  // Air quality
  AirQualitySensor:         "/tvoc-air-quality-monitor",
  // Generic fallback
  default:                  "",
};

/**
 * Returns a purchase URL for a given model/SKU string.
 * Falls back to the Aqara product listing page.
 */
export function getPurchaseUrl(modelOrSku: string): string {
  // Try exact match first
  if (MODEL_TO_PATH[modelOrSku]) {
    return `${AQARA_STORE_BASE}${MODEL_TO_PATH[modelOrSku]}`;
  }
  // Try prefix match (e.g., "Light_ZigBee" matches "Light")
  for (const [key, path] of Object.entries(MODEL_TO_PATH)) {
    if (key !== "default" && modelOrSku.toLowerCase().includes(key.toLowerCase())) {
      return `${AQARA_STORE_BASE}${path}`;
    }
  }
  return "https://www.aqara.com/us/product-list.html";
}

/** Returns the display name of a model template for UI labels */
export function getModelDisplayName(model: string): string {
  const NAMES: Record<string, string> = {
    Light: "智能灯",
    CeilingLight: "吸顶灯",
    DownLight: "筒灯",
    AirConditioner: "空调控制器",
    Thermostat: "温控面板",
    MotionSensor: "人体传感器",
    ContactSensor: "门窗传感器",
    PresenceSensor: "存在传感器",
    SmokeSensor: "烟雾报警器",
    WaterLeakSensor: "水浸传感器",
    CurtainMotor: "窗帘电机",
    WallSwitch: "智能开关",
    WallSocket: "智能插座",
    SceneSwitch: "场景面板",
    DoorLock: "智能门锁",
    Hub: "中枢网关 M3",
    HubMini: "中枢网关 Mini",
    Camera: "摄像头",
    AirQualitySensor: "空气质量传感器",
  };
  return NAMES[model] ?? model;
}
