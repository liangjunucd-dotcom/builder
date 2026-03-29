/**
 * Space types for projects: different topologies and Studio delivery counts.
 * Home, Office, Stadium, Hotel, School, Other
 */
import type { LucideIcon } from "lucide-react";
import { Home, Building2, Landmark, Hotel, School, MoreHorizontal } from "lucide-react";
import type { SpaceTypeId } from "./domain-types";

export type { SpaceTypeId };

export interface SpaceTypeOption {
  id: SpaceTypeId;
  label: string;
  labelEn: string;
  Icon: LucideIcon;
}

export const SPACE_TYPES: SpaceTypeOption[] = [
  { id: "home", label: "Home", labelEn: "Home", Icon: Home },
  { id: "office", label: "Office", labelEn: "Office", Icon: Building2 },
  { id: "stadium", label: "Stadium", labelEn: "Stadium", Icon: Landmark },
  { id: "hotel", label: "Hotel", labelEn: "Hotel", Icon: Hotel },
  { id: "school", label: "School", labelEn: "School", Icon: School },
  { id: "other", label: "Other", labelEn: "Other", Icon: MoreHorizontal },
];

export function getSpaceType(id: SpaceTypeId | undefined): SpaceTypeOption | undefined {
  return SPACE_TYPES.find((t) => t.id === id);
}
