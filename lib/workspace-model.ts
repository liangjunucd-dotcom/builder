import type { BuilderSpace } from "./account-types";

export function isPersonalWorkspace(space: BuilderSpace | null | undefined): boolean {
  return space?.kind === "personal";
}

export function isCollaborativeWorkspace(space: BuilderSpace | null | undefined): boolean {
  return space != null && space.kind !== "personal";
}

export function getWorkspaceKindLabel(space: BuilderSpace | null | undefined): string {
  return isPersonalWorkspace(space) ? "Personal Workspace" : "Collaborative Workspace";
}

export function getWorkspaceKindDescription(space: BuilderSpace | null | undefined): string {
  if (isPersonalWorkspace(space)) {
    return "Default home for free Cloud Studio trial, personal designs, and Life aggregation.";
  }

  return "Invite members, isolate delivery projects, and bind Studios under a shared runtime boundary.";
}

export function getWorkspaceTone(space: BuilderSpace | null | undefined): {
  badge: string;
  dot: string;
  surface: string;
} {
  if (isPersonalWorkspace(space)) {
    return {
      badge: "bg-sky-500/12 text-sky-300 border-sky-400/25",
      dot: "bg-sky-400",
      surface: "from-sky-500/20 via-cyan-400/10 to-transparent",
    };
  }

  return {
    badge: "bg-amber-500/12 text-amber-300 border-amber-400/25",
    dot: "bg-amber-400",
    surface: "from-amber-500/18 via-orange-400/10 to-transparent",
  };
}

export function getWorkspaceRegionLabel(space: BuilderSpace | null | undefined): string {
  if (!space) return "Region Unset";
  return `Data Region · ${space.region}`;
}

export function groupWorkspaces(spaces: BuilderSpace[]): {
  personal: BuilderSpace[];
  collaborative: BuilderSpace[];
} {
  return {
    personal: spaces.filter((space) => isPersonalWorkspace(space)),
    collaborative: spaces.filter((space) => isCollaborativeWorkspace(space)),
  };
}

export function canManageSpaceBilling(
  space: BuilderSpace | null,
  accountId: string | undefined,
): boolean {
  if (!space || !accountId) return false;
  const role = space.members.find((member) => member.accountId === accountId)?.role;
  return role === "owner" || role === "admin";
}
