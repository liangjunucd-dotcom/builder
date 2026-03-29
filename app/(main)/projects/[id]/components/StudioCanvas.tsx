"use client";

import React, { useState, useMemo } from "react";
import {
  Settings, LayoutGrid, Cpu, Rocket, BarChart3, Box, Zap, ArrowLeftRight,
  ChevronRight, Plus, Eye, Globe, Lock,
} from "lucide-react";
import { getLifeAppPreviewUrl, getLifeAppQrImageUrl } from "@/lib/life-app-links";
import { getObjectsByType, countByType, type BXMLDocument } from "@/lib/bxml";
import { DeployTabContent } from "./DeployTabContent";
import type { StudioTab } from "./constants";

const STUDIO_SIDEBAR: { id: StudioTab; icon: React.ElementType; label: string }[] = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "assets", icon: LayoutGrid, label: "Entities" },
  { id: "capabilities", icon: Cpu, label: "Capabilities" },
  { id: "deploy", icon: Rocket, label: "Deploy" },
  { id: "logs", icon: BarChart3, label: "Logs" },
];

export function StudioCanvas({ selectedStudioId, projectId, projectName, cloudStudioId, studioOptions, hasGenerated, studioExpired, studioExpiresIn, onLinkStudio, onSelectStudio, onReallocate, bxmlDoc }: {
  selectedStudioId: string | null;
  projectId: string;
  projectName: string;
  cloudStudioId: string;
  studioOptions: { id: string; name: string; model?: string }[];
  hasGenerated: boolean;
  studioExpired: boolean;
  studioExpiresIn: string;
  onLinkStudio: (id: string) => void;
  onSelectStudio?: (id: string, name: string) => void;
  onReallocate: () => void;
  bxmlDoc: BXMLDocument | null;
}) {
  const [studioTab, setStudioTab] = useState<StudioTab>("settings");
  const [projVisibility, setProjVisibility] = useState<"public_remix" | "public_view" | "private">("public_remix");

  const spaces = useMemo(() => bxmlDoc ? getObjectsByType(bxmlDoc, "space") : [], [bxmlDoc]);
  const devices = useMemo(() => bxmlDoc ? getObjectsByType(bxmlDoc, "device") : [], [bxmlDoc]);
  const automations = useMemo(() => bxmlDoc ? getObjectsByType(bxmlDoc, "automation") : [], [bxmlDoc]);
  const scenes = useMemo(() => bxmlDoc ? getObjectsByType(bxmlDoc, "scene") : [], [bxmlDoc]);
  const totalObjects = (bxmlDoc?.objects.length ?? 0);
  const totalRelations = (bxmlDoc?.relations.length ?? 0);

  return (
    <div className="h-full flex">
      <div className="w-[180px] shrink-0 border-r border-zinc-700/30 bg-[#14141c] flex flex-col">
        <div className="px-3 py-3 border-b border-zinc-700/25">
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${studioExpired ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
              <Cpu className={`h-3.5 w-3.5 ${studioExpired ? "text-red-400" : "text-emerald-400"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate font-mono">{cloudStudioId}</p>
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

        {studioTab === "assets" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-indigo-400" /> Spatial Entities
              </h3>
              <p className="text-xs text-zinc-500">Objects, relations, and states in the spatial ontology model — organized by space.</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Objects", count: totalObjects, iconCls: "text-indigo-400", icon: Box },
                { label: "Relations", count: totalRelations, iconCls: "text-cyan-400", icon: ArrowLeftRight },
                { label: "Automations", count: automations.length, iconCls: "text-amber-400", icon: Zap },
                { label: "Scenes", count: scenes.length, iconCls: "text-violet-400", icon: Settings },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-zinc-700/25 bg-zinc-800/20 px-3 py-2.5 text-center">
                  <s.icon className={`h-4 w-4 mx-auto mb-1.5 ${s.iconCls}`} />
                  <p className="text-lg font-bold text-zinc-100 tabular-nums">{s.count}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            {spaces.length > 0 ? (
              <>
                {spaces.map((space, idx) => {
                  const spaceDevices = devices.filter(d => d.parentId === space.id);
                  const SPACE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6", "#f43f5e", "#22c55e"];
                  const color = SPACE_COLORS[idx % SPACE_COLORS.length];
                  return (
                    <div key={space.id} className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 overflow-hidden">
                      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-zinc-700/20" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                        <span className="text-xs font-semibold" style={{ color }}>{space.name}</span>
                        <span className="text-[10px] text-zinc-600">{spaceDevices.length} devices</span>
                        <span className="ml-auto text-[10px] text-zinc-600">
                          {spaceDevices.reduce((s, e) => s + e.properties.length, 0)} attributes
                        </span>
                      </div>
                      <div className="divide-y divide-zinc-700/15">
                        {spaceDevices.map((dev) => (
                          <div key={dev.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[.01] transition-colors">
                            <span className="text-base mt-0.5">{dev.icon ?? "📦"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-zinc-200">{dev.name}</span>
                                <span className="rounded bg-zinc-700/40 px-1.5 py-0.5 text-[9px] text-zinc-500 font-medium">
                                  {dev.properties.find(p => p.key === "model")?.value ?? "Device"}
                                </span>
                              </div>
                              {dev.properties.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {dev.properties.filter(p => p.key !== "model").slice(0, 4).map((p) => (
                                    <span key={p.key} className="rounded-md bg-white/[.03] border border-white/[.04] px-1.5 py-0.5 text-[10px] text-zinc-500">
                                      {p.key}: {p.value}{p.unit ? ` ${p.unit}` : ""}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="mt-1 h-2 w-2 rounded-full shrink-0 bg-emerald-400 shadow-sm shadow-emerald-400/30" />
                          </div>
                        ))}
                        {spaceDevices.length === 0 && (
                          <div className="px-4 py-3 text-xs text-zinc-600">No devices in this space</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 p-8 text-center">
                <LayoutGrid className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No BXML data yet</p>
                <p className="text-xs text-zinc-600 mt-1">Generate a solution via AI chat to populate entities.</p>
              </div>
            )}
            {bxmlDoc && bxmlDoc.relations.length > 0 && (
              <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-zinc-700/20">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-zinc-300">Relations ({bxmlDoc.relations.length})</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {bxmlDoc.relations.slice(0, 8).map((rel) => {
                    const src = bxmlDoc.objects.find(o => o.id === rel.sourceId);
                    const tgt = bxmlDoc.objects.find(o => o.id === rel.targetId);
                    return (
                      <div key={rel.id} className="flex items-center gap-2.5 text-xs">
                        <span className="font-medium text-zinc-300 whitespace-nowrap truncate max-w-[120px]">{src?.name ?? rel.sourceId}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium shrink-0 ${
                          rel.type === "triggers" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                          rel.type === "contains" ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" :
                          rel.type === "controls" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                          "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                        }`}>{rel.type}</span>
                        <span className="text-zinc-500 truncate">{tgt?.name ?? rel.targetId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <button type="button" className="w-full rounded-xl border border-dashed border-zinc-600/30 py-3 text-xs text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors flex items-center justify-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Add entity from Marketplace
            </button>
          </div>
        )}

        {studioTab === "capabilities" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" /> Capabilities
              </h3>
              <p className="text-xs text-zinc-500">Functional abilities installed on this Studio — defines what your spatial entities can do.</p>
            </div>
            {([
              { category: "Protocol", desc: "Device communication & connectivity", color: "#3b82f6", items: [
                { name: "Zigbee 3.0", version: "v3.0.1", desc: "IEEE 802.15.4 mesh networking for sensors and actuators", status: "installed" as const, entities: 18 },
                { name: "Matter / Thread", version: "v1.3", desc: "IP-based smart home interop standard", status: "installed" as const, entities: 6 },
                { name: "KNX Bridge", version: "v2.1", desc: "Industrial KNX protocol for commercial environments", status: "available" as const, entities: 0 },
                { name: "Modbus TCP", version: "v1.0", desc: "Industrial protocol for HVAC and energy systems", status: "available" as const, entities: 0 },
              ]},
              { category: "Logic", desc: "Automation, rules & data processing", color: "#f59e0b", items: [
                { name: "Scene Engine", version: "v4.2", desc: "Multi-device scene orchestration with transitions", status: "installed" as const, entities: 6 },
                { name: "Energy Analytics", version: "v1.5", desc: "Real-time power monitoring, cost estimation, trend analysis", status: "available" as const, entities: 0 },
                { name: "Schedule Manager", version: "v2.0", desc: "Time-based and astronomical triggers", status: "installed" as const, entities: 4 },
              ]},
              { category: "AI", desc: "Perception, prediction & intelligence", color: "#8b5cf6", items: [
                { name: "FP2 Presence Intelligence", version: "v3.1", desc: "Zone-level presence, posture detection, occupancy counting", status: "installed" as const, entities: 3 },
                { name: "Space Anomaly Detection", version: "v1.0", desc: "Detects unusual patterns: water leak, abnormal temp, intrusion", status: "available" as const, entities: 0 },
                { name: "Proactive Comfort", version: "v0.9β", desc: "Learns user preference and pre-adjusts environment", status: "available" as const, entities: 0 },
              ]},
              { category: "Experience", desc: "UI components, widgets & app modules", color: "#ec4899", items: [
                { name: "Dashboard Widgets", version: "v2.3", desc: "Charts, gauges, floor map overlay for data visualization", status: "installed" as const, entities: 5 },
                { name: "Voice Control Module", version: "v1.4", desc: "Natural language commands via Siri, Alexa, Google", status: "installed" as const, entities: 28 },
                { name: "AR Space Preview", version: "v0.5β", desc: "Augmented reality view of device placement and status", status: "available" as const, entities: 0 },
              ]},
            ] as const).map((cat) => {
              const installed = cat.items.filter((i) => i.status === "installed").length;
              return (
                <div key={cat.category} className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-700/20" style={{ borderLeftWidth: 3, borderLeftColor: cat.color }}>
                    <div>
                      <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.category}</span>
                      <span className="text-[10px] text-zinc-600 ml-2">{cat.desc}</span>
                    </div>
                    <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: cat.color, background: `${cat.color}15` }}>
                      {installed}/{cat.items.length} active
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-700/15">
                    {cat.items.map((cap, ci) => (
                      <div key={ci} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[.01] transition-colors group">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}20` }}>
                          <Cpu className="h-4 w-4" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-200">{cap.name}</span>
                            <span className="text-[9px] text-zinc-600 font-mono">{cap.version}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{cap.desc}</p>
                          {cap.status === "installed" && cap.entities > 0 && (
                            <p className="text-[10px] mt-1" style={{ color: cat.color }}>Serving {cap.entities} entities</p>
                          )}
                        </div>
                        {cap.status === "installed" ? (
                          <div className="flex items-center gap-2 shrink-0 mt-1">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">Active</span>
                          </div>
                        ) : (
                          <button type="button" className="shrink-0 mt-1 rounded-lg border border-indigo-500/30 bg-indigo-500/8 px-3 py-1.5 text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                            Install
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl border border-zinc-700/25 bg-zinc-800/10 p-4">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-3">How capabilities flow</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 text-indigo-400 font-semibold">Marketplace</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1.5 text-cyan-400 font-semibold">My Assets</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-emerald-400 font-semibold">Assign to Studio</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-amber-400 font-semibold">Enables Entities</span>
              </div>
            </div>
            <button type="button" className="w-full rounded-xl border border-dashed border-zinc-600/30 py-3 text-xs text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors flex items-center justify-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Browse Marketplace for capabilities
            </button>
          </div>
        )}

        {studioTab === "logs" && (
          <div className="max-w-lg">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Activity Logs</h3>
            <p className="text-xs text-zinc-500 mb-4">Recent events from this Studio.</p>
            <div className="space-y-1">
              {[
                { time: "2 min ago", msg: "FP2 · Presence detected in Living Room", type: "event" },
                { time: "5 min ago", msg: "Automation · Home Mode triggered", type: "automation" },
                { time: "12 min ago", msg: "Living Room Light · Turned on (100%)", type: "device" },
                { time: "1 hour ago", msg: "System · Health check passed", type: "system" },
                { time: "3 hours ago", msg: "AC · Temperature set to 24°C", type: "device" },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-800/20 transition-colors">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 bg-zinc-600" />
                  <div className="flex-1 min-w-0"><p className="text-xs text-zinc-300">{l.msg}</p><p className="text-[10px] text-zinc-600 mt-0.5">{l.time}</p></div>
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
            hasGenerated={hasGenerated}
            onPushToM300={(studioId, studioName) => onSelectStudio?.(studioId, studioName)}
            bxmlDoc={bxmlDoc ?? null}
          />
        )}
      </div>
    </div>
  );
}
