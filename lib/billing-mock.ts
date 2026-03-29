import type {
  Membership,
  MembershipTier,
  WorkspacePlan,
  PersonalCreditBalance,
  WorkspaceCreditBalance,
  CreditTransaction,
  PartnerEnterpriseContract,
} from "./billing-types";

// ============ Account Layer: Membership (Plan) ============

export const membershipTiers: Record<MembershipTier, Membership> = {
  free: {
    tier: "free",
    displayName: "Starter",
    monthlyPersonalCredits: 500,
    personalCapabilities: [
      "1 workspace, 1 member",
      "Basic creation tools",
      "Community browsing",
    ],
    workspaceLimits: {
      maxOwnedWorkspaces: 1,
      maxJoinedSpaces: 2,
      maxMembersPerSpace: 1,
      maxProjects: 3,
      maxStudios: 1,
      aiEnabled: false,
      serviceHub: "none",
      customerManagement: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  explorer: {
    tier: "explorer",
    displayName: "Explorer",
    monthlyPersonalCredits: 2000,
    personalCapabilities: [
      "Includes all Starter features and more",
      "Post in private mode",
      "2,000 credits monthly (80 building requests)",
      "Assets storage: 2 GB",
    ],
    workspaceLimits: {
      maxOwnedWorkspaces: 2,
      maxJoinedSpaces: 5,
      maxMembersPerSpace: 3,
      maxProjects: 10,
      maxStudios: 3,
      aiEnabled: true,
      serviceHub: "none",
      customerManagement: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  builder: {
    tier: "builder",
    displayName: "Builder",
    monthlyPersonalCredits: 5000,
    personalCapabilities: [
      "Includes all Explorer features and more",
      "Advanced features added continuously",
      "5,000 credits monthly (200 building requests)",
      "Assets storage: 10 GB",
    ],
    workspaceLimits: {
      maxOwnedWorkspaces: 5,
      maxJoinedSpaces: 10,
      maxMembersPerSpace: 10,
      maxProjects: 50,
      maxStudios: 15,
      aiEnabled: true,
      serviceHub: "basic",
      customerManagement: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  master: {
    tier: "master",
    displayName: "Master",
    monthlyPersonalCredits: 10000,
    personalCapabilities: [
      "Includes all Builder features and more",
      "Advanced features added continuously",
      "10,000 credits monthly (400 building requests)",
      "Assets storage: 20 GB",
    ],
    workspaceLimits: {
      maxOwnedWorkspaces: 10,
      maxJoinedSpaces: 20,
      maxMembersPerSpace: 25,
      maxProjects: 100,
      maxStudios: 50,
      aiEnabled: true,
      serviceHub: "full",
      customerManagement: true,
      advancedAnalytics: true,
      prioritySupport: false,
    },
  },
  team: {
    tier: "team",
    displayName: "Team",
    monthlyPersonalCredits: 20000,
    personalCapabilities: [
      "Includes all Master features and more",
      "Advanced features added continuously",
      "20,000 credits monthly (800 building requests)",
      "Assets storage: 50 GB",
    ],
    workspaceLimits: {
      maxOwnedWorkspaces: 15,
      maxJoinedSpaces: -1,
      maxMembersPerSpace: 50,
      maxProjects: 200,
      maxStudios: 100,
      aiEnabled: true,
      serviceHub: "full",
      customerManagement: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
};

/** Current account membership (mock: Builder) */
export const mockAccountMembership: Membership = membershipTiers.builder;

/** Account plan pricing (USD) */
export const membershipPricing: Record<MembershipTier, { monthly: number; yearly?: number; yearlyNote?: string }> = {
  free: { monthly: 0 },
  explorer: { monthly: 19, yearly: 190, yearlyNote: "≈ $15.8/mo" },
  builder: { monthly: 49, yearly: 490, yearlyNote: "≈ $40.8/mo" },
  master: { monthly: 99, yearly: 990, yearlyNote: "≈ $82.5/mo" },
  team: { monthly: 199, yearly: 1990, yearlyNote: "≈ $165.8/mo" },
};

// ============ Workspace Layer: Plan ============

export const workspacePlans: Record<string, WorkspacePlan> = {
  free: {
    tier: "free",
    displayName: "Free",
    limits: {
      maxMembers: 1,
      maxProjects: 3,
      maxStudios: 2,
      maxSites: 5,
      businessFeatures: false,
      opsAndService: false,
    },
    workspaceCreditsPerMonth: 0,
  },
  team: {
    tier: "team",
    displayName: "Team",
    limits: {
      maxMembers: 15,
      maxProjects: 50,
      maxStudios: 30,
      maxSites: 150,
      businessFeatures: true,
      opsAndService: true,
    },
    workspaceCreditsPerMonth: 500,
  },
  business: {
    tier: "business",
    displayName: "Business",
    limits: {
      maxMembers: 50,
      maxProjects: 200,
      maxStudios: 100,
      maxSites: 500,
      businessFeatures: true,
      opsAndService: true,
    },
    workspaceCreditsPerMonth: 2000,
  },
  enterprise: {
    tier: "enterprise",
    displayName: "Enterprise",
    limits: {
      maxMembers: -1,
      maxProjects: -1,
      maxStudios: -1,
      maxSites: -1,
      businessFeatures: true,
      opsAndService: true,
    },
    workspaceCreditsPerMonth: 10000,
  },
};

/**
 * Plan for each Workspace (one person can have different plans for different workspaces)
 * key = workspaceId, value = plan tier
 */
export const mockWorkspacePlanBySpaceId: Record<string, string> = {
  "space-1": "free",   // John's Personal Space → Free
  "space-2": "business", // Acme Corp → Business
};

// ============ Consumption Layer: Credits ============

export const mockPersonalCredits: PersonalCreditBalance = {
  available: 7_200,
  usedThisMonthFromMember: 2_800,
  allowanceThisMonthFromMember: 10_000,
};

/**
 * Credit pool for the currently selected Workspace (consumed first within business context)
 * @param planOverride If provided (e.g. currentSpace.plan), use this tier for quota calculation to align with the workspace plan
 */
export function getMockWorkspaceCreditBalance(
  workspaceId: string,
  workspaceName: string,
  planOverride?: string
): WorkspaceCreditBalance {
  const planKey = planOverride ?? mockWorkspacePlanBySpaceId[workspaceId] ?? "free";
  const plan = workspacePlans[planKey];
  const allowance = plan?.workspaceCreditsPerMonth ?? 0;
  return {
    workspaceId,
    workspaceName,
    planTier: (plan?.tier ?? "free") as WorkspacePlan["tier"],
    poolAvailable: Math.max(0, allowance - 120),
    poolUsedThisMonth: 120,
    poolAllowanceThisMonth: allowance,
  };
}

export const mockCreditTransactions: CreditTransaction[] = [
  {
    id: "1",
    amount: 10_000,
    source: "member_monthly",
    description: "Pro plan monthly credits",
    createdAt: new Date().toISOString().slice(0, 10),
  },
  {
    id: "2",
    amount: -800,
    consumptionType: "ai",
    workspaceId: "space-2",
    description: "AI Build · 3D space generation × 2",
    createdAt: new Date().toISOString().slice(0, 10),
  },
  {
    id: "3",
    amount: -500,
    consumptionType: "ai",
    description: "Automation plan generation",
    createdAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
  },
  {
    id: "4",
    amount: -1_500,
    consumptionType: "market",
    description: "Template Market · Whole-home smart solution template",
    createdAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
  },
  {
    id: "5",
    amount: 3_500,
    source: "purchase",
    description: "Top-up $29 → 3,500 credits",
    createdAt: new Date(Date.now() - 259200000).toISOString().slice(0, 10),
  },
];

// ============ Partner / Enterprise ============

export const mockPartnerContract: PartnerEnterpriseContract | null = null;

export const mockPartnerContractActive: PartnerEnterpriseContract = {
  type: "partner",
  displayName: "Partner Franchise Contract",
  status: "active",
  period: { start: "2024-01-01", end: "2024-12-31" },
  dedicatedCreditPool: 50000,
  usedCreditPool: 12000,
  planDiscount: "20% off Team/Business plan",
  benefits: ["Channel rebates", "Showcase project subsidies", "Dedicated account manager"],
};
