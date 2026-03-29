"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Heart,
  Coins,
  Sparkles,
  Puzzle,
  ArrowRight,
} from "lucide-react";
import {
  getPluginsList,
  PLUGIN_CATEGORIES,
  type PluginCategory,
  type PluginListItem,
} from "@/lib/plugins-mock";
import { BuildCard, type BuildCardItem } from "@/components/BuildCard";

type MarketTab = "solutions" | "plugins" | "templates";

const TABS: { id: MarketTab; label: string; count: number }[] = [
  { id: "solutions", label: "Solutions", count: 48 },
  { id: "plugins", label: "Plugins", count: 126 },
  { id: "templates", label: "Templates", count: 35 },
];

/* ── Solution Mock Data ── */
const SOLUTION_ITEMS = [
  { id: "sol-1", title: "Full-Home Intelligence Suite", author: "Aqara Official", avatar: "A", description: "Standardized whole-home solution: 28 devices + 12 automations + 3 dashboards", price: 5000, installs: "2.3k", likes: 4800, views: 12200, visual: "linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #1e1b4b 100%)", layers: ["🏠", "⚡", "📊"], category: "space" as const, featured: true },
  { id: "sol-2", title: "Hotel Guest Control V3", author: "HotelTech", avatar: "H", description: "Room panel + check-in/out automation + energy stats + SOS", price: 35000, installs: "580", likes: 1200, views: 5800, visual: "linear-gradient(150deg, #051210 0%, #0a2220 30%, #0e2e2a 55%, #071816 100%)", layers: ["🏨", "🔑", "📈"], category: "automation" as const, featured: true },
  { id: "sol-3", title: "Smart Office Energy Saver", author: "GreenTech", avatar: "G", description: "Occupancy-linked AC + CO2 ventilation + room booking + energy reports", price: 12000, installs: "890", likes: 2100, views: 8900, visual: "linear-gradient(140deg, #0a100a 0%, #142014 35%, #1a2e1a 60%, #0d180d 100%)", layers: ["🏢", "🌿", "💨"], category: "dashboard" as const, featured: true },
  { id: "sol-4", title: "Elderly Home Care", author: "CareHome", avatar: "C", description: "Fall detection + emergency call + medication reminders + family alerts", price: 0, installs: "1.5k", likes: 3200, views: 15000, visual: "linear-gradient(135deg, #18080f 0%, #2a0e1a 30%, #221018 60%, #120810 100%)", layers: ["👴", "🆘", "💊"], category: "automation" as const, featured: false },
  { id: "sol-5", title: "Whole-Home Security Pro", author: "SecureHome", avatar: "S", description: "Intrusion detection + video linkage + away mode + real-time alerts", price: 6000, installs: "1.8k", likes: 3600, views: 18000, visual: "linear-gradient(135deg, #1a0505 0%, #2a0a0a 30%, #1f0f0f 60%, #0f0505 100%)", layers: ["🔒", "📹", "🚨"], category: "scene" as const, featured: false },
  { id: "sol-6", title: "Smart Classroom Lighting", author: "EduSmart", avatar: "E", description: "Eye-care lighting + projector linkage + CO2 monitoring + auto-off", price: 8000, installs: "420", likes: 980, views: 4200, visual: "linear-gradient(140deg, #08080f 0%, #101025 35%, #181838 60%, #0c0c1c 100%)", layers: ["🏫", "💡", "🎥"], category: "scene" as const, featured: false },
  { id: "sol-7", title: "Retail Store Management", author: "RetailOps", avatar: "R", description: "Zone lighting + foot traffic + energy comparison + remote inspection", price: 15000, installs: "340", likes: 670, views: 3400, visual: "linear-gradient(135deg, #12080a 0%, #221015 30%, #2a1520 55%, #180c10 100%)", layers: ["🛍", "📊", "🔦"], category: "dashboard" as const, featured: false },
  { id: "sol-8", title: "Starter Home Pack", author: "Aqara Official", avatar: "A", description: "Entry-level whole-home: entryway + living room + bedroom essentials", price: 0, installs: "5.6k", likes: 8200, views: 56000, visual: "linear-gradient(140deg, #0c0c0e 0%, #151518 35%, #1c1c22 60%, #121215 100%)", layers: ["🏠", "🛋", "🛏"], category: "space" as const, featured: false },
];

/* ── Template Mock Data ── */
const TEMPLATE_ITEMS = [
  { id: "tpl-1", title: "3-Bedroom Standard", author: "Aqara Official", avatar: "A", price: 0, installs: "8.2k", likes: 5600, views: 82000, visual: "linear-gradient(145deg, #0a0a1a 0%, #0f1530 30%, #141d42 55%, #0d1228 100%)", layers: ["🏠", "🛋"], category: "template" as const },
  { id: "tpl-2", title: "200 sqm Office", author: "OfficeX", avatar: "O", price: 0, installs: "2.1k", likes: 1200, views: 21000, visual: "linear-gradient(140deg, #0a0d18 0%, #0e152a 35%, #121c38 60%, #0b1020 100%)", layers: ["🏢", "💼"], category: "template" as const },
  { id: "tpl-3", title: "Airbnb Quick Deploy", author: "HostPro", avatar: "H", price: 500, installs: "3.4k", likes: 2800, views: 34000, visual: "linear-gradient(135deg, #100808 0%, #201410 30%, #2a1c14 55%, #181008 100%)", layers: ["🏡", "🔑"], category: "template" as const },
  { id: "tpl-4", title: "Factory Floor Monitor", author: "InduPro", avatar: "I", price: 2000, installs: "680", likes: 420, views: 6800, visual: "linear-gradient(145deg, #080a10 0%, #0e1520 35%, #121e30 60%, #0a1018 100%)", layers: ["🏭", "📡"], category: "template" as const },
  { id: "tpl-5", title: "Installer Delivery Kit", author: "Pro_Builder", avatar: "P", price: 0, installs: "4.5k", likes: 3100, views: 45000, visual: "linear-gradient(135deg, #0c0c0e 0%, #151518 35%, #1c1c22 60%, #121215 100%)", layers: ["📦", "🔧"], category: "template" as const },
  { id: "tpl-6", title: "Kindergarten Safety", author: "SafeKids", avatar: "S", price: 1000, installs: "560", likes: 890, views: 5600, visual: "linear-gradient(135deg, #060f08 0%, #0c1e10 30%, #112a16 55%, #0a180c 100%)", layers: ["🧒", "🔔"], category: "template" as const },
];

const BADGE_STYLES: Record<string, string> = {
  Official: "bg-blue-500/20 text-blue-400",
  Matter: "bg-emerald-500/20 text-emerald-400",
  Verified: "bg-indigo-500/20 text-indigo-400",
  Popular: "bg-amber-500/20 text-amber-400",
  Beta: "bg-orange-500/20 text-orange-400",
  Free: "bg-emerald-500/20 text-emerald-400",
  Other: "bg-zinc-600/40 text-zinc-400",
};

const VISUAL_STYLES: Record<string, string> = {
  Official: "bg-gradient-to-br from-blue-600/30 via-indigo-700/20 to-zinc-800/80",
  Matter: "bg-gradient-to-br from-emerald-600/25 via-teal-700/20 to-zinc-800/80",
  Verified: "bg-gradient-to-br from-indigo-600/20 via-violet-700/20 to-zinc-800/80",
  Popular: "bg-gradient-to-br from-amber-600/20 via-orange-700/15 to-zinc-800/80",
  Beta: "bg-gradient-to-br from-orange-600/20 via-amber-700/15 to-zinc-800/80",
  Free: "bg-gradient-to-br from-emerald-600/20 via-teal-700/15 to-zinc-800/80",
  Other: "bg-gradient-to-br from-indigo-600/15 via-zinc-700/30 to-zinc-800/80",
};

/* Plugin card — keeps /square gradient style */
function PluginCard({ plugin }: { plugin: PluginListItem }) {
  const authorHref = `/builders/${encodeURIComponent(plugin.author)}`;
  return (
    <Link
      href={`/square/${plugin.id}`}
      className="group/card flex flex-col rounded-xl border border-zinc-800/50 overflow-hidden transition-all hover:border-zinc-700/60"
      style={{ background: "rgba(15, 15, 22, 0.6)" }}
    >
      <div className={`relative aspect-[16/10] w-full overflow-hidden`}>
        <div className={`absolute inset-0 transition-transform duration-500 group-hover/card:scale-110 ${VISUAL_STYLES[plugin.badge] ?? VISUAL_STYLES.Other}`}>
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white/15 group-hover/card:text-white/25 transition-opacity">
            {plugin.title.charAt(0)}
          </span>
        </div>
        <span className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase ${BADGE_STYLES[plugin.badge]}`}>
          {plugin.badge}
        </span>
        <span className={`absolute top-2 right-2 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
          plugin.price === "Free" ? "bg-emerald-500/20 text-emerald-400" : "bg-black/50 text-amber-400 backdrop-blur-sm"
        }`}>
          {plugin.price === "Free" ? "Free" : <><Coins className="h-2.5 w-2.5" />${plugin.price}</>}
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2.5">
          <span
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = authorHref; }}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[9px] font-bold text-white">
              {plugin.author.charAt(0)}
            </span>
            <span className="text-[10px] text-white/80">{plugin.author}</span>
          </span>
          <span className="flex items-center gap-1 rounded-md bg-white/15 backdrop-blur-sm px-2 py-1 text-[10px] font-medium text-white">
            <Download className="h-2.5 w-2.5" /> Install
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-100 truncate">{plugin.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-zinc-500">@{plugin.author}</span>
          <div className="flex items-center gap-2 text-zinc-600">
            <span className="flex items-center gap-0.5 text-[10px]"><Heart className="h-2.5 w-2.5" />{plugin.likes}</span>
            <span className="flex items-center gap-0.5 text-[10px]"><Download className="h-2.5 w-2.5" />{plugin.downloads}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<MarketTab>("solutions");
  const [searchQuery, setSearchQuery] = useState("");
  const [pluginCategory, setPluginCategory] = useState<PluginCategory>("all");

  const plugins = useMemo(() => getPluginsList(pluginCategory), [pluginCategory]);

  const solutionCards: BuildCardItem[] = useMemo(() => {
    let items = SOLUTION_ITEMS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return items.map((s) => ({
      id: s.id,
      title: s.title,
      author: s.author,
      avatar: s.avatar,
      category: s.category,
      likes: s.likes,
      views: s.views,
      visual: s.visual,
      layers: s.layers,
      price: s.price,
      installs: s.installs,
    }));
  }, [searchQuery]);

  const templateCards: BuildCardItem[] = TEMPLATE_ITEMS.map((t) => ({
    id: t.id,
    title: t.title,
    author: t.author,
    avatar: t.avatar,
    category: t.category,
    likes: t.likes,
    views: t.views,
    visual: t.visual,
    layers: t.layers,
    price: t.price,
    installs: t.installs,
  }));

  const featuredSolutions = SOLUTION_ITEMS.filter((s) => s.featured);

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Marketplace</h1>
              <p className="mt-1 text-sm text-zinc-500">Discover community-built solutions, plugins, and templates for your Studio</p>
            </div>
            <Link
              href="/develop"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 px-3.5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 transition-colors shrink-0"
            >
              <Puzzle className="h-3.5 w-3.5" />
              Publish
            </Link>
          </div>
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solutions, plugins, templates..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="px-6 flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-zinc-800/60 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                activeTab === tab.id ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/50 text-zinc-600"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">

          {/* ── Solutions ── */}
          {activeTab === "solutions" && (
            <>
              {!searchQuery && (
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-zinc-200">Featured Solutions</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {featuredSolutions.map((item) => (
                      <div key={item.id} className="group/card relative rounded-xl overflow-hidden border border-zinc-800/40 hover:border-zinc-700/60 transition-all cursor-pointer" style={{ background: "rgba(15, 15, 22, 0.6)" }}>
                        <div className="aspect-[16/9] relative overflow-hidden">
                          <div className="absolute inset-0 transition-transform duration-500 group-hover/card:scale-110" style={{ background: item.visual }}>
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                              {item.layers.map((e, i) => <span key={i} className="text-2xl opacity-15">{e}</span>)}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                            <h3 className="text-base font-semibold text-white">{item.title}</h3>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Link href={`/builders/${encodeURIComponent(item.author)}`} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">by {item.author}</Link>
                              <span className="text-sm font-semibold flex items-center gap-0.5">
                                {item.price === 0 ? <span className="text-emerald-400">Free</span> : <span className="text-amber-400 flex items-center gap-0.5"><Coins className="h-3 w-3" />{item.price.toLocaleString()}</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">All Solutions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {solutionCards.map((item) => (
                    <BuildCard key={item.id} item={item} variant="marketplace" />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── Plugins ── */}
          {activeTab === "plugins" && (
            <>
              <div className="flex items-center gap-1 mb-6 overflow-x-auto">
                {PLUGIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPluginCategory(cat.id)}
                    className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      pluginCategory === cat.id ? "bg-zinc-800/60 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                    }`}
                  >
                    {cat.label}
                    {cat.badge != null && cat.badge > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500/90 px-1 text-[10px] font-bold text-white">{cat.badge}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {plugins.map((plugin) => (
                  <PluginCard key={plugin.id} plugin={plugin} />
                ))}
              </div>
              <div className="mt-8 rounded-xl border border-indigo-500/15 bg-indigo-950/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Puzzle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-100">Build your own plugin</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Create System, UI, or Cloud plugins and earn Credits from every install.</p>
                </div>
                <Link href="/develop" className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                  Open Dev Hub <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            </>
          )}

          {/* ── Templates ── */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {templateCards.map((item) => (
                <BuildCard key={item.id} item={item} variant="marketplace" />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
