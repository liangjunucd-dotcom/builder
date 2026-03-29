"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Users,
  Globe2,
  Award,
  ChevronRight,
  Radio,
  Play,
} from "lucide-react";
import {
  GALLERY_ITEMS,
  CATEGORIES,
  type CategoryId,
} from "@/lib/gallery-data";
import { BuildCard } from "@/components/BuildCard";

type SortBy = "popular" | "trending" | "newest";

const STATS = [
  { label: "Builds", value: "6,240+", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { label: "Builders", value: "2,180+", icon: <Users className="h-3.5 w-3.5" /> },
  { label: "Countries", value: "38", icon: <Globe2 className="h-3.5 w-3.5" /> },
];

const TOP_BUILDERS = [
  { name: "Pro_Builder", avatar: "P", rep: 12400, solutions: 24, badge: "Master" },
  { name: "HotelTech", avatar: "H", rep: 9800, solutions: 18, badge: "Expert" },
  { name: "GreenTech", avatar: "G", rep: 7200, solutions: 12, badge: "Expert" },
  { name: "Alex", avatar: "A", rep: 5600, solutions: 9, badge: "Specialist" },
  { name: "SafeHome", avatar: "S", rep: 4100, solutions: 7, badge: "Specialist" },
];

export default function ExplorePage() {
  const [category, setCategory] = useState<CategoryId>("all");
  const [sortBy, setSortBy] = useState<SortBy>("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    let items = category === "all" ? [...GALLERY_ITEMS] : GALLERY_ITEMS.filter((g) => g.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.author.toLowerCase().includes(q));
    }
    if (sortBy === "popular") items.sort((a, b) => b.likes - a.likes);
    else if (sortBy === "trending") items.sort((a, b) => b.views - a.views);
    return items;
  }, [category, sortBy, searchQuery]);

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Explore</h1>
              <p className="mt-1 text-sm text-zinc-500">Discover what Builders around the world are creating with Aqara Studio</p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  {s.icon}
                  <span className="font-semibold text-zinc-300 tabular-nums">{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search builds, builders, categories..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/40 focus:outline-none transition-colors"
            />
          </div>
        </div>
        {/* Category tabs + sort */}
        <div className="px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`relative whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  category === cat.id ? "bg-zinc-800/60 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 focus:outline-none"
          >
            <option value="popular">Most Liked</option>
            <option value="trending">Most Viewed</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          {/* Featured Hero Section — MakerWorld style */}
          {category === "all" && !searchQuery && filteredItems.length >= 4 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Hero large card */}
                <Link href={`/explore/${filteredItems[0].id}`} className="md:col-span-2 xl:row-span-2 group/hero relative rounded-2xl overflow-hidden">
                  <div className="aspect-[16/9] xl:aspect-auto xl:h-full min-h-[280px] relative">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover/hero:scale-105" style={{ background: filteredItems[0].visual }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {filteredItems[0].layers && (
                      <div className="absolute inset-0 flex items-center justify-center gap-4">
                        {filteredItems[0].layers.map((emoji, i) => (
                          <span key={i} className="text-5xl opacity-10">{emoji}</span>
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-block rounded-lg bg-indigo-500/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-indigo-300 mb-2">Featured</span>
                      <h3 className="text-lg font-bold text-white mb-1">{filteredItems[0].title}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 mb-3">{filteredItems[0].description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">{filteredItems[0].avatar}</div>
                          <span className="text-xs text-white/80">{filteredItems[0].author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/50 text-[11px]">
                          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />{filteredItems[0].likes}</span>
                          <span className="flex items-center gap-1"><Play className="h-3 w-3" />{filteredItems[0].views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Secondary featured cards */}
                {filteredItems.slice(1, 4).map((item) => (
                  <Link key={item.id} href={`/explore/${item.id}`} className="group/feat relative rounded-2xl overflow-hidden">
                    <div className="aspect-[16/9] relative">
                      <div className="absolute inset-0 transition-transform duration-500 group-hover/feat:scale-105" style={{ background: item.visual }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {item.layers && (
                        <div className="absolute inset-0 flex items-center justify-center gap-3">
                          {item.layers.map((emoji, i) => (
                            <span key={i} className="text-3xl opacity-10">{emoji}</span>
                          ))}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-5 w-5 rounded-full bg-zinc-700/80 flex items-center justify-center text-[8px] font-bold text-white">{item.avatar}</div>
                          <span className="text-[11px] text-white/70">{item.author}</span>
                          <span className="ml-auto text-[10px] text-white/40 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />{item.likes}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Experience CTA */}
          {category === "all" && !searchQuery && (
            <Link
              href="/experience"
              className="mb-6 flex items-center gap-4 rounded-xl border border-indigo-500/15 bg-indigo-950/10 p-4 hover:bg-indigo-950/20 transition-colors group block"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Radio className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">Experience a live Studio space</p>
                <p className="text-xs text-zinc-500 mt-0.5">Connect to a live demo space or explore in a sandbox</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-indigo-400 group-hover:text-indigo-300">
                <Play className="h-3.5 w-3.5" /> Try now
              </div>
            </Link>
          )}

          <div className="flex gap-8">
            {/* Main Grid — responsive MakerWorld layout */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {(category === "all" && !searchQuery ? filteredItems.slice(4) : filteredItems).map((item) => (
                  <BuildCard
                    key={item.id}
                    item={item}
                    variant="explore"
                    href={`/explore/${item.id}`}
                  />
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <Search className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No builds found</p>
                </div>
              )}
            </div>

            {/* Right sidebar: Top Builders */}
            {category === "all" && !searchQuery && (
              <aside className="hidden 2xl:block w-56 shrink-0">
                <div className="sticky top-0 rounded-xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-zinc-200">Top Builders</h3>
                    </div>
                  </div>
                  <div className="p-2">
                    {TOP_BUILDERS.map((builder, i) => (
                      <Link
                        key={builder.name}
                        href={`/builders/${encodeURIComponent(builder.name)}`}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-800/40 transition-colors"
                      >
                        <span className="text-xs font-bold text-zinc-600 w-4 text-right tabular-nums">{i + 1}</span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700/80 text-[9px] font-bold text-zinc-200">
                          {builder.avatar}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200 truncate">{builder.name}</p>
                          <p className="text-[10px] text-zinc-600">{builder.solutions} solutions</p>
                        </div>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          builder.badge === "Master" ? "text-amber-400 bg-amber-500/10" :
                          builder.badge === "Expert" ? "text-purple-400 bg-purple-500/10" :
                          "text-indigo-400 bg-indigo-500/10"
                        }`}>{builder.badge}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-zinc-800/40">
                    <Link href="/profile" className="flex items-center justify-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                      View leaderboard <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
