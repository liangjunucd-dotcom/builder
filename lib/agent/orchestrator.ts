import type { BXMLDocument } from "@/lib/bxml";
import { getBXMLStats } from "@/lib/bxml";
import type { AgentMessage, AgentTurnResult, AgentSkillExecutor, IntentType } from "./types";
import { parseIntent } from "./intent-parser";
import { spaceModelingSkill } from "./skills/space-modeling";
import { deviceResolveSkill } from "./skills/device-resolve";
import { automationGenSkill } from "./skills/automation-gen";
import { sceneGenSkill } from "./skills/scene-gen";
import { appUiGenSkill } from "./skills/app-ui-gen";
import { bomEstimateSkill } from "./skills/bom-estimate";

const ALL_SKILLS: AgentSkillExecutor[] = [
  spaceModelingSkill,
  deviceResolveSkill,
  automationGenSkill,
  sceneGenSkill,
  appUiGenSkill,
  bomEstimateSkill,
];

/**
 * For "generate_full", skills execute in dependency order.
 */
const FULL_GENERATION_ORDER: string[] = [
  "space_modeling",
  "device_resolve",
  "automation_gen",
  "scene_gen",
  "app_ui_gen",
];

function findSkillsForIntent(intent: IntentType): AgentSkillExecutor[] {
  return ALL_SKILLS.filter((s) => s.supportedIntents.includes(intent));
}

let _msgUid = 0;
function msgId() {
  return `msg-${Date.now()}-${++_msgUid}`;
}

/**
 * Execute a single agent turn.
 *
 * The orchestrator:
 * 1. Parses intent from user prompt
 * 2. Routes to appropriate skill(s)
 * 3. Executes skills in order (for generate_full: sequential pipeline)
 * 4. Returns updated BXML + agent messages
 */
export async function executeAgentTurn(
  userPrompt: string,
  currentBXML: BXMLDocument,
  conversationHistory: AgentMessage[],
): Promise<AgentTurnResult> {
  const intent = parseIntent(userPrompt);
  const now = () => new Date().toISOString();
  const messages: AgentMessage[] = [];
  const skillsUsed: string[] = [];
  let bxml = { ...currentBXML };

  if (intent.primary === "general_chat") {
    messages.push({
      id: msgId(),
      role: "agent",
      text: getGeneralResponse(userPrompt),
      timestamp: now(),
    });
    return { messages, updatedBXML: bxml, skillsUsed: [], revisionLabel: "Chat" };
  }

  if (intent.primary === "generate_full") {
    messages.push({
      id: msgId(),
      role: "agent",
      text: `🚀 开始生成完整方案…\n\n识别到意图：**全屋智能方案生成**${intent.entities.layout ? `\n户型：${intent.entities.layout}` : ""}${intent.entities.area ? `\n面积：${intent.entities.area}m²` : ""}${intent.entities.spaceType ? `\n类型：${intent.entities.spaceType}` : ""}`,
      timestamp: now(),
      thinking: `Intent: ${intent.primary} (confidence: ${intent.confidence.toFixed(2)})\nEntities: ${JSON.stringify(intent.entities)}\nSkill pipeline: ${FULL_GENERATION_ORDER.join(" → ")}`,
    });

    for (const skillId of FULL_GENERATION_ORDER) {
      const skill = ALL_SKILLS.find((s) => s.id === skillId);
      if (!skill) continue;

      const result = await skill.execute({
        intent,
        currentBXML: bxml,
        conversationHistory: [...conversationHistory, ...messages],
        userPrompt,
      });

      bxml = result.updatedBXML;
      skillsUsed.push(skillId);

      messages.push({
        id: msgId(),
        role: "agent",
        text: result.responseText,
        timestamp: now(),
        skillsUsed: [skillId],
        thinking: result.thinkingTrace,
      });
    }

    const stats = getBXMLStats(bxml);
    const layoutLabel = intent.entities.layout ?? intent.entities.spaceType ?? "智能空间";
    bxml = {
      ...bxml,
      summary: `${layoutLabel}方案：${stats.spaces} 个空间、${stats.devices} 台设备、${stats.automations} 条自动化、${stats.scenes} 个场景`,
    };

    return {
      messages,
      updatedBXML: bxml,
      skillsUsed,
      revisionLabel: `Full generation: ${layoutLabel}`,
    };
  }

  // Single-intent execution
  const skills = findSkillsForIntent(intent.primary);
  if (skills.length === 0) {
    messages.push({
      id: msgId(),
      role: "agent",
      text: `理解你的意图了（${intent.primary}），但目前还没有对应的技能处理这个请求。我会在后续版本中支持。`,
      timestamp: now(),
    });
    return { messages, updatedBXML: bxml, skillsUsed: [], revisionLabel: "Unsupported" };
  }

  for (const skill of skills) {
    const result = await skill.execute({
      intent,
      currentBXML: bxml,
      conversationHistory: [...conversationHistory, ...messages],
      userPrompt,
    });

    bxml = result.updatedBXML;
    skillsUsed.push(skill.id);

    messages.push({
      id: msgId(),
      role: "agent",
      text: result.responseText,
      timestamp: now(),
      skillsUsed: [skill.id],
    });
  }

  const intentLabels: Record<string, string> = {
    create_space: "Space modeling",
    add_devices: "Device placement",
    create_automation: "Automation rules",
    create_scene: "Scene creation",
    generate_app_ui: "App UI generation",
    estimate_bom: "BOM estimate",
    modify_existing: "Modification",
  };

  return {
    messages,
    updatedBXML: bxml,
    skillsUsed,
    revisionLabel: intentLabels[intent.primary] ?? intent.primary,
  };
}

function getGeneralResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("你好") || lower.includes("hello") || lower.includes("hi")) {
    return `你好！我是 Aqara Builder AI，可以帮你设计智能空间方案。\n\n你可以告诉我：\n• 户型信息（如「两室一厅 90平」）\n• 需要的功能（如「人来灯亮、离家安防」）\n• 或直接说「帮我设计一套全屋智能方案」\n\n我会为你生成完整的 BXML 配置方案。`;
  }
  if (lower.includes("帮助") || lower.includes("help") || lower.includes("怎么")) {
    return `**Aqara Builder AI 使用指南**\n\n1. 🏗️ **创建空间**：描述户型，如「三室两厅 120平」\n2. 📡 **配置设备**：我会自动推荐，你也可以指定「客厅加个传感器」\n3. ⚡ **自动化**：说「人来灯亮」或「生成自动化规则」\n4. 🎭 **场景模式**：如「创建回家模式和睡眠模式」\n5. 📱 **App界面**：说「生成App页面」\n6. 📋 **BOM报价**：说「估算设备清单」\n\n所有修改都可以撤回到历史版本。`;
  }
  return `收到！请描述你想要创建的智能空间（如户型、面积、功能需求），我会帮你生成方案。`;
}

/**
 * Simulate streaming by yielding chunks with delays.
 * Production: replace with SSE from backend.
 */
export async function* streamAgentTurn(
  userPrompt: string,
  currentBXML: BXMLDocument,
  conversationHistory: AgentMessage[],
): AsyncGenerator<{
  type: "thinking" | "skill_start" | "message" | "bxml_update" | "done";
  content?: string;
  skillId?: string;
  bxml?: BXMLDocument;
  messages?: AgentMessage[];
  skillsUsed?: string[];
  revisionLabel?: string;
}> {
  const intent = parseIntent(userPrompt);

  yield { type: "thinking", content: `Parsing intent: ${intent.primary} (${(intent.confidence * 100).toFixed(0)}%)` };

  const result = await executeAgentTurn(userPrompt, currentBXML, conversationHistory);

  for (const msg of result.messages) {
    if (msg.skillsUsed?.length) {
      yield { type: "skill_start", skillId: msg.skillsUsed[0], content: `Executing: ${msg.skillsUsed[0]}` };
    }
    yield { type: "message", content: msg.text, messages: [msg] };
  }

  yield { type: "bxml_update", bxml: result.updatedBXML };
  yield {
    type: "done",
    messages: result.messages,
    skillsUsed: result.skillsUsed,
    revisionLabel: result.revisionLabel,
    bxml: result.updatedBXML,
  };
}
