"use client";

import React, { useState } from "react";
import {
  Globe, Zap, Smartphone, Check, ChevronRight, Eye, Cpu, Download, Radio,
  Box, Shield, Lock, QrCode,
} from "lucide-react";
import { getLifeAppPreviewUrl, getLifeAppQrImageUrl } from "@/lib/life-app-links";
import type { BXMLDocument } from "@/lib/bxml";

type PluginBuildStage = { id: string; label: string; desc: string; status: "pending" | "running" | "done" };

const PLUGIN_PIPELINE: { id: string; label: string; desc: string; icon: React.ElementType; delay: number }[] = [
  { id: "sandbox", label: "Cloud Sandbox Verification", desc: "Running BXML in isolated sandbox", icon: Shield, delay: 1200 },
  { id: "security", label: "Security Scan", desc: "Checking vulnerabilities & policy compliance", icon: Lock, delay: 1000 },
  { id: "build", label: "Plugin Package Build", desc: "Compiling DSL into installable bundle", icon: Box, delay: 1500 },
  { id: "cdn", label: "CDN Distribution", desc: "Deploying to global CDN edge nodes", icon: Globe, delay: 800 },
  { id: "qr", label: "QR Code Generation", desc: "Generating scannable QR for Aqara Life", icon: QrCode, delay: 500 },
];

export function DeployTabContent({
  projectId, projectName, cloudStudioId, studioOptions, hasGenerated, onPushToM300, bxmlDoc,
}: {
  projectId: string; projectName: string; cloudStudioId: string;
  studioOptions: { id: string; name: string; model?: string }[];
  hasGenerated: boolean;
  onPushToM300: (studioId: string, studioName: string) => void;
  bxmlDoc: BXMLDocument | null;
}) {
  const [deployingOnline, setDeployingOnline] = useState(false);
  const [onlineStudioResult, setOnlineStudioResult] = useState<{
    onlineStudioId: string; status: string; deviceCount: number;
    topology: { spaceId: string; spaceName: string; deviceCount: number }[];
    expiresAt: string;
  } | null>(null);

  const [syncingAiot, setSyncingAiot] = useState(false);
  const [aiotSyncResult, setAiotSyncResult] = useState<{
    summary: { total: number; mappedCount: number; unmappedCount: number; conflictedCount: number; coveragePercent: number };
    mapped: { virtualDeviceId: string; virtualName: string; binding: { bindingStatus: string; realDeviceId?: string; realModel?: string } }[];
    unmapped: { virtualDeviceId: string; virtualName: string; virtualModel: string; binding: { missingReason?: string; purchaseSku?: string } }[];
    conflicted: { virtualDeviceId: string; virtualName: string; virtualModel: string; binding: { conflictCandidates?: string[] } }[];
    syncedAt: string;
  } | null>(null);
  const [syncedBxml, setSyncedBxml] = useState<BXMLDocument | null>(null);

  const [buildStages, setBuildStages] = useState<PluginBuildStage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [builtPluginUrl, setBuiltPluginUrl] = useState<string | null>(null);
  const [builtQrUrl, setBuiltQrUrl] = useState<string | null>(null);

  const [pushingTo, setPushingTo] = useState<string | null>(null);
  const [pushedStudios, setPushedStudios] = useState<Set<string>>(new Set());

  const deployToOnlineStudio = async () => {
    if (!bxmlDoc) return;
    setDeployingOnline(true);
    try {
      const res = await fetch("/api/online-studio/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, bxml: bxmlDoc, projectName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOnlineStudioResult(data);
    } catch (e) {
      console.error("Deploy failed", e);
    } finally {
      setDeployingOnline(false);
    }
  };

  const syncFromAiot = async () => {
    if (!bxmlDoc) return;
    setSyncingAiot(true);
    try {
      const res = await fetch("/api/aiot/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, bxml: bxmlDoc, onlineStudioId: onlineStudioResult?.onlineStudioId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAiotSyncResult(data.syncResult);
      setSyncedBxml(data.updatedBxml);
    } catch (e) {
      console.error("AIOT sync failed", e);
    } finally {
      setSyncingAiot(false);
    }
  };

  const buildPlugin = async () => {
    const sourceBxml = syncedBxml ?? bxmlDoc;
    if (!sourceBxml) return;
    setIsBuilding(true);
    setBuildStages(PLUGIN_PIPELINE.map((s) => ({ id: s.id, label: s.label, desc: s.desc, status: "pending" })));

    let totalDelay = 200;
    PLUGIN_PIPELINE.forEach((stage, i) => {
      setTimeout(() => {
        setBuildStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, status: "running" } : s));
      }, totalDelay);
      totalDelay += stage.delay;
      setTimeout(() => {
        setBuildStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, status: "done" } : s));
      }, totalDelay);
    });

    try {
      const res = await fetch("/api/plugin/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectName, bxml: sourceBxml }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTimeout(() => {
        setIsBuilding(false);
        setBuildComplete(true);
        setBuiltPluginUrl(data.pluginUrl);
        setBuiltQrUrl(data.qrUrl);
      }, totalDelay + 300);
    } catch (e) {
      console.error("Plugin build failed", e);
      setIsBuilding(false);
    }
  };

  const handlePushToM300 = (studioId: string, studioName: string) => {
    setPushingTo(studioId);
    setTimeout(() => {
      setPushingTo(null);
      setPushedStudios((prev) => new Set(prev).add(studioId));
      onPushToM300(studioId, studioName);
    }, 2500);
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Step 1: Deploy to Online Studio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" /> Step 1 · Deploy to Cloud Studio
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">将 BXML 部署到云端 Online Studio，作为运行底座</p>
          </div>
          {!onlineStudioResult ? (
            <button type="button" onClick={deployToOnlineStudio} disabled={!hasGenerated || deployingOnline}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {deployingOnline ? (<><div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> 部署中…</>) : "Deploy →"}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"><Check className="h-4 w-4" /> 已部署</span>
          )}
        </div>
        {!hasGenerated && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <p className="text-xs text-amber-400">请先通过 AI 对话生成 BXML 方案，再进行部署。</p>
          </div>
        )}
        {onlineStudioResult && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-indigo-300">{onlineStudioResult.onlineStudioId}</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Running</span>
              </div>
              <span className="text-[10px] text-zinc-500">
                到期: {new Date(onlineStudioResult.expiresAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "空间", value: onlineStudioResult.topology.length },
                { label: "设备", value: onlineStudioResult.deviceCount },
                { label: "状态", value: "Running" },
              ].map((s) => (
                <div key={s.label} className="bg-indigo-900/20 rounded-lg px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-indigo-200">{s.value}</p>
                  <p className="text-[10px] text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {onlineStudioResult.topology.slice(0, 4).map((t) => (
                <div key={t.spaceId} className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>{t.spaceName}</span><span className="text-zinc-600">{t.deviceCount} 设备</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Sync from AIOT */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" /> Step 2 · Sync from AIOT
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">从 AIOT 平台拉取真实设备，与虚拟设备完成映射绑定</p>
          </div>
          {!aiotSyncResult ? (
            <button type="button" onClick={syncFromAiot} disabled={!hasGenerated || syncingAiot}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {syncingAiot ? (<><div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> 同步中…</>) : "Sync AIOT →"}
            </button>
          ) : (
            <button type="button" onClick={syncFromAiot} className="rounded-lg border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">重新同步</button>
          )}
        </div>
        {aiotSyncResult && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "总设备", value: aiotSyncResult.summary.total, color: "text-zinc-200" },
                { label: "已绑定", value: aiotSyncResult.summary.mappedCount, color: "text-emerald-400" },
                { label: "未绑定", value: aiotSyncResult.summary.unmappedCount, color: "text-zinc-400" },
                { label: "冲突", value: aiotSyncResult.summary.conflictedCount, color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900/40 rounded-lg px-2 py-2 text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-zinc-600">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-500">设备覆盖率</span>
                <span className="font-semibold text-emerald-400">{aiotSyncResult.summary.coveragePercent}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${aiotSyncResult.summary.coveragePercent}%` }} />
              </div>
            </div>
            {aiotSyncResult.mapped.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">✓ 已绑定</p>
                <div className="space-y-1">
                  {aiotSyncResult.mapped.slice(0, 5).map((m) => (
                    <div key={m.virtualDeviceId} className="flex items-center justify-between text-xs px-1">
                      <span className="text-zinc-300">{m.virtualName}</span>
                      <span className="text-zinc-500 font-mono text-[10px]">{m.binding.realModel ?? m.binding.realDeviceId}</span>
                    </div>
                  ))}
                  {aiotSyncResult.mapped.length > 5 && <p className="text-[10px] text-zinc-600 px-1">+ {aiotSyncResult.mapped.length - 5} 更多</p>}
                </div>
              </div>
            )}
            {aiotSyncResult.unmapped.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">⚠ 未绑定 (可去购买)</p>
                <div className="space-y-1">
                  {aiotSyncResult.unmapped.slice(0, 4).map((m) => (
                    <div key={m.virtualDeviceId} className="flex items-center justify-between text-xs px-1">
                      <span className="text-zinc-500">{m.virtualName}</span>
                      <span className="text-zinc-600 text-[10px]">{m.binding.missingReason ?? "未找到匹配设备"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Build Plugin Package */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-400" /> Step 3 · Build Plugin Package
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">编译 BXML → 插件包 → CDN → QR 分发</p>
          </div>
          {!isBuilding && !buildComplete && (
            <button type="button" onClick={buildPlugin} disabled={!hasGenerated}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Build Plugin
            </button>
          )}
          {buildComplete && <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"><Check className="h-4 w-4" /> 已分发</span>}
        </div>
        <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 overflow-hidden">
          {!isBuilding && !buildComplete && buildStages.length === 0 ? (
            <div className="divide-y divide-zinc-700/15">
              {PLUGIN_PIPELINE.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-7 w-7 rounded-md bg-zinc-800/60 flex items-center justify-center shrink-0"><stage.icon className="h-3.5 w-3.5 text-zinc-500" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs text-zinc-300">{stage.label}</p><p className="text-[10px] text-zinc-600">{stage.desc}</p></div>
                  <span className="text-[10px] text-zinc-700 shrink-0">{i + 1}</span>
                </div>
              ))}
              {!hasGenerated && <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/10"><p className="text-xs text-amber-400/70">Generate BXML first to enable building.</p></div>}
            </div>
          ) : (
            <div className="divide-y divide-zinc-700/15">
              {buildStages.map((stage) => {
                const Icon = PLUGIN_PIPELINE.find((p) => p.id === stage.id)?.icon ?? Box;
                return (
                  <div key={stage.id} className={`flex items-center gap-3 px-4 py-2.5 transition-all ${stage.status === "running" ? "bg-blue-500/5" : ""} ${stage.status === "pending" ? "opacity-40" : ""}`}>
                    <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${stage.status === "done" ? "bg-emerald-500/10" : stage.status === "running" ? "bg-blue-500/10" : "bg-zinc-800/60"}`}>
                      {stage.status === "done" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> :
                       stage.status === "running" ? <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" /> :
                       <Icon className="h-3.5 w-3.5 text-zinc-600" />}
                    </div>
                    <div className="flex-1"><p className={`text-xs font-medium ${stage.status === "running" ? "text-blue-300" : stage.status === "done" ? "text-zinc-300" : "text-zinc-600"}`}>{stage.label}</p></div>
                    {stage.status === "done" && <span className="text-[10px] text-emerald-400">✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {buildComplete && builtQrUrl && (
          <div className="mt-4 rounded-xl border border-zinc-700/25 bg-zinc-800/10 p-4">
            <div className="grid grid-cols-[180px_1fr] gap-4">
              <div className="rounded-xl bg-white p-3">
                <img src={builtQrUrl} alt="Plugin QR Code" className="h-40 w-40 rounded-lg mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-100">Aqara Life App Plugin</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                  <span>📱 扫码</span><ChevronRight className="h-3 w-3" /><span>⬇️ 下载插件</span><ChevronRight className="h-3 w-3" /><span>▶️ 容器加载</span>
                </div>
                {aiotSyncResult && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{aiotSyncResult.summary.mappedCount} 设备可控</span>
                    {aiotSyncResult.summary.unmappedCount > 0 && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{aiotSyncResult.summary.unmappedCount} 缺失可购</span>
                    )}
                  </div>
                )}
                {builtPluginUrl && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 mt-2">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-0.5">Plugin URL</p>
                    <p className="text-[11px] text-zinc-400 font-mono break-all">{builtPluginUrl}</p>
                  </div>
                )}
                {builtPluginUrl && (
                  <a href={`${builtPluginUrl}${onlineStudioResult ? `?studio=${onlineStudioResult.onlineStudioId}` : ""}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">
                    <Eye className="h-3 w-3" /> 预览插件页面
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Push DSL to M300 */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
          <Radio className="h-4 w-4 text-blue-400" /> Step 4 · Push DSL to M300 <span className="text-xs text-zinc-600 font-normal">(可选)</span>
        </h3>
        <p className="text-xs text-zinc-500 mb-3">将 BXML 以 DSL 形式下发到物理 M300 终端（通过 OTA）。</p>
        {!hasGenerated ? (
          <p className="text-xs text-zinc-500 py-4">Generate BXML first to enable M300 deployment.</p>
        ) : studioOptions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
            <p className="text-sm text-zinc-500">No M300 Studios bound. Bind one in Settings first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {studioOptions.map((s) => {
              const pushed = pushedStudios.has(s.id);
              const pushing = pushingTo === s.id;
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-zinc-700/25 bg-zinc-800/10 px-4 py-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${pushed ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                    <Cpu className={`h-4 w-4 ${pushed ? "text-emerald-400" : "text-blue-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{s.name}</p>
                    <p className="text-[11px] text-zinc-500">{s.model ?? "M300"}</p>
                    {pushed && <p className="text-[10px] text-emerald-400 mt-0.5">✓ DSL synced</p>}
                  </div>
                  {pushing ? (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" /> Pushing...
                    </div>
                  ) : pushed ? (
                    <button type="button" onClick={() => handlePushToM300(s.id, s.name)} className="rounded-lg border border-zinc-700/40 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">Re-push</button>
                  ) : (
                    <button type="button" onClick={() => handlePushToM300(s.id, s.name)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors flex items-center gap-1.5">
                      <Download className="h-3 w-3" /> Push
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
