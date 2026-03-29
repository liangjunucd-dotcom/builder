"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Users,
  Building2,
  Cpu,
  Cloud,
  Globe2,
  Puzzle,
  BarChart3,
  ArrowRight,
  Coins,
  Shield,
  Rocket,
  Star,
} from "lucide-react";
import { membershipTiers, membershipPricing } from "@/lib/billing-mock";
import type { MembershipTier } from "@/lib/billing-types";
import { useBilling } from "@/context/BillingContext";
import { useAccount } from "@/context/AccountContext";

const TIER_ORDER: MembershipTier[] = ["free", "explorer", "builder", "master", "team"];

const TIER_META: Record<
  MembershipTier,
  {
    tagline: string;
    description: string;
    icon: React.ReactNode;
    accent: string;
    accentBg: string;
    accentBorder: string;
    btn: string;
    popular?: boolean;
  }
> = {
  free: {
    tagline: "Get Started",
    description: "Explore the platform and try basic creation tools for free",
    icon: <Sparkles className="h-5 w-5" />,
    accent: "text-zinc-300",
    accentBg: "bg-zinc-800/40",
    accentBorder: "border-zinc-700/60",
    btn: "bg-zinc-700 hover:bg-zinc-600",
  },
  explorer: {
    tagline: "Explore & Launch",
    description: "Explore and launch your ideas with 2,000 credits monthly",
    icon: <Sparkles className="h-5 w-5" />,
    accent: "text-sky-400",
    accentBg: "bg-sky-950/20",
    accentBorder: "border-sky-600/40",
    btn: "bg-sky-600 hover:bg-sky-700",
  },
  builder: {
    tagline: "Build More",
    description: "Build more with smarter tools, 5,000 credits and advanced features",
    icon: <Zap className="h-5 w-5" />,
    accent: "text-blue-400",
    accentBg: "bg-blue-950/20",
    accentBorder: "border-blue-600/40",
    btn: "bg-blue-600 hover:bg-blue-700",
    popular: true,
  },
  master: {
    tagline: "Full Control",
    description: "Unlock full control and flexibility with 10,000 credits",
    icon: <Zap className="h-5 w-5" />,
    accent: "text-purple-400",
    accentBg: "bg-purple-950/20",
    accentBorder: "border-purple-600/40",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
  team: {
    tagline: "Scale Together",
    description: "Collaborate, share, and scale together with 20,000 credits",
    icon: <Users className="h-5 w-5" />,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-950/20",
    accentBorder: "border-emerald-600/40",
    btn: "bg-emerald-600 hover:bg-emerald-700",
  },
};

const VALUE_PILLARS = [
  {
    icon: <Cpu className="h-5 w-5" />,
    title: "AI Build",
    description: "Describe your needs in natural language; AI generates automation solutions, dashboards, and space layouts",
    free: "Basic",
    paid: "Full capability + continuous optimization",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: "Cloud Services",
    description: "Cloud backup, cross-device sync, remote Studio management, version history",
    free: "—",
    paid: "Full cloud services",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Data & Analytics",
    description: "Energy stats, usage analytics, space insights, AI-driven optimization recommendations",
    free: "—",
    paid: "Basic → Advanced",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: <Globe2 className="h-5 w-5" />,
    title: "Community & Marketplace",
    description: "Publish solutions to the community, sell plugins and templates on the Marketplace, earn revenue",
    free: "Browse",
    paid: "Publish + Sell",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Collaboration",
    description: "Invite team members, real-time co-editing, role-based permissions",
    free: "3 / workspace",
    paid: "15–50",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: <Puzzle className="h-5 w-5" />,
    title: "Plugin Ecosystem",
    description: "Install protocol, algorithm, and dashboard plugins to extend Studio capabilities",
    free: "Free plugins only",
    paid: "Develop + Publish + Earn",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
];

const CREDITS_USAGE = [
  { action: "AI Build · Automation Solution", cost: "100–500", icon: <Zap className="h-4 w-4 text-blue-400" /> },
  { action: "AI Build · 3D Space Generation", cost: "200–1,000", icon: <Cpu className="h-4 w-4 text-indigo-400" /> },
  { action: "AI Video Rendering (10s)", cost: "500–2,000", icon: <Sparkles className="h-4 w-4 text-purple-400" /> },
  { action: "Purchase Community Templates", cost: "500–5,000", icon: <Star className="h-4 w-4 text-amber-400" /> },
  { action: "Purchase Plugins", cost: "1,000–10,000", icon: <Puzzle className="h-4 w-4 text-emerald-400" /> },
  { action: "Cloud Backup · Storage", cost: "Included in plan", icon: <Cloud className="h-4 w-4 text-cyan-400" /> },
];

const CREDITS_EARN = [
  { action: "Monthly Plan Bonus", earn: "1,000–50,000", note: "Depends on plan" },
  { action: "Solution used by others", earn: "+10 / use", note: null },
  { action: "Solution forked", earn: "+20 / fork", note: null },
  { action: "First solution published", earn: "+500", note: "One-time" },
  { action: "Invite new user", earn: "+200 / user", note: null },
  { action: "Marketplace sales", earn: "After platform fee", note: "15–30% platform fee" },
];

const TOP_UP = [
  { price: 9.9, credits: 1_000, perCredit: "$0.01", discount: null },
  { price: 29, credits: 3_500, perCredit: "$0.0083", discount: "17% off" },
  { price: 99, credits: 15_000, perCredit: "$0.0066", discount: "34% off" },
];

type CompareCategory = {
  category: string;
  rows: { label: string; values: [string, string, string, string, string] }[];
};

const COMPARE: CompareCategory[] = [
  {
    category: "Credits & Pricing",
    rows: [
      { label: "Monthly credits", values: ["500", "2,000", "5,000", "10,000", "20,000"] },
      { label: "Building requests", values: ["~20", "~80", "~200", "~400", "~800"] },
      { label: "Monthly price", values: ["$0", "$19", "$49", "$99", "$199"] },
      { label: "Assets storage", values: ["500 MB", "2 GB", "10 GB", "20 GB", "50 GB"] },
    ],
  },
  {
    category: "AI & Creation",
    rows: [
      { label: "AI Build", values: ["Basic", "✓", "✓", "✓", "✓"] },
      { label: "AI 3D Space Generation", values: ["—", "—", "✓", "✓", "✓"] },
      { label: "AI Video Rendering", values: ["—", "—", "✓", "✓", "✓"] },
      { label: "Private mode", values: ["—", "✓", "✓", "✓", "✓"] },
      { label: "Advanced features", values: ["—", "—", "✓", "✓", "✓"] },
    ],
  },
  {
    category: "Cloud Services",
    rows: [
      { label: "Cloud backup", values: ["—", "✓", "✓", "✓", "✓"] },
      { label: "Cross-device sync", values: ["—", "✓", "✓", "✓", "✓"] },
      { label: "Remote Studio management", values: ["—", "—", "✓", "✓", "✓"] },
      { label: "Data & Analytics", values: ["—", "—", "Basic", "Advanced", "Advanced"] },
    ],
  },
  {
    category: "Community & Marketplace",
    rows: [
      { label: "Community browsing", values: ["✓", "✓", "✓", "✓", "✓"] },
      { label: "Publish to community", values: ["—", "✓", "✓", "✓ + Featured", "✓ + Featured"] },
      { label: "Plugin development", values: ["—", "—", "✓", "✓", "✓"] },
      { label: "Marketplace storefront", values: ["—", "—", "L4+", "✓", "✓"] },
    ],
  },
  {
    category: "Workspace & Collaboration",
    rows: [
      { label: "Workspaces", values: ["1", "2", "5", "10", "15"] },
      { label: "Members / workspace", values: ["1", "3", "10", "25", "50"] },
      { label: "Projects", values: ["3", "10", "50", "100", "200"] },
      { label: "Studios", values: ["1", "3", "15", "50", "100"] },
      { label: "Workspace Credits Pool", values: ["—", "—", "—", "✓", "✓"] },
    ],
  },
  {
    category: "Delivery & Support",
    rows: [
      { label: "Service Hub", values: ["—", "—", "Basic", "Full", "Full"] },
      { label: "Customer management", values: ["—", "—", "—", "✓", "✓"] },
      { label: "Support", values: ["Community", "Email", "Email", "Priority", "Priority"] },
      { label: "Community identity", values: ["Starter", "Explorer", "Builder", "Master", "Team Lead"] },
    ],
  },
];

const FAQS = [
  {
    q: "Is Aqara Studio free to use locally?",
    a: "Yes. Aqara Studio runs completely free locally — device control, scenes, automations, and other core capabilities require no subscription. The paid value of the Builder platform lies in AI creation, cloud services, community ecosystem, and team collaboration.",
  },
  {
    q: "What are Credits?",
    a: "Credits are the unified currency within the Builder platform. They are used for AI Build, purchasing templates/plugins, video rendering, and more. Each month you receive credits based on your plan, and you can earn more through community activity, publishing solutions, or topping up.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "You can top up on demand at any time with instant delivery. You can also wait for your monthly plan allowance to reset. Free users receive 1,000 credits per month (approximately 5–10 basic AI Builds).",
  },
  {
    q: "Do team members need to purchase their own plans?",
    a: "No. Workspace capabilities are determined by the Owner's plan, and members share those capabilities within the workspace. A member's personal plan only affects their own workspaces and personal credits.",
  },
  {
    q: "Does working in someone else's workspace consume my credits?",
    a: "No. When working in another user's workspace, the Owner's credit pool is consumed (Team+ plans have a dedicated Workspace Credits Pool). Your personal credits are unaffected.",
  },
  {
    q: "When does an upgrade take effect?",
    a: "Immediately. Monthly credits are delivered instantly and workspace capabilities are upgraded at the same time.",
  },
  {
    q: "Can I downgrade at any time?",
    a: "Yes. After downgrading, you retain full access to your current plan's features for the remainder of the billing cycle. Starting from the next cycle, the new plan takes effect. Workspaces, members, and projects exceeding the new plan's limits won't be deleted, but will be placed in a read-only frozen state — you can view and export, but cannot add or edit until you remove excess content or upgrade again. Studio bindings that exceed limits will enter an offline pending-migration state.",
  },
  {
    q: "What happens if workspace members exceed the limit after downgrading?",
    a: "Existing members will not be automatically removed. However, the Owner cannot add new members once the limit is exceeded, and the system will display a notice in workspace settings. The Owner can choose to remove extra members or upgrade the plan. During the frozen period, all existing members can still access and view content normally.",
  },
  {
    q: "How can I earn money through the Builder platform?",
    a: "Publish quality solutions and plugins to the Marketplace. When other users purchase them, you earn credit revenue (minus 15–30% platform fee). Once your accumulated earnings reach the threshold, you can request a withdrawal.",
  },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const { membershipTier: currentTier, setMembershipTier, addCredits } = useBilling();
  const { account } = useAccount();

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-4xl px-6 pt-12 pb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 mb-6">
              <Rocket className="h-3.5 w-3.5 text-blue-400" />
              Studio free locally · Builder cloud value-add
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              Choose the Right Plan
            </h1>
            <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Aqara Studio runs free locally, forever. The Builder platform provides AI creation, cloud services, community ecosystem, and team collaboration —
              empowering every space solution to be efficiently created, shared, and deployed.
            </p>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="mx-auto max-w-4xl px-6 pb-12">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Why does Builder require a subscription?</h2>
          <p className="text-sm text-zinc-400 mb-6">These capabilities require cloud computing and platform infrastructure that cannot be delivered by local Studio alone.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VALUE_PILLARS.map((v) => (
              <div key={v.title} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 hover:border-zinc-700/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${v.bgColor} ${v.color}`}>
                    {v.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">{v.title}</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3">{v.description}</p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-zinc-500">Free: {v.free}</span>
                  <span className={`rounded-full px-2 py-0.5 ${v.bgColor} ${v.color}`}>Pro+: {v.paid}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Billing Cycle Toggle */}
        <section className="mx-auto max-w-4xl px-6 pb-2">
          <div className="flex items-center justify-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/50 p-1 w-fit mx-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${billingCycle === "monthly" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${billingCycle === "yearly" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Yearly
              <span className="ml-1.5 text-[11px] text-emerald-500 font-semibold">Save 2 months</span>
            </button>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {TIER_ORDER.map((tierKey) => {
              const t = membershipTiers[tierKey];
              const price = membershipPricing[tierKey];
              const meta = TIER_META[tierKey];
              const monthly = price.monthly;
              const yearly = price.yearly ?? monthly * 12;
              const isCurrent = tierKey === currentTier;
              const currentIdx = TIER_ORDER.indexOf(currentTier);
              const thisIdx = TIER_ORDER.indexOf(tierKey);
              const isUpgrade = thisIdx > currentIdx;

              return (
                <div
                  key={tierKey}
                  className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                    meta.popular ? `${meta.accentBorder} ${meta.accentBg} shadow-lg shadow-blue-950/20` : `${meta.accentBorder} bg-zinc-900/30 hover:border-zinc-600/60`
                  }`}
                >
                  {meta.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.accentBg} ${meta.accent}`}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">{t.displayName}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-zinc-700/60 px-2 py-0.5 text-[10px] font-medium text-zinc-300">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{meta.tagline}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    {billingCycle === "monthly" ? (
                      <span className="text-3xl font-bold text-white tracking-tight">
                        {monthly === 0 ? "Free" : `$${monthly}`}
                        {monthly > 0 && <span className="text-sm font-normal text-zinc-500 ml-1">/mo</span>}
                      </span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-white tracking-tight">
                          {monthly === 0 ? "Free" : `$${yearly}`}
                          {monthly > 0 && <span className="text-sm font-normal text-zinc-500 ml-1">/yr</span>}
                        </span>
                        {price.yearlyNote && (
                          <p className="text-xs text-zinc-500 mt-1">{price.yearlyNote}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-zinc-400">{meta.description}</p>

                  <div className="mt-3 rounded-lg bg-zinc-800/30 px-3 py-2 flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-zinc-300">
                      <span className="font-semibold text-amber-400">{t.monthlyPersonalCredits.toLocaleString()}</span> credits / month
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-zinc-400 flex-1">
                    {t.personalCapabilities.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5">
                    {isUpgrade && (
                      <button
                        onClick={() => setMembershipTier(tierKey)}
                        className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${meta.btn} transition-colors`}
                      >
                        Upgrade to {t.displayName}
                      </button>
                    )}
                    {isCurrent && (
                      <div className="w-full rounded-xl border border-zinc-700/60 py-3 text-center text-sm font-medium text-zinc-400">
                        Current Plan
                      </div>
                    )}
                    {!isUpgrade && !isCurrent && (
                      <div className="w-full py-3 text-center text-xs text-zinc-600">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enterprise */}
          <div className="mt-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Enterprise</h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  SSO · Invoicing · Contracts · Custom credits · Site Manager integration · Design Center integration
                </p>
              </div>
            </div>
            <button className="shrink-0 rounded-xl border border-zinc-600 bg-zinc-900/50 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </section>

        {/* Credits Explained */}
        <section className="mx-auto max-w-4xl px-6 py-10 border-t border-zinc-800/40">
          <div className="flex items-center gap-2.5 mb-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Credits Explained</h2>
          </div>
          <p className="text-sm text-zinc-500 mb-8">
            Credits are the unified currency of the Builder platform, used for AI creation, purchasing templates, and plugins. Base rate: 1 credit ≈ $0.01.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Spend */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/40 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-red-400 rotate-45" />
                <h3 className="text-sm font-semibold text-zinc-200">Usage Scenarios</h3>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {CREDITS_USAGE.map((item) => (
                  <div key={item.action} className="flex items-center gap-3 px-5 py-3">
                    {item.icon}
                    <span className="flex-1 text-sm text-zinc-300">{item.action}</span>
                    <span className="text-sm font-medium text-zinc-400 tabular-nums">{item.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Earn */}
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/40 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-emerald-400 -rotate-45" />
                <h3 className="text-sm font-semibold text-zinc-200">How to Earn</h3>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {CREDITS_EARN.map((item) => (
                  <div key={item.action} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex-1 text-sm text-zinc-300">{item.action}</span>
                    <span className="text-sm font-medium text-emerald-400 tabular-nums">{item.earn}</span>
                    {item.note && <span className="text-[11px] text-zinc-600">{item.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Up */}
        <section className="mx-auto max-w-4xl px-6 py-8 border-t border-zinc-800/40">
          <h2 className="text-sm font-semibold text-zinc-200 mb-1">Top Up</h2>
          <p className="text-xs text-zinc-500 mb-5">Top up credits on demand with instant delivery.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TOP_UP.map((t) => (
              <div key={t.price} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-white">${t.price}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{t.credits.toLocaleString()} credits</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-zinc-600">{t.perCredit}/credit</span>
                    {t.discount && <span className="text-[11px] font-medium text-emerald-500">{t.discount}</span>}
                  </div>
                </div>
                <button
                  onClick={() => addCredits(t.credits)}
                  className="shrink-0 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Compare */}
        <section className="mx-auto max-w-4xl px-6 py-8 border-t border-zinc-800/40">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-200 hover:text-zinc-100 transition-colors w-full"
          >
            Detailed Plan Comparison
            {showCompare ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
          </button>

          {showCompare && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800/60">
              <table className="w-full min-w-[580px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-4 py-3 text-left font-medium text-zinc-400 w-[200px]"> </th>
                    {TIER_ORDER.map((key) => (
                      <th key={key} className="px-4 py-3 text-center font-semibold text-zinc-200">
                        {membershipTiers[key].displayName}
                        {key === currentTier && <span className="ml-1 text-xs text-blue-400">(Current)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  {COMPARE.map((cat, ci) => (
                    <React.Fragment key={ci}>
                      <tr className="bg-zinc-900/30">
                        <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-zinc-800/30 last:border-b-0">
                          <td className="px-4 py-2.5 text-zinc-500 text-xs">{row.label}</td>
                          {row.values.map((val, vi) => (
                            <td key={vi} className="px-4 py-2.5 text-center text-xs">
                              {val === "✓" || val.startsWith("✓") ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <Check className="h-3.5 w-3.5" />
                                  {val.length > 1 && <span>{val.slice(2)}</span>}
                                </span>
                              ) : val === "—" ? (
                                <span className="text-zinc-600">—</span>
                              ) : (
                                val
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-6 py-10 border-t border-zinc-800/40">
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">FAQ</h2>
          <p className="text-sm text-zinc-500 mb-6">Common questions about subscriptions, credits, and platform usage</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/30 transition-colors"
                >
                  {faq.q}
                  {openFaqIndex === i ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
                </button>
                {openFaqIndex === i && (
                  <div className="border-t border-zinc-800/40 px-5 py-4 text-sm text-zinc-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-4xl px-6 py-12 text-center">
          <p className="text-sm text-zinc-500 mb-3">Still have questions?</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/admin" className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors">
              View My Billing
            </Link>
            <button className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors">
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
