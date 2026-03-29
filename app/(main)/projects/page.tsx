"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";
import {
  Search, Plus, Check, ChevronDown, MoreHorizontal, Star,
  ChevronLeft, MapPin, Clock, Users, X,
} from "lucide-react";
import { SPACE_TYPES, getSpaceType } from "@/lib/space-types";
import type { Project, SpaceTypeId } from "@/lib/domain-types";
import { getBXMLStats } from "@/lib/bxml";

/* ── Visuals: one distinct gradient per space type ── */
const COVER_GRADIENTS: Record<string, string> = {
  residential: "linear-gradient(140deg,#0f2027 0%,#203a43 50%,#2c5364 100%)",
  office:      "linear-gradient(140deg,#0d1117 0%,#1a2a4a 50%,#243b55 100%)",
  hotel:       "linear-gradient(140deg,#1a0f0f 0%,#3b1212 50%,#5c2323 100%)",
  school:      "linear-gradient(140deg,#0d1117 0%,#1a2a1a 50%,#2a4a2a 100%)",
  retail:      "linear-gradient(140deg,#170f1a 0%,#2d1b4e 50%,#4a2a6e 100%)",
  healthcare:  "linear-gradient(140deg,#0d1515 0%,#1a3030 50%,#0e4040 100%)",
  warehouse:   "linear-gradient(140deg,#111 0%,#1a1a1a 50%,#2a2a2a 100%)",
  default:     "linear-gradient(140deg,#0d1117 0%,#1c2333 50%,#1e293b 100%)",
};

/* icons for cover decoration */
const COVER_EMOJI: Record<string, string> = {
  residential: "🏠", office: "🏢", hotel: "🏨", school: "🏫",
  retail: "🛍️", healthcare: "🏥", warehouse: "🏭", default: "📐",
};

const FILTER_TABS = ["All", "Residential", "Office", "Hotel", "School", "Retail"] as const;
type FilterTab = typeof FILTER_TABS[number];

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProjectsPage() {
  const router = useRouter();
  const { currentSpace, account } = useAccount();
  const { projects, starredProjectIds, toggleProjectStar, getProjectsByBuilderSpaceId, addProject, getBxml } = useProjects();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [planSearch, setPlanSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newSpaceType, setNewSpaceType] = useState<SpaceTypeId>("office");
  const [spaceTypeDropdownOpen, setSpaceTypeDropdownOpen] = useState(false);
  const [newBusinessType, setNewBusinessType] = useState<"delivery" | "customer" | "self_use">("delivery");

  const STARRED = new Set(starredProjectIds);
  const isContainer = (p: Project) => !(p.creationMethod === "ai_build" || p.projectType === "ai_build") && !p.parentProjectId;

  const allProjects = useMemo(
    () => getProjectsByBuilderSpaceId(currentSpace?.id).filter(isContainer),
    [projects, currentSpace?.id]
  );

  const buildsByProject = useMemo(() => {
    const map: Map<string, Project[]> = new Map();
    projects
      .filter((p: Project) => (p.creationMethod === "ai_build" || p.projectType === "ai_build") && p.parentProjectId)
      .forEach((p: Project) => {
        const arr = map.get(p.parentProjectId!) ?? [];
        arr.push(p);
        map.set(p.parentProjectId!, arr);
      });
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    return allProjects
      .filter((p) => {
        if (activeTab === "All") return true;
        const label = getSpaceType(p.spaceType)?.label ?? "";
        return label.toLowerCase().includes(activeTab.toLowerCase()) ||
          p.spaceType?.toLowerCase().includes(activeTab.toLowerCase());
      })
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [allProjects, activeTab, search]);

  /* ── space plans for selected project ── */
  const plans = useMemo((): Project[] => {
    if (!selectedProject) return [];
    return (buildsByProject.get(selectedProject.id) ?? []).sort(
      (a: Project, b: Project) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
    );
  }, [selectedProject, buildsByProject]);

  const filteredPlans = useMemo(
    () => plans.filter((p: Project) => !planSearch || p.name.toLowerCase().includes(planSearch.toLowerCase())),
    [plans, planSearch]
  );

  const handleCreateProject = () => {
    if (!currentSpace || !newProjectName.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      buildingType: "commercial",
      country: "China",
      siteIds: [],
      builderSpaceId: currentSpace.id,
      collaborators: [{ email: account?.email ?? "owner@example.com", role: "owner" }],
      spaceType: newSpaceType,
      creationMethod: "manual",
      projectMode: "standard",
      projectType: "standard",
      studioLinked: false,
      updatedAt: new Date().toISOString(),
      projectBusinessType: newBusinessType,
      parentProjectId: null,
    };
    addProject(project);
    setIsCreateModalOpen(false);
    setNewProjectName("");
    setNewSpaceType("office");
    setNewBusinessType("delivery");
  };

  /* ── DETAIL VIEW ── */
  if (selectedProject) {
    const spaceType = getSpaceType(selectedProject.spaceType);
    const projectId = `PRJ-${new Date(selectedProject.updatedAt ?? Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}`;
    const cover = COVER_GRADIENTS[selectedProject.spaceType ?? "default"] ?? COVER_GRADIENTS.default;
    const emoji = COVER_EMOJI[selectedProject.spaceType ?? "default"] ?? COVER_EMOJI.default;

    return (
      <div className="flex h-full flex-col bg-[#0d0d0f] text-zinc-100">
        {/* Back nav */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/40">
          <button
            type="button"
            onClick={() => { setSelectedProject(null); setPlanSearch(""); }}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> All Projects
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Project header */}
          <div className="px-8 pt-8 pb-6 border-b border-zinc-800/30">
            <div className="flex items-start gap-5">
              {/* Cover thumbnail */}
              <div
                className="h-16 w-16 rounded-xl shrink-0 flex items-center justify-center text-2xl border border-zinc-700/30"
                style={{ background: cover }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {spaceType && (
                    <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                      {spaceType.label}
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-600 font-mono">ID: {projectId}</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-100 truncate">{selectedProject.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-[12px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Updated {timeAgo(selectedProject.updatedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {selectedProject.collaborators.length} member{selectedProject.collaborators.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plans section */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">空间方案 <span className="text-zinc-500 font-normal">(Space Plans)</span></h2>
                <p className="text-xs text-zinc-600 mt-0.5">Select a space plan to edit its canvas.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={planSearch}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    placeholder="Search plans..."
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none w-52"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/?createPlan=1")}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> New Plan
                </button>
              </div>
            </div>

            {filteredPlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700/40 py-16 flex flex-col items-center text-center">
                <MapPin className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-400">还没有空间方案</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs">从 Build AI 将方案移入当前项目，或点击 New Plan 开始创建。</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlans.map((plan: Project) => {
                  const bxml = getBxml(plan.id);
                  const stats = bxml ? getBXMLStats(bxml) : null;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => router.push(`/projects/${plan.id}?loading=1`)}
                      className="group rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/70 transition-all text-left overflow-hidden"
                    >
                      {/* Map placeholder */}
                      <div className="aspect-[4/3] flex items-center justify-center border-b border-zinc-800/40 bg-zinc-900/60">
                        <MapPin className="h-10 w-10 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-zinc-100 truncate">{plan.name}</p>
                          <MoreHorizontal className="h-4 w-4 text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100" />
                        </div>
                        {stats && (stats.spaces > 0 || stats.devices > 0) && (
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1">🗂 {stats.spaces} rooms</span>
                            <span className="flex items-center gap-1">📱 {stats.devices} devices</span>
                          </div>
                        )}
                        <p className="text-[11px] text-zinc-600 mt-1.5">Updated {timeAgo(plan.updatedAt)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div className="flex h-full flex-col bg-[#0d0d0f] text-zinc-100">
      {/* Header */}
      <div className="px-8 py-6 border-b border-zinc-800/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">All Projects</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage and organize your smart home deployments.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none w-60"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mt-5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-zinc-700/60 text-zinc-100 border border-zinc-600/50"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-800/40 flex items-center justify-center mb-4 text-2xl">📐</div>
            <p className="text-base font-medium text-zinc-400">No projects yet</p>
            <p className="text-sm text-zinc-600 mt-1">Create your first project to get started.</p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 flex items-center gap-1.5 rounded-lg bg-zinc-700/60 border border-zinc-600/50 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((project) => {
              const spaceType = getSpaceType(project.spaceType);
              const cover = COVER_GRADIENTS[project.spaceType ?? "default"] ?? COVER_GRADIENTS.default;
              const emoji = COVER_EMOJI[project.spaceType ?? "default"] ?? COVER_EMOJI.default;
              const buildCount = buildsByProject.get(project.id)?.length ?? 0;
              const starred = STARRED.has(project.id);

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="group rounded-2xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden hover:border-zinc-700/70 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-black/30 transition-all text-left"
                >
                  {/* Cover */}
                  <div
                    className="relative h-44 overflow-hidden"
                    style={{ background: cover }}
                  >
                    {/* Decorative blobs */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-10 select-none">{emoji}</span>
                    </div>
                    {/* Star button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleProjectStar(project.id); }}
                      className="absolute top-2.5 right-2.5 h-7 w-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-zinc-400 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Star className={`h-3.5 w-3.5 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    {/* Space type tag */}
                    {spaceType && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] text-zinc-200 font-medium">
                          {spaceType.label}
                        </span>
                      </div>
                    )}
                    {buildCount > 0 && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[10px] text-zinc-300">
                          {buildCount} plan{buildCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <p className="font-semibold text-zinc-100 text-[15px] leading-snug truncate">{project.name}</p>
                    <p className="text-[12px] text-zinc-500 mt-1 truncate">
                      {project.country ?? "China"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-zinc-600">Updated {timeAgo(project.updatedAt)}</p>
                      {/* Collaborator avatars */}
                      <div className="flex -space-x-1.5">
                        {project.collaborators.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white"
                            title={c.email}
                          >
                            {c.email.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">New Project</h3>
              <button
                type="button"
                onClick={() => { setIsCreateModalOpen(false); setNewProjectName(""); setSpaceTypeDropdownOpen(false); }}
                className="text-zinc-500 hover:text-zinc-300 rounded-lg p-1 hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. 李总 130㎡ 大平层智能方案"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateProject(); }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Space type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSpaceTypeDropdownOpen(!spaceTypeDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left text-sm text-zinc-200 hover:border-zinc-700"
                  >
                    {(() => { const st = getSpaceType(newSpaceType); return st ? <span className="flex items-center gap-2"><st.Icon className="h-4 w-4 text-zinc-400" />{st.label}<span className="text-zinc-500 text-xs">({st.labelEn})</span></span> : <span>Select type</span>; })()}
                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${spaceTypeDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {spaceTypeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl max-h-60 overflow-auto">
                      {SPACE_TYPES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => { setNewSpaceType(st.id); setSpaceTypeDropdownOpen(false); }}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-zinc-800 ${newSpaceType === st.id ? "text-indigo-400" : "text-zinc-200"}`}
                        >
                          {newSpaceType === st.id ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5" />}
                          <st.Icon className="h-4 w-4 text-zinc-400 shrink-0" />
                          {st.label}
                          <span className="text-zinc-500 text-xs">({st.labelEn})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setNewProjectName(""); setSpaceTypeDropdownOpen(false); }}
                  className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newProjectName.trim()}
                  onClick={handleCreateProject}
                  className="rounded-lg bg-zinc-100 text-zinc-900 px-5 py-2 text-sm font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
