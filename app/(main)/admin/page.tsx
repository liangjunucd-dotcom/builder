"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "@/context/AccountContext";
import { useBilling } from "@/context/BillingContext";
import {
  Coins,
  ArrowRight,
  Building2,
  Sparkles,
  Zap,
  Users,
  Shield,
  TrendingDown,
  TrendingUp,
  Clock,
  Cpu,
  Star as StarIcon,
  Puzzle,
  Cloud,
  ArrowUpRight,
} from "lucide-react";
import {
  membershipTiers,
  membershipPricing,
  getMockWorkspaceCreditBalance,
  mockPersonalCredits,
  mockCreditTransactions,
  mockPartnerContractActive,
} from "@/lib/billing-mock";
import { canManageSpaceBilling } from "@/lib/workspace-model";
import type { MembershipTier } from "@/lib/billing-types";

const TIER_ICON: Record<MembershipTier, React.ReactNode> = {
  free: <Sparkles className="h-5 w-5" />,
  explorer: <Sparkles className="h-5 w-5" />,
  builder: <Zap className="h-5 w-5" />,
  master: <Zap className="h-5 w-5" />,
  team: <Users className="h-5 w-5" />,
};

const TIER_ACCENT: Record<MembershipTier, { bg: string; text: string; border: string; gradFrom: string }> = {
  free: { bg: "bg-zinc-800/50", text: "text-zinc-300", border: "border-zinc-700", gradFrom: "from-zinc-700" },
  explorer: { bg: "bg-sky-950/30", text: "text-sky-400", border: "border-sky-600/50", gradFrom: "from-sky-600" },
  builder: { bg: "bg-blue-950/30", text: "text-blue-400", border: "border-blue-600/50", gradFrom: "from-blue-600" },
  master: { bg: "bg-purple-950/30", text: "text-purple-400", border: "border-purple-600/50", gradFrom: "from-purple-600" },
  team: { bg: "bg-emerald-950/30", text: "text-emerald-400", border: "border-emerald-600/50", gradFrom: "from-emerald-600" },
};

const usageBreakdown = [
  { label: "AI Build", amount: 1800, icon: <Cpu className="h-3.5 w-3.5" />, color: "bg-blue-500" },
  { label: "Templates / Plugins", amount: 650, icon: <Puzzle className="h-3.5 w-3.5" />, color: "bg-amber-500" },
  { label: "Cloud Storage / Sync", amount: 200, icon: <Cloud className="h-3.5 w-3.5" />, color: "bg-indigo-500" },
  { label: "Video Rendering", amount: 150, icon: <Sparkles className="h-3.5 w-3.5" />, color: "bg-purple-500" },
];
const totalUsed = usageBreakdown.reduce((s, i) => s + i.amount, 0);

export default function BillingPage() {
  const { currentSpace, spaces, account } = useAccount();
  const { membershipTier, personalCredits } = useBilling();

  const currentPlan = membershipTiers[membershipTier];
  const pricing = membershipPricing[membershipTier];
  const accent = TIER_ACCENT[membershipTier];

  const managedSpaces = spaces.filter((s) => canManageSpaceBilling(s, account?.id));

  const usagePercent = mockPersonalCredits.allowanceThisMonthFromMember > 0
    ? Math.round((mockPersonalCredits.usedThisMonthFromMember / mockPersonalCredits.allowanceThisMonthFromMember) * 100)
    : 0;

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm shrink-0">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Billing & Credits</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Your plan, credit balance, and usage details</p>
          </div>
          <Link
            href="/plans"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            View All Plans
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">

          {/* ─── Current Plan ─── */}
          <section className={`rounded-2xl border ${accent.border} overflow-hidden`}>
            <div className={`${accent.bg} px-6 py-5 flex items-start justify-between gap-4`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.bg} ${accent.text} border ${accent.border}`}>
                  {TIER_ICON[membershipTier]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-zinc-100">{currentPlan.displayName}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${accent.text} border ${accent.border}`}>
                      Current Plan
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {pricing.monthly === 0 ? "Free" : `¥${pricing.monthly}/mo`}
                    {pricing.monthly > 0 && " · "}
                    {currentPlan.monthlyPersonalCredits.toLocaleString()} credits/month included
                  </p>
                </div>
              </div>
              <Link
                href="/plans"
                className="shrink-0 rounded-lg border border-zinc-600 px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              >
                Upgrade Plan
              </Link>
            </div>
            <div className="px-6 py-3 border-t border-zinc-800/30 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center bg-zinc-950/30">
              <div>
                <p className="text-[11px] text-zinc-500">Workspaces</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">
                  {managedSpaces.length} / {currentPlan.workspaceLimits.maxOwnedWorkspaces < 0 ? "∞" : currentPlan.workspaceLimits.maxOwnedWorkspaces}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Member Limit</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{currentPlan.workspaceLimits.maxMembersPerSpace}/workspace</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Project Limit</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{currentPlan.workspaceLimits.maxProjects}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">AI Build</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{currentPlan.workspaceLimits.aiEnabled ? "✓" : "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Studio Binding</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{currentPlan.workspaceLimits.maxStudios}</p>
              </div>
            </div>
          </section>

          {/* ─── Credits Overview ─── */}
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-zinc-200">My Credits</h2>
              </div>
              <Link
                href="/plans#credits"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Credit Details →
              </Link>
            </div>

            <div className="px-6 py-5">
              {/* Balance row */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-4xl font-bold tabular-nums text-white tracking-tight">
                    {personalCredits.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">Available credits</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingDown className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">Used this month</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{mockPersonalCredits.usedThisMonthFromMember.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm mt-1">
                    <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">Monthly allowance</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{mockPersonalCredits.allowanceThisMonthFromMember.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500">Monthly usage</span>
                  <span className="text-zinc-400 font-medium">{usagePercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div
                    className={`h-2 rounded-full transition-all ${usagePercent > 80 ? "bg-amber-500" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(100, usagePercent)}%` }}
                  />
                </div>
              </div>

              {/* Quick top-up */}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
                >
                  <Coins className="h-3.5 w-3.5" />
                  Top Up Credits
                </Link>
                <p className="text-xs text-zinc-600">Top up on demand when credits run low — instant delivery</p>
              </div>
            </div>
          </section>

          {/* ─── Usage Breakdown ─── */}
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-200">Usage Breakdown This Month</h2>
            </div>
            <div className="px-6 py-4">
              {/* Stacked bar */}
              <div className="h-3 rounded-full bg-zinc-800 flex overflow-hidden">
                {usageBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className={`${item.color} first:rounded-l-full last:rounded-r-full`}
                    style={{ width: totalUsed > 0 ? `${(item.amount / totalUsed) * 100}%` : "0%" }}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {usageBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <span className="ml-auto text-sm font-medium text-zinc-300 tabular-nums">{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Transaction History ─── */}
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center gap-2">
              <Coins className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-200">Credit Transactions</h2>
            </div>
            <div className="divide-y divide-zinc-800/30">
              {mockCreditTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-6 py-3.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.amount >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800/60 text-zinc-500"}`}>
                    {t.amount >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{t.description}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{t.createdAt}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${t.amount >= 0 ? "text-emerald-400" : "text-zinc-400"}`}>
                    {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-zinc-800/40 text-center">
              <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">View all transactions →</button>
            </div>
          </section>

          {/* ─── Managed Workspaces ─── */}
          <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Managed Workspaces</h2>
              <span className="ml-auto text-xs text-zinc-600">
                {managedSpaces.length} / {currentPlan.workspaceLimits.maxOwnedWorkspaces < 0 ? "∞" : currentPlan.workspaceLimits.maxOwnedWorkspaces} workspaces
              </span>
            </div>
            {managedSpaces.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-zinc-500">No workspaces managed by you</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/30">
                {managedSpaces.map((space) => {
                  const isCurrent = currentSpace?.id === space.id;
                  return (
                    <div key={space.id} className={`px-6 py-4 ${isCurrent ? "bg-emerald-950/5" : ""}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300">
                            {space.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-100 truncate">{space.name}</span>
                              {isCurrent && <span className="text-[10px] font-medium text-emerald-400 shrink-0">Active</span>}
                            </div>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Uses your credits · Cap: {currentPlan.displayName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-500">
                          <span>{space.members.length} members</span>
                          <span>{space.studioIds.length} Studio</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── Enterprise Contract ─── */}
          {currentSpace?.verified && (
            <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Enterprise Partnership</h2>
              </div>
              <div className="px-6 py-5">
                <p className="font-medium text-zinc-100">{mockPartnerContractActive.displayName}</p>
                <p className="text-xs text-zinc-500 mt-1">{mockPartnerContractActive.period.start} ~ {mockPartnerContractActive.period.end}</p>
                {mockPartnerContractActive.dedicatedCreditPool != null && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-zinc-500">Dedicated Credit Pool</span>
                      <span className="text-zinc-300 tabular-nums">
                        {(mockPartnerContractActive.usedCreditPool ?? 0).toLocaleString()} / {mockPartnerContractActive.dedicatedCreditPool.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, ((mockPartnerContractActive.usedCreditPool ?? 0) / mockPartnerContractActive.dedicatedCreditPool) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
