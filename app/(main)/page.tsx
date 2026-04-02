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
  Plus,
  RefreshCw,
  CloudUpload,
  Home,
  ArrowRight,
  Zap,
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
    icon: Home,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "连接我的家",
    desc: "同步 Aqara Home 家庭数据到 Studio",
    prompt: "",
    action: "connect-home" as const,
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
    label: "二次创作",
    desc: "上传空间方案，AI 自动优化",
    prompt: "我上传了一份已有的空间方案，请帮我分析其中可以改进的地方，并给出优化建议，包括设备调整、自动化优化和 App 界面改进",
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

const MOCK_AIOT_FAMILIES = [
  { id: "fam-001", name: "我的家", location: "上海", devices: 14 },
  { id: "fam-002", name: "父母家", location: "杭州", devices: 8 },
];

const MOCK_CLOUD_STUDIOS = [
  { id: "cs-001", name: "aqarastudio-7831", label: "我的家", status: "online" as const, devices: 14, rooms: 4, lastSync: "2h ago", aiotSynced: true, syncedFamilyName: "我的家" },
  { id: "cs-002", name: "aqarastudio-5492", label: "父母家", status: "offline" as const, devices: 8, rooms: 3, lastSync: "3d ago", aiotSynced: false, syncedFamilyName: "" },
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
  const [qrBuildMeta, setQrBuildMeta] = useState<Record<string, { builtAt: string }>>({});
  const [moveBuildProject, setMoveBuildProject] = useState<Project | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("aqara-ai");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [showStudioPicker, setShowStudioPicker] = useState(false);
  const [showConnectHome, setShowConnectHome] = useState(false);
  const [homeDataPromptState, setHomeDataPromptState] = useState<"never_asked" | "declined" | "accepted">("never_asked");
  const [actionWarning, setActionWarning] = useState<string>("");

  // Studio selector for 二次创作 / 对话上下文
  const [cloudStudios, setCloudStudios] = useState(MOCK_CLOUD_STUDIOS);
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(null);
  const [deployProject, setDeployProject] = useState<Project | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const selectedStudio = cloudStudios.find(s => s.id === selectedStudioId);
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
      selectedStudioId: selectedStudioId ?? null,
      homeDataSyncStatus: selectedStudio?.aiotSynced ? "synced" : "not_synced",
      homeDataFamilyName: selectedStudio?.syncedFamilyName ?? "",
      homeDataPromptState: selectedStudio?.aiotSynced ? "accepted" : homeDataPromptState,
      updatedAt: new Date().toISOString(),
      agentStep: "describe",
    };
    addProject(project);
    const studioParam = selectedStudio ? `&studio=${encodeURIComponent(selectedStudio.name)}` : "";
    router.push(`/projects/${project.id}?prompt=${encodeURIComponent(p)}${studioParam}&mode=space&loading=1`);
  };

  const handleCreate = () => createProjectAndOpen(prompt);

  const selectedStudio = cloudStudios.find((s) => s.id === selectedStudioId) ?? null;

  const handleConnectMyHome = () => {
    setActionWarning("");
    setShowConnectHome(true);
  };

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
            {selectedStudio && (
              <div className="px-4 pt-4">
                <div className="inline-flex flex-col items-start gap-1">
                  <div className="relative inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/70 px-3 py-1.5 pr-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedStudio.status === "online" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                    <span className="max-w-[220px] truncate text-[11px] font-medium text-zinc-200">{selectedStudio.name}</span>
                    {selectedStudio.aiotSynced && selectedStudio.syncedFamilyName && (
                      <span className="pointer-events-none absolute -top-2.5 right-7 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-[1px] text-[10px] font-medium text-emerald-300">
                        {selectedStudio.syncedFamilyName}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedStudioId(null)}
                      className="rounded-full p-0.5 text-zinc-500 hover:bg-zinc-700/70 hover:text-zinc-300 transition-colors"
                      title="取消当前 Studio 上下文"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className={`text-[10px] ${selectedStudio.aiotSynced ? "text-emerald-300/90" : "text-zinc-500"}`}>
                    {selectedStudio.aiotSynced ? `Home Data Synced${selectedStudio.syncedFamilyName ? ` · ${selectedStudio.syncedFamilyName}` : ""}` : "Home Data Not synced"}
                  </p>
                </div>
              </div>
            )}

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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.dwg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAttachmentMenuOpen((v) => !v)}
                    title="添加上下文"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/70 text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {attachmentMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={() => setAttachmentMenuOpen(false)} />
                      <div className="absolute left-0 bottom-full mb-2 z-[100] w-52 rounded-2xl border border-zinc-700/60 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-md">
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/80"
                        >
                          <ImagePlus className="h-3.5 w-3.5 text-sky-400" />
                          添加户型图
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentMenuOpen(false);
                            setShowStudioPicker(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800/80"
                        >
                          <Building2 className="h-3.5 w-3.5 text-violet-400" />
                          选择 Studio
                        </button>
                      </div>
                    </>
                  )}
                </div>

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
                  onClick={() => {
                    if ((card as { action?: string }).action === "connect-home") {
                      handleConnectMyHome();
                      return;
                    }
                    setPrompt(card.prompt);
                    promptRef.current?.focus();
                  }}
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

          {actionWarning && (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
              {actionWarning}
            </div>
          )}
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
                qrBuildMeta={qrBuildMeta}
                onDeployToStudio={setDeployProject}
                onRemixProject={(project) => {
                  const remixId = `proj-${Date.now()}`;
                  addProject({
                    ...project,
                    id: remixId,
                    name: `${project.name} Remix`,
                    updatedAt: new Date().toISOString(),
                    studioLinked: false,
                    agentStep: "describe",
                    parentProjectId: undefined,
                  });
                  router.push(`/projects/${remixId}?mode=space&loading=1&remixFrom=${encodeURIComponent(project.id)}`);
                }}
                onRenameProject={(project) => {
                  const nextName = window.prompt("重命名方案", project.name);
                  if (!nextName) return;
                  const trimmed = nextName.trim();
                  if (!trimmed || trimmed === project.name) return;
                  updateProject(project.id, {
                    name: trimmed,
                    updatedAt: new Date().toISOString(),
                  });
                }}
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
      <BuildPluginModal
        project={buildProject}
        onClose={() => setBuildProject(null)}
        onBuilt={(p) => {
          setQrBuildMeta((prev) => ({ ...prev, [p.id]: { builtAt: new Date().toISOString() } }));
        }}
        onShowQr={(p) => { setBuildProject(null); setQrProject(p); }}
      />
      <StudioPickerModal
        open={showStudioPicker}
        studios={cloudStudios}
        selectedStudioId={selectedStudioId}
        onClose={() => setShowStudioPicker(false)}
        onConfirm={(studioId) => {
          setSelectedStudioId(studioId);
          setShowStudioPicker(false);
        }}
      />
      <ConnectMyHomeModal
        open={showConnectHome}
        studios={cloudStudios}
        selectedStudioId={selectedStudioId}
        onClose={() => setShowConnectHome(false)}
        onDeclined={() => {
          setHomeDataPromptState("declined");
          setShowConnectHome(false);
        }}
        onCreateStudio={() => {
          const newStudio = {
            id: `cs-${Date.now()}`,
            name: `aqarastudio-${Math.floor(1000 + Math.random() * 9000)}`,
            label: "新云空间",
            status: "online" as const,
            devices: 0,
            rooms: 0,
            lastSync: "just now",
            aiotSynced: false,
            syncedFamilyName: "",
          };
          setCloudStudios((prev) => [newStudio, ...prev]);
          return newStudio;
        }}
        onConnected={(studioId, familyName) => {
          setCloudStudios((prev) =>
            prev.map((studio) =>
              studio.id === studioId
                ? { ...studio, aiotSynced: true, syncedFamilyName: familyName, lastSync: "just now" }
                : studio
            )
          );
          setHomeDataPromptState("accepted");
          setSelectedStudioId(studioId);
          setShowConnectHome(false);
        }}
      />
      <DeployToStudioModal
        project={deployProject}
        onClose={() => setDeployProject(null)}
      />
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
  qrBuildMeta,
  onDeployToStudio,
  onRemixProject,
  onRenameProject,
  onMoveToProjects,
}: {
  projects: Project[];
  onOpenQr: (project: Project) => void;
  onBuildPlugin: (project: Project) => void;
  getBxml: (id: string) => BXMLDocument | null;
  qrBuildMeta: Record<string, { builtAt: string }>;
  onDeployToStudio: (project: Project) => void;
  onRemixProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
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
        (() => {
          const built = qrBuildMeta[p.id];
          const persistedBuild = Boolean(
            p.rolePluginConfigs?.some((cfg) => cfg.status === "published")
          );
          const hasQrBuild = Boolean(built || persistedBuild);
          const updatedTs = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
          const builtTs = built?.builtAt ? new Date(built.builtAt).getTime() : 0;
          const isQrOutdated = Boolean(built && updatedTs > builtTs);
          return (
        <ProjectCard
          key={p.id}
          project={p}
          bxmlDoc={getBxml(p.id)}
          hasQrBuild={hasQrBuild}
          isQrOutdated={isQrOutdated}
          onClick={() => router.push(`/projects/${p.id}?loading=1`)}
          onOpenQr={() => onOpenQr(p)}
          onBuildPlugin={() => onBuildPlugin(p)}
          onDeployToStudio={() => onDeployToStudio(p)}
          onRemix={() => onRemixProject(p)}
          onRename={() => onRenameProject(p)}
          onMoveToProjects={() => onMoveToProjects(p)}
        />
          );
        })()
      ))}
    </div>
  );
}

const STEP_LABELS: Record<string, string> = { describe: "Describing", generate: "Generating", refine: "Refining", deploy: "Deployed" };

function ProjectCard({
  project,
  bxmlDoc,
  hasQrBuild,
  isQrOutdated,
  onClick,
  onOpenQr,
  onBuildPlugin,
  onDeployToStudio,
  onRemix,
  onRename,
  onMoveToProjects,
}: {
  project: Project;
  bxmlDoc: BXMLDocument | null;
  hasQrBuild: boolean;
  isQrOutdated: boolean;
  onClick: () => void;
  onOpenQr: () => void;
  onBuildPlugin: () => void;
  onDeployToStudio: () => void;
  onRemix: () => void;
  onRename: () => void;
  onMoveToProjects: () => void;
}) {
  const isAiBuild = project.creationMethod === "ai_build" || project.projectType === "ai_build";
  const isDeployed = project.studioLinked;
  const updatedAt = project.updatedAt ? new Date(project.updatedAt) : null;
  const timeAgo = updatedAt ? getTimeAgo(updatedAt) : "";
  const step = project.agentStep;
  const [menuOpen, setMenuOpen] = useState(false);

  const stats = useMemo(() => bxmlDoc ? getBXMLStats(bxmlDoc) : null, [bxmlDoc]);
  const hasStats = Boolean(stats && (stats.spaces + stats.devices + stats.automations + stats.scenes > 0));
  const isDraft = !hasStats;
  const visual = pickVisual(project.id);

  return (
    <div className="group relative rounded-xl border border-zinc-800/50 bg-zinc-900/40 cursor-pointer hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all overflow-visible" onClick={onClick}>
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
          <span className="absolute top-2 right-2 rounded bg-blue-500/20 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-blue-400 transition-opacity group-hover:opacity-0">AI</span>
        )}
        {/* Menu button */}
        <button type="button" className="absolute top-2 right-2 rounded-md border border-zinc-600/50 bg-black/45 px-2 py-1 text-[10px] font-medium text-zinc-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}>
          Details
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
          <div className="absolute right-2 top-12 z-50 w-56 rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-600">查看 / 进入</div>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); window.open(`/projects/${project.id}?loading=1`, "_blank", "noopener,noreferrer"); }}>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" /> Open in New Tab
            </button>
            <div className="border-t border-zinc-800" />
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-600">生成 / 发布</div>
            <button type="button" disabled={isDraft} className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${isDraft ? "text-zinc-600 cursor-not-allowed" : "text-zinc-300 hover:bg-zinc-800/60"}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onBuildPlugin(); }}>
              <Package className={`h-3.5 w-3.5 ${isDraft ? "text-zinc-700" : "text-violet-400"}`} /> Build App Plugin
            </button>
            <button
              type="button"
              disabled={!hasQrBuild}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${!hasQrBuild ? "text-zinc-600 cursor-not-allowed" : isQrOutdated ? "text-amber-300 hover:bg-zinc-800/60" : "text-zinc-300 hover:bg-zinc-800/60"}`}
              onClick={(e) => { e.stopPropagation(); if (!hasQrBuild) return; setMenuOpen(false); onOpenQr(); }}
            >
              <Smartphone className={`h-3.5 w-3.5 ${!hasQrBuild ? "text-zinc-700" : isQrOutdated ? "text-amber-400" : "text-blue-400"}`} />
              {isQrOutdated ? "Preview outdated?" : "View QR Code"}
            </button>
            {hasQrBuild && isQrOutdated && (
              <p className="px-3 pb-2 text-[10px] text-amber-300/85">当前二维码基于上一次 build，不包含最新修改</p>
            )}
            <button type="button" disabled={isDraft} className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${isDraft ? "text-zinc-600 cursor-not-allowed" : "text-zinc-300 hover:bg-zinc-800/60"}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeployToStudio(); }}>
              <CloudUpload className={`h-3.5 w-3.5 ${isDraft ? "text-zinc-700" : "text-sky-400"}`} />
              Deploy to Studio
            </button>
            <div className="border-t border-zinc-800" />
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-zinc-600">编辑 / 衍生</div>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRemix(); }}>
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Remix
            </button>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename(); }}>
              <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" /> Rename
            </button>
            <button type="button" className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveToProjects(); }}>
              <FolderInput className="h-3.5 w-3.5 text-amber-400" /> Move to Projects
            </button>
          </div>
        </>
      )}

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-zinc-100 truncate mb-1">{project.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          {timeAgo && <span className="flex items-center gap-1 text-[11px] text-zinc-600"><Clock className="h-3 w-3" aria-hidden /> {timeAgo}</span>}
          {isDraft && <span className="rounded-full border border-zinc-700/80 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">Draft</span>}
        </div>

        {hasStats ? (
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: "空间", value: stats!.spaces, color: "text-violet-400" },
              { label: "设备", value: stats!.devices, color: "text-sky-400" },
              { label: "自动", value: stats!.automations, color: "text-amber-400" },
              { label: "场景", value: stats!.scenes, color: "text-emerald-400" },
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

type AgentEntry = {
  id: number;
  kind: "think" | "action" | "result" | "warn" | "done";
  text: string;
};

const AGENT_SCRIPT: { kind: AgentEntry["kind"]; text: string; delay: number }[] = [
  { kind: "think",  text: "Reading BXML structure and space graph…",                        delay: 600  },
  { kind: "action", text: "parse_bxml({ source: 'space_graph.xml' })",                      delay: 700  },
  { kind: "result", text: "Found 4 rooms · 12 devices · 3 scenes · 8 automation rules",    delay: 500  },
  { kind: "think",  text: "Resolving semantic ID bindings against Studio device catalog…",  delay: 800  },
  { kind: "action", text: "resolve_semantic_ids({ strict: false })",                        delay: 900  },
  { kind: "result", text: "11 / 12 devices matched  ·  1 fallback applied",                delay: 400  },
  { kind: "warn",   text: "camera_entrance has no real binding — using preview placeholder",delay: 300  },
  { kind: "think",  text: "Generating plugin manifest and role config (owner role)…",       delay: 700  },
  { kind: "action", text: "generate_manifest({ roles: ['owner'], theme: 'home_warm' })",    delay: 1000 },
  { kind: "result", text: "Manifest v1 created  ·  UI pages: 5  ·  widgets: 24",           delay: 400  },
  { kind: "think",  text: "Packaging assets and running sandbox verification…",             delay: 600  },
  { kind: "action", text: "pack_plugin({ target: 'cloud', minify: true })",                delay: 1400 },
  { kind: "result", text: "Bundle 48 KB  ·  sandbox checks passed",                        delay: 500  },
  { kind: "action", text: "distribute_cdn({ regions: ['CN', 'US'] })",                     delay: 900  },
  { kind: "result", text: "CDN propagation complete  ·  avg latency 12 ms",                delay: 400  },
  { kind: "action", text: "generate_qr({ ttl: 'permanent', access: 'owner' })",            delay: 600  },
  { kind: "done",   text: "Plugin ready — pluginId: plg_xxxxxxxx",                         delay: 0    },
];

function BuildPluginModal({
  project,
  onClose,
  onBuilt,
  onShowQr,
}: {
  project: Project | null;
  onClose: () => void;
  onBuilt: (p: Project) => void;
  onShowQr: (p: Project) => void;
}) {
  const [log, setLog] = React.useState<AgentEntry[]>([]);
  const [running, setRunning] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!project) { setLog([]); setRunning(false); setDone(false); }
  }, [project]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  if (!project) return null;

  const startBuild = () => {
    setRunning(true);
    let cursor = 0;
    AGENT_SCRIPT.forEach((entry, i) => {
      cursor += 400 + entry.delay;
      setTimeout(() => {
        setLog((prev) => [...prev, { id: i, kind: entry.kind, text: entry.text }]);
        if (entry.kind === "done") setTimeout(() => {
          setRunning(false);
          setDone(true);
          onBuilt(project);
        }, 300);
      }, cursor);
    });
  };

  const kindMeta: Record<AgentEntry["kind"], { label: string; labelColor: string; textColor: string }> = {
    think:  { label: "think",  labelColor: "text-violet-400",  textColor: "text-zinc-400"  },
    action: { label: "call",   labelColor: "text-sky-400",     textColor: "text-zinc-200"  },
    result: { label: "obs",    labelColor: "text-emerald-400", textColor: "text-zinc-300"  },
    warn:   { label: "warn",   labelColor: "text-amber-400",   textColor: "text-amber-200" },
    done:   { label: "done",   labelColor: "text-emerald-400", textColor: "text-emerald-300"},
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
              <Package className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Build Plugin</h3>
              <p className="text-[11px] text-zinc-500">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <span className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                running
              </span>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* idle state */}
        {!running && !done && log.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-zinc-300 mb-1">Package this space design into a Life App plugin</p>
            <p className="text-xs text-zinc-500 mb-5">The agent will analyze BXML, resolve device bindings, and generate a scannable QR plugin.</p>
            <button type="button" onClick={startBuild} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
              Start Build
            </button>
          </div>
        )}

        {/* agent log */}
        {(running || log.length > 0) && (
          <div ref={logRef} className="max-h-72 overflow-y-auto px-4 py-3 space-y-1.5 font-mono text-[11px]">
            {log.map((entry) => {
              const m = kindMeta[entry.kind];
              return (
                <div key={entry.id} className="flex items-start gap-2">
                  <span className={`shrink-0 w-9 text-right ${m.labelColor} opacity-70`}>{m.label}</span>
                  <span className="text-zinc-700 shrink-0">›</span>
                  <span className={m.textColor}>{entry.text}</span>
                </div>
              );
            })}
            {running && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="w-9 text-right text-zinc-600 opacity-70">···</span>
                <span className="text-zinc-700 shrink-0">›</span>
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* done footer */}
        {done && (
          <div className="border-t border-zinc-800 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Plugin ready
            </div>
            <button type="button" onClick={() => onShowQr(project)} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors">
              Show QR Code →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StudioPickerModal({
  open,
  studios,
  selectedStudioId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  studios: typeof MOCK_CLOUD_STUDIOS;
  selectedStudioId: string | null;
  onClose: () => void;
  onConfirm: (studioId: string) => void;
}) {
  const [localSelection, setLocalSelection] = React.useState<string | null>(selectedStudioId);
  React.useEffect(() => {
    if (open) setLocalSelection(selectedStudioId);
  }, [open, selectedStudioId]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">选择 Studio 上下文</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {studios.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-4 text-center text-xs text-zinc-500">当前没有可用 Studio，请先点击「连接我的家」创建云 Studio。</p>
          ) : (
            studios.map((studio) => (
              <button
                key={studio.id}
                type="button"
                onClick={() => setLocalSelection(studio.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${localSelection === studio.id ? "border-violet-500/40 bg-violet-500/[0.06]" : "border-zinc-800 hover:border-zinc-700"}`}
              >
                <span className={`h-2 w-2 rounded-full ${studio.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-200">{studio.name}</p>
                  <p className="text-[11px] text-zinc-500">{studio.devices} 台设备 · {studio.rooms} 个空间</p>
                </div>
                {localSelection === studio.id && <Check className="h-4 w-4 text-violet-400" />}
              </button>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">取消</button>
          <button
            type="button"
            disabled={!localSelection}
            onClick={() => localSelection && onConfirm(localSelection)}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

const CONNECT_SYNC_LOG: { kind: "think" | "action" | "result" | "done"; text: string; delay: number }[] = [
  { kind: "think", text: "正在读取你选择的家庭信息…", delay: 450 },
  { kind: "action", text: "正在同步房间和设备到目标 Studio…", delay: 850 },
  { kind: "result", text: "家庭数据已同步，正在整理创作所需信息…", delay: 600 },
  { kind: "done", text: "已准备完成，可继续创作。", delay: 0 },
];

function ConnectMyHomeModal({
  open,
  studios,
  selectedStudioId,
  onClose,
  onDeclined,
  onCreateStudio,
  onConnected,
}: {
  open: boolean;
  studios: typeof MOCK_CLOUD_STUDIOS;
  selectedStudioId: string | null;
  onClose: () => void;
  onDeclined: () => void;
  onCreateStudio: () => (typeof MOCK_CLOUD_STUDIOS)[number] | null;
  onConnected: (studioId: string, familyName: string) => void;
}) {
  const [step, setStep] = React.useState<"no-family" | "select-family" | "create-confirm" | "creating" | "select-studio" | "syncing" | "done">("select-family");
  const [activeStudioId, setActiveStudioId] = React.useState<string>(selectedStudioId ?? studios[0]?.id ?? "");
  const [selectedFamilyId, setSelectedFamilyId] = React.useState<string>(MOCK_AIOT_FAMILIES[0]?.id ?? "");
  const [syncLog, setSyncLog] = React.useState<typeof CONNECT_SYNC_LOG>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const nextStudio = selectedStudioId ?? studios[0]?.id ?? "";
    setActiveStudioId(nextStudio);
    setSelectedFamilyId(MOCK_AIOT_FAMILIES[0]?.id ?? "");
    setSyncLog([]);
    setStep(MOCK_AIOT_FAMILIES.length === 0 ? "no-family" : "select-family");
  }, [open, studios, selectedStudioId]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [syncLog]);

  if (!open) return null;

  const activeStudio = studios.find((s) => s.id === activeStudioId);

  const beginSync = () => {
    setStep("syncing");
    let cursor = 0;
    CONNECT_SYNC_LOG.forEach((entry) => {
      cursor += 300 + entry.delay;
      setTimeout(() => {
        setSyncLog((prev) => [...prev, entry]);
        if (entry.kind === "done") setTimeout(() => setStep("done"), 250);
      }, cursor);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">连接我的家</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "no-family" && (
          <div className="p-5">
            <p className="text-sm text-zinc-300">当前 Aqara Home 账号下暂无可用家庭。</p>
            <p className="mt-1 text-xs text-zinc-500">本次流程已结束，可先在 Aqara Home 中创建家庭后再继续连接。</p>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={onClose} className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700">完成</button>
            </div>
          </div>
        )}

        {step === "create-confirm" && (
          <div className="p-5">
            <p className="text-sm text-zinc-300">当前还没有可用的 Studio，请先获取一台 Studio。</p>
            <p className="mt-1 text-xs text-zinc-500">点击 Try Online Demo 可快速创建一台在线 Studio。</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onDeclined} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">取消</button>
              <button
                type="button"
                onClick={() => {
                  setStep("creating");
                  setTimeout(() => {
                    const created = onCreateStudio();
                    if (!created) {
                      onClose();
                      return;
                    }
                    setActiveStudioId(created.id);
                    setStep("syncing");
                    beginSync();
                  }, 700);
                }}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
              >
                Try Online Demo
              </button>
            </div>
          </div>
        )}

        {step === "creating" && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
            <p className="text-sm text-zinc-300">正在创建云 Studio…</p>
          </div>
        )}

        {step === "select-family" && (
          <div className="p-4">
            <p className="mb-3 text-xs text-zinc-500">请选择一个 Aqara Home 家庭，作为本次创作的数据来源。</p>
            <div className="space-y-2">
              {MOCK_AIOT_FAMILIES.map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setSelectedFamilyId(fam.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${selectedFamilyId === fam.id ? "border-emerald-500/40 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-700"}`}
                >
                  <Home className={`h-4 w-4 ${selectedFamilyId === fam.id ? "text-emerald-400" : "text-zinc-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200">{fam.name}</p>
                  </div>
                  {selectedFamilyId === fam.id && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onDeclined} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">取消</button>
              <button
                type="button"
                disabled={!selectedFamilyId}
                onClick={() => setStep(studios.length === 0 ? "create-confirm" : "select-studio")}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === "select-studio" && (
          <div className="p-4">
            <p className="mb-3 text-xs text-zinc-500">请选择目标 Studio，系统将把家庭数据同步到该 Studio。</p>
            <div className="space-y-2">
              {studios.map((studio) => (
                <button
                  key={studio.id}
                  type="button"
                  onClick={() => setActiveStudioId(studio.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${activeStudioId === studio.id ? "border-violet-500/40 bg-violet-500/[0.06]" : "border-zinc-800 hover:border-zinc-700"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${studio.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200">{studio.name}</p>
                    <p className={`text-[11px] ${studio.aiotSynced ? "text-emerald-400/90" : "text-zinc-500"}`}>
                      {studio.aiotSynced ? `已同步 Aqara Home 家庭数据${studio.syncedFamilyName ? ` · ${studio.syncedFamilyName}` : ""}` : "未同步家庭数据"}
                    </p>
                  </div>
                  {activeStudioId === studio.id && <Check className="h-4 w-4 text-violet-400" />}
                </button>
              ))}
            </div>
            {activeStudio?.aiotSynced && (
              <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                该 Studio 已同步过 Aqara Home 家庭数据，继续同步时系统会自动处理重复数据。
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={onDeclined} className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">取消</button>
              <button type="button" onClick={beginSync} disabled={!activeStudioId} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40">确认并同步</button>
            </div>
          </div>
        )}

        {(step === "syncing" || step === "done") && (
          <div className="p-4">
            <div ref={logRef} className="max-h-48 space-y-1.5 overflow-y-auto text-[11px]">
              {syncLog.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-9 shrink-0 text-right text-zinc-600">
                    {entry.kind === "think" ? "AI" : entry.kind === "action" ? "同步" : entry.kind === "result" ? "结果" : "完成"}
                  </span>
                  <span className="text-zinc-700">›</span>
                  <span className={entry.kind === "done" ? "text-emerald-300" : "text-zinc-400"}>{entry.text}</span>
                </div>
              ))}
              {step === "syncing" && (
                <div className="flex items-center gap-1 pl-11">
                  {[0, 1, 2].map((i) => <span key={i} className="h-1 w-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}
                </div>
              )}
            </div>
            {step === "done" && (
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-xs text-emerald-300">已同步完成，返回继续创作</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!activeStudioId) return;
                    const fam = MOCK_AIOT_FAMILIES.find((f) => f.id === selectedFamilyId);
                    onConnected(activeStudioId, fam?.name ?? "");
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                >
                  完成
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Move to Projects Modal ── */
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
            <h3 className="text-base font-semibold text-zinc-100">Move to Projects</h3>
            <p className="mt-1 text-xs text-zinc-500">Move "{buildProject.name}" into another project</p>
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

/* ── Get Cloud Studio Modal (used in project canvas conversation) ── */
function GetStudioModal({
  open,
  onClose,
  onActivated,
}: {
  open: boolean;
  onClose: () => void;
  onActivated: (name: string) => void;
}) {
  const [step, setStep] = React.useState<"intro" | "activating" | "done">("intro");
  const [log, setLog] = React.useState<string[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) { setStep("intro"); setLog([]); }
  }, [open]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const ACTIVATE_LOG = [
    { text: "Allocating Cloud Studio instance in CN region…", delay: 500 },
    { text: "Provisioning Studio Core runtime…", delay: 900 },
    { text: "Installing device catalog & BXML engine…", delay: 1000 },
    { text: "Configuring knowledge graph endpoints…", delay: 800 },
    { text: "Studio online · aqarastudio-7831", delay: 700 },
  ];

  const activate = () => {
    setStep("activating");
    let cursor = 0;
    ACTIVATE_LOG.forEach((entry, i) => {
      cursor += entry.delay;
      setTimeout(() => {
        setLog((prev) => [...prev, entry.text]);
        if (i === ACTIVATE_LOG.length - 1) setTimeout(() => setStep("done"), 400);
      }, cursor);
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15">
              <CloudUpload className="h-4 w-4 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">获取 Cloud Studio</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "intro" && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Zap, label: "即时部署", desc: "BXML 方案一键上线，无需本地硬件" },
                { icon: RefreshCw, label: "AIOT 同步", desc: "自动导入账号下的家庭和设备数据" },
                { icon: Home, label: "远程控制", desc: "Life App 登录即可实控所有设备" },
                { icon: ArrowRight, label: "迁移到 M300", desc: "满意后一键迁移到本地硬件" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  <item.icon className="h-4 w-4 text-sky-400 mb-2" />
                  <p className="text-xs font-medium text-zinc-200">{item.label}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={activate}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition-colors">
              免费领取 5 天试用
            </button>
            <p className="text-center text-[11px] text-zinc-600 mt-2">到期后可续费或迁移到 M300 本地设备</p>
          </div>
        )}

        {(step === "activating" || step === "done") && (
          <div className="p-4">
            <div ref={logRef} className="font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              {log.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  {i === log.length - 1 && step === "done"
                    ? <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    : <span className="text-zinc-600 shrink-0 mt-0.5">›</span>}
                  <span className={i === log.length - 1 && step === "done" ? "text-emerald-300" : "text-zinc-400"}>{line}</span>
                </div>
              ))}
              {step === "activating" && (
                <div className="flex gap-1 pt-1 pl-5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>
            {step === "done" && (
              <div className="mt-4 border-t border-zinc-800 pt-4 flex justify-end">
                <button type="button" onClick={() => onActivated("aqarastudio-7831")}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                  开始使用 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── AIOT Sync Modal ── */
const AIOT_SYNC_LOG: { kind: "think" | "action" | "result" | "done"; text: string; delay: number }[] = [
  { kind: "think",  text: "Reading AIOT account families and device topology…",       delay: 500  },
  { kind: "action", text: "fetch_aiot_families({ account: 'current' })",              delay: 700  },
  { kind: "result", text: "Found 2 families · 22 devices total",                      delay: 400  },
  { kind: "think",  text: "Mapping AIOT device models to Studio semantic catalog…",   delay: 600  },
  { kind: "action", text: "map_devices({ strategy: 'semantic_match', strict: false })", delay: 1100 },
  { kind: "result", text: "20 / 22 devices matched  ·  2 require manual binding",    delay: 400  },
  { kind: "think",  text: "Building space graph from room metadata…",                 delay: 700  },
  { kind: "action", text: "build_space_graph({ source: 'aiot_home' })",               delay: 1000 },
  { kind: "result", text: "Space graph ready: 6 rooms · 20 devices · 8 scenes",      delay: 400  },
  { kind: "action", text: "push_to_studio({ target: 'cloud', merge: 'replace' })",   delay: 900  },
  { kind: "done",   text: "Sync complete — data available in Cloud Studio",           delay: 0    },
];

function AiotSyncModal({ open, studioName, onClose }: { open: boolean; studioName: string; onClose: () => void }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(MOCK_AIOT_FAMILIES.map((f) => f.id)));
  const [phase, setPhase] = React.useState<"select" | "syncing" | "done">("select");
  const [log, setLog] = React.useState<typeof AIOT_SYNC_LOG>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) { setPhase("select"); setLog([]); setSelected(new Set(MOCK_AIOT_FAMILIES.map((f) => f.id))); }
  }, [open]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const startSync = () => {
    setPhase("syncing");
    let cursor = 0;
    AIOT_SYNC_LOG.forEach((entry, i) => {
      cursor += 400 + entry.delay;
      setTimeout(() => {
        setLog((prev) => [...prev, entry]);
        if (entry.kind === "done") setTimeout(() => setPhase("done"), 300);
      }, cursor);
    });
  };

  const kindStyle = {
    think:  { label: "think",  color: "text-violet-400" },
    action: { label: "call",   color: "text-sky-400"    },
    result: { label: "obs",    color: "text-emerald-400" },
    done:   { label: "done",   color: "text-emerald-400" },
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
              <RefreshCw className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">同步 AIOT 数据</h3>
              <p className="text-[11px] text-zinc-500">目标：{studioName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === "select" && (
          <div className="p-5">
            <p className="text-xs text-zinc-500 mb-3">检测到以下 AIOT 家庭，选择需要同步的数据：</p>
            <div className="space-y-2 mb-5">
              {MOCK_AIOT_FAMILIES.map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setSelected((prev) => {
                    const next = new Set(prev);
                    next.has(fam.id) ? next.delete(fam.id) : next.add(fam.id);
                    return next;
                  })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${selected.has(fam.id) ? "border-emerald-500/40 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-700"}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${selected.has(fam.id) ? "bg-emerald-500/15" : "bg-zinc-800"}`}>
                    <Home className={`h-4 w-4 ${selected.has(fam.id) ? "text-emerald-400" : "text-zinc-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{fam.name}</p>
                  </div>
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${selected.has(fam.id) ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                    {selected.has(fam.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-zinc-600">已选 {selected.size} 个家庭</p>
              <button type="button" disabled={selected.size === 0} onClick={startSync}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-30 transition-colors">
                开始同步
              </button>
            </div>
          </div>
        )}

        {(phase === "syncing" || phase === "done") && (
          <div className="p-4">
            <div ref={logRef} className="font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto">
              {log.map((entry, i) => {
                const s = kindStyle[entry.kind];
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-9 text-right shrink-0 ${s.color} opacity-70`}>{s.label}</span>
                    <span className="text-zinc-700 shrink-0">›</span>
                    <span className={entry.kind === "done" ? "text-emerald-300" : entry.kind === "result" ? "text-zinc-300" : "text-zinc-400"}>{entry.text}</span>
                  </div>
                );
              })}
              {phase === "syncing" && (
                <div className="flex items-center gap-2 pl-11 pt-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>
            {phase === "done" && (
              <div className="border-t border-zinc-800 mt-4 pt-4 flex items-center justify-between">
                <p className="text-xs text-zinc-500">可在 Cloud Studio Web 中查看已导入的空间和设备数据</p>
                <button type="button" onClick={onClose}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                  完成
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Deploy to Studio Modal ── */
const DEPLOY_LOG: { kind: "think" | "action" | "result" | "done"; text: string; delay: number }[] = [
  { kind: "think",  text: "Validating BXML schema and semantic ID integrity…",        delay: 500  },
  { kind: "action", text: "validate_bxml({ strict: true })",                          delay: 700  },
  { kind: "result", text: "Schema valid · 0 errors · 2 warnings (non-blocking)",     delay: 400  },
  { kind: "think",  text: "Pushing space graph and device definitions to Studio…",    delay: 600  },
  { kind: "action", text: "deploy_bxml({ target: 'cloud_studio', merge: 'replace' })", delay: 1200 },
  { kind: "result", text: "Space graph updated · 12 devices registered",              delay: 400  },
  { kind: "action", text: "sync_automations({ rules: 8, scenes: 3 })",                delay: 900  },
  { kind: "result", text: "8 automation rules · 3 scenes activated",                  delay: 400  },
  { kind: "action", text: "notify_life_app({ event: 'bxml_updated' })",               delay: 600  },
  { kind: "done",   text: "Deployment complete — BXML is live on Cloud Studio",       delay: 0    },
];

function DeployToStudioModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [phase, setPhase] = React.useState<"idle" | "deploying" | "done">("idle");
  const [log, setLog] = React.useState<typeof DEPLOY_LOG>([]);
  const [targetStudioId, setTargetStudioId] = React.useState<string>(MOCK_CLOUD_STUDIOS[0]?.id ?? "");
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!project) { setPhase("idle"); setLog([]); setTargetStudioId(MOCK_CLOUD_STUDIOS[0]?.id ?? ""); }
  }, [project]);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const startDeploy = () => {
    setPhase("deploying");
    let cursor = 0;
    DEPLOY_LOG.forEach((entry, i) => {
      cursor += 400 + entry.delay;
      setTimeout(() => {
        setLog((prev) => [...prev, entry]);
        if (entry.kind === "done") setTimeout(() => setPhase("done"), 300);
      }, cursor);
    });
  };

  const kindStyle = {
    think:  { label: "think",  textColor: "text-zinc-400",   labelColor: "text-violet-400" },
    action: { label: "call",   textColor: "text-zinc-200",   labelColor: "text-sky-400"    },
    result: { label: "obs",    textColor: "text-zinc-300",   labelColor: "text-emerald-400" },
    done:   { label: "done",   textColor: "text-emerald-300", labelColor: "text-emerald-400" },
  };

  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15">
              <CloudUpload className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Deploy to Studio</h3>
              <p className="text-[11px] text-zinc-500">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === "deploying" && (
              <span className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />deploying
              </span>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {phase === "idle" && (
          <div className="p-5">
            <p className="text-xs text-zinc-500 mb-4">选择目标 Cloud Studio，将 BXML 方案实例化部署。部署后可在 Life App 及 Studio Web 中看到完整空间和设备数据。</p>
            <div className="space-y-2 mb-5">
              {MOCK_CLOUD_STUDIOS.map((studio) => (
                <button key={studio.id} type="button"
                  onClick={() => setTargetStudioId(studio.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${targetStudioId === studio.id ? "border-sky-500/40 bg-sky-500/[0.05]" : "border-zinc-800 hover:border-zinc-700"}`}>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${studio.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-medium text-zinc-200">{studio.label}</span>
                      <span className="text-[10px] text-zinc-600 truncate">{studio.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{studio.devices} 台设备 · {studio.rooms} 个空间</div>
                  </div>
                  {targetStudioId === studio.id && <div className="h-4 w-4 shrink-0 rounded-full bg-sky-500/20 flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-sky-400" /></div>}
                </button>
              ))}
            </div>
            <button type="button" onClick={startDeploy} disabled={!targetStudioId}
              className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-40 transition-colors">
              开始部署
            </button>
          </div>
        )}

        {(phase === "deploying" || phase === "done") && (
          <div className="p-4">
            <div ref={logRef} className="font-mono text-[11px] space-y-1.5 max-h-64 overflow-y-auto">
              {log.map((entry, i) => {
                const s = kindStyle[entry.kind];
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-9 text-right shrink-0 ${s.labelColor} opacity-70`}>{s.label}</span>
                    <span className="text-zinc-700 shrink-0">›</span>
                    <span className={s.textColor}>{entry.text}</span>
                  </div>
                );
              })}
              {phase === "deploying" && (
                <div className="flex items-center gap-2 pl-11 pt-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>
            {phase === "done" && (
              <div className="border-t border-zinc-800 mt-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  已部署 · Life App 登录后可实控
                </div>
                <button type="button" onClick={onClose}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                  完成
                </button>
              </div>
            )}
          </div>
        )}
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
