"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getPluginsList,
  PLUGIN_CATEGORIES,
  type PluginCategory,
  type PluginListItem,
} from "@/lib/plugins-mock";
import { Download, Heart } from "lucide-react";

export default function SquarePage() {
  const searchParams = useSearchParams();
  const filterFromUrl = (searchParams.get("filter") as PluginCategory) || "all";
  const [category, setCategory] = useState<PluginCategory>(filterFromUrl);

  const list = useMemo(() => getPluginsList(category), [category]);

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Plugin Square</h1>
        <p className="mt-1 text-sm text-zinc-500">Browse and install official and community plugins: bridge services, protocols, device integration, and drivers</p>
      </div>

      {/* 分类 Tab */}
      <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950/50 px-6 py-2 overflow-x-auto">
        {PLUGIN_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === "all" ? "/square" : `/square?filter=${encodeURIComponent(cat.id)}`}
            onClick={(e) => {
              e.preventDefault();
              setCategory(cat.id);
            }}
            className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              category === cat.id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            {cat.label}
            {cat.badge != null && cat.badge > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500/90 px-1 text-[10px] font-bold text-white">
                {cat.badge}
              </span>
            )}
            {category === cat.id && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-blue-500" />
            )}
          </Link>
        ))}
      </div>

      {/* 插件卡片网格 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {list.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PluginCard({ plugin }: { plugin: PluginListItem }) {
  const priceLabel = plugin.price === "Free" ? "Free" : `$ ${plugin.price}`;
  return (
    <Link
      href={`/square/${plugin.id}`}
      className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="relative aspect-[4/3] w-full bg-zinc-800/80 flex items-center justify-center overflow-hidden">
        <div className={`h-full w-full transition-colors ${
          plugin.badge === "Official" ? "bg-gradient-to-br from-blue-600/30 via-indigo-700/20 to-zinc-800/80" :
          plugin.badge === "Matter" ? "bg-gradient-to-br from-emerald-600/25 via-teal-700/20 to-zinc-800/80" :
          plugin.badge === "Beta" ? "bg-gradient-to-br from-amber-600/20 via-orange-700/15 to-zinc-800/80" :
          "bg-gradient-to-br from-indigo-600/20 via-zinc-700/30 to-zinc-800/80"
        }`} />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 0%, transparent 50%)" }} />
        <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white/20">
          {plugin.title.charAt(0)}
        </span>
        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
            plugin.badge === "Official"
              ? "bg-blue-500/20 text-blue-400"
              : plugin.badge === "Matter"
                ? "bg-emerald-500/20 text-emerald-400"
                : plugin.badge === "Beta"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-zinc-600/80 text-zinc-400"
          }`}
        >
          {plugin.badge}
        </span>
      </div>
      <div className="flex flex-col p-4">
        <h3 className="font-medium text-zinc-100 line-clamp-2">{plugin.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-5 w-5 rounded-full bg-zinc-600 flex items-center justify-center text-[10px] font-medium text-zinc-300">
            {plugin.author.charAt(0)}
          </span>
          {plugin.author}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-300">{priceLabel}</span>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {plugin.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {plugin.likes}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
