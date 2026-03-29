"use client";

import React, { useState, useRef, useEffect, Suspense, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown, ArrowLeft, Send, Sparkles, Globe, Star, Settings,
  Coins, Copy, Edit3, Eye,
  Zap, Box, PanelLeftClose, PanelLeftOpen, MessageSquare,
  ImagePlus, X, Check, ChevronRight, ChevronLeft, CircleDot,
  Cpu, LayoutGrid, Share2, PenTool, MessageSquarePlus, Upload,
  Plus, Clock, AlertCircle,
} from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";
import { useBilling } from "@/context/BillingContext";
import { getStudiosByIds } from "@/lib/studios-mock";
import {
  countByType, getBXMLStats,
  createEmptyBXML, createVersionStore, pushRevision, revertToRevision, getCurrentSnapshot,
  type BXMLDocument, type BXMLAgentStep, type BXMLVersionStore,
} from "@/lib/bxml";
import { executeAgentTurn, type AgentMessage } from "@/lib/agent";
import { getLifeAppPreviewUrl } from "@/lib/life-app-links";
import type { RolePluginConfig } from "@/lib/domain-types";

import {
  SpaceCanvas,
  AutomationCanvas,
  AppCanvas,
  StudioCanvas,
  DesignPanel,
  DeployDialog,
  ShareDialog,
  PublishDialog,
  BxmlSidebar,
  type CanvasView,
  type GenStep,
  GEN_STEPS,
  PREVIEW_TABS,
} from "./components";

type ChatMsg = { role: "user" | "assistant"; text: string };

function ProjectEditorContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, currentSpace } = useAccount();
  const { projects, updateProject, getBxml, saveBxml } = useProjects();
  const { personalCredits, currentMembership } = useBilling();

  const projectId = params.id as string;
  const project = projects.find((p) => p.id === projectId);
  const promptParam = searchParams.get("prompt");
  const loadingParam = searchParams.get("loading");

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [versionStore, setVersionStore] = useState<BXMLVersionStore>(() => createVersionStore(projectId));
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedStudioId, setSelectedStudioId] = useState<string | null>(project?.selectedStudioId ?? null);
  const [attachedImageNames, setAttachedImageNames] = useState<string[]>(project?.attachedImageNames ?? []);

  const [canvasView, setCanvasView] = useState<CanvasView>("space");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genSteps, setGenSteps] = useState<GenStep[]>([]);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [studioEnableDialog, setStudioEnableDialog] = useState<{ studioId: string; studioName: string } | null>(null);
  const [studioAssigning, setStudioAssigning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncedStudioId, setLastSyncedStudioId] = useState<string | null>(null);

  const [agentStep, setAgentStep] = useState<BXMLAgentStep>(project?.agentStep as BXMLAgentStep ?? "describe");
  const [bxmlDoc, setBxmlDocRaw] = useState<BXMLDocument | null>(null);
  const [bxmlPanelOpen, setBxmlPanelOpen] = useState(false);

  const setBxmlDoc = useCallback((doc: BXMLDocument | null) => {
    setBxmlDocRaw(doc);
    if (doc) saveBxml(projectId, doc);
  }, [projectId, saveBxml]);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [rolePluginBuilderOpen, setRolePluginBuilderOpen] = useState(false);
  const [lifePreviewOpen, setLifePreviewOpen] = useState(false);

  const STUDIO_TTL_MS = 24 * 60 * 60 * 1000;

  const [cloudStudioId, setCloudStudioId] = useState(() => {
    const studioParam = searchParams.get("studio");
    if (studioParam) return studioParam;
    if (project?.cloudStudioId) return project.cloudStudioId;
    return `aqarastudio-${projectId.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}`;
  });

  const [studioAllocatedAt, setStudioAllocatedAt] = useState<string>(() => {
    return project?.cloudStudioAllocatedAt ?? new Date().toISOString();
  });

  const studioExpired = useMemo(() => {
    const elapsed = Date.now() - new Date(studioAllocatedAt).getTime();
    return elapsed > STUDIO_TTL_MS;
  }, [studioAllocatedAt, STUDIO_TTL_MS]);

  const studioExpiresIn = useMemo(() => {
    const remaining = STUDIO_TTL_MS - (Date.now() - new Date(studioAllocatedAt).getTime());
    if (remaining <= 0) return "Expired";
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [studioAllocatedAt, STUDIO_TTL_MS]);

  const reallocateStudio = () => {
    const newId = `aqarastudio-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const now = new Date().toISOString();
    setCloudStudioId(newId);
    setStudioAllocatedAt(now);
    if (project?.id) {
      updateProject(project.id, { cloudStudioId: newId, cloudStudioAllocatedAt: now, updatedAt: now });
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const hasBootstrapped = useRef(false);
  const studioOptions = getStudiosByIds(currentSpace?.studioIds ?? []);
  const projectName = project?.name ?? promptParam?.slice(0, 30) ?? "Untitled Project";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { const t = setTimeout(() => setIsPageLoading(false), loadingParam ? 1100 : 650); return () => clearTimeout(t); }, [loadingParam]);

  useEffect(() => {
    const saved = getBxml(projectId);
    if (saved && !bxmlDoc) {
      setBxmlDocRaw(saved);
      setHasGenerated(true);
    }
  }, [projectId, getBxml]);

  useEffect(() => {
    if (hasBootstrapped.current || !promptParam) return;
    hasBootstrapped.current = true;

    const userMsg: AgentMessage = { id: `msg-init-${Date.now()}`, role: "user", text: promptParam, timestamp: new Date().toISOString() };
    setMessages([userMsg]);
    setIsGenerating(true);
    setGenSteps(GEN_STEPS.map((s) => ({ id: s.id, label: s.label, status: "pending" })));

    let totalDelay = 300;
    GEN_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setGenSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "running" } : s));
      }, totalDelay);
      totalDelay += step.delay;
      setTimeout(() => {
        setGenSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, status: "done" } : s));
        if (i === GEN_STEPS.length - 1) {
          setTimeout(async () => {
            const emptyBXML = createEmptyBXML(projectId);
            const result = await executeAgentTurn(promptParam!, emptyBXML, [userMsg]);
            const newDoc = result.updatedBXML;

            const store = pushRevision(
              createVersionStore(projectId),
              newDoc,
              result.revisionLabel,
              "agent",
              result.messages[0]?.id,
            );
            setVersionStore(store);
            setBxmlDoc(newDoc);
            setActiveSkills(result.skillsUsed);
            setIsGenerating(false);
            setAgentStep("refine");
            if (project?.id) updateProject(project.id, { agentStep: "refine", updatedAt: new Date().toISOString() });

            const stats = getBXMLStats(newDoc);
            const summaryMsg: AgentMessage = {
              id: `msg-summary-${Date.now()}`,
              role: "agent",
              text: `✅ 方案已生成！\n\n• ${stats.spaces} 个空间\n• ${stats.devices} 个设备\n• ${stats.automations} 条自动化\n• ${stats.scenes} 个场景\n• ${newDoc.relations.length} 条关系\n\n你可以继续对话来调整方案，或切换到 Studio → Deploy 进行部署。`,
              timestamp: new Date().toISOString(),
              revision: store.currentRevision,
              skillsUsed: result.skillsUsed,
            };
            setMessages((prev) => [...prev, ...result.messages, summaryMsg]);
            setHasGenerated(true);
            setBxmlPanelOpen(true);
          }, 200);
        }
      }, totalDelay);
    });
  }, [promptParam]);

  useEffect(() => {
    if (hasBootstrapped.current || promptParam || !project) return;
    hasBootstrapped.current = true;
    const now = new Date().toISOString();
    setMessages([
      { id: "msg-resume-1", role: "user", text: `Continue optimizing "${project.name}"`, timestamp: now },
      { id: "msg-resume-2", role: "agent", text: `欢迎回来！你可以继续通过对话修改方案：\n\n• 描述想要的变更（如 "加个传感器到厨房"）\n• 创建自动化（如 "人来灯亮"）\n• 生成场景模式\n• 查看 BOM 报价\n\n也可以在左侧版本历史中回退到任意版本。`, timestamp: now },
    ]);
    setHasGenerated(true);
  }, [promptParam, project]);

  const { deductCredits } = useBilling();
  const [chatCreditWarning, setChatCreditWarning] = useState(false);

  const handleSend = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    if (!deductCredits(100)) { setChatCreditWarning(true); return; }
    setChatCreditWarning(false);
    setChatInput("");

    const userMsg: AgentMessage = { id: `msg-${Date.now()}`, role: "user", text: msg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const currentBXML = bxmlDoc ?? createEmptyBXML(projectId);
      const result = await executeAgentTurn(msg, currentBXML, messages);

      if (result.skillsUsed.length > 0) {
        setActiveSkills(result.skillsUsed);
        const updatedDoc = result.updatedBXML;
        setBxmlDoc(updatedDoc);
        const newStore = pushRevision(versionStore, updatedDoc, result.revisionLabel, "agent", result.messages[0]?.id);
        setVersionStore(newStore);

        const agentMsgs = result.messages.map((m) => ({ ...m, revision: newStore.currentRevision }));
        setMessages((prev) => [...prev, ...agentMsgs]);
        setHasGenerated(true);
        if (lastSyncedStudioId) setHasUnsavedChanges(true);
      } else {
        setMessages((prev) => [...prev, ...result.messages]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: `msg-err-${Date.now()}`, role: "agent" as const, text: "抱歉，处理出错了，请重试。", timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRevert = useCallback((targetRevision: number) => {
    const newStore = revertToRevision(versionStore, targetRevision);
    setVersionStore(newStore);
    const snapshot = getCurrentSnapshot(newStore);
    if (snapshot) {
      setBxmlDoc(snapshot);
      const now = new Date().toISOString();
      setMessages((prev) => [...prev, {
        id: `msg-revert-${Date.now()}`,
        role: "agent",
        text: `⏪ 已回退到 v${targetRevision}。当前方案状态：\n\n• ${countByType(snapshot, "space")} 空间 · ${countByType(snapshot, "device")} 设备 · ${countByType(snapshot, "automation")} 自动化 · ${countByType(snapshot, "scene")} 场景\n\n你可以继续修改或部署。`,
        timestamp: now,
        revision: newStore.currentRevision,
      }]);
    }
  }, [versionStore]);

  const handleSaveToStudio = useCallback(() => {
    if (!lastSyncedStudioId) return;
    setHasUnsavedChanges(false);
    setMessages((prev) => [...prev, { role: "agent", text: "✅ Changes saved and pushed to Studio.", id: `msg-${Date.now()}`, timestamp: new Date().toISOString() } as unknown as AgentMessage]);
  }, [lastSyncedStudioId]);

  const handleDiscardChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const handlePickImages = (files: FileList | null) => {
    if (!files?.length || !project?.id) return;
    const next = [...attachedImageNames, ...Array.from(files).map((f) => f.name)].slice(0, 8);
    setAttachedImageNames(next);
    updateProject(project.id, { attachedImageNames: next, updatedAt: new Date().toISOString() });
  };

  const enterCustomize = useCallback(() => {
    setIsCustomizing(true);
    setLeftCollapsed(false);
  }, []);
  const exitCustomize = useCallback(() => {
    setIsCustomizing(false);
    setSelectedElementId(null);
  }, []);

  const handleStudioSelect = useCallback((studioId: string, studioName: string) => {
    setStudioEnableDialog({ studioId, studioName });
  }, []);

  const handleStudioConfirm = useCallback(() => {
    if (!studioEnableDialog) return;
    const { studioId, studioName } = studioEnableDialog;
    setStudioEnableDialog(null);
    setStudioAssigning(true);
    setMessages((prev) => [...prev, { role: "user", text: `Assign this space package to "${studioName}"`, id: `msg-${Date.now()}`, timestamp: new Date().toISOString() } as AgentMessage]);
    setCanvasView("space");
    setLeftCollapsed(false);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "agent", text: `Connecting to ${studioName}…\n\n⏳ Submitting "Assign to Studio"\n📡 Pushing space package & capability requirements…`, id: `msg-${Date.now()}`, timestamp: new Date().toISOString() } as unknown as AgentMessage]);
    }, 400);

    setTimeout(() => {
      setSelectedStudioId(studioId);
      setLastSyncedStudioId(studioId);
      setHasUnsavedChanges(false);
      if (project?.id) updateProject(project.id, { selectedStudioId: studioId, studioLinked: true, deployedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      setStudioAssigning(false);
      setMessages((prev) => [...prev, { role: "agent", text: `✅ Successfully assigned to ${studioName}!\n\nYour space package has been deployed. The Studio is now:\n• Running your automation rules\n• Serving your dashboard\n• Ready for Aqara Life to connect\n\nYou can check the Studio status anytime in the Studio tab.`, id: `msg-${Date.now()}`, timestamp: new Date().toISOString() } as unknown as AgentMessage]);
    }, 2500);
  }, [studioEnableDialog, project, updateProject]);

  const bomItems = useMemo(() => {
    if (!bxmlDoc) return [];
    const deviceObjects = bxmlDoc.objects.filter((o) => o.type === "device");
    const grouped = new Map<string, { key: string; name: string; qty: number }>();
    for (const dev of deviceObjects) {
      const model = dev.properties.find((p) => p.key === "model")?.value;
      const sku = dev.properties.find((p) => p.key === "sku")?.value;
      const key = String(sku || model || dev.name || "Unknown");
      const item = grouped.get(key);
      if (item) {
        item.qty += 1;
      } else {
        grouped.set(key, { key, name: String(dev.name || model || sku || "Device"), qty: 1 });
      }
    }
    return Array.from(grouped.values()).sort((a, b) => b.qty - a.qty);
  }, [bxmlDoc]);

  const handleExportBxml = useCallback(() => {
    if (!bxmlDoc) return;
    const payload = JSON.stringify(bxmlDoc, null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]+/g, "-").toLowerCase() || "space-package";
    a.href = url;
    a.download = `${safeName}.bxml.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bxmlDoc, projectName]);

  const handlePreviewLife = useCallback(() => {
    setLifePreviewOpen(true);
  }, []);

  const rolePluginConfigs = project?.rolePluginConfigs ?? [];
  const updateRolePlugins = useCallback((next: RolePluginConfig[]) => {
    if (!project?.id) return;
    updateProject(project.id, {
      rolePluginConfigs: next,
      updatedAt: new Date().toISOString(),
    });
  }, [project?.id, updateProject]);

  if (isPageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111118]">
        <div className="mb-4 flex items-center gap-2 text-zinc-300">
          <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-500" />
        </div>
      </div>
    );
  }

  const isDesignMode = isCustomizing;
  const leftW = leftCollapsed ? 0 : 360;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#111118]">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-700/30 px-2 h-12 shrink-0 bg-[#16161e]/95">
        <div className="flex items-center gap-1 min-w-0">
          <button type="button" onClick={() => setLeftCollapsed(!leftCollapsed)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors">
            {leftCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setHistorySidebarOpen(!historySidebarOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors" title="Chat history">
            <Clock className="h-4 w-4" />
          </button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors" title="New chat">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-zinc-700/30 mx-1" />
          <div className="relative">
            <button type="button" onClick={() => setProjectMenuOpen(!projectMenuOpen)} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700/30 transition-colors truncate max-w-[200px]">{projectName}<ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" /></button>
            {projectMenuOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-xl border border-zinc-700/50 bg-[#1a1a24] py-1 shadow-2xl">
                <button type="button" onClick={() => { setProjectMenuOpen(false); router.push("/home"); }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><ArrowLeft className="h-3.5 w-3.5" /> Home</button>
                <div className="my-1 border-t border-zinc-700/20" />
                <button type="button" className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><Copy className="h-3.5 w-3.5 text-zinc-500" /> Remix</button>
                <button type="button" className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><Edit3 className="h-3.5 w-3.5 text-zinc-500" /> Rename</button>
                <button type="button" className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><Star className="h-3.5 w-3.5 text-zinc-500" /> Star</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2 py-1 mr-2 ${studioExpired ? "border-red-500/30 bg-red-500/5" : "border-zinc-700/30 bg-zinc-800/20"}`}>
            <span className={`h-2 w-2 rounded-full ${studioExpired ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
            <span className="text-[10px] text-zinc-400 font-mono">{cloudStudioId}</span>
            {studioExpired ? (
              <button type="button" onClick={reallocateStudio} className="ml-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold text-white hover:bg-indigo-500 transition-colors">Re-try</button>
            ) : (
              <span className="text-[9px] text-zinc-600">{studioExpiresIn}</span>
            )}
          </div>
          <div className={`flex items-center rounded-lg border border-zinc-700/40 bg-zinc-800/30 p-0.5 ${isCustomizing ? "opacity-40 pointer-events-none" : ""}`}>
            <button type="button" onClick={() => { if (canvasView === "studio") setCanvasView("space"); }} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-all ${canvasView !== "studio" ? "bg-zinc-100 text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
              <Eye className="h-3 w-3 inline mr-1" />Preview
            </button>
            <button type="button" onClick={() => setCanvasView("studio")} className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-all ${canvasView === "studio" ? "bg-zinc-100 text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
              <Cpu className="h-3 w-3 inline mr-1" />Studio
            </button>
          </div>
          {isCustomizing && (
            <>
              <div className="h-5 w-px bg-zinc-700/30 mx-0.5" />
              <div className="flex items-center gap-1.5 rounded-lg bg-indigo-500/8 border border-indigo-500/20 px-2.5 py-1">
                <PenTool className="h-3 w-3 text-indigo-400" />
                <span className="text-[11px] font-medium text-indigo-300">Visual Edit</span>
              </div>
              <button type="button" onClick={exitCustomize} className="ml-1 flex items-center gap-1 rounded-lg border border-zinc-700/40 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
                <ChevronLeft className="h-3 w-3" /> Exit
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-1">
            {(["describe", "generate", "refine", "deploy"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${agentStep === s ? "bg-blue-400 ring-2 ring-blue-400/30" : (["describe","generate","refine","deploy"].indexOf(agentStep) > i ? "bg-emerald-500" : "bg-zinc-700")}`} />
                {i < 3 && <div className={`w-4 h-px ${["describe","generate","refine","deploy"].indexOf(agentStep) > i ? "bg-emerald-500/50" : "bg-zinc-700/50"}`} />}
              </div>
            ))}
          </div>
          {bxmlDoc && (
            <button type="button" onClick={() => setBxmlPanelOpen(!bxmlPanelOpen)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${bxmlPanelOpen ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"}`}>
              <LayoutGrid className="h-3.5 w-3.5" /> BXML
            </button>
          )}
          {hasGenerated && <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 mr-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Saved</span>}
          <button type="button" onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"><Share2 className="h-3.5 w-3.5" /> Share</button>
          <button type="button" onClick={() => setPublishOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors"><Globe className="h-3 w-3" /> Publish</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!leftCollapsed && (
          <div className="flex shrink-0" style={{ width: `${leftW + (historySidebarOpen ? 200 : 0)}px` }}>
            {historySidebarOpen && (
              <div className="w-[220px] shrink-0 border-r border-zinc-700/30 bg-[#111118] flex flex-col">
                <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-700/25">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Versions</span>
                  <button type="button" onClick={() => setHistorySidebarOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex-1 overflow-auto px-2 py-2 space-y-1">
                  {versionStore.revisions.length === 0 ? (
                    <p className="px-2 py-6 text-xs text-zinc-600 text-center">No versions yet.<br/>Start a conversation to generate BXML.</p>
                  ) : (
                    [...versionStore.revisions].reverse().map((rev) => {
                      const isCurrent = rev.revision === versionStore.currentRevision;
                      const time = new Date(rev.timestamp);
                      const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
                      const stats = getBXMLStats(rev.snapshot);
                      return (
                        <div key={rev.revision} className={`rounded-lg px-2.5 py-2 transition-all ${isCurrent ? "bg-indigo-500/8 border border-indigo-500/20" : "border border-transparent hover:bg-zinc-800/30"}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-semibold ${isCurrent ? "text-indigo-300" : "text-zinc-300"}`}>v{rev.revision}</span>
                            <span className="text-[10px] text-zinc-600">{timeStr}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{rev.label}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-600">
                            <span>{stats.spaces}sp</span><span>{stats.devices}dev</span><span>{stats.automations}auto</span><span>{stats.scenes}sc</span>
                          </div>
                          {rev.delta && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                              {rev.delta.spacesAdded > 0 && <span className="text-emerald-400">+{rev.delta.spacesAdded}sp</span>}
                              {rev.delta.devicesAdded > 0 && <span className="text-blue-400">+{rev.delta.devicesAdded}dev</span>}
                              {rev.delta.automationsAdded > 0 && <span className="text-amber-400">+{rev.delta.automationsAdded}auto</span>}
                              {rev.delta.scenesAdded > 0 && <span className="text-purple-400">+{rev.delta.scenesAdded}sc</span>}
                            </div>
                          )}
                          {!isCurrent && (
                            <button type="button" onClick={() => handleRevert(rev.revision)}
                              className="mt-1.5 w-full rounded-md border border-zinc-700/40 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors">
                              Revert to v{rev.revision}
                            </button>
                          )}
                          {isCurrent && <span className="inline-block mt-1 text-[10px] text-indigo-400 font-medium">← Current</span>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col border-r border-zinc-700/30 bg-[#14141c] min-w-0">
            {!isCustomizing ? (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {messages.length === 0 && !isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/8 flex items-center justify-center mb-3"><Sparkles className="h-6 w-6 text-indigo-400/60" /></div>
                      <p className="text-sm text-zinc-300 font-medium">Turn your idea into a playable space</p>
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xs">Describe your space requirements and AI will generate a complete solution.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {["3-Bedroom Whole Home", "Smart Hotel Room", "Office Energy Saving"].map((tip) => (<button key={tip} type="button" onClick={() => setChatInput(tip)} className="rounded-full border border-zinc-700/40 bg-zinc-800/20 px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors">{tip}</button>))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600/12 border border-indigo-500/20 text-zinc-100" : "bg-zinc-700/15 border border-zinc-700/25 text-zinc-300"}`}>
                        {msg.skillsUsed && msg.skillsUsed.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            {msg.skillsUsed.map((s) => (<span key={s} className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-medium text-indigo-300">{s}</span>))}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.revision && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-zinc-600">
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5">v{msg.revision}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGenerating && genSteps.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-indigo-400" /></div>
                        <span className="text-xs font-medium text-zinc-400">Building your space…</span>
                      </div>
                      {genSteps.map((step) => (
                        <div key={step.id} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-300 ${step.status === "done" ? "text-zinc-300" : step.status === "running" ? "text-zinc-200 bg-zinc-800/20" : "text-zinc-600"}`}>
                          {step.status === "done" && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                          {step.status === "running" && <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />}
                          {step.status === "pending" && <CircleDot className="h-3.5 w-3.5 text-zinc-700 shrink-0" />}
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {studioAssigning && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-zinc-700/15 border border-zinc-700/25 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-indigo-400">
                          <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                          <span>Connecting to Studio…</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-zinc-700/15 border border-zinc-700/25 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t border-zinc-700/25 p-3 shrink-0">
                  {chatCreditWarning && (<div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 flex items-center gap-2 mb-2"><Coins className="h-3.5 w-3.5 shrink-0" />Insufficient credits<a href="/plans" className="ml-auto text-amber-300 underline underline-offset-2">Top up</a></div>)}
                  <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 focus-within:border-indigo-500/40 transition-colors">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} placeholder={isGenerating ? "Generating…" : "Tell Aqara what to do instead..."} disabled={isGenerating} className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none disabled:opacity-40" />
                    <div className="flex items-center justify-between px-2 pb-2">
                      <div className="flex items-center gap-1">
                        {!isGenerating && (
                          <>
                            <div className="relative">
                              <button type="button" onClick={() => setPlusMenuOpen(!plusMenuOpen)} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30 transition-colors"><Plus className="h-4 w-4" /></button>
                              {plusMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-xl border border-zinc-700/50 bg-[#1a1a24] py-1 shadow-2xl">
                                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handlePickImages(e.target.files); setPlusMenuOpen(false); }} />
                                  <button type="button" onClick={() => { imageInputRef.current?.click(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><ImagePlus className="h-3.5 w-3.5 text-zinc-500" /> Upload image{attachedImageNames.length > 0 && <span className="ml-auto rounded-full bg-indigo-500/20 text-indigo-400 px-1.5 text-[10px]">{attachedImageNames.length}</span>}</button>
                                  <button type="button" onClick={() => { setChatInput("Add more devices to my project!"); setPlusMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><Cpu className="h-3.5 w-3.5 text-zinc-500" /> Add devices</button>
                                  <button type="button" onClick={() => { setChatInput("Add a new automation rule"); setPlusMenuOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/30"><Zap className="h-3.5 w-3.5 text-zinc-500" /> Add automation</button>
                                </div>
                              )}
                            </div>
                            <button type="button" onClick={enterCustomize} className="flex items-center gap-1.5 rounded-lg border border-zinc-700/30 bg-zinc-800/30 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"><PenTool className="h-3 w-3" /> Visual edits</button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isGenerating && (
                          <button type="button" onClick={() => { if (chatInput.trim()) { setChatInput(chatInput + " (optimize for energy saving)"); } }} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-zinc-700/30 transition-colors" title="AI enhance prompt"><Sparkles className="h-3.5 w-3.5" /></button>
                        )}
                        <button type="button" onClick={handleSend} disabled={!chatInput.trim() || isGenerating} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"><Send className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700/25 shrink-0">
                  <PenTool className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-zinc-200 flex-1">Customize</h3>
                </div>
                <DesignPanel canvasView={canvasView} selectedId={selectedElementId} />
                <div className="border-t border-zinc-700/25 p-3 shrink-0 space-y-2">
                  <button type="button" onClick={() => { exitCustomize(); setChatInput("Add more devices to my project!"); }} className="w-full flex items-center gap-2 rounded-lg border border-zinc-700/30 bg-zinc-800/15 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors">
                    <MessageSquare className="h-3 w-3" /> Ask AI to make changes
                  </button>
                  <button type="button" onClick={exitCustomize} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/8 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                    <ChevronLeft className="h-3 w-3" /> Exit Customize
                  </button>
                </div>
              </>
            )}
          </div>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {canvasView !== "studio" && !isGenerating && !isCustomizing && (
            <div className="flex items-center gap-1 px-4 h-9 shrink-0 border-b border-zinc-700/20 bg-[#16161e]/40">
              {PREVIEW_TABS.map((t) => (
                <button key={t.id} type="button" onClick={() => { setCanvasView(t.id); setSelectedElementId(null); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${canvasView === t.id ? "bg-zinc-700/40 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/20"}`}>
                  <t.icon className="h-3 w-3" /> {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "radial-gradient(ellipse at 50% 40%, #1a1a2e 0%, #111118 70%)" }}>
                <div className="relative mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/8 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-indigo-400/80" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-emerald-500/80 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{genSteps.filter((s) => s.status === "done").length}</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">Your Project is Coming Together</h2>
                <p className="text-sm text-zinc-500 mb-6">We&apos;re generating your project now.<br />This will just take a few moments.</p>
                <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: `${Math.max(5, (genSteps.filter((s) => s.status === "done").length / genSteps.length) * 100)}%` }} />
                </div>
                <p className="mt-3 text-[11px] text-zinc-600">{genSteps.find((s) => s.status === "running")?.label ?? "Preparing…"}</p>
              </div>
            ) : canvasView === "studio" ? (
              <StudioCanvas selectedStudioId={selectedStudioId} projectId={projectId} projectName={projectName} cloudStudioId={cloudStudioId} studioOptions={studioOptions} hasGenerated={hasGenerated} studioExpired={studioExpired} studioExpiresIn={studioExpiresIn} onLinkStudio={(id) => { setSelectedStudioId(id); if (project?.id) updateProject(project.id, { selectedStudioId: id, studioLinked: true, deployedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }} onSelectStudio={handleStudioSelect} onReallocate={reallocateStudio} bxmlDoc={bxmlDoc} />
            ) : (
              <>
                {studioExpired && (
                  <div className="mx-4 mt-2 mb-0 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-amber-300">Cloud Studio expired</p>
                        <p className="text-[11px] text-zinc-500">Your configuration is preserved. Allocate a new Studio to continue editing.</p>
                      </div>
                    </div>
                    <button type="button" onClick={reallocateStudio} className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                      Allocate New
                    </button>
                  </div>
                )}
                {canvasView === "space" && <SpaceCanvas isDesignMode={isDesignMode} selectedId={selectedElementId} onSelect={setSelectedElementId} bxmlDoc={bxmlDoc} />}
                {canvasView === "automation" && <AutomationCanvas isDesignMode={isDesignMode} selectedId={selectedElementId} onSelect={setSelectedElementId} bxmlDoc={bxmlDoc} />}
                {canvasView === "app" && (
                  <AppCanvas
                    isDesignMode={isDesignMode}
                    selectedId={selectedElementId}
                    onSelect={setSelectedElementId}
                    bxmlDoc={bxmlDoc}
                    rolePluginCount={rolePluginConfigs.length}
                    onGeneratePlugin={() => setRolePluginBuilderOpen(true)}
                    onOpenBom={() => setBomDialogOpen(true)}
                    onPreviewLifeApp={handlePreviewLife}
                    onExportBxml={handleExportBxml}
                    rolePluginConfigs={rolePluginConfigs}
                    bomItems={bomItems}
                    onAddRole={() => setRolePluginBuilderOpen(true)}
                    onEditRole={() => setRolePluginBuilderOpen(true)}
                    onDeleteRole={(id) => {
                      const next = rolePluginConfigs.filter((c) => c.id !== id);
                      updateRolePlugins(next);
                    }}
                    onGenerateQr={(cfg) => {
                      // future: open QR modal for specific role
                      setRolePluginBuilderOpen(true);
                    }}
                  />
                )}
              </>
            )}

            {hasUnsavedChanges && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-zinc-700/60 bg-zinc-900/95 backdrop-blur-md pl-4 pr-2 py-2 shadow-2xl">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Unsaved changes</span>
                </div>
                <button type="button" onClick={handleDiscardChanges} className="rounded-full border border-zinc-600 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">Discard</button>
                <button type="button" onClick={handleSaveToStudio} className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors">Save</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Studio Enable Dialog */}
      {studioEnableDialog && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setStudioEnableDialog(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-indigo-400" /><h3 className="text-sm font-semibold text-zinc-100">Enable Studio</h3></div>
              <button type="button" onClick={() => setStudioEnableDialog(null)} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
            </div>
            <p className="px-5 pb-3 text-xs text-zinc-500">Deploy your space package to a Studio runtime.</p>
            <div className="px-5 pb-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5"><Upload className="h-4 w-4 text-indigo-400" /></div>
                <div><p className="text-sm font-medium text-zinc-200">Push space package</p><p className="text-xs text-zinc-500">Schema, automations, dashboard, and app blueprint will be deployed to the Studio.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5"><Zap className="h-4 w-4 text-emerald-400" /></div>
                <div><p className="text-sm font-medium text-zinc-200">Enable capabilities</p><p className="text-xs text-zinc-500">Required capabilities will be checked and enabled on the Studio.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5"><Settings className="h-4 w-4 text-amber-400" /></div>
                <div><p className="text-sm font-medium text-zinc-200">{studioEnableDialog.studioName}</p><p className="text-xs text-zinc-500">Your data will be stored on this Studio. This cannot be changed later.</p></div>
              </div>
            </div>
            <div className="border-t border-zinc-800/60 px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">Always allow ▾</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setStudioEnableDialog(null)} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800">Skip</button>
                <button type="button" onClick={handleStudioConfirm} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Allow</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} projectName={projectName} />

      {bxmlPanelOpen && bxmlDoc && (
        <BxmlSidebar bxmlDoc={bxmlDoc} onClose={() => setBxmlPanelOpen(false)} />
      )}

      {deployDialogOpen && (
        <DeployDialog
          onClose={() => setDeployDialogOpen(false)}
          projectId={projectId}
          projectName={projectName}
          studioOptions={studioOptions}
          selectedStudioId={selectedStudioId}
          onDeployToStudio={(studioId, studioName) => {
            setDeployDialogOpen(false);
            handleStudioSelect(studioId, studioName);
          }}
          onPluginBuilt={() => {
            setDeployDialogOpen(false);
            setAgentStep("deploy");
            if (project?.id) updateProject(project.id, { agentStep: "deploy", updatedAt: new Date().toISOString() });
            setMessages((prev) => [...prev, { role: "agent", text: "📱 Plugin built and distributed!\n\nYour BXML package has gone through:\n✅ Cloud Sandbox Verification\n✅ Security Scan\n✅ Plugin Build\n✅ CDN Distribution\n\nA QR code is now available. Users can scan it with Aqara Life App to download the plugin. The app runtime will load and run it automatically.", id: `msg-${Date.now()}`, timestamp: new Date().toISOString() } as unknown as AgentMessage]);
          }}
        />
      )}

      {rolePluginBuilderOpen && (
        <RolePluginBuilderModal
          projectName={projectName}
          studioOptions={studioOptions}
          selectedStudioId={selectedStudioId}
          rolePluginConfigs={rolePluginConfigs}
          onClose={() => setRolePluginBuilderOpen(false)}
          onChange={updateRolePlugins}
          onOpenDeployPipeline={() => {
            setRolePluginBuilderOpen(false);
            setDeployDialogOpen(true);
          }}
        />
      )}

      {lifePreviewOpen && (
        <LifeAppPreviewModal
          projectId={projectId}
          projectName={projectName}
          hasRolePlugins={rolePluginConfigs.length > 0}
          onClose={() => setLifePreviewOpen(false)}
        />
      )}

      {bomDialogOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setBomDialogOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/70">
              <div>
                <p className="text-sm font-semibold text-zinc-100">BOM 清单</p>
                <p className="text-xs text-zinc-500 mt-1">{projectName} · {bomItems.length} 个设备类型</p>
              </div>
              <button type="button" onClick={() => setBomDialogOpen(false)} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-4 space-y-2">
              {bomItems.length === 0 ? (
                <p className="text-sm text-zinc-500">当前方案暂无设备，可先通过 AI 生成空间与设备。</p>
              ) : bomItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[11px] text-zinc-600 truncate">{item.key}</p>
                  </div>
                  <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300">x{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RolePluginBuilderModal({
  projectName,
  studioOptions,
  selectedStudioId,
  rolePluginConfigs,
  onChange,
  onClose,
  onOpenDeployPipeline,
}: {
  projectName: string;
  studioOptions: { id: string; name: string; model?: string }[];
  selectedStudioId: string | null;
  rolePluginConfigs: RolePluginConfig[];
  onChange: (next: RolePluginConfig[]) => void;
  onClose: () => void;
  onOpenDeployPipeline: () => void;
}) {
  const addRole = () => {
    const next: RolePluginConfig = {
      id: `role-${Date.now()}`,
      roleName: "Owner",
      theme: "Home Default",
      status: "draft",
      ttlHours: 48,
      studioId: selectedStudioId ?? studioOptions[0]?.id ?? null,
    };
    onChange([...rolePluginConfigs, next]);
  };

  const patchRole = (id: string, patch: Partial<RolePluginConfig>) => {
    onChange(rolePluginConfigs.map((cfg) => (cfg.id === id ? { ...cfg, ...patch } : cfg)));
  };

  const removeRole = (id: string) => {
    onChange(rolePluginConfigs.filter((cfg) => cfg.id !== id));
  };

  const publishedCount = rolePluginConfigs.filter((r) => r.status === "published").length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-700/60 bg-zinc-950 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">角色插件构建 · {projectName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Pipeline: 角色配置 → 绑定 Studio → 构建/发布插件 → QR 分发</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-5 pt-4">
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              { name: "1. 角色配置", active: true },
              { name: "2. 选择 Studio", active: rolePluginConfigs.length > 0 },
              { name: "3. 插件构建发布", active: publishedCount > 0 },
            ].map((s) => (
              <div key={s.name} className={`rounded-lg border px-2.5 py-2 text-center ${s.active ? "border-indigo-500/30 bg-indigo-500/8 text-indigo-300" : "border-zinc-800 bg-zinc-900/50 text-zinc-600"}`}>
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-auto">
          {rolePluginConfigs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/35 p-8 text-center">
              <p className="text-sm text-zinc-300">尚未创建角色插件配置</p>
              <p className="mt-1 text-xs text-zinc-600">先添加 Owner / Guest 等角色，再生成 QR。</p>
            </div>
          ) : (
            rolePluginConfigs.map((cfg) => (
              <div key={cfg.id} className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-1">角色</p>
                    <select
                      value={cfg.roleName}
                      onChange={(e) => patchRole(cfg.id, { roleName: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700/50 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200"
                    >
                      <option>Owner</option>
                      <option>Guest</option>
                      <option>Admin</option>
                      <option>Family</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-1">UI 主题</p>
                    <input
                      value={cfg.theme}
                      onChange={(e) => patchRole(cfg.id, { theme: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700/50 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 mb-1">目标 Studio</p>
                    <select
                      value={cfg.studioId ?? ""}
                      onChange={(e) => patchRole(cfg.id, { studioId: e.target.value || null })}
                      className="w-full rounded-lg border border-zinc-700/50 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200"
                    >
                      <option value="">未指定</option>
                      {studioOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => patchRole(cfg.id, { status: "published" })}
                      className="flex-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      生成 QR
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRole(cfg.id)}
                      className="rounded-lg border border-zinc-700/60 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={`${cfg.status === "published" ? "text-emerald-400" : "text-zinc-500"}`}>
                    {cfg.status === "published" ? "已发布" : "草稿"}
                  </span>
                  <span className="text-zinc-600">有效期 {cfg.ttlHours ?? 48} 小时</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between">
          <button type="button" onClick={addRole} className="rounded-lg border border-zinc-700/60 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/50">
            + 新增角色配置
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onOpenDeployPipeline} className="rounded-lg border border-zinc-700/60 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/50">
              打开部署 Pipeline
            </button>
            <button type="button" onClick={onClose} className="rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white">
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LifeAppPreviewModal({
  projectId,
  projectName,
  hasRolePlugins,
  onClose,
}: {
  projectId: string;
  projectName: string;
  hasRolePlugins: boolean;
  onClose: () => void;
}) {
  const previewUrl = getLifeAppPreviewUrl(projectId);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-700/60 bg-zinc-950 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Life App 预览 · {projectName}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">弹窗预览（角色插件驱动）</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 flex items-center justify-center bg-[#101118]">
          <div className="w-[320px] h-[640px] rounded-[2.5rem] border-[3px] border-zinc-700/50 bg-black p-2">
            <div className="w-full h-full rounded-[2.1rem] overflow-hidden bg-zinc-900">
              {hasRolePlugins ? (
                <iframe title="life-app-preview" src={previewUrl} className="h-full w-full border-0" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
                  <p className="text-sm font-medium text-zinc-300">暂无可预览页面</p>
                  <p className="mt-2 text-xs text-zinc-600">请先在“角色插件构建”里生成至少一个角色插件。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-40 flex items-center justify-center bg-[#111118]"><p className="text-sm text-zinc-500">Loading project...</p></div>}>
      <ProjectEditorContent />
    </Suspense>
  );
}
