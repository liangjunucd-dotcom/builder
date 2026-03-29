export type BuildingType = "residential" | "commercial" | "industrial";

/** Space type: Home / Office / Stadium / Hotel / School / Other — determines space topology and number of Studios to deliver */
export type SpaceTypeId = "home" | "office" | "stadium" | "hotel" | "school" | "other";

/** Creation method: AI Build generated / Manual creation */
export type CreationMethod = "ai_build" | "manual";

/** Association mode: Standard (linked to Workspace Studio) / Project management (not linked to customer Studio) */
export type ProjectMode = "standard" | "project_management";

export interface ProjectCollaborator {
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

export interface RolePluginConfig {
  id: string;
  roleName: string;
  theme: string;
  status: "draft" | "published";
  ttlHours?: number;
  studioId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  buildingType: BuildingType;
  country: string;
  siteIds: string[];
  builderSpaceId: string;
  collaborators: ProjectCollaborator[];
  /** Space type: different topologies and Studio counts at delivery */
  spaceType?: SpaceTypeId;
  /** Creation method: AI Build generated / Manual creation */
  creationMethod?: CreationMethod;
  /** Association mode: Standard (linked to Studio for managed ops) / Project management (not linked to customer Studio) */
  projectMode?: ProjectMode;
  /** @deprecated Use creationMethod + projectMode instead; kept for backward compatibility */
  projectType?: "ai_build" | "standard" | "project_management";
  studioLinked?: boolean;
  /** Project lifecycle phase: Planning → Procurement → Commissioning → Configuration → Operations & Optimization */
  lifecyclePhase?: ProjectLifecyclePhase;
  /** Last updated ISO string, used for list display */
  updatedAt?: string;
  /** Customer ID (from customer records), used to view projects by customer and establish service relationships */
  customerId?: string;
  /** Project cover video (e.g. 10s solution animation) */
  coverVideoUrl?: string;
  /** Video generation status */
  coverVideoStatus?: "idle" | "generating" | "ready" | "failed";
  /** Studio bound when entering creation mode (optional) */
  selectedStudioId?: string | null;
  /** When the space package was last deployed / assigned to the linked Studio (ISO) */
  deployedAt?: string;
  /** Names of user-uploaded reference images */
  attachedImageNames?: string[];
  /** Agent skill IDs enabled for this project's AI Build session */
  enabledSkillIds?: string[];
  /** Current agent workflow step */
  agentStep?: "describe" | "generate" | "refine" | "deploy";
  /** Cloud Studio instance ID allocated during AI Build */
  cloudStudioId?: string;
  /** When the cloud Studio was allocated (ISO) — expires after 24h */
  cloudStudioAllocatedAt?: string;
  /** If present, this space solution is attached under a container project */
  parentProjectId?: string | null;
  /** Role-based plugin entries built from this space solution */
  rolePluginConfigs?: RolePluginConfig[];
  /** Business-facing project type used for management views */
  projectBusinessType?: "delivery" | "customer" | "self_use";
}

/** Project lifecycle (five phases) */
export type ProjectLifecyclePhase =
  | "planning"      // Planning: draw floor plan, add rooms, link Studios, preset automation, generate BOM
  | "procurement"   // Procurement: purchase devices per BOM
  | "commissioning" // Commissioning: on-site network onboarding & debugging
  | "config"        // Configuration: deploy to Studio, auto config, scenes/linkage/permissions/UI
  | "ops";          // Operations & Optimization: monitoring, logs, troubleshooting, scene optimization, firmware upgrades

export interface Site {
  id: string;
  projectId: string;
  name: string;
  studioId?: string;
}
