/**
 * Builder Growth System
 *
 * Five-tier progression: Explorer → Builder → Pro → Expert → Partner
 * Designed to cover all skill levels — from first-time hobbyist to certified integrator.
 *
 * The growth path is the core retention & motivation mechanism.
 * Each level unlocks tangible capabilities and revenue potential.
 */

export type BuilderLevel = "explorer" | "builder" | "pro" | "expert" | "partner";

export interface BuilderLevelDef {
  level: BuilderLevel;
  rank: number;
  displayName: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  xpRequired: number;
  revenueShare: number;
  hardwareCommission: number;
  platformFee: number;
  unlocks: string[];
}

export const BUILDER_LEVELS: BuilderLevelDef[] = [
  {
    level: "explorer",
    rank: 1,
    displayName: "Explorer",
    tagline: "Learn & discover",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30",
    icon: "🌱",
    xpRequired: 0,
    revenueShare: 70,
    hardwareCommission: 5,
    platformFee: 30,
    unlocks: [
      "Browse & deploy free packages",
      "AI Build (basic)",
      "Community access",
      "1 Workspace",
    ],
  },
  {
    level: "builder",
    rank: 2,
    displayName: "Builder",
    tagline: "Create & publish",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "🔧",
    xpRequired: 500,
    revenueShare: 75,
    hardwareCommission: 8,
    platformFee: 25,
    unlocks: [
      "Publish packages to Marketplace",
      "Earn device commissions (8%)",
      "Client lead notifications",
      "Private asset pond",
    ],
  },
  {
    level: "pro",
    rank: 3,
    displayName: "Pro Builder",
    tagline: "Deliver & earn",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    icon: "⚡",
    xpRequired: 2000,
    revenueShare: 80,
    hardwareCommission: 12,
    platformFee: 20,
    unlocks: [
      "Priority client leads",
      "Multi-project workspace",
      "Delivery document generation",
      "Studio deploy & mapping tools",
    ],
  },
  {
    level: "expert",
    rank: 4,
    displayName: "Expert",
    tagline: "Scale & specialize",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "🏆",
    xpRequired: 8000,
    revenueShare: 85,
    hardwareCommission: 15,
    platformFee: 15,
    unlocks: [
      "Industry certification badge",
      "Featured in Marketplace",
      "Team workspace (up to 25)",
      "Advanced Ops & analytics",
    ],
  },
  {
    level: "partner",
    rank: 5,
    displayName: "Partner",
    tagline: "Lead & mentor",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: "💎",
    xpRequired: 25000,
    revenueShare: 90,
    hardwareCommission: 18,
    platformFee: 10,
    unlocks: [
      "Co-marketing with Aqara",
      "Lowest platform fee (10%)",
      "Enterprise client access",
      "Aqara advisory council seat",
    ],
  },
];

export function getLevelDef(level: BuilderLevel): BuilderLevelDef {
  return BUILDER_LEVELS.find((l) => l.level === level) ?? BUILDER_LEVELS[0];
}

export function getNextLevel(level: BuilderLevel): BuilderLevelDef | null {
  const current = BUILDER_LEVELS.find((l) => l.level === level);
  if (!current) return BUILDER_LEVELS[1];
  const next = BUILDER_LEVELS.find((l) => l.rank === current.rank + 1);
  return next ?? null;
}

export interface XPAction {
  action: string;
  xp: number;
  description: string;
}

export const XP_ACTIONS: XPAction[] = [
  { action: "package_deployed", xp: 100, description: "Package deployed to Studio" },
  { action: "device_sale", xp: 50, description: "Device sale attributed" },
  { action: "package_stable_30d", xp: 30, description: "Package runs 30 days stable" },
  { action: "package_forked", xp: 20, description: "Package forked by another Builder" },
  { action: "client_5star", xp: 200, description: "5-star client review" },
  { action: "boost_received", xp: 10, description: "Boost received from user" },
  { action: "certification_passed", xp: 500, description: "Industry certification passed" },
];

export interface BuilderStats {
  level: BuilderLevel;
  xp: number;
  packagesPublished: number;
  totalDeploys: number;
  devicesAttributed: number;
  deviceRevenueTotal: number;
  commissionEarned: number;
  packageRevenue: number;
  managedStudios: number;
  clientRating: number;
  boostsReceived: number;
  monthlyActiveProjects: number;
}

export const MOCK_BUILDER_STATS: BuilderStats = {
  level: "pro",
  xp: 3_850,
  packagesPublished: 12,
  totalDeploys: 47,
  devicesAttributed: 234,
  deviceRevenueTotal: 186_400,
  commissionEarned: 22_368,
  packageRevenue: 8_900,
  managedStudios: 8,
  clientRating: 4.8,
  boostsReceived: 156,
  monthlyActiveProjects: 5,
};
