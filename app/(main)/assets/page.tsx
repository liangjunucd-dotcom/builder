"use client";

import React, { useState } from "react";
import {
  Search, Cpu, Box, Zap, Package, ChevronRight, Check,
  Puzzle, Monitor, Cloud, Shield, X, Minus, Plus,
  LayoutGrid, List, Filter, ExternalLink, Smartphone,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════════ */

type AssetCategory = "all" | "protocol" | "logic" | "ai" | "experience";
type AssetStatus = "available" | "assigned";

interface OwnedAsset {
  id: string;
  name: string;
  icon: React.ElementType;
  category: AssetCategory;
  version: string;
  description: string;
  totalLicenses: number;
  assignedStudios: { id: string; name: string; status: "online" | "offline" }[];
  color: string;
}

const CATEGORIES: { id: AssetCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: "all", label: "All", icon: Package, color: "text-zinc-400" },
  { id: "protocol", label: "Protocol", icon: Cpu, color: "text-blue-400" },
  { id: "logic", label: "Logic", icon: Zap, color: "text-amber-400" },
  { id: "ai", label: "AI", icon: Shield, color: "text-violet-400" },
  { id: "experience", label: "Experience", icon: Monitor, color: "text-pink-400" },
];

const OWNED_ASSETS: OwnedAsset[] = [
  {
    id: "a1", name: "HomeKit Advanced Integration Pro", icon: Puzzle, category: "protocol",
    version: "v2.3.1", description: "Full HomeKit protocol bridge with Thread/Matter support, accessory pairing, and scene mapping",
    totalLicenses: 3, color: "#3b82f6",
    assignedStudios: [
      { id: "s1", name: "Living Room Studio", status: "online" },
      { id: "s2", name: "Bedroom Studio", status: "online" },
      { id: "s3", name: "Office Studio", status: "offline" },
    ],
  },
  {
    id: "a2", name: "KNX Bridge", icon: Cpu, category: "protocol",
    version: "v1.4.0", description: "Industrial KNX protocol adapter for commercial HVAC, lighting and blinds control",
    totalLicenses: 2, color: "#3b82f6",
    assignedStudios: [
      { id: "s4", name: "Conference Room Studio", status: "online" },
    ],
  },
  {
    id: "a3", name: "FP2 Presence Intelligence", icon: Shield, category: "ai",
    version: "v3.1.0", description: "Zone-level presence detection, posture recognition, occupancy counting with ML inference",
    totalLicenses: 5, color: "#8b5cf6",
    assignedStudios: [
      { id: "s1", name: "Living Room Studio", status: "online" },
      { id: "s5", name: "Smart Hotel Demo", status: "online" },
    ],
  },
  {
    id: "a4", name: "Energy Analytics Pro", icon: Zap, category: "logic",
    version: "v1.5.2", description: "Real-time power monitoring, cost estimation, trend analysis and anomaly detection",
    totalLicenses: 2, color: "#f59e0b",
    assignedStudios: [],
  },
  {
    id: "a5", name: "Scene Engine Plus", icon: Zap, category: "logic",
    version: "v4.2.0", description: "Advanced multi-device scene orchestration with transitions, conditions, and time-based triggers",
    totalLicenses: 3, color: "#f59e0b",
    assignedStudios: [
      { id: "s1", name: "Living Room Studio", status: "online" },
      { id: "s2", name: "Bedroom Studio", status: "online" },
    ],
  },
  {
    id: "a6", name: "Dashboard Widget Pack", icon: Monitor, category: "experience",
    version: "v2.3.0", description: "Charts, gauges, floor map overlay, energy ring and device status cards for Aqara Life",
    totalLicenses: 5, color: "#ec4899",
    assignedStudios: [
      { id: "s1", name: "Living Room Studio", status: "online" },
    ],
  },
  {
    id: "a7", name: "Voice Control Module", icon: Smartphone, category: "experience",
    version: "v1.4.0", description: "Natural language voice commands via Siri, Alexa, and Google Assistant integration",
    totalLicenses: 10, color: "#ec4899",
    assignedStudios: [
      { id: "s1", name: "Living Room Studio", status: "online" },
      { id: "s2", name: "Bedroom Studio", status: "online" },
      { id: "s3", name: "Office Studio", status: "offline" },
    ],
  },
  {
    id: "a8", name: "Proactive Comfort AI", icon: Cloud, category: "ai",
    version: "v0.9.0-beta", description: "Learns user comfort preferences and pre-adjusts environment using predictive models",
    totalLicenses: 1, color: "#8b5cf6",
    assignedStudios: [],
  },
];

const AVAILABLE_STUDIOS = [
  { id: "s1", name: "Living Room Studio", model: "M300", status: "online" as const },
  { id: "s2", name: "Bedroom Studio", model: "M300", status: "online" as const },
  { id: "s3", name: "Office Studio", model: "M200", status: "offline" as const },
  { id: "s4", name: "Conference Room Studio", model: "Cloud", status: "online" as const },
  { id: "s5", name: "Smart Hotel Demo", model: "Cloud", status: "online" as const },
];

/* ═══════════════════════════════════════════════════
   Assign Modal
   ═══════════════════════════════════════════════════ */

function AssignModal({ asset, open, onClose }: { asset: OwnedAsset | null; open: boolean; onClose: () => void }) {
  const [selectedCount, setSelectedCount] = useState(1);
  const [workspace] = useState("Personal");
  const [selectedStudioIds, setSelectedStudioIds] = useState<string[]>([]);

  if (!open || !asset) return null;

  const remainingLicenses = asset.totalLicenses - asset.assignedStudios.length;
  const alreadyAssigned = new Set(asset.assignedStudios.map((s) => s.id));
  const availableForAssign = AVAILABLE_STUDIOS.filter((s) => !alreadyAssigned.has(s.id));

  const toggleStudio = (id: string) => {
    setSelectedStudioIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < selectedCount ? [...prev, id] : prev
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 rounded-3xl bg-[#14141e] border border-white/[.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="px-7 pt-7 pb-2 text-center">
          <h2 className="text-xl font-bold text-zinc-100">Assign Plugin</h2>
          <p className="text-sm text-zinc-500 mt-1">Select a Studio for each plugin.</p>
        </div>

        <div className="px-7 py-5 space-y-5">
          {/* Plugin Name */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Plugin Name</label>
            <div className="flex items-center gap-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${asset.color}15` }}>
                <Puzzle className="h-4 w-4" style={{ color: asset.color }} />
              </div>
              <span className="text-sm font-medium text-zinc-200">{asset.name}</span>
            </div>
          </div>

          {/* Plugin Count + Workspace */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Plugin Count</label>
              <div className="flex items-center rounded-xl bg-zinc-800/40 border border-zinc-700/30 overflow-hidden">
                <button type="button" onClick={() => setSelectedCount(Math.max(1, selectedCount - 1))}
                  className="flex h-10 w-10 items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[.04] transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-base font-bold text-zinc-100 tabular-nums">{selectedCount}</span>
                <button type="button" onClick={() => setSelectedCount(Math.min(remainingLicenses, selectedCount + 1))}
                  className="flex h-10 w-10 items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[.04] transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Select Workspace</label>
              <div className="flex items-center gap-2 rounded-xl bg-zinc-800/40 border border-zinc-700/30 px-3 h-10">
                <Box className="h-4 w-4 text-zinc-500" />
                <span className="flex-1 text-sm text-zinc-200">{workspace}</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 rotate-90" />
              </div>
            </div>
          </div>

          {/* Select Studios */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">
              Select Studios <span className="text-zinc-600">({selectedStudioIds.length}/{selectedCount})</span>
            </label>
            <div className="space-y-1.5 max-h-40 overflow-auto">
              {availableForAssign.length > 0 ? availableForAssign.map((studio) => {
                const selected = selectedStudioIds.includes(studio.id);
                return (
                  <button key={studio.id} type="button" onClick={() => toggleStudio(studio.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all border ${
                      selected ? "border-indigo-500/40 bg-indigo-500/8" : "border-zinc-700/30 bg-zinc-800/30 hover:border-zinc-600/50"
                    }`}>
                    <Cpu className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="flex-1 text-sm text-zinc-200">{studio.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      studio.status === "online" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700/40 text-zinc-500"
                    }`}>{studio.status === "online" ? "Online" : "Offline"}</span>
                    {selected && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              }) : (
                <p className="text-xs text-zinc-600 py-4 text-center">All Studios already have this plugin assigned.</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
          <button type="button" disabled={selectedStudioIds.length === 0}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */

export default function AssetsPage() {
  const [category, setCategory] = useState<AssetCategory>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [assignAsset, setAssignAsset] = useState<OwnedAsset | null>(null);

  const filtered = OWNED_ASSETS.filter(
    (a) => (category === "all" || a.category === category) && (search === "" || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalAssets = OWNED_ASSETS.length;
  const totalLicenses = OWNED_ASSETS.reduce((s, a) => s + a.totalLicenses, 0);
  const totalAssigned = OWNED_ASSETS.reduce((s, a) => s + a.assignedStudios.length, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/50 px-6 py-5">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-400" /> My Assets
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Plugins and capabilities acquired from the Store. Assign them to Studios to enable spatial intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-1">
            <button type="button" onClick={() => setViewMode("card")} className={`rounded-md p-1.5 ${viewMode === "card" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setViewMode("list")} className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-xl">
          <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{totalAssets}</p>
            <p className="text-[11px] text-zinc-500">Owned Assets</p>
          </div>
          <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{totalLicenses}</p>
            <p className="text-[11px] text-zinc-500">Total Licenses</p>
          </div>
          <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/20 px-4 py-3">
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">{totalAssigned}</p>
            <p className="text-[11px] text-zinc-500">Assigned to Studios</p>
          </div>
        </div>

        {/* Flow reminder */}
        <div className="flex items-center gap-2 text-[11px] mb-6 px-1">
          <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 text-indigo-400 font-semibold">Store</span>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/15 px-2.5 py-1 text-cyan-400 font-semibold">My Assets</span>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 text-emerald-400 font-semibold">Assign to Studio</span>
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          <span className="rounded-lg bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 text-amber-400 font-semibold">OTA → Enabled</span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800/50 bg-zinc-900/30 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-zinc-600" />
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                  category === c.id ? "border-indigo-500/30 bg-indigo-500/8 text-indigo-300" : "border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}>
                <c.icon className="h-3 w-3" /> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Cards */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((asset) => {
              const remaining = asset.totalLicenses - asset.assignedStudios.length;
              return (
                <div key={asset.id} className="rounded-2xl border border-zinc-800/40 bg-zinc-900/15 overflow-hidden hover:border-zinc-700/50 transition-all group">
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${asset.color}12`, border: `1px solid ${asset.color}20` }}>
                        <asset.icon className="h-5 w-5" style={{ color: asset.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-100 leading-tight">{asset.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-600 font-mono">{asset.version}</span>
                          <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-zinc-500 font-medium uppercase">
                            {CATEGORIES.find((c) => c.id === asset.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 leading-relaxed line-clamp-2">{asset.description}</p>
                  </div>

                  {/* License bar */}
                  <div className="px-5 py-3 border-t border-zinc-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-zinc-600 font-medium">License usage</span>
                      <span className="text-[10px] text-zinc-400 tabular-nums">{asset.assignedStudios.length} / {asset.totalLicenses}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800/60 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(asset.assignedStudios.length / asset.totalLicenses) * 100}%`, background: asset.color }} />
                    </div>
                  </div>

                  {/* Assigned studios */}
                  {asset.assignedStudios.length > 0 && (
                    <div className="px-5 py-2.5 border-t border-zinc-800/20">
                      <div className="flex flex-wrap gap-1.5">
                        {asset.assignedStudios.map((s) => (
                          <span key={s.id} className="flex items-center gap-1 rounded-lg bg-zinc-800/30 px-2 py-1 text-[10px] text-zinc-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${s.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="px-5 py-3 border-t border-zinc-800/20">
                    {remaining > 0 ? (
                      <button type="button" onClick={() => setAssignAsset(asset)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/8 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/15 transition-colors">
                        <Cpu className="h-3.5 w-3.5" /> Assign to Studio
                        <span className="text-[10px] text-indigo-500/70">({remaining} remaining)</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-600">
                        <Check className="h-3.5 w-3.5" /> All licenses assigned
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/15 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800/40 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium text-xs">Asset</th>
                  <th className="px-5 py-3 font-medium text-xs">Category</th>
                  <th className="px-5 py-3 font-medium text-xs">Licenses</th>
                  <th className="px-5 py-3 font-medium text-xs">Studios</th>
                  <th className="px-5 py-3 font-medium text-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filtered.map((asset) => {
                  const remaining = asset.totalLicenses - asset.assignedStudios.length;
                  return (
                    <tr key={asset.id} className="hover:bg-white/[.01] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${asset.color}12` }}>
                            <asset.icon className="h-4 w-4" style={{ color: asset.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{asset.name}</p>
                            <p className="text-[10px] text-zinc-600 font-mono">{asset.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">{CATEGORIES.find((c) => c.id === asset.category)?.label}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400 tabular-nums">{asset.assignedStudios.length}/{asset.totalLicenses}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {asset.assignedStudios.map((s) => (
                            <span key={s.id} className="flex items-center gap-1 rounded bg-zinc-800/40 px-1.5 py-0.5 text-[9px] text-zinc-500">
                              <span className={`h-1 w-1 rounded-full ${s.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`} />{s.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {remaining > 0 ? (
                          <button type="button" onClick={() => setAssignAsset(asset)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Assign</button>
                        ) : (
                          <span className="text-xs text-zinc-600">Fully assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No assets found.</p>
            <a href="/marketplace" className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-400 hover:text-indigo-300">
              Browse Store <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AssignModal asset={assignAsset} open={!!assignAsset} onClose={() => setAssignAsset(null)} />
    </div>
  );
}
