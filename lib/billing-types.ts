/**
 * Builder Entitlement Model
 *
 * Billing entity = Account (Free / Pro / Team)
 * Workspace = consumption context; capability limits determined by Owner's account plan
 * Credits = account-level; monthly allowance + top-up + community activity; consumed from Owner's credit pool within Workspace
 */

// ============ Account Layer: Membership (Plan) ============

export type MembershipTier = "free" | "explorer" | "builder" | "master" | "team";

export interface Membership {
  tier: MembershipTier;
  displayName: string;
  /** Monthly credited points */
  monthlyPersonalCredits: number;
  /** Capability highlights (for card display) */
  personalCapabilities: string[];
  /** Workspace capability limits (Owner's plan determines limits for managed workspaces) */
  workspaceLimits: {
    maxOwnedWorkspaces: number;
    maxJoinedSpaces: number;
    maxMembersPerSpace: number;
    maxProjects: number;
    maxStudios: number;
    aiEnabled: boolean;
    serviceHub: "none" | "basic" | "full";
    customerManagement: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
}

// ============ Workspace Layer: Plan ============

/** Workspace Plan tiers */
export type WorkspacePlanTier = "free" | "team" | "business" | "enterprise";

export interface WorkspacePlanLimits {
  maxMembers: number;
  maxProjects: number;
  maxStudios: number;
  maxSites: number;
  businessFeatures: boolean;
  opsAndService: boolean;
}

export interface WorkspacePlan {
  tier: WorkspacePlanTier;
  displayName: string;
  limits: WorkspacePlanLimits;
  /** Monthly credit pool provided by this Plan for the Workspace (consumed first within business context) */
  workspaceCreditsPerMonth: number;
}

// ============ Consumption Layer: Credits ============

/** Credit source (incoming) */
export type CreditSource =
  | "member_monthly"    // Monthly membership allowance (Personal)
  | "workspace_pool"    // Workspace credit pool (current Workspace Plan monthly quota)
  | "purchase";        // On-demand purchase (general, can top up personal or Workspace)

/** Credit consumption scenarios (marketplace: AI / twin / plugins / premium features) */
export type CreditConsumptionType =
  | "market"           // Marketplace (plugins, templates, package purchases)
  | "ai"               // AI invocations
  | "twin"             // 3D twin / Marble generation
  | "plugin"           // Plugins
  | "premium";         // Other premium features

/** Personal credit balance (from Membership monthly allowance + on-demand purchases allocated to personal) */
export interface PersonalCreditBalance {
  available: number;
  /** Monthly membership allowance used this month */
  usedThisMonthFromMember: number;
  /** Monthly membership allowance quota */
  allowanceThisMonthFromMember: number;
}

/** Workspace credit pool balance (from current Workspace Plan monthly quota, consumed first within business context) */
export interface WorkspaceCreditBalance {
  workspaceId: string;
  workspaceName: string;
  planTier: WorkspacePlanTier;
  /** Current pool remaining */
  poolAvailable: number;
  /** Used from pool this month */
  poolUsedThisMonth: number;
  /** Total pool quota this month (Plan monthly quota) */
  poolAllowanceThisMonth: number;
}

/** Single transaction: source or consumption */
export interface CreditTransaction {
  id: string;
  amount: number;
  /** Incoming = source, deduction = consumptionType */
  source?: CreditSource;
  consumptionType?: CreditConsumptionType;
  /** If consumption occurs within a Workspace business context, record workspaceId */
  workspaceId?: string;
  description: string;
  createdAt: string;
}

// ============ Partner / Enterprise Contract (optional advanced tier) ============

export type ContractType = "partner" | "enterprise" | "regional_partner" | "integrator";

export interface PartnerEnterpriseContract {
  type: ContractType;
  displayName: string;
  status: "active" | "pending" | "expired";
  period: { start: string; end: string };
  dedicatedCreditPool?: number;
  usedCreditPool?: number;
  planDiscount?: string;
  benefits?: string[];
}
