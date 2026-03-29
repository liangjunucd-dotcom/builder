export type DataCenterRegion = "CN" | "US" | "EU";

export interface Account {
  id: string;
  name: string;
  email: string;
}

export type BuilderSpaceKind = "personal" | "team" | "company";
export type BuilderSpaceRole = "owner" | "admin" | "member" | "viewer";

/** Optional profile when creating a Shared Workspace */
export type WorkspaceProfile =
  | "creator_team"
  | "installer_team"
  | "customer_org"
  | "family_home"
  | "internal_ops"
  | "other";

export interface BuilderSpaceMember {
  accountId: string;
  role: BuilderSpaceRole;
}

/** Growth stage: 0 Exploration → 1 Personal → 2 Collaboration → 3 Established Team → 4 Business Team → 5 Certified Partner */
export type WorkspaceStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface BuilderSpace {
  id: string;
  name: string;
  kind: BuilderSpaceKind;
  plan: string;
  members: BuilderSpaceMember[];
  studioIds: string[];
  projectIds: string[];
  region: DataCenterRegion;
  companyProfile?: string;
  parentCompanyId?: string;
  createdAt: string;
  /** Shared Workspace profile (selected when creating collaboration/team workspace) */
  workspaceProfile?: WorkspaceProfile;
  /** Whether business features are enabled: customer management, ops center, service hub, tickets, etc. */
  businessFeatures?: boolean;
  /** Whether certified (Enterprise/Installer/Partner) */
  verified?: boolean;
  /** Explicit stage; if unset, derived from kind + businessFeatures + verified */
  stage?: WorkspaceStage;
  /** Custom display names for Studios within this workspace { [studioId]: displayName } */
  studioDisplayNames?: Record<string, string>;
}
