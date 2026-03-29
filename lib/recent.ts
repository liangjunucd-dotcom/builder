export interface RecentItem {
  type: "project" | "lab";
  id: string;
  label: string;
  href: string;
  openedAt: string;
}

const STORAGE_KEY = "builder_profile_recent";

export function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function recordRecentOpened(item: Omit<RecentItem, "openedAt">) {
  if (typeof window === "undefined") return;
  try {
    const recent = loadRecent();
    const filtered = recent.filter((r) => r.id !== item.id);
    filtered.unshift({ ...item, openedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.error("Failed to save recent item", e);
  }
}
