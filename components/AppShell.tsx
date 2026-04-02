"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  ExternalLink,
  Gift,
  Globe,
  Headphones,
  Home,
  LayoutGrid,
  MapPinned,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Rss,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  UserPlus,
} from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useBilling } from "@/context/BillingContext";
import { useProjects } from "@/context/ProjectsContext";
import {
  getWorkspaceKindDescription,
  getWorkspaceKindLabel,
  getWorkspaceRegionLabel,
  getWorkspaceTone,
  groupWorkspaces,
  isCollaborativeWorkspace,
  isPersonalWorkspace,
} from "@/lib/workspace-model";
import type { DataCenterRegion } from "@/lib/account-types";

type PageMeta = {
  title: string;
  subtitle: string;
};

const PAGE_META: Array<{ match: (pathname: string) => boolean; meta: PageMeta }> = [
  {
    match: (pathname) => pathname === "/home",
    meta: {
      title: "Home",
      subtitle: "Workspace overview, delivery funnel, and current runtime health.",
    },
  },
  {
    match: (pathname) => pathname === "/",
    meta: {
      title: "Build AI",
      subtitle: "Turn floor plans, text intent, and device logic into deployable space packages.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/projects"),
    meta: {
      title: "Projects",
      subtitle: "Manage customer spaces, design packages, and deployment-ready BXML assets.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/spaces"),
    meta: {
      title: "Studios",
      subtitle: "Bind Cloud Studio and local M300 runtimes under the active workspace.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/marketplace"),
    meta: {
      title: "Marketplace",
      subtitle: "Discover reusable templates, Life plugins, and install-ready space packages.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/moments"),
    meta: {
      title: "Moments",
      subtitle: "Latest feeds, project showcases, ecosystem news, and partner updates.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/recents"),
    meta: {
      title: "Recents",
      subtitle: "Jump back into the last designs, deployments, and plugin builds.",
    },
  },
  {
    match: (pathname) => pathname.startsWith("/search"),
    meta: {
      title: "Search",
      subtitle: "Search projects, studios, templates, devices, and collaborator surfaces.",
    },
  },
];

function resolvePageMeta(pathname: string): PageMeta {
  return (
    PAGE_META.find((item) => item.match(pathname))?.meta ?? {
      title: "Aqara Builder",
      subtitle: "Spatial intelligence control surface.",
    }
  );
}

const REGION_OPTIONS: DataCenterRegion[] = ["CN", "US", "EU"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { account, spaces, currentSpace, setCurrentSpaceId, createTeamBuilderSpace } = useAccount();
  const { personalCredits, currentMembership } = useBilling();
  const { projects } = useProjects();

  const [collapsed, setCollapsed] = React.useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState<DataCenterRegion>("CN");

  const isProjectDetail = /^\/projects\/[^/]+$/.test(pathname);
  const isExploreDetail = /^\/explore\/[^/]+$/.test(pathname);
  const isAppEditor = /^\/develop\/apps\/[^/]+$/.test(pathname);

  const groupedSpaces = React.useMemo(() => groupWorkspaces(spaces), [spaces]);
  const tone = getWorkspaceTone(currentSpace);
  const pageMeta = resolvePageMeta(pathname);
  const sideWidth = collapsed ? "w-[76px]" : "w-[252px]";

  const recentProjects = React.useMemo(
    () =>
      projects
        .filter((project) => project.builderSpaceId === currentSpace?.id)
        .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
        .slice(0, 4),
    [projects, currentSpace?.id],
  );

  const ownedCount = spaces.filter((space) =>
    space.members.some((member) => member.accountId === account?.id && member.role === "owner"),
  ).length;
  const maxWorkspaces = currentMembership.workspaceLimits.maxOwnedWorkspaces;
  const canCreateMore = maxWorkspaces < 0 || ownedCount < maxWorkspaces;

  if (isProjectDetail || isExploreDetail || isAppEditor) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/search", label: "Search", icon: Search, exact: true },
    { href: "/home", label: "Home", icon: Home, exact: true },
    { href: "/", label: "Build AI", icon: Sparkles, exact: true, highlight: true },
    { href: "/projects", label: "Projects", icon: LayoutGrid },
    { href: "/spaces", label: "Studios", icon: Cpu },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/moments", label: "Moments", icon: Rss },
    { href: "/recents", label: "Recents", icon: Clock, exact: true },
  ];

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const createWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    createTeamBuilderSpace({
      name: newWorkspaceName.trim(),
      region: selectedRegion,
    });
    setNewWorkspaceName("");
    setSelectedRegion("CN");
    setIsCreateWorkspaceModalOpen(false);
  };

  const workspaceCard = currentSpace ? (
    <button
      type="button"
      onClick={() => setIsWorkspaceMenuOpen((value) => !value)}
      className={`group relative w-full overflow-hidden rounded-2xl border border-white/8 bg-zinc-950/70 px-3 py-3 text-left transition-all hover:border-white/15 hover:bg-zinc-900/90 ${
        collapsed ? "flex justify-center px-2 py-3" : ""
      }`}
    >
      {!collapsed && (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-br ${tone.surface}`}
        />
      )}
      <div className={`relative flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/10">
          <span className="text-sm font-bold text-white">{currentSpace.name.charAt(0)}</span>
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-zinc-100">{currentSpace.name}</p>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tone.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {isPersonalWorkspace(currentSpace) ? "Personal" : "Collaborative"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">{getWorkspaceRegionLabel(currentSpace)}</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:text-zinc-300" />
          </>
        )}
      </div>
    </button>
  ) : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070b12] text-zinc-100">
      <aside className={`${sideWidth} relative z-20 flex shrink-0 flex-col border-r border-white/8 bg-[#090d14] transition-all duration-200`}>
        <div className="border-b border-white/6 px-3 pt-3 pb-3">
          <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
            {!collapsed && (
              <Link href="/home" className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-cyan-300 to-amber-300 text-[11px] font-bold text-slate-950">
                  A
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-zinc-50">Aqara Builder</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Spatial OS Console</p>
                </div>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-zinc-950/60 text-zinc-500 transition-colors hover:text-zinc-200"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative px-3 py-3">
          {workspaceCard}

          {isWorkspaceMenuOpen && !collapsed && (
            <>
              {/* overlay */}
              <div className="fixed inset-0 z-30" onClick={() => setIsWorkspaceMenuOpen(false)} />
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#13181f] shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold text-white shadow-lg">
                      {currentSpace?.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-50">{currentSpace?.name}</p>
                      <p className="text-xs text-zinc-500">
                        {currentMembership.displayName} · {currentSpace?.members.length ?? 1} member{(currentSpace?.members.length ?? 1) > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/settings"
                      onClick={() => setIsWorkspaceMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/8"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsWorkspaceMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/8"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite
                    </button>
                  </div>
                </div>

                {/* All workspaces */}
                <div className="border-t border-white/6 px-3 py-2">
                  <p className="px-2 pb-1.5 text-[11px] text-zinc-500">All workspaces</p>
                  <div className="space-y-0.5">
                    {spaces.map((space) => (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => { setCurrentSpaceId(space.id); setIsWorkspaceMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-200">
                          {space.name.charAt(0)}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm text-zinc-200">{space.name}</p>
                        {currentSpace?.id === space.id && (
                          <Check className="h-4 w-4 shrink-0 text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* New workspace */}
                <div className="border-t border-white/6 px-3 py-2 pb-3">
                  <button
                    type="button"
                    onClick={() => { setIsWorkspaceMenuOpen(false); setIsCreateWorkspaceModalOpen(true); }}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  >
                    <Plus className="h-4 w-4" />
                    New workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-all ${
                    collapsed ? "justify-center px-2" : ""
                  } ${
                    active
                      ? item.highlight
                        ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
                        : "border-white/10 bg-white/7 text-zinc-100"
                      : "border-transparent text-zinc-400 hover:border-white/6 hover:bg-white/4 hover:text-zinc-200"
                  }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {!collapsed && (
            <>


              <div className="mt-6">
                <p className="px-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Quick Access</p>
                <div className="mt-2 space-y-1">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}?loading=1`}
                        className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition-all hover:border-white/6 hover:bg-white/4 hover:text-zinc-200"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 ring-1 ring-white/8">
                          {project.creationMethod === "ai_build" ? <Sparkles className="h-4 w-4 text-sky-300" /> : <MapPinned className="h-4 w-4 text-zinc-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-200">{project.name}</p>
                          <p className="text-[11px] text-zinc-600">{project.creationMethod === "ai_build" ? "AI package" : "Project container"}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/8 px-3 py-4 text-xs text-zinc-600">
                      Your latest AI builds and project containers will appear here.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white/6 px-3 py-3 space-y-1">
          {[
            { href: "/academy", label: "Academy", icon: BookOpen },
            { href: "/collab", label: "Support", icon: Headphones },
            { href: "https://www.aqara.com/store", label: "Aqara Shop", icon: ShoppingBag, external: true },
          ].map((item) => {
            const Icon = item.icon;
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition-all hover:border-white/6 hover:bg-white/4 hover:text-zinc-200 ${collapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition-all hover:border-white/6 hover:bg-white/4 hover:text-zinc-200 ${collapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(38,157,255,0.08),_transparent_28%),linear-gradient(180deg,#070b12_0%,#09101a_100%)]">
        <header className="border-b border-white/6 bg-black/10 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-zinc-50">{pageMeta.title}</p>
                {currentSpace && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${tone.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {getWorkspaceKindLabel(currentSpace)}
                  </span>
                )}
                {currentSpace && (
                  <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                    {currentSpace.region}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-500">{pageMeta.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Invitation Reward */}
              <button
                type="button"
                className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-opacity hover:opacity-90 md:flex"
              >
                <Gift className="h-4 w-4" />
                Invitation Reward
              </button>

              {/* Credits */}
              <Link
                href="/plans"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/8"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">A</span>
                {personalCredits.toLocaleString()}
              </Link>

              {/* Divider */}
              <div className="mx-1 h-5 w-px bg-white/10" />

              {/* Guide */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/8"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Guide
              </button>

              {/* Divider */}
              <div className="mx-1 h-5 w-px bg-white/10" />

              {/* Bell */}
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/8 hover:text-zinc-200">
                <Bell className="h-4 w-4" />
              </button>

              {/* Avatar */}
              <button type="button" className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/10 transition-opacity hover:opacity-80">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                  {account?.name?.charAt(0) ?? "U"}
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>

      {isCreateWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0b111a] shadow-2xl shadow-black/60">
            <div className="border-b border-white/6 px-6 py-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">New Workspace</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-50">Create a Collaborative Workspace</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Personal Workspace is provisioned automatically per account. New workspaces are shared by default and support members, project delivery, and independent data regions.
              </p>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(event) => setNewWorkspaceName(event.target.value)}
                  placeholder="e.g. Hotel Delivery Workspace"
                  className="mt-2 w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-sky-400/35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Data Region</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {REGION_OPTIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                        selectedRegion === region
                          ? "border-sky-400/30 bg-sky-500/10 text-sky-200"
                          : "border-white/8 bg-white/4 text-zinc-400 hover:bg-white/7 hover:text-zinc-200"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {!canCreateMore && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  Workspace limit reached for the current membership tier.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/6 px-6 py-4">
              <p className="text-xs text-zinc-600">
                Owned: {ownedCount} / {maxWorkspaces < 0 ? "∞" : maxWorkspaces}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateWorkspaceModalOpen(false)}
                  className="rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newWorkspaceName.trim() || !canCreateMore}
                  onClick={createWorkspace}
                  className="rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
