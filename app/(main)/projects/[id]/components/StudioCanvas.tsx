"use client";

import React, { useState, useMemo } from "react";
import {
  Settings, Cpu, Rocket, BarChart3, ChevronRight,
} from "lucide-react";
import { getObjectsByType, type BXMLDocument } from "@/lib/bxml";
import { DeployTabContent } from "./DeployTabContent";
import type { StudioTab } from "./constants";

const STUDIO_SIDEBAR: { id: StudioTab; icon: React.ElementType; label: string }[] = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "deploy", icon: Rocket, label: "Deploy" },
  { id: "logs", icon: BarChart3, label: "Logs" },
];

export function StudioCanvas({ selectedStudioId, projectId, projectName, cloudStudioId, studioOptions, hasGenerated, studioExpired, studioExpiresIn, onSelectStudio, onReallocate, bxmlDoc }: {
  selectedStudioId: string | null;
  projectId: string;
  projectName: string;
  cloudStudioId: string;
  studioOptions: { id: string; name: string; model?: string }[];
  hasGenerated: boolean;
  studioExpired: boolean;
  studioExpiresIn: string;
  onSelectStudio?: (id: string, name: string) => void;
  onReallocate: () => void;
  bxmlDoc: BXMLDocument | null;
}) {
  const [studioTab, setStudioTab] = useState<StudioTab>("settings");
  const [projVisibility, setProjVisibility] = useState<"public_remix" | "public_view" | "private">("public_remix");

  const spaces = useMemo(() => bxmlDoc ? getObjectsByType(bxmlDoc, "space") : [], [bxmlDoc]);

  return (
    <div className="h-full flex">
      <div className="w-[180px] shrink-0 border-r border-zinc-700/30 bg-[#14141c] flex flex-col">
        <div className="px-3 py-3 border-b border-zinc-700/25">
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${studioExpired ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
              <Cpu className={`h-3.5 w-3.5 ${studioExpired ? "text-red-400" : "text-emerald-400"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200">Studio Runtime</p>
              {studioExpired ? (
                <p className="text-[10px] text-red-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />Expired</p>
              ) : (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{studioExpiresIn}</p>
              )}
            </div>
          </div>
          {studioExpired && (
            <button type="button" onClick={onReallocate}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors">
              Allocate New Studio
            </button>
          )}
        </div>
        <div className="flex-1 py-2 px-2 space-y-0.5">
          {STUDIO_SIDEBAR.map((t) => (
            <button key={t.id} type="button" onClick={() => setStudioTab(t.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-all ${studioTab === t.id ? "bg-zinc-700/40 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/20"}`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6" style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1a26 0%, #111118 70%)" }}>
        {studioTab === "settings" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Project Name</label>
                  <input type="text" defaultValue={projectName} className="w-full rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500/40 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Visibility</label>
                  <div className="space-y-2">
                    {([
                      { id: "public_remix" as const, label: "Public & Remixable", desc: "Anyone can view and remix" },
                      { id: "public_view" as const, label: "Public & View Only", desc: "Anyone can view, no remix" },
                      { id: "private" as const, label: "Private", desc: "Only friends with link you share can view" },
                    ]).map((v) => (
                      <button key={v.id} type="button" onClick={() => setProjVisibility(v.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${projVisibility === v.id ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-700/40 bg-zinc-800/15 hover:border-zinc-600"}`}>
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${projVisibility === v.id ? "border-indigo-500" : "border-zinc-600"}`}>
                          {projVisibility === v.id && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                        </div>
                        <div><p className="text-sm font-medium text-zinc-200">{v.label}</p><p className="text-[11px] text-zinc-500">{v.desc}</p></div>
                        {v.id === "private" && <span className="ml-auto rounded border border-amber-500/30 bg-amber-500/8 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 uppercase">Builder+</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-700/20"><button type="button" className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Delete this project</button></div>
          </div>
        )}

        {studioTab === "logs" && (
          <div className="max-w-lg">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Activity Logs</h3>
            <p className="text-xs text-zinc-500 mb-4">操作日志、部署日志等最近记录。</p>
            <div className="space-y-1">
              {[
                { time: "刚刚", msg: "Deploy to Studio completed", type: "deploy" },
                { time: "2 min ago", msg: "Build App Plugin succeeded", type: "operation" },
                { time: "8 min ago", msg: "Space layout updated by AI", type: "operation" },
                { time: "32 min ago", msg: "Studio health check passed", type: "system" },
                { time: "1 hour ago", msg: "Opened project in editor", type: "operation" },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-800/20 transition-colors">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-zinc-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">{l.msg}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-[10px] text-zinc-600">{l.time}</p>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500 uppercase">{l.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {studioTab === "deploy" && (
          <DeployTabContent
            projectId={projectId}
            projectName={projectName}
            cloudStudioId={cloudStudioId}
            studioOptions={studioOptions}
            selectedStudioId={selectedStudioId}
            onSelectStudio={onSelectStudio}
            hasGenerated={hasGenerated}
            bxmlDoc={bxmlDoc ?? null}
          />
        )}
      </div>
    </div>
  );
}
