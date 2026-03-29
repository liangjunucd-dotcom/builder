"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Award,
  Heart,
  GitFork,
  Users,
  UserPlus,
  UserCheck,
  Globe2,
  Flame,
  BarChart3,
} from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/gallery-data";
import BuildCard from "@/components/BuildCard";

/* ── Builder Levels ── */
const BUILDER_LEVELS = [
  { level: 0, name: "Newcomer", color: "text-zinc-400 bg-zinc-800", accent: "#71717a" },
  { level: 1, name: "Explorer", color: "text-zinc-300 bg-zinc-700", accent: "#a1a1aa" },
  { level: 2, name: "Creator", color: "text-blue-400 bg-blue-500/10", accent: "#60a5fa" },
  { level: 3, name: "Specialist", color: "text-indigo-400 bg-indigo-500/10", accent: "#818cf8" },
  { level: 4, name: "Expert", color: "text-purple-400 bg-purple-500/10", accent: "#a78bfa" },
  { level: 5, name: "Master", color: "text-amber-400 bg-amber-500/10", accent: "#fbbf24" },
  { level: 6, name: "Legend", color: "text-rose-400 bg-rose-500/10", accent: "#fb7185" },
];

/* ── Banner Gradients per Level ── */
const BANNER_GRADIENTS: Record<number, string> = {
  0: "linear-gradient(135deg, #27272a 0%, #3f3f46 50%, #52525b 100%)",
  1: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
  2: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #60a5fa 100%)",
  3: "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%)",
  4: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)",
  5: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)",
  6: "linear-gradient(135deg, #881337 0%, #e11d48 50%, #fb7185 100%)",
};

/* ── Mock Builders ── */
const MOCK_BUILDERS: Record<string, {
  name: string; avatar: string; level: number; reputation: number;
  location: string; joined: string; bio: string;
  solutions: number; plugins: number; followers: number; following: number;
  totalLikes: number; totalForks: number; links: string[];
  totalBuilds: number; daysActive: number; currentStreak: number; dailyAvg: number;
  heatmapSeed: number;
}> = {
  Pro_Builder: {
    name: "Pro_Builder", avatar: "P", level: 5, reputation: 12400,
    location: "Shanghai, China", joined: "2024-01", bio: "Full-stack builder specializing in large-scale smart home deployments. Apple Home ecosystem expert. Building the future of spatial intelligence.",
    solutions: 24, plugins: 6, followers: 1280, following: 45,
    totalLikes: 18200, totalForks: 2340, links: ["https://github.com/probuilder"],
    totalBuilds: 342, daysActive: 280, currentStreak: 14, dailyAvg: 1.2, heatmapSeed: 42,
  },
  HotelTech: {
    name: "HotelTech", avatar: "H", level: 4, reputation: 9800,
    location: "Beijing, China", joined: "2024-03", bio: "Hotel industry smart solutions provider. Focused on guest experience and energy optimization.",
    solutions: 18, plugins: 3, followers: 890, following: 32,
    totalLikes: 12400, totalForks: 1560, links: [],
    totalBuilds: 186, daysActive: 195, currentStreak: 7, dailyAvg: 0.8, heatmapSeed: 17,
  },
  GreenTech: {
    name: "GreenTech", avatar: "G", level: 4, reputation: 7200,
    location: "Shenzhen, China", joined: "2024-05", bio: "Building sustainable smart spaces. Energy efficiency through automation.",
    solutions: 12, plugins: 2, followers: 620, following: 28,
    totalLikes: 8900, totalForks: 1020, links: [],
    totalBuilds: 128, daysActive: 142, currentStreak: 3, dailyAvg: 0.6, heatmapSeed: 91,
  },
  Alex: {
    name: "Alex", avatar: "A", level: 3, reputation: 5600,
    location: "San Francisco, US", joined: "2024-06", bio: "Smart home enthusiast and indie developer. Matter protocol contributor.",
    solutions: 9, plugins: 1, followers: 340, following: 56,
    totalLikes: 4500, totalForks: 580, links: [],
    totalBuilds: 67, daysActive: 98, currentStreak: 0, dailyAvg: 0.4, heatmapSeed: 55,
  },
};

/* ── Activity Heatmap (GitHub-style) ── */
function ActivityHeatmap({ seed, totalBuilds }: { seed: number; totalBuilds: number }) {
  const weeks = 52;
  const days = 7;

  const cells = useMemo(() => {
    const result: number[] = [];
    let s = seed;
    for (let i = 0; i < weeks * days; i++) {
      s = (s * 16807 + 12345) % 2147483647;
      const r = (s % 100) / 100;
      if (r < 0.45) result.push(0);
      else if (r < 0.7) result.push(1);
      else if (r < 0.85) result.push(2);
      else if (r < 0.95) result.push(3);
      else result.push(4);
    }
    return result;
  }, [seed]);

  const intensityClass = (v: number) => {
    switch (v) {
      case 0: return "bg-zinc-800/50";
      case 1: return "bg-indigo-900/60";
      case 2: return "bg-indigo-700/60";
      case 3: return "bg-indigo-500/70";
      case 4: return "bg-indigo-400/80";
      default: return "bg-zinc-800/50";
    }
  };

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-300">{totalBuilds} builds</span>
        <span className="text-xs text-zinc-600">in the last year</span>
      </div>
      {/* Month labels */}
      <div className="flex gap-0 mb-1 pl-0">
        {months.map((m) => (
          <span key={m} className="text-[9px] text-zinc-600 tabular-nums" style={{ width: `${100 / 12}%` }}>{m}</span>
        ))}
      </div>
      {/* Grid */}
      <div className="flex gap-[2px] overflow-x-auto">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[2px]">
            {Array.from({ length: days }).map((_, d) => (
              <div
                key={d}
                className={`h-[10px] w-[10px] rounded-[2px] ${intensityClass(cells[w * days + d])}`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-zinc-600">Less</span>
        {[0, 1, 2, 3, 4].map((v) => (
          <div key={v} className={`h-[10px] w-[10px] rounded-[2px] ${intensityClass(v)}`} />
        ))}
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  );
}

const fmtNum = (n: number) => n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export default function BuilderProfilePage() {
  const params = useParams();
  const username = typeof params.username === "string" ? decodeURIComponent(params.username) : "";
  const [isFollowing, setIsFollowing] = useState(false);

  const builder = MOCK_BUILDERS[username] ?? {
    name: username, avatar: username.charAt(0).toUpperCase(), level: 2, reputation: 1200,
    location: "Earth", joined: "2025-01", bio: "An Aqara Builder.",
    solutions: 3, plugins: 0, followers: 42, following: 10,
    totalLikes: 280, totalForks: 35, links: [],
    totalBuilds: 24, daysActive: 30, currentStreak: 1, dailyAvg: 0.3, heatmapSeed: 7,
  };

  const levelInfo = BUILDER_LEVELS[builder.level] ?? BUILDER_LEVELS[0];
  const bannerGradient = BANNER_GRADIENTS[builder.level] ?? BANNER_GRADIENTS[0];

  const builderSolutions = useMemo(() => {
    const matching = GALLERY_ITEMS.filter((g) => g.author === username);
    if (matching.length > 0) return matching;
    return GALLERY_ITEMS.slice(0, Math.min(builder.solutions, 8));
  }, [username, builder.solutions]);

  return (
    <div className="flex h-full flex-col min-h-0 overflow-auto">
      {/* ── Gradient Banner ── */}
      <div className="relative shrink-0">
        <div className="h-36 w-full" style={{ background: bannerGradient }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, white 0%, transparent 60%)" }} />
        </div>

        {/* Avatar overlapping banner */}
        <div className="relative px-6 -mt-10 flex items-end gap-5">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl border-[3px] border-zinc-950 flex items-center justify-center text-3xl font-bold text-white" style={{ background: bannerGradient }}>
              {builder.avatar}
            </div>
            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold ${
              builder.level >= 5 ? "bg-amber-500 text-black" : builder.level >= 4 ? "bg-purple-500 text-white" : builder.level >= 2 ? "bg-indigo-500 text-white" : "bg-zinc-700 text-zinc-300"
            }`}>
              L{builder.level}
            </div>
          </div>
          <div className="flex-1 min-w-0 pb-1" />
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isFollowing
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                : "bg-white text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            {isFollowing ? <><UserCheck className="h-3.5 w-3.5" /> Following</> : <><UserPlus className="h-3.5 w-3.5" /> Follow</>}
          </button>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="px-6 mt-4">
        <h1 className="text-xl font-semibold text-zinc-100">@{builder.name}</h1>
        <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500">
          <span className="font-medium text-zinc-300">{fmtNum(builder.followers)} <span className="font-normal text-zinc-500">followers</span></span>
          <span className="font-medium text-zinc-300">{builder.following} <span className="font-normal text-zinc-500">following</span></span>
        </div>
        {builder.bio && <p className="mt-3 text-sm text-zinc-400 max-w-2xl leading-relaxed">{builder.bio}</p>}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{builder.location}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {builder.joined}</span>
          <span className="flex items-center gap-1"><Award className="h-3 w-3" style={{ color: levelInfo.accent }} /><span className={levelInfo.color.split(" ")[0]}>{levelInfo.name}</span> · {fmtNum(builder.reputation)} rep</span>
          {builder.links.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              <Globe2 className="h-3 w-3" />{new URL(link).hostname}
            </a>
          ))}
        </div>
      </div>

      {/* ── Projects ── */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {builderSolutions.map((item) => (
            <BuildCard key={item.id} item={item} variant="explore" />
          ))}
        </div>
        {builderSolutions.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-600">
            This builder hasn&apos;t published any solutions yet.
          </div>
        )}
      </div>

      {/* ── Activity Heatmap + Stats ── */}
      <div className="px-6 mt-8 pb-8">
        <ActivityHeatmap seed={builder.heatmapSeed} totalBuilds={builder.totalBuilds} />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Daily Average", value: `${builder.dailyAvg} builds`, sub: null },
            { label: "Days Active", value: `${builder.daysActive} days`, sub: `${Math.round((builder.daysActive / 365) * 100)}% of year` },
            { label: "Current Streak", value: `${builder.currentStreak} days`, sub: builder.currentStreak > 0 ? <Flame className="inline h-3 w-3 text-orange-400" /> : null },
            { label: "Total Builds", value: fmtNum(builder.totalBuilds), sub: null },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4">
              <p className="text-xs text-zinc-600">{stat.label}</p>
              <p className="text-lg font-bold text-zinc-100 mt-1 tabular-nums">{stat.value}</p>
              {stat.sub && <p className="text-[11px] text-zinc-600 mt-0.5">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
