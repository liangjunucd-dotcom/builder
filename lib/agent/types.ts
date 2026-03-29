import type { BXMLDocument } from "@/lib/bxml";

/* ══════════════════════════════════════════════
   Agent message types
   ══════════════════════════════════════════════ */

export interface AgentMessage {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  timestamp: string;
  /** Which revision this message produced (agent messages only) */
  revision?: number;
  /** Skills invoked during this turn */
  skillsUsed?: string[];
  /** Thinking / reasoning trace (collapsed by default) */
  thinking?: string;
}

/* ══════════════════════════════════════════════
   Intent & Skill types
   ══════════════════════════════════════════════ */

export type IntentType =
  | "create_space"
  | "add_devices"
  | "create_automation"
  | "create_scene"
  | "generate_app_ui"
  | "modify_existing"
  | "generate_full"
  | "estimate_bom"
  | "sync_aiot"
  | "general_chat";

export interface ParsedIntent {
  primary: IntentType;
  secondary: IntentType[];
  entities: Record<string, string>;
  confidence: number;
  rawPrompt: string;
}

export interface SkillInput {
  intent: ParsedIntent;
  currentBXML: BXMLDocument;
  conversationHistory: AgentMessage[];
  userPrompt: string;
}

export interface SkillOutput {
  updatedBXML: BXMLDocument;
  responseText: string;
  thinkingTrace?: string;
  skillId: string;
}

export interface AgentSkillExecutor {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportedIntents: IntentType[];
  execute: (input: SkillInput) => Promise<SkillOutput>;
}

/* ══════════════════════════════════════════════
   Agent orchestrator types
   ══════════════════════════════════════════════ */

export interface AgentTurnResult {
  messages: AgentMessage[];
  updatedBXML: BXMLDocument;
  skillsUsed: string[];
  revisionLabel: string;
}

export interface StreamChunk {
  type: "thinking" | "text" | "skill_start" | "skill_end" | "bxml_update" | "done";
  content: string;
  skillId?: string;
  bxml?: BXMLDocument;
}
