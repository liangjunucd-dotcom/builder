"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import { useBilling } from "@/context/BillingContext";
import {
  Box,
  Heart,
  Eye,
  Download,
  Award,
  TrendingUp,
  Puzzle,
  Coins,
  Shield,
  Sparkles,
  GitFork,
  ArrowRight,
  Star,
  Globe2,
  Zap,
  Flame,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

type TabId = "solutions" | "activity" | "plugins" | "reputation";

const BUILDER_LEVELS = [
  { level: 0, name: "Newcomer", min: 0, color: "text-zinc-400", accent: "#71717a" },
  { level: 1, name: "Explorer", min: 100, color: "text-zinc-300", accent: "#a1a1aa" },
  { level: 2, name: "Creator", min: 500, color: "text-blue-400", accent: "#60a5fa" },
  { level: 3, name: "Specialist", min: 2000, color: "text-indigo-400", accent: "#818cf8" },
  { level: 4, name: "Expert", min: 5000, color: "text-purple-400", accent: "#a78bfa" },
  { level: 5, name: "Master", min: 15000, color: "text-amber-400", accent: "#fbbf24" },
  { level: 6, name: "Legend", min: 50000, color: "text-rose-400", accent: "#fb7185" },
];

const MOCK_STATS = {
  reputation: 2340, solutions: 8, plugins: 2,
  totalLikes: 456, totalViews: 12800, totalForks: 89,
  totalInstalls: 1560, creditsEarned: 34500,
  joinedDate: "2024-03-15", rank: 128,
  followers: 186, following: 42,
  totalBuilds: 94, daysActive: 142, currentStreak: 5, dailyAvg: 0.7,
};

const BADGES = [
  { id: "b1", name: "Early Adopter", icon: <Sparkles className="h-3.5 w-3.5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "b2", name: "Publisher", icon: <Box className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "b3", name: "Plugin Dev", icon: <Puzzle className="h-3.5 w-3.5" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { id: "b4", name: "Top 200", icon: <TrendingUp className="h-3.5 w-3.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

const MY_SOLUTIONS = [
  { id: "ms1", title: "3-Bedroom Whole-Home Smart", likes: 123, views: 4500, forks: 34, status: "published" as const, category: "residential" },
  { id: "ms2", title: "Villa Security Solution", likes: 89, views: 2800, forks: 18, status: "published" as const, category: "residential" },
  { id: "ms3", title: "Small Office Energy Saving", likes: 67, views: 1890, forks: 12, status: "published" as const, category: "commercial" },
  { id: "ms4", title: "Apple Home Integration", likes: 156, views: 5200, forks: 45, status: "published" as const, category: "residential" },
  { id: "ms5", title: "Elderly Home Care Solution v2", likes: 0, views: 0, forks: 0, status: "draft" as const, category: "healthcare" },
];

const ACTIVITY_LOG = [
  { id: "a1", action: "published", target: "Apple Home Integration", time: "2 hours ago", icon: <Box className="h-3.5 w-3.5" /> },
  { id: "a2", action: "earned", target: "+200 Credits (Solution Forked)", time: "5 hours ago", icon: <Coins className="h-3.5 w-3.5 text-amber-400" /> },
  { id: "a3", action: "level_up", target: "Leveled Up to Specialist (L3)", time: "1 day ago", icon: <Award className="h-3.5 w-3.5 text-indigo-400" /> },
  { id: "a4", action: "forked", target: "Smart Office by EcoBuilder", time: "2 days ago", icon: <GitFork className="h-3.5 w-3.5" /> },
  { id: "a5", action: "published", target: "Small Office Energy Saving", time: "3 days ago", icon: <Box className="h-3.5 w-3.5" /> },
  { id: "a6", action: "plugin_review", target: "Room Occupancy Heatmap Approved", time: "5 days ago", icon: <Shield className="h-3.5 w-3.5 text-emerald-400" /> },
];

function getBuilderLevel(reputation: number) {
  for (let i = BUILDER_LEVELS.length - 1; i >= 0; i--) {
    if (reputation >= BUILDER_LEVELS[i].min) return BUILDER_LEVELS[i];
  }
  return BUILDER_LEVELS[0];
}

function getNextLevel(reputation: number) {
  for (const level of BUILDER_LEVELS) {
    if (reputation < level.min) return level;
  }
  return null;
}

/* ── Activity Heatmap ── */
function ActivityHeatmap({ totalBuilds }: { totalBuilds: number }) {
  const weeks = 52;
  const days = 7;
  const cells = useMemo(() => {
    const result: number[] = [];
    let s = 33;
    for (let i = 0; i < weeks * days; i++) {
      s = (s * 16807 + 12345) % 2147483647;
      const r = (s % 100) / 100;
      if (r < 0.5) result.push(0);
      else if (r < 0.7) result.push(1);
      else if (r < 0.85) result.push(2);
      else if (r < 0.95) result.push(3);
      else result.push(4);
    }
    return result;
  }, []);

  const ic = (v: number) => {
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
      <div className="flex gap-0 mb-1">
        {months.map((m) => <span key={m} className="text-[9px] text-zinc-600 tabular-nums" style={{ width: `${100 / 12}%` }}>{m}</span>)}
      </div>
      <div className="flex gap-[2px] overflow-x-auto">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[2px]">
            {Array.from({ length: days }).map((_, d) => (
              <div key={d} className={`h-[10px] w-[10px] rounded-[2px] ${ic(cells[w * days + d])}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-zinc-600">Less</span>
        {[0, 1, 2, 3, 4].map((v) => <div key={v} className={`h-[10px] w-[10px] rounded-[2px] ${ic(v)}`} />)}
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { account } = useAccount();
  const { personalCredits, currentMembership } = useBilling();
  const [activeTab, setActiveTab] = useState<TabId>("solutions");

  const currentLevel = getBuilderLevel(MOCK_STATS.reputation);
  const nextLevel = getNextLevel(MOCK_STATS.reputation);
  const progressToNext = nextLevel ? ((MOCK_STATS.reputation - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;
  const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "solutions", label: "Solutions", count: MY_SOLUTIONS.filter((s) => s.status === "published").length },
    { id: "plugins", label: "Plugins", count: MOCK_STATS.plugins },
    { id: "activity", label: "Activity" },
    { id: "reputation", label: "Reputation" },
  ];

  const bannerGradient = currentLevel.level >= 5
    ? "linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)"
    : currentLevel.level >= 4
    ? "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)"
    : currentLevel.level >= 2
    ? "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%)"
    : "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)";

  return (
    <div className="flex h-full flex-col min-h-0 overflow-auto">
      {/* ── Gradient Banner ── */}
      <div className="relative shrink-0">
        <div className="h-32 w-full" style={{ background: bannerGradient }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, white 0%, transparent 60%)" }} />
        </div>

        <div className="relative px-6 -mt-10 flex items-end gap-5">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl border-[3px] border-zinc-950 flex items-center justify-center text-3xl font-bold text-white" style={{ background: bannerGradient }}>
              {(account?.name ?? "B").charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold ${
              currentLevel.level >= 4 ? "bg-purple-500 text-white" : currentLevel.level >= 2 ? "bg-indigo-500 text-white" : "bg-zinc-700 text-zinc-300"
            }`}>
              L{currentLevel.level}
            </div>
          </div>
          <div className="flex-1" />
          <Link
            href="/settings"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="px-6 mt-4">
        <h1 className="text-xl font-semibold text-zinc-100">@{account?.name ?? "Builder"}</h1>
        <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500">
          <span className="font-medium text-zinc-300">{fmtNum(MOCK_STATS.followers)} <span className="font-normal text-zinc-500">followers</span></span>
          <span className="font-medium text-zinc-300">{MOCK_STATS.following} <span className="font-normal text-zinc-500">following</span></span>
        </div>
        <p className="mt-2 text-sm text-zinc-500">{account?.email}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
          <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" />Joined {new Date(MOCK_STATS.joinedDate).toLocaleDateString("en", { year: "numeric", month: "short" })}</span>
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Rank #{MOCK_STATS.rank}</span>
          <span className="flex items-center gap-1"><Award className="h-3 w-3" style={{ color: currentLevel.accent }} /><span className={currentLevel.color}>{currentLevel.name}</span> · {fmtNum(MOCK_STATS.reputation)} rep</span>
          <span className="flex items-center gap-1 text-zinc-500"><span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">{currentMembership.displayName}</span></span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {BADGES.map((b) => (
            <span key={b.id} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${b.color}`}>
              {b.icon}{b.name}
            </span>
          ))}
        </div>

        {/* Level Progress */}
        {nextLevel && (
          <div className="mt-4 max-w-md">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-zinc-500 shrink-0">L{currentLevel.level} → L{nextLevel.level}</span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${progressToNext}%` }} />
              </div>
              <span className="text-[10px] text-zinc-500 tabular-nums shrink-0">{MOCK_STATS.reputation}/{nextLevel.min}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Heatmap ── */}
      <div className="px-6 mt-6">
        <ActivityHeatmap totalBuilds={MOCK_STATS.totalBuilds} />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Daily Average", value: `${MOCK_STATS.dailyAvg} builds` },
            { label: "Days Active", value: `${MOCK_STATS.daysActive} days`, sub: `${Math.round((MOCK_STATS.daysActive / 365) * 100)}% of year` },
            { label: "Current Streak", value: `${MOCK_STATS.currentStreak} days`, sub: MOCK_STATS.currentStreak > 0 ? <Flame className="inline h-3 w-3 text-orange-400" /> : null },
            { label: "Total Builds", value: String(MOCK_STATS.totalBuilds) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-3">
              <p className="text-[11px] text-zinc-600">{stat.label}</p>
              <p className="text-base font-bold text-zinc-100 mt-0.5 tabular-nums">{stat.value}</p>
              {"sub" in stat && stat.sub && <p className="text-[11px] text-zinc-600 mt-0.5">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-6 mt-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-zinc-800/60 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab.id ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/50 text-zinc-500"}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="px-6 py-6 max-w-5xl">
        {activeTab === "solutions" && (
          <div className="space-y-3">
            {MY_SOLUTIONS.map((sol) => (
              <div key={sol.id} className="group rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 flex items-center gap-4 hover:border-zinc-700/60 transition-colors cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/60">
                  <Box className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white">{sol.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      sol.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                    }`}>{sol.status}</span>
                    <span className="text-[10px] text-zinc-600">{sol.category}</span>
                  </div>
                  {sol.status === "published" && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{sol.likes}</span>
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{sol.views.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5"><GitFork className="h-3 w-3" />{sol.forks}</span>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 shrink-0 group-hover:text-zinc-400" />
              </div>
            ))}
            <Link href="/" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 py-3">Create a new solution →</Link>
          </div>
        )}

        {activeTab === "plugins" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10"><Puzzle className="h-5 w-5 text-purple-400" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-100">Room Occupancy Heatmap</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span>UI Plugin</span>
                  <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />89</span>
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400/70" />4.7</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400 tabular-nums">+1,780</span>
            </div>
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10"><Puzzle className="h-5 w-5 text-blue-400" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-100">Smart HVAC Controller</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span>System Plugin</span>
                  <span className="flex items-center gap-0.5"><Download className="h-3 w-3" />234</span>
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400/70" />4.5</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400 tabular-nums">+4,680</span>
            </div>
            <Link href="/develop" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 py-3">Go to Developer Hub →</Link>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-1">
            {ACTIVITY_LOG.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-900/30 transition-colors">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400">{a.icon}</div>
                <p className="flex-1 text-sm text-zinc-300">{a.target}</p>
                <span className="text-xs text-zinc-600 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reputation" && (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Reputation Breakdown</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Solutions Published", value: 800, detail: "8 solutions × 100 base pts", color: "bg-blue-500" },
                  { label: "Community Recognition", value: 920, detail: "456 likes + 89 forks", color: "bg-purple-500" },
                  { label: "Plugin Contributions", value: 400, detail: "2 plugins listed", color: "bg-emerald-500" },
                  { label: "Community Engagement", value: 220, detail: "Q&A, comments, interactions", color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                      <span className="text-sm font-semibold text-zinc-100 tabular-nums">+{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 mb-2">
                      <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${(item.value / 1000) * 100}%` }} />
                    </div>
                    <p className="text-xs text-zinc-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Growth Ladder</h3>
              <div className="space-y-2">
                {BUILDER_LEVELS.map((lvl) => {
                  const isReached = MOCK_STATS.reputation >= lvl.min;
                  const isCurrent = currentLevel.level === lvl.level;
                  return (
                    <div key={lvl.level} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${isCurrent ? "border border-indigo-500/30 bg-indigo-950/10" : isReached ? "bg-zinc-900/20" : "opacity-40"}`}>
                      <span className={`text-sm font-bold w-6 ${isCurrent ? "text-indigo-400" : isReached ? "text-zinc-300" : "text-zinc-600"}`}>L{lvl.level}</span>
                      <span className={`text-sm font-medium flex-1 ${isCurrent ? "text-indigo-300" : isReached ? "text-zinc-200" : "text-zinc-600"}`}>{lvl.name}</span>
                      <span className="text-xs text-zinc-500 tabular-nums">{lvl.min > 0 ? `${lvl.min.toLocaleString()} rep` : "Start"}</span>
                      {isCurrent && <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
                      {isReached && !isCurrent && <Shield className="h-3.5 w-3.5 text-emerald-400/60 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
