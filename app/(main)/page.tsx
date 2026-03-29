"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Coins,
  Star,
  Rocket,
  Package,
  Heart,
  Eye,
  MoreHorizontal,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Smartphone,
  X,
  ChevronRight,
  Check,
  Shield,
  Layers,
  FolderInput,
  ImagePlus,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  Cpu,
  Mic,
  Send,
} from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";
import { useBilling } from "@/context/BillingContext";
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/gallery-data";
import type { Project } from "@/lib/domain-types";
import { getLifeAppPreviewUrl, getLifeAppQrImageUrl } from "@/lib/life-app-links";
import { getBXMLStats, type BXMLDocument } from "@/lib/bxml";

const QUICK_PROMPTS = [
  { icon: "🏠", label: "Family Apartment", prompt: "Design a smart home for a 3-bedroom family apartment with lighting scenes, morning routines, and kids safety" },
  { icon: "🧑", label: "Solo Apartment", prompt: "Create a modern solo apartment with voice control, mood lighting, and energy saving" },
  { icon: "👴", label: "Parents' Home", prompt: "Set up elderly care monitoring with morning check-in, night safety, fall alerts, and one-tap controls" },
  { icon: "🏢", label: "Smart Office", prompt: "Design a 200 sqm smart office with occupancy-based lighting, meeting room booking, and energy saving" },
];

const TASK_CARDS = [
  {
    icon: Sparkles,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Aqara AI 新功能",
    desc: "探索最新 AI 设计能力",
    prompt: "介绍 Aqara Builder 最新的 AI 功能，以及如何用 AI 快速设计智能空间方案",
  },
  {
    icon: Building2,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    label: "设计空间方案",
    desc: "描述户型，生成完整 BXML 方案",
    prompt: "请帮我设计一套三居室的智能家居方案，包含灯光分区、安防、能源管理和场景自动化",
  },
  {
    icon: ImagePlus,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    label: "分析户型图",
    desc: "上传户型图，AI 自动识别空间",
    prompt: "我上传了一张户型图，请分析各空间的功能区域，并为每个房间推荐智能设备和自动化方案",
  },
  {
    icon: Cpu,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "推荐自动化",
    desc: "基于空间语义推荐自动化规则",
    prompt: "基于当前空间方案，推荐最实用的自动化规则，包括安防、节能、舒适度场景",
  },
  {
    icon: FileSpreadsheet,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "生成 BOM 清单",
    desc: "自动输出设备采购清单与预算",
    prompt: "根据已有的空间方案，生成完整的设备 BOM 清单，包含型号、数量、安装位置和预估总价",
  },
];

const AI_MODELS = [
  { id: "aqara-ai", label: "Aqara AI", badge: "推荐" },
  { id: "gpt-4o", label: "GPT-4o", badge: "" },
  { id: "claude-3-7", label: "Claude 3.7", badge: "" },
  { id: "gemini-2", label: "Gemini 2.0", badge: "" },
];

const BUILD_VISUALS = [
  { gradient: "linear-gradient(135deg,#0f2027 0%,#203a43 55%,#2c5364 100%)", layers: ["🛋️", "💡", "🔒"] },
  { gradient: "linear-gradient(135deg,#1a0533 0%,#2d1b4e 55%,#4a2a6e 100%)", layers: ["🛏️", "🌙", "🎵"] },
  { gradient: "linear-gradient(135deg,#0d2818 0%,#1a4a2e 55%,#256640 100%)", layers: ["🌿", "☀️", "💧"] },
  { gradient: "linear-gradient(135deg,#1a0f00 0%,#3b2200 55%,#5c3800 100%)", layers: ["🍳", "☕", "🏠"] },
  { gradient: "linear-gradient(135deg,#000d1a 0%,#001a33 55%,#003366 100%)", layers: ["🖥️", "📊", "⚡"] },
  { gradient: "linear-gradient(135deg,#1a000d 0%,#330015 55%,#4d001e 100%)", layers: ["🏨", "🛎️", "✨"] },
];

function pickVisual(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return BUILD_VISUALS[h % BUILD_VISUALS.length];
}

type BottomTab = "my-build" | "templates";

function sortByTrending(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((a, b) => {
    const scoreA = (a.deployCount ?? 0) * 10 + a.likes + Math.floor(a.views / 100);
    const scoreB = (b.deployCount ?? 0) * 10 + b.likes + Math.floor(b.views / 100);
    return scoreB - scoreA;
  });
}

function generateStudioId(): string {
  return `aqarastudio-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

export default function HomePage() {
  const router = useRouter();
  const { account, currentSpace } = useAccount();
  const { addProject, projects, getBxml, updateProject } = useProjects();
  const { deductCredits, personalCredits } = useBilling();
  const [prompt, setPrompt] = useState("");
  const [creditWarning, setCreditWarning] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>("my-build");
  const [qrProject, setQrProject] = useState<Project | null>(null);
  const [buildProject, setBuildProject] = useState<Project | null>(null);
  const [moveBuildProject, setMoveBuildProject] = useState<Project | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("aqara-ai");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studioId = useRef(generateStudioId());

  const AI_BUILD_COST = 200;

  const myBuilds = useMemo(
    () =>
      projects
        .filter((p) => p.creationMethod === "ai_build" || p.projectType === "ai_build")
        .filter((p) => p.builderSpaceId === currentSpace?.id)
        .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()),
    [projects, currentSpace?.id]
  );

  const templateItems = useMemo(() => sortByTrending(GALLERY_ITEMS).slice(0, 12), []);
  const containerProjects = useMemo(
    () =>
      projects
        .filter((p) => p.builderSpaceId === currentSpace?.id)
        .filter((p) => !(p.creationMethod === "ai_build" || p.projectType === "ai_build"))
        .filter((p) => !p.parentProjectId),
    [projects, currentSpace?.id]
  );

  const createProjectAndOpen = (text: string) => {
    if (!currentSpace) return;
    if (!deductCredits(AI_BUILD_COST)) {
      setCreditWarning(true);
      return;
    }
    setCreditWarning(false);
    const p = text.trim() || "New AI Build";
    const sid = studioId.current;
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: p.slice(0, 40),
      buildingType: "commercial",
      country: "China",
      siteIds: [],
      builderSpaceId: currentSpace.id,
      collaborators: [{ email: account?.email ?? "owner@example.com", role: "owner" }],
      spaceType: "other",
      creationMethod: "ai_build",
      projectMode: "standard",
      projectType: "ai_build",
      studioLinked: false,
      updatedAt: new Date().toISOString(),
      agentStep: "describe",
    };
    addProject(project);
    router.push(`/projects/${project.id}?prompt=${encodeURIComponent(p)}&studio=${encodeURIComponent(sid)}&mode=space&loading=1`);
  };

  const handleCreate = () => createProjectAndOpen(prompt);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) ?? AI_MODELS[0];

  return (
    <div className="min-h-full bg-[#0d0d0f] text-zinc-100">

      {/* ── Build AI Hero ── */}
      <div className="px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
        <div className="max-w-2xl mx-auto">

          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-violet-500/20">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100">Build AI</h1>
              <p className="text-sm text-zinc-500 mt-0.5">描述你的空间，AI 自动生成智能方案</p>
            </div>
          </div>

          {/* Input Card */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/60 shadow-xl shadow-black/30 backdrop-blur-sm">

            {/* Uploaded image preview */}
            {uploadedImage && (
              <div className="px-4 pt-4">
                <div className="relative inline-flex items-center gap-2 rounded-xl border border-zinc-700/40 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-300">
                  <img src={uploadedImage} alt="floor plan" className="h-8 w-8 rounded object-cover" />
                  <span className="max-w-[180px] truncate text-xs text-zinc-400">{uploadedFileName}</span>
                  <button type="button" onClick={() => { setUploadedImage(null); setUploadedFileName(""); }} className="ml-1 rounded p-0.5 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="描述你的空间需求，例如：三居室，有两个孩子，需要安全监控和睡眠场景…"
              rows={4}
              className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none min-h-[7rem] leading-relaxed"
            />

            {/* Bottom bar */}
            <div className="flex items-center justify-between gap-3 px-4 pb-4">
              <div className="flex items-center gap-2">
                {/* Upload floor plan */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.dwg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="上传户型图"
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/60 hover:bg-zinc-800 transition-all"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span>户型图</span>
                </button>

                {/* Model selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModelMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600/60 hover:bg-zinc-800 transition-all"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>{currentModel.label}</span>
                    {currentModel.badge && (
                      <span className="rounded-full bg-violet-500/20 px-1.5 text-[10px] text-violet-400">{currentModel.badge}</span>
                    )}
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </button>
                  {modelMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setModelMenuOpen(false)} />
                      <div className="absolute left-0 bottom-full mb-2 z-[100] w-52 rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-zinc-800">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-600">选择大模型</p>
                        </div>
                        {AI_MODELS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => { setSelectedModel(m.id); setModelMenuOpen(false); }}
                            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors ${selectedModel === m.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"}`}
                          >
                            <span>{m.label}</span>
                            <div className="flex items-center gap-1.5">
                              {m.badge && <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-400">{m.badge}</span>}
                              {selectedModel === m.id && <Check className="h-3.5 w-3.5 text-violet-400" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Send button */}
              <button
                type="button"
                onClick={handleCreate}
                disabled={!prompt.trim()}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>开始构建</span>
              </button>
            </div>
          </div>

          {creditWarning && (
            <div role="alert" className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400 flex flex-wrap items-center gap-2">
              <Coins className="h-4 w-4 shrink-0" aria-hidden />
              <span>需要 {AI_BUILD_COST} 积分（当前余额 {personalCredits}）</span>
              <a href="/plans" className="ml-auto text-xs font-medium underline underline-offset-2">充值</a>
            </div>
          )}

          {/* Task Cards - single row horizontal scroll */}
          <div className="mt-7">
            <p className="text-xs text-zinc-600 mb-3 uppercase tracking-wider">快速任务</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {TASK_CARDS.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => { setPrompt(card.prompt); promptRef.current?.focus(); }}
                  className={`group flex-shrink-0 rounded-xl border ${card.bg} px-4 py-3 text-left hover:brightness-110 transition-all`}
                  style={{ minWidth: "160px" }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <card.icon className={`h-4 w-4 ${card.color} shrink-0`} />
                    <span className={`text-xs font-semibold ${card.color} whitespace-nowrap`}>{card.label}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Studio ID badge */}
          <div className="mt-6 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-[11px] text-zinc-600 w-fit">
            <span aria-hidden>🖥️</span>
            <span>{studioId.current}</span>
            <Clock className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* ── Bottom section: My Build / Templates ── */}
      <div className="border-t border-zinc-800/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 pt-4 pb-3">
            <button type="button" onClick={() => setBottomTab("my-build")} className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${bottomTab === "my-build" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}>
              My Build
            </button>
            <button type="button" onClick={() => setBottomTab("templates")} className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${bottomTab === "templates" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}>
              Templates
            </button>
          </div>
          <div className="pb-12">
            {bottomTab === "my-build" ? (
              <ProjectsGrid
                projects={myBuilds}
                onOpenQr={setQrProject}
                onBuildPlugin={setBuildProject}
                getBxml={getBxml}
                onMoveToProjects={(project) => {
                  setMoveBuildProject(project);
                  setTargetProjectId(project.parentProjectId ?? "");
                }}
              />
            ) : (
              <TemplatesGrid items={templateItems} onUseTemplate={(item) => { setPrompt(item.prompt); promptRef.current?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            )}
          </div>
        </div>
      </div>

      <LifeAppQrModal project={qrProject} onClose={() => setQrProject(null)} />
      <BuildPluginModal project={buildProject} onClose={() => setBuildProject(null)} onShowQr={(p) => { setBuildProject(null); setQrProject(p); }} />
      <MoveBuildToProjectModal
        buildProject={moveBuildProject}
        containerProjects={containerProjects}
        targetProjectId={targetProjectId}
        onTargetChange={setTargetProjectId}
        onClose={() => {
          setMoveBuildProject(null);
          setTargetProjectId("");
        }}
        onConfirm={() => {
          if (!moveBuildProject || !targetProjectId) return;
          updateProject(moveBuildProject.id, {
            parentProjectId: targetProjectId,
            updatedAt: new Date().toISOString(),
          });
          setMoveBuildProject(null);
          setTargetProjectId("");
        }}
      />
    </div>
  );
}

/* ── Project Grid ── */
function ProjectsGrid({
  projects,
  onOpenQr,
  onBuildPlugin,
  getBxml,
  onMoveToProjects,
}: {
  projects: Project[];
  onOpenQr: (project: Project) => void;
  onBuildPlugin: (project: Project) => void;
  getBxml: (id: string) => BXMLDocument | null;
  onMoveToProjects: (project: Project) => void;
}) {
  const router = useRouter();
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-zinc-800/30 p-6 mb-4"><Sparkles className="h-8 w-8 text-zinc-600" /></div>
        <p className="text-sm text-zinc-400">No builds yet</p>
        <p className="text-xs text-zinc-600 mt-1">Type an idea above and hit Build to create your first AI build.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          bxmlDoc={getBxml(p.id)}
          onClick={() => router.push(`/projects/${p.id}?loading=1`)}
          onOpenQr={() => onOpenQr(p)}
          onBuildPlugin={() => onBuildPlugin(p)}
          onMoveToProjects={() => onMoveToProjects(p)}
        />
      ))}
    </div>
  );
}

const STEP_LABELS: Record<string, string> = { describe: "Describing", generate: "Generating", refine: "Refining", deploy: "Deployed" };

function ProjectCard({
  project,
  bxmlDoc,
  onClick,
  onOpenQr,
  onBuildPlugin,
  onMoveToProjects,
}: {
  project: Project;
  bxmlDoc: BXMLDocument | null;
  onClick: () => void;
  onOpenQr: () => void;
  onBuildPlugin: () => void;
  onMoveToProjects: () => void;
}) {
  const isAiBuild = project.creationMethod === "ai_build" || project.projectType === "ai_build";
  const isDeployed = project.studioLinked;
  const updatedAt = project.updatedAt ? new Date(project.updatedAt) : null;
  const timeAgo = updatedAt ? getTimeAgo(updatedAt) : "";
  const step = project.agentStep;
  const [menuOpen, setMenuOpen] = useState(false);

  const stats = useMemo(() => bxmlDoc ? getBXMLStats(bxmlDoc) : null, [bxmlDoc]);
  const hasStats = stats && (stats.spaces + stats.devices + stats.automations + stats.scenes > 0);
  const visual = pickVisual(project.id);

  return (
    <div className="group relative rounded-xl border border-zinc-800/50 bg-zinc-900/40 cursor-pointer hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all overflow-hidden" onClick={onClick}>
      {/* Visual area */}
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: visual.gradient }}>
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {visual.layers.map((e, i) => <span key={i} className="text-3xl opacity-[0.13] select-none">{e}</span>)}
        </div>
        {/* Status badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isDeployed ? (
            <span className="flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Deployed</span>
          ) : step ? (
            <span className="flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] text-blue-400"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />{STEP_LABELS[step] ?? step}</span>
          ) : null}
        </div>
        {isAiBuild && (
          <span className="absolute top-2 right-2 rounded bg-blue-500/20 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-blue-400">AI</span>
        )}
        {/* Menu button */}
        <button type="button" className="absolute bottom-2 right-2 h-6 w-6 flex items-center justify-center rounded-md bg-black/50 backdrop-blur-sm text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
          <div className="absolute right-2 top-16 z-50 w-48 rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onBuildPlugin(); }}>
              <Package className="h-3.5 w-3.5 text-emerald-400" /> Build Plugin
            </button>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onOpenQr(); }}>
              <Smartphone className="h-3.5 w-3.5 text-blue-400" /> QR Code
            </button>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveToProjects(); }}>
              <FolderInput className="h-3.5 w-3.5 text-amber-400" /> Move to Projects
            </button>
            <div className="border-t border-zinc-800" />
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick(); }}>
              <Eye className="h-3.5 w-3.5 text-indigo-400" /> Open Project
            </button>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}>
              <Rocket className="h-3.5 w-3.5 text-amber-400" /> Publish to Explore
            </button>
          </div>
        </>
      )}

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-zinc-100 truncate mb-1">{project.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          {timeAgo && <span className="flex items-center gap-1 text-[11px] text-zinc-600"><Clock className="h-3 w-3" aria-hidden /> {timeAgo}</span>}
        </div>

        {hasStats ? (
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: "空间", value: stats.spaces, color: "text-violet-400" },
              { label: "设备", value: stats.devices, color: "text-sky-400" },
              { label: "自动", value: stats.automations, color: "text-amber-400" },
              { label: "场景", value: stats.scenes, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-md bg-zinc-800/40 px-1.5 py-1 text-center">
                <p className={`text-xs font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-zinc-600">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600 italic">No BXML data yet</p>
        )}

        {bxmlDoc?.summary && (
          <p className="mt-1.5 text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">{bxmlDoc.summary}</p>
        )}

        {isDeployed && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-2.5 py-1.5">
            <p className="text-[10px] font-medium text-emerald-400">Live on Studio</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); onOpenQr(); }} className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors">
              QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Templates Grid ── */
function TemplatesGrid({ items, onUseTemplate }: { items: GalleryItem[]; onUseTemplate: (item: GalleryItem) => void }) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <article key={item.id} className="group rounded-xl border border-zinc-800/45 overflow-hidden hover:border-zinc-700/60 hover:shadow-lg hover:shadow-black/25 transition-all duration-200 cursor-pointer" style={{ background: "rgba(15, 15, 22, 0.65)" }} onClick={() => router.push(`/explore/${item.id}`)}>
          <div className="relative aspect-[4/3] overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]" style={{ background: item.visual }}>
              <div className="absolute inset-0 flex items-center justify-center gap-2">{item.layers.map((e, i) => (<span key={i} className="opacity-[0.12] select-none text-2xl sm:text-3xl">{e}</span>))}</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2.5 pt-8 pointer-events-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(item.deployCount ?? 0) > 0 && <span className="flex items-center gap-0.5 rounded-full bg-black/55 backdrop-blur-sm px-1.5 py-0.5 text-[10px] text-zinc-200"><Rocket className="h-2.5 w-2.5 text-sky-400 shrink-0" aria-hidden /> {item.deployCount}</span>}
                {item.bom && item.bom.length > 0 && <span className="flex items-center gap-0.5 rounded-full bg-black/55 backdrop-blur-sm px-1.5 py-0.5 text-[10px] text-emerald-400/95"><Package className="h-2.5 w-2.5 shrink-0" aria-hidden /> {item.bom.reduce((s, b) => s + b.qty, 0)} devices</span>}
              </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onUseTemplate(item); }} className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-blue-600/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-blue-500 z-10">
              <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden /> Use
            </button>
          </div>
          <div className="p-2.5 sm:p-3">
            <h3 className="text-[13px] font-semibold text-zinc-100 line-clamp-1 leading-snug">{item.title}</h3>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700/90 text-[9px] font-bold text-zinc-200 shrink-0" aria-hidden>{item.avatar}</div>
                <span className="text-[11px] text-zinc-500 truncate">{item.author}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-600">
                <span className="flex items-center gap-0.5" title="Likes"><Heart className="h-3 w-3 opacity-70" aria-hidden />{item.likes}</span>
                <span className="flex items-center gap-0.5" title="Views"><Eye className="h-3 w-3 opacity-70" aria-hidden />{item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── QR Modal ── */
function LifeAppQrModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;
  const previewUrl = getLifeAppPreviewUrl(project.id);
  const qrUrl = getLifeAppQrImageUrl(previewUrl, 196);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">{project.name}</h3>
            <p className="mt-1 text-xs text-zinc-500">Scan with Aqara Life App to download and run plugin.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0">
          <div className="border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/50 p-5">
            <div className="rounded-2xl border border-zinc-800 bg-white p-4">
              <img src={qrUrl} alt={`QR code for ${project.name}`} className="mx-auto h-48 w-48 rounded-lg" />
            </div>
            <p className="mt-4 text-center text-xs text-zinc-500">Scan → Download plugin → App runtime loads it</p>
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">Plugin URL</p>
              <p className="mt-1 break-all text-[11px] text-zinc-400">{previewUrl}</p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-[11px]">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Sandbox verified</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Layers className="h-3 w-3 text-blue-400" />
                <span className="text-blue-400">CDN distributed</span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Smartphone className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium text-zinc-100">Aqara Life App Preview</p><p className="text-xs text-zinc-500">Plugin runtime loads after scan & download</p></div>
            </div>
            <div className="mx-auto max-w-[260px] rounded-[2rem] border border-zinc-800 bg-[#0b0c10] p-3 shadow-2xl">
              <div className="rounded-[1.5rem] border border-zinc-800 bg-gradient-to-b from-[#171b24] to-[#10131a] px-3 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-xs text-zinc-500">Aqara Life</p><p className="text-sm font-semibold text-zinc-100 truncate">{project.name}</p></div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-400">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Welcome Home", "Away Mode", "Sleep", "Movie Time"].map((scene) => (
                    <div key={scene} className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-3"><p className="text-[11px] text-zinc-400">Scene</p><p className="mt-1 text-xs font-medium text-zinc-100">{scene}</p></div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-3">
                  <div className="flex items-center justify-between"><div><p className="text-[11px] text-zinc-400">Linked Studio</p><p className="mt-1 text-xs font-medium text-zinc-100">{(project as any).selectedStudioId ?? "Cloud Studio"}</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BUILD_STEPS = [
  { id: "sandbox", label: "Cloud Sandbox Verification", delay: 1200 },
  { id: "scan", label: "Security Scan", delay: 800 },
  { id: "build", label: "Plugin Package Build", delay: 1500 },
  { id: "cdn", label: "CDN Distribution", delay: 800 },
  { id: "qr", label: "QR Code Generation", delay: 500 },
];

function BuildPluginModal({ project, onClose, onShowQr }: { project: Project | null; onClose: () => void; onShowQr: (p: Project) => void }) {
  const [stages, setStages] = useState<{ id: string; label: string; status: "pending" | "running" | "done" }[]>([]);
  const [building, setBuilding] = useState(false);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (!project) { setStages([]); setBuilding(false); setDone(false); }
  }, [project]);

  if (!project) return null;

  const startBuild = () => {
    setBuilding(true);
    setStages(BUILD_STEPS.map((s) => ({ id: s.id, label: s.label, status: "pending" })));
    let total = 200;
    BUILD_STEPS.forEach((step, i) => {
      setTimeout(() => setStages((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "running" } : s)), total);
      total += step.delay;
      setTimeout(() => {
        setStages((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "done" } : s));
        if (i === BUILD_STEPS.length - 1) setTimeout(() => { setBuilding(false); setDone(true); }, 300);
      }, total);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Build Plugin</h3>
            <p className="mt-1 text-xs text-zinc-500">{project.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">
          {!building && !done && stages.length === 0 && (
            <div className="text-center py-4">
              <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-300 mb-1">Build Life App Plugin</p>
              <p className="text-xs text-zinc-500 mb-5">Package this space design into a scannable QR plugin</p>
              <button type="button" onClick={startBuild} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">Start Build</button>
            </div>
          )}
          {(building || stages.length > 0) && (
            <div className="space-y-2">
              {stages.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
                  {s.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-zinc-700 shrink-0" />}
                  {s.status === "running" && <div className="h-4 w-4 rounded-full border-2 border-t-blue-400 border-zinc-700 animate-spin shrink-0" />}
                  {s.status === "done" && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  <span className={`text-xs ${s.status === "pending" ? "text-zinc-600" : s.status === "running" ? "text-zinc-200" : "text-zinc-300"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {done && (
            <div className="mt-4 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 mb-4">
                <p className="text-sm font-medium text-emerald-300">Plugin ready!</p>
                <p className="text-xs text-zinc-500 mt-1">Scan QR to install in Aqara Life</p>
              </div>
              <button type="button" onClick={() => onShowQr(project)} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">Show QR Code</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Move to Project Modal ── */
function MoveBuildToProjectModal({
  buildProject,
  containerProjects,
  targetProjectId,
  onTargetChange,
  onClose,
  onConfirm,
}: {
  buildProject: Project | null;
  containerProjects: Project[];
  targetProjectId: string;
  onTargetChange: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!buildProject) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Move to Project</h3>
            <p className="mt-1 text-xs text-zinc-500">Move "{buildProject.name}" into a container project</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {containerProjects.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
              <p className="text-sm text-zinc-400">No container projects yet</p>
              <p className="text-xs text-zinc-600 mt-1">Create a project first from the Projects page</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-auto">
              {containerProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onTargetChange(p.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${targetProjectId === p.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{p.name}</p>
                  </div>
                  {targetProjectId === p.id && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button type="button" disabled={!targetProjectId} onClick={onConfirm} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Move</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */
function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
