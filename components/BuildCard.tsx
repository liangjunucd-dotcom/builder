"use client";

import React from "react";
import Link from "next/link";
import { Heart, Eye, GitFork, RotateCcw, Download, Coins } from "lucide-react";
import { CATEGORIES, CAT_COLORS, type CategoryId } from "@/lib/gallery-data";

export interface BuildCardItem {
  id: string;
  title: string;
  author: string;
  avatar: string;
  category?: Exclude<CategoryId, "all">;
  likes: number | string;
  views: number | string;
  visual: string;
  layers?: string[];
  price?: number | "Free";
  installs?: number | string;
}

interface BuildCardProps {
  item: BuildCardItem;
  /** "explore" = Fork action, "home" = Reuse action, "marketplace" = Get action with price */
  variant?: "explore" | "home" | "marketplace";
  /** Main click handler (card body) */
  onClick?: () => void;
  /** Secondary action button handler (e.g. Reuse prompt) */
  onAction?: (e: React.MouseEvent) => void;
  /** Optional link destination — wraps the card in a Next.js Link */
  href?: string;
}

const fmtNum = (n: number | string) => {
  if (typeof n === "string") return n;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
};

export function BuildCard({ item, variant = "explore", onClick, onAction, href }: BuildCardProps) {
  const catStyle = item.category ? (CAT_COLORS[item.category] ?? "text-zinc-400 bg-zinc-800") : "";
  const catLabel = item.category ? CATEGORIES.find((c) => c.id === item.category)?.label : null;

  const actionLabel = variant === "home" ? "Reuse" : variant === "marketplace" ? "Get" : "Fork";
  const ActionIcon = variant === "home" ? RotateCcw : variant === "marketplace" ? Download : GitFork;
  const showPrice = variant === "marketplace" && item.price !== undefined;

  const authorHref = `/builders/${encodeURIComponent(item.author)}`;

  const card = (
    <div
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group/card cursor-pointer rounded-2xl border border-zinc-800/40 overflow-hidden text-left hover:border-zinc-700/50 hover:shadow-lg hover:shadow-black/20 transition-all duration-300"
      style={{ background: "rgba(15, 15, 22, 0.6)" }}
    >
      {/* Visual */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover/card:scale-105"
          style={{ background: item.visual }}
        >
          {item.layers && (
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              {item.layers.map((emoji, i) => (
                <span key={i} className="text-3xl opacity-15">{emoji}</span>
              ))}
            </div>
          )}
        </div>

        {/* Category badge */}
        {catLabel && (
          <span className={`absolute top-3 left-3 rounded-lg px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${catStyle}`}>
            {catLabel}
          </span>
        )}

        {/* Price badge (marketplace only) */}
        {showPrice && (
          <span className={`absolute top-3 right-3 flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
            item.price === 0 || item.price === "Free"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-black/50 text-amber-400"
          }`}>
            {item.price === 0 || item.price === "Free" ? (
              "Free"
            ) : (
              <><Coins className="h-3 w-3" />{typeof item.price === "number" ? item.price.toLocaleString() : item.price}</>
            )}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
          <Link
            href={authorHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-white ring-1 ring-white/10">
              {item.avatar}
            </div>
            <span className="text-xs text-white/90 font-medium">{item.author}</span>
          </Link>
          {onAction ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAction(e); }}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/25 transition-colors"
            >
              <ActionIcon className="h-3 w-3" /> {actionLabel}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white">
              <ActionIcon className="h-3 w-3" /> {actionLabel}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-[13px] font-semibold text-zinc-100 truncate leading-snug">{item.title}</p>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={authorHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700/60 text-[8px] font-bold text-zinc-300">
              {item.avatar}
            </div>
            <span className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">{item.author}</span>
          </Link>
          <div className="flex items-center gap-3 text-zinc-500">
            <span className="flex items-center gap-1 text-[11px]">
              <Heart className="h-3 w-3" />{fmtNum(item.likes)}
            </span>
            {variant === "marketplace" && item.installs !== undefined ? (
              <span className="flex items-center gap-1 text-[11px]">
                <Download className="h-3 w-3" />{fmtNum(item.installs)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px]">
                <Eye className="h-3 w-3" />{fmtNum(item.views)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{card}</Link>;
  }
  return card;
}

export default BuildCard;
