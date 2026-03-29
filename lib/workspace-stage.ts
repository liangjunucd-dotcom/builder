import type { BuilderSpace, WorkspaceStage } from "./account-types";

/**
 * Derive the current Workspace growth stage
 * 0 Exploration → 1 Basic → 2 Collaboration → 3 Established Team → 4 Business Team → 5 Certified Partner
 */
export function getWorkspaceStage(space: BuilderSpace | null): WorkspaceStage {
  if (!space) return 1;
  if (space.stage !== undefined) return space.stage;
  if (space.verified) return 5;
  if (space.businessFeatures) return 4;
  if (space.members.length > 1) return 3;
  return 1;
}

/** Whether to show business-related navigation and dashboard modules: customers, ops center, service hub, tickets, etc. */
export function shouldShowBusinessNav(space: BuilderSpace | null): boolean {
  if (!space) return false;
  return Boolean(space.businessFeatures) || space.kind === "company" || space.plan === "enterprise";
}
