import type { IntentType, ParsedIntent } from "./types";

/**
 * Intent parser — extracts user intent from natural language.
 * MVP: keyword-based; production: LLM function calling.
 */

const INTENT_PATTERNS: { intent: IntentType; keywords: string[] }[] = [
  { intent: "create_space", keywords: ["房间", "空间", "户型", "两室", "三室", "客厅", "卧室", "厨房", "卫生间", "room", "space", "layout", "apartment", "bedroom", "living room", "floor plan"] },
  { intent: "add_devices", keywords: ["设备", "传感器", "灯", "窗帘", "空调", "开关", "门锁", "sensor", "device", "light", "curtain", "switch", "lock", "camera", "hub"] },
  { intent: "create_automation", keywords: ["自动化", "联动", "人来灯亮", "人走灯灭", "触发", "automation", "trigger", "rule", "when", "if"] },
  { intent: "create_scene", keywords: ["场景", "模式", "回家", "离家", "睡眠", "影院", "scene", "mode", "movie", "sleep", "away", "welcome"] },
  { intent: "generate_app_ui", keywords: ["app", "界面", "页面", "控制面板", "仪表盘", "ui", "dashboard", "page"] },
  { intent: "generate_full", keywords: ["方案", "设计", "全屋", "智能家居", "帮我设计", "design", "full", "complete", "whole", "plan"] },
  { intent: "estimate_bom", keywords: ["bom", "清单", "报价", "成本", "预算", "bill", "cost", "estimate", "price"] },
  { intent: "sync_aiot", keywords: ["同步", "aqara home", "aiot", "已有设备", "sync", "existing"] },
  { intent: "modify_existing", keywords: ["修改", "调整", "删除", "移除", "增加", "改", "remove", "modify", "change", "update", "add more", "delete"] },
];

export function parseIntent(prompt: string): ParsedIntent {
  const lower = prompt.toLowerCase();
  const scores = new Map<IntentType, number>();

  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > 0) scores.set(pattern.intent, score);
  }

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return {
      primary: "general_chat",
      secondary: [],
      entities: {},
      confidence: 0.3,
      rawPrompt: prompt,
    };
  }

  // "generate_full" gets priority if it has any score AND total entities ≥ 2
  if (scores.has("generate_full") && sorted.length >= 2) {
    return {
      primary: "generate_full",
      secondary: sorted.filter(([t]) => t !== "generate_full").map(([t]) => t),
      entities: extractEntities(prompt),
      confidence: Math.min(0.95, 0.5 + sorted[0][1] * 0.15),
      rawPrompt: prompt,
    };
  }

  return {
    primary: sorted[0][0],
    secondary: sorted.slice(1).map(([t]) => t),
    entities: extractEntities(prompt),
    confidence: Math.min(0.95, 0.4 + sorted[0][1] * 0.15),
    rawPrompt: prompt,
  };
}

function extractEntities(prompt: string): Record<string, string> {
  const entities: Record<string, string> = {};

  const layoutPatterns = [
    /([一二三四五六七八]\s*室\s*[一二三四五六七八]?\s*厅)/,
    /([\u4e24\u4e09\u56db\u4e94]\s*室\s*[\u4e00\u4e8c\u4e09]?\s*\u5385)/,
    /(\d+)\s*(?:bedroom|bed|room)s?\s*(?:(\d+)\s*(?:bath|living))?/i,
  ];
  for (const pat of layoutPatterns) {
    const m = prompt.match(pat);
    if (m) { entities.layout = m[0].trim(); break; }
  }

  const areaMatch = prompt.match(/(\d+)\s*(?:m²|平|平方|平米|sqm|square\s*met)/i);
  if (areaMatch) entities.area = areaMatch[1];

  const typePatterns = /(酒店|公寓|办公|住宅|别墅|样板间|民宿|商铺|商业|写字楼|复式|loft|hotel|office|apartment|villa|residential|bnb|homestay|showroom|studio|penthouse)/i;
  const typeMatch = prompt.match(typePatterns);
  if (typeMatch) entities.spaceType = typeMatch[0];

  const budgetMatch = prompt.match(/(?:预算|budget)\s*[:：]?\s*(\d+)\s*(?:万|k|元|rmb)?/i);
  if (budgetMatch) entities.budget = budgetMatch[1];

  const floorMatch = prompt.match(/(\d+)\s*(?:层|楼|floor)/i);
  if (floorMatch) entities.floors = floorMatch[1];

  return entities;
}
