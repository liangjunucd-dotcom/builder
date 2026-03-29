/**
 * Agent Skills — capabilities the user can enable before entering the AI Build vibe session.
 * Each skill tells the agent what domain knowledge / actions it can use during BXML generation.
 */

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "space" | "device" | "automation" | "integration" | "app";
  defaultEnabled: boolean;
}

export const AGENT_SKILLS: AgentSkill[] = [
  // Space understanding
  { id: "floor_plan", name: "Floor Plan Analysis", description: "Parse uploaded floor plan images to auto-detect rooms, doors, and windows", icon: "🗺️", category: "space", defaultEnabled: true },
  { id: "space_ontology", name: "Space Ontology", description: "Use the Aqara spatial ontology model to classify zones and infer room functions", icon: "🏗️", category: "space", defaultEnabled: true },

  // Device placement
  { id: "device_recommend", name: "Device Recommendation", description: "Recommend optimal devices for each room based on space type and user needs", icon: "📡", category: "device", defaultEnabled: true },
  { id: "bom_generate", name: "BOM Generation", description: "Generate a bill-of-materials with device quantities and estimated costs", icon: "📋", category: "device", defaultEnabled: true },

  // Automation
  { id: "auto_presence", name: "Presence Automation", description: "Create automations based on FP2 presence detection zones", icon: "👁️", category: "automation", defaultEnabled: true },
  { id: "auto_schedule", name: "Schedule & Scenes", description: "Generate time-based schedules and user scenes (Welcome Home, Good Night, etc.)", icon: "⏰", category: "automation", defaultEnabled: true },
  { id: "auto_security", name: "Security & Safety", description: "Set up smoke, water leak, intrusion alerts and emergency protocols", icon: "🔒", category: "automation", defaultEnabled: false },
  { id: "auto_energy", name: "Energy Optimization", description: "Create energy-saving rules: daylight harvesting, standby power, HVAC scheduling", icon: "⚡", category: "automation", defaultEnabled: false },

  // Integration
  { id: "aiot_sync", name: "AIOT Data Sync", description: "Sync existing device configurations from the user's Aqara Home account", icon: "🔄", category: "integration", defaultEnabled: false },
  { id: "matter_bridge", name: "Matter / HomeKit", description: "Enable Matter bridge and Apple HomeKit exposure for cross-platform control", icon: "🌐", category: "integration", defaultEnabled: false },

  // App generation
  { id: "app_pages", name: "App Page Generation", description: "Generate Aqara Life App pages with device cards, scene buttons, and dashboards", icon: "📱", category: "app", defaultEnabled: false },
  { id: "voice_control", name: "Voice Control Setup", description: "Configure voice assistant integration (Siri, Alexa, Google Home)", icon: "🗣️", category: "app", defaultEnabled: false },
];

export const SKILL_CATEGORIES = [
  { id: "space", label: "Space Understanding" },
  { id: "device", label: "Device & Hardware" },
  { id: "automation", label: "Automation" },
  { id: "integration", label: "Integration" },
  { id: "app", label: "App & UI" },
] as const;

export function getDefaultEnabledSkillIds(): string[] {
  return AGENT_SKILLS.filter((s) => s.defaultEnabled).map((s) => s.id);
}
