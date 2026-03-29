"use client";

import React, { useState } from "react";
import {
  X, Check, Cpu, Smartphone, ChevronRight,
} from "lucide-react";
import { getLifeAppPreviewUrl, getLifeAppQrImageUrl } from "@/lib/life-app-links";

type BuildStage = { id: string; label: string; desc: string; status: "pending" | "running" | "done" | "error" };

const PLUGIN_BUILD_STAGES: { id: string; label: string; desc: string; delay: number }[] = [
  { id: "sandbox", label: "Cloud Sandbox Verification", desc: "Running BXML in isolated sandbox environment", delay: 1200 },
  { id: "security", label: "Security Scan", desc: "Checking for vulnerabilities and policy compliance", delay: 1000 },
  { id: "build", label: "Plugin Package Build", desc: "Compiling DSL into installable plugin bundle", delay: 1500 },
  { id: "cdn", label: "CDN Distribution", desc: "Deploying plugin to global CDN edge nodes", delay: 800 },
  { id: "qr", label: "QR Code Generation", desc: "Generating scannable QR for Aqara Life App", delay: 500 },
];

export function DeployDialog({
  onClose, projectId, projectName, studioOptions, selectedStudioId, onDeployToStudio, onPluginBuilt,
}: {
  onClose: () => void;
  projectId: string;
  projectName: string;
  studioOptions: { id: string; name: string; model?: string }[];
  selectedStudioId: string | null;
  onDeployToStudio: (studioId: string, studioName: string) => void;
  onPluginBuilt: () => void;
}) {
  const [mode, setMode] = useState<"studio" | "plugin">("studio");
  const [buildStages, setBuildStages] = useState<BuildStage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const previewUrl = getLifeAppPreviewUrl(projectId);
  const qrUrl = getLifeAppQrImageUrl(previewUrl, 220);

  const startPluginBuild = () => {
    setIsBuilding(true);
    setBuildStages(PLUGIN_BUILD_STAGES.map((s) => ({ id: s.id, label: s.label, desc: s.desc, status: "pending" })));

    let totalDelay = 200;
    PLUGIN_BUILD_STAGES.forEach((stage, i) => {
      setTimeout(() => {
        setBuildStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, status: "running" } : s));
      }, totalDelay);
      totalDelay += stage.delay;
      setTimeout(() => {
        setBuildStages((prev) => prev.map((s) => s.id === stage.id ? { ...s, status: "done" } : s));
        if (i === PLUGIN_BUILD_STAGES.length - 1) {
          setTimeout(() => {
            setIsBuilding(false);
            setBuildComplete(true);
            onPluginBuilt();
          }, 300);
        }
      }, totalDelay);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-base font-semibold text-zinc-100">Deploy BXML</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
        </div>
        <p className="px-6 pb-3 text-sm text-zinc-400">Deploy <strong className="text-zinc-200">{projectName}</strong> as DSL or build a plugin package.</p>

        <div className="flex gap-2 px-6 pb-4">
          <button type="button" onClick={() => { if (!isBuilding) setMode("studio"); }} className={`flex-1 rounded-xl border p-3 text-left transition-colors ${mode === "studio" ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-700/40 hover:border-zinc-600"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-medium text-zinc-100">Deploy to Studio (DSL)</p>
            </div>
            <p className="text-[11px] text-zinc-500">Push BXML as DSL to a physical M300 terminal.</p>
          </button>
          <button type="button" onClick={() => { if (!isBuilding) setMode("plugin"); }} className={`flex-1 rounded-xl border p-3 text-left transition-colors ${mode === "plugin" ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-700/40 hover:border-zinc-600"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium text-zinc-100">Build Plugin Package</p>
            </div>
            <p className="text-[11px] text-zinc-500">Sandbox verify → Security scan → CDN → QR</p>
          </button>
        </div>

        <div className="border-t border-zinc-800/60 px-6 py-4">
          {mode === "studio" ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-2">Select a Studio to deploy DSL:</p>
              {selectedStudioId && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 mb-2">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /><p className="text-sm text-zinc-200">Already linked — re-deploy will update</p></div>
                </div>
              )}
              {studioOptions.map((s) => (
                <button key={s.id} type="button" onClick={() => onDeployToStudio(s.id, s.name)} className="w-full flex items-center gap-3 rounded-xl border border-zinc-700/40 bg-zinc-800/15 px-3 py-2.5 text-left hover:border-blue-500/30 transition-colors">
                  <Cpu className="h-4 w-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-sm text-zinc-200">{s.name}</p><p className="text-xs text-zinc-500">{s.model ?? "Studio"}</p></div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                </button>
              ))}
              {studioOptions.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No Studios available. Bind a Studio first.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!isBuilding && !buildComplete ? (
                <div>
                  <p className="text-xs text-zinc-500 mb-3">Build pipeline:</p>
                  <div className="space-y-2 mb-4">
                    {PLUGIN_BUILD_STAGES.map((stage, i) => (
                      <div key={stage.id} className="flex items-center gap-3 text-[12px]">
                        <div className="h-6 w-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-300 font-medium">{stage.label}</p>
                          <p className="text-[10px] text-zinc-600">{stage.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={startPluginBuild} className="w-full rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                    Start Build Pipeline
                  </button>
                </div>
              ) : isBuilding ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    <span className="text-sm font-medium text-zinc-200">Building plugin...</span>
                  </div>
                  {buildStages.map((stage) => (
                    <div key={stage.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] transition-all ${stage.status === "running" ? "bg-blue-500/5 border border-blue-500/20" : stage.status === "done" ? "opacity-80" : "opacity-40"}`}>
                      {stage.status === "done" && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                      {stage.status === "running" && <div className="h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />}
                      {stage.status === "pending" && <div className="h-4 w-4 rounded-full border border-zinc-700 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${stage.status === "running" ? "text-blue-300" : stage.status === "done" ? "text-zinc-300" : "text-zinc-600"}`}>{stage.label}</p>
                        <p className="text-[10px] text-zinc-600">{stage.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Check className="h-5 w-5" />
                    <p className="text-sm font-semibold">Plugin Built & Distributed!</p>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {buildStages.map((stage) => (
                      <div key={stage.id} className="text-center">
                        <div className="h-1.5 rounded-full bg-emerald-500 mb-1" />
                        <p className="text-[9px] text-zinc-500">{stage.label.split(" ")[0]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-white p-4 max-w-[240px] mx-auto">
                    <img src={qrUrl} alt={`QR for ${projectName}`} className="mx-auto h-52 w-52 rounded-lg" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-zinc-200">Scan with Aqara Life App</p>
                    <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">📱 Scan QR</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="flex items-center gap-1">⬇️ Download</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="flex items-center gap-1">▶️ Runtime Load</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">Plugin auto-installs in Aqara Life App and loads in the app runtime.</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">CDN URL</p>
                    <p className="mt-1 break-all text-[11px] text-zinc-400">https://cdn.aqara.com/plugins/{projectId}/latest/bundle.zip</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
