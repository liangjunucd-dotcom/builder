"use client";

import React, { useEffect, useState } from "react";
import { CloudUpload, Smartphone, Check, ChevronRight, Eye, QrCode, Package } from "lucide-react";
import type { BXMLDocument } from "@/lib/bxml";
import { getLifeAppPreviewUrl, getLifeAppQrImageUrl } from "@/lib/life-app-links";

export function DeployTabContent({
  projectId, projectName, cloudStudioId, studioOptions, selectedStudioId, onSelectStudio, hasGenerated, bxmlDoc,
}: {
  projectId: string; projectName: string; cloudStudioId: string;
  studioOptions: { id: string; name: string; model?: string }[];
  selectedStudioId: string | null;
  onSelectStudio?: (studioId: string, studioName: string) => void;
  hasGenerated: boolean;
  bxmlDoc: BXMLDocument | null;
}) {
  const [deployingOnline, setDeployingOnline] = useState(false);
  const [onlineStudioResult, setOnlineStudioResult] = useState<{
    onlineStudioId: string; status: string; deviceCount: number;
    topology: { spaceId: string; spaceName: string; deviceCount: number }[];
    expiresAt: string;
  } | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [builtPluginUrl, setBuiltPluginUrl] = useState<string | null>(null);
  const [builtQrUrl, setBuiltQrUrl] = useState<string | null>(null);
  const [targetStudioId, setTargetStudioId] = useState<string>(selectedStudioId ?? studioOptions[0]?.id ?? "");

  useEffect(() => {
    if (selectedStudioId) setTargetStudioId(selectedStudioId);
  }, [selectedStudioId]);

  const deployToOnlineStudio = async () => {
    if (!bxmlDoc) return;
    const picked = studioOptions.find((s) => s.id === targetStudioId);
    if (picked) onSelectStudio?.(picked.id, picked.name);
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

  const buildPlugin = async () => {
    if (!bxmlDoc) return;
    setIsBuilding(true);

    try {
      const res = await fetch("/api/plugin/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectName, bxml: bxmlDoc }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setIsBuilding(false);
      setBuildComplete(true);
      setBuiltPluginUrl(data.pluginUrl);
      setBuiltQrUrl(data.qrUrl);
    } catch (e) {
      console.error("Plugin build failed", e);
      setIsBuilding(false);
    }
  };

  const previewUrl = builtPluginUrl ?? getLifeAppPreviewUrl(projectId);
  const qrUrl = builtQrUrl ?? getLifeAppQrImageUrl(previewUrl, 180);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-sky-400" /> Deploy to Studio
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">与外部详情菜单一致的部署动作。</p>
          </div>
          {!onlineStudioResult ? (
            <button type="button" onClick={deployToOnlineStudio} disabled={!hasGenerated || deployingOnline}
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {deployingOnline ? (<><div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> 部署中…</>) : "Deploy to Studio"}
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
        {studioOptions.length > 0 && (
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {studioOptions.map((studio) => (
              <button
                key={studio.id}
                type="button"
                onClick={() => setTargetStudioId(studio.id)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  targetStudioId === studio.id
                    ? "border-sky-500/40 bg-sky-500/10"
                    : "border-zinc-700/40 bg-zinc-800/20 hover:border-zinc-600"
                }`}
              >
                <p className="text-xs font-medium text-zinc-200">{studio.name}</p>
                <p className="text-[10px] text-zinc-500">{studio.model ?? "Studio"}</p>
              </button>
            ))}
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-violet-400" /> Build App Plugin
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">不展示多步骤流水，保持与详情菜单一致。</p>
          </div>
            <button type="button" onClick={buildPlugin} disabled={!hasGenerated}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {buildComplete ? "Rebuild Plugin" : "Build App Plugin"}
            </button>
        </div>
        <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 px-4 py-3">
          {isBuilding ? (
            <p className="text-xs text-violet-300 flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
              正在构建插件与二维码...
            </p>
          ) : buildComplete ? (
            <p className="text-xs text-emerald-400 flex items-center gap-2"><Check className="h-3.5 w-3.5" /> 插件构建完成</p>
          ) : (
            <p className="text-xs text-zinc-500">点击 Build App Plugin 生成可扫码安装的 Life App 插件。</p>
          )}
          {!hasGenerated && <p className="text-xs text-amber-400/70 mt-2">Generate BXML first to enable building.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-400" /> View QR Code
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">仅在已构建后可查看二维码，和外部详情菜单一致。</p>
          </div>
        </div>
        {!buildComplete ? (
          <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 px-4 py-3">
            <p className="text-xs text-zinc-600">未构建插件，暂不可查看二维码。</p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 p-4">
            <div className="grid grid-cols-[180px_1fr] gap-4">
              <div className="rounded-xl bg-white p-3">
                <img src={qrUrl} alt="Plugin QR Code" className="h-40 w-40 rounded-lg mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-100">Aqara Life App Plugin</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                  <span>📱 扫码</span><ChevronRight className="h-3 w-3" /><span>⬇️ 下载插件</span><ChevronRight className="h-3 w-3" /><span>▶️ 容器加载</span>
                </div>
                {builtPluginUrl && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 mt-2">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-0.5">Plugin URL</p>
                    <p className="text-[11px] text-zinc-400 font-mono break-all">{builtPluginUrl}</p>
                  </div>
                )}
                <a
                  href={`${previewUrl}?studio=${onlineStudioResult?.onlineStudioId ?? cloudStudioId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                >
                  <Eye className="h-3 w-3" /> 预览插件页面
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
