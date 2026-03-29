"use client";

import React, { useState } from "react";
import { X, Check, ChevronDown, ChevronUp, Sparkles, Zap, Users, Building2 } from "lucide-react";
import { membershipTiers, membershipPricing } from "@/lib/billing-mock";
import type { MembershipTier } from "@/lib/billing-types";
import { useBilling } from "@/context/BillingContext";
import { useAccount } from "@/context/AccountContext";

const topUpTiers = [
  { price: 9.9, credits: 1_000, note: null },
  { price: 29, credits: 3_500, note: "500 bonus" },
  { price: 99, credits: 15_000, note: "5,100 bonus" },
];

const TIER_ORDER: MembershipTier[] = ["free", "explorer", "builder", "master", "team"];

const TIER_TAGLINE: Record<MembershipTier, string> = {
  free: "Get started",
  explorer: "Explore & Launch",
  builder: "Build more",
  master: "Full control",
  team: "Scale together",
};

const TIER_ICON: Record<MembershipTier, React.ReactNode> = {
  free: <Sparkles className="h-5 w-5" />,
  explorer: <Sparkles className="h-5 w-5" />,
  builder: <Zap className="h-5 w-5" />,
  master: <Zap className="h-5 w-5" />,
  team: <Users className="h-5 w-5" />,
};

const TIER_ACCENT: Record<MembershipTier, { border: string; bg: string; text: string; btn: string; btnHover: string }> = {
  free: { border: "border-zinc-700", bg: "bg-zinc-900/50", text: "text-zinc-300", btn: "bg-zinc-700", btnHover: "hover:bg-zinc-600" },
  explorer: { border: "border-sky-600", bg: "bg-sky-950/20", text: "text-sky-400", btn: "bg-sky-600", btnHover: "hover:bg-sky-700" },
  builder: { border: "border-blue-600", bg: "bg-blue-950/20", text: "text-blue-400", btn: "bg-blue-600", btnHover: "hover:bg-blue-700" },
  master: { border: "border-purple-600", bg: "bg-purple-950/20", text: "text-purple-400", btn: "bg-purple-600", btnHover: "hover:bg-purple-700" },
  team: { border: "border-emerald-600", bg: "bg-emerald-950/20", text: "text-emerald-400", btn: "bg-emerald-600", btnHover: "hover:bg-emerald-700" },
};

type CompareCategory = {
  category: string;
  rows: { label: string; values: [string, string, string, string, string] }[];
};

const comparePlan: CompareCategory[] = [
  {
    category: "Credits & Pricing",
    rows: [
      { label: "Monthly credits", values: ["500", "2,000", "5,000", "10,000", "20,000"] },
      { label: "Monthly price", values: ["$0", "$19", "$49", "$99", "$199"] },
      { label: "Building requests", values: ["20", "80", "200", "400", "800"] },
      { label: "Assets storage", values: ["500 MB", "2 GB", "10 GB", "20 GB", "50 GB"] },
    ],
  },
  {
    category: "Creation & AI",
    rows: [
      { label: "AI Build", values: ["—", "✓", "✓", "✓", "✓"] },
      { label: "Private mode", values: ["—", "✓", "✓", "✓", "✓"] },
      { label: "Advanced features", values: ["—", "—", "✓", "✓", "✓"] },
    ],
  },
  {
    category: "Workspace & Collaboration",
    rows: [
      { label: "Workspaces", values: ["1", "2", "5", "10", "15"] },
      { label: "Members / workspace", values: ["1", "3", "10", "25", "50"] },
      { label: "Studios", values: ["1", "3", "15", "50", "100"] },
      { label: "Projects", values: ["3", "10", "50", "100", "200"] },
    ],
  },
  {
    category: "Support",
    rows: [
      { label: "Community identity", values: ["Starter", "Explorer", "Builder", "Master", "Team Lead"] },
      { label: "Support", values: ["Community", "Email", "Email", "Priority", "Priority"] },
    ],
  },
];

const faqs = [
  {
    q: "When does the upgrade take effect?",
    a: "Immediately. Monthly credits are delivered instantly, and your workspace capabilities (member limits, project count, etc.) are upgraded at the same time.",
  },
  {
    q: "Do team members need to purchase their own plan?",
    a: "No. Workspace capability limits are determined by the Owner's plan, and all members share capabilities within that workspace. A member's own plan only affects their personal workspaces and credits.",
  },
  {
    q: "How are Credits consumed?",
    a: "Credits are used for AI Build, template purchases, plugin marketplace, and more. Working in your own workspace consumes your credits; working in someone else's workspace consumes the Owner's credit pool.",
  },
  {
    q: "Can I downgrade at any time?",
    a: "Yes. After downgrading, you retain your current plan until the end of the billing cycle; the new plan takes effect in the next cycle. Workspaces and members exceeding the new plan limits won't be deleted, but you can't add new ones.",
  },
  {
    q: "Enterprise certification and invoicing?",
    a: "Team plan users and above can apply for enterprise certification, with support for wire transfers and contract billing. Once certified, you unlock SSO, unified audit, and other advanced capabilities.",
  },
];

export function UpgradePlanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const { membershipTier: currentTier, setMembershipTier, addCredits } = useBilling();
  const { account } = useAccount();

  if (!open) return null;

  const currentPlan = membershipTiers[currentTier];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-plan-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 shrink-0">
          <div>
            <h2 id="upgrade-plan-title" className="text-lg font-semibold text-zinc-100">
              Upgrade Plan
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Current:{" "}
              <span className={`font-semibold ${TIER_ACCENT[currentTier].text}`}>
                {currentPlan.displayName}
              </span>
              {account && <span className="text-zinc-500"> · {account.name}</span>}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Your plan determines your credits, creation capabilities, and workspace limits.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto">
          {/* Billing cycle toggle */}
          <div className="flex items-center justify-center gap-2 border-b border-zinc-800 px-6 py-3">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${billingCycle === "monthly" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${billingCycle === "yearly" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Yearly
              <span className="ml-1 text-xs text-emerald-500">Save 2 months</span>
            </button>
          </div>

          {/* Plan cards */}
          <div className="p-6">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {TIER_ORDER.map((tierKey) => {
                const t = membershipTiers[tierKey];
                const price = membershipPricing[tierKey];
                const accent = TIER_ACCENT[tierKey];
                const monthly = price.monthly;
                const yearly = price.yearly ?? monthly * 12;
                const isCurrent = tierKey === currentTier;
                const currentIdx = TIER_ORDER.indexOf(currentTier);
                const thisIdx = TIER_ORDER.indexOf(tierKey);
                const isUpgrade = thisIdx > currentIdx;

                return (
                  <div
                    key={tierKey}
                    className={`rounded-xl border p-5 flex flex-col ${isCurrent ? `${accent.border} ${accent.bg}` : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"} transition-colors`}
                  >
                    {/* Icon + Name */}
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
                        {TIER_ICON[tierKey]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">{t.displayName}</span>
                          {isCurrent && (
                            <span className="rounded bg-blue-600/30 px-2 py-0.5 text-[10px] font-medium text-blue-300">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">{TIER_TAGLINE[tierKey]}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4">
                      {billingCycle === "monthly" ? (
                        <span className="text-2xl font-bold text-white">
                          {monthly === 0 ? "Free" : `$${monthly}`}
                          {monthly > 0 && <span className="text-sm font-normal text-zinc-500">/mo</span>}
                        </span>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-white">
                            {monthly === 0 ? "Free" : `$${yearly}`}
                            {monthly > 0 && <span className="text-sm font-normal text-zinc-500">/yr</span>}
                          </span>
                          {price.yearlyNote && <p className="text-xs text-zinc-500 mt-0.5">{price.yearlyNote}</p>}
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      <span className="text-amber-400 font-medium">{t.monthlyPersonalCredits}</span> credits/mo
                    </p>

                    {/* Capabilities */}
                    <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 flex-1">
                      {t.personalCapabilities.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isUpgrade && (
                      <button
                        onClick={() => { setMembershipTier(tierKey); onClose(); }}
                        className={`mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-white ${accent.btn} ${accent.btnHover} transition-colors`}
                      >
                        Upgrade to {t.displayName}
                      </button>
                    )}
                    {isCurrent && (
                      <p className="mt-4 text-center text-xs text-zinc-500">Current plan</p>
                    )}
                    {!isUpgrade && !isCurrent && (
                      <p className="mt-4 text-center text-xs text-zinc-600">—</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="mx-6 mb-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Enterprise</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  SSO · Enterprise billing · Contracts · Dedicated account manager · Custom credits · Advanced audit
                </p>
              </div>
            </div>
            <button className="shrink-0 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              Contact Sales
            </button>
          </div>

          {/* Top-up */}
          <div className="border-t border-zinc-800 px-6 py-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Top Up Credits</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Top up on demand when credits run low. Instant delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              {topUpTiers.map((t) => (
                <div key={t.price} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <div>
                    <p className="text-lg font-semibold text-white">¥{t.price}</p>
                    <p className="text-xs text-zinc-500">{t.credits.toLocaleString()} credits</p>
                    {t.note && <p className="text-[10px] text-emerald-500">{t.note}</p>}
                  </div>
                  <button
                    onClick={() => addCredits(t.credits)}
                    className="rounded-lg border border-zinc-600 bg-transparent px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compare toggle */}
          <div className="border-t border-zinc-800 px-6 py-4">
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-200 hover:text-zinc-100 transition-colors w-full"
            >
              Detailed Plan Comparison
              {showCompare ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            <p className="text-xs text-zinc-500 mt-1">
              The Owner's plan determines workspace capability limits; members share capabilities within the workspace.
            </p>

            {showCompare && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="px-4 py-3 text-left font-medium text-zinc-400 w-[180px]"> </th>
                      {TIER_ORDER.map((key) => (
                        <th key={key} className="px-4 py-3 text-center font-semibold text-zinc-200">
                          {membershipTiers[key].displayName}
                          {key === currentTier && <span className="ml-1 text-xs text-blue-400">(current)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-zinc-400">
                    {comparePlan.map((cat, ci) => (
                      <React.Fragment key={ci}>
                        <tr className="bg-zinc-900/30">
                          <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            {cat.category}
                          </td>
                        </tr>
                        {cat.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-zinc-800/40 last:border-b-0">
                            <td className="px-4 py-2.5 text-zinc-500 text-xs">{row.label}</td>
                            {row.values.map((val, vi) => (
                              <td key={vi} className="px-4 py-2.5 text-center text-xs">
                                {val === "✓" ? (
                                  <Check className="h-4 w-4 text-emerald-500 mx-auto" />
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
          </div>

          {/* FAQ */}
          <div className="border-t border-zinc-800 px-6 py-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">FAQ</h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800/50"
                  >
                    {faq.q}
                    {openFaqIndex === i ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                  </button>
                  {openFaqIndex === i && (
                    <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-500 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
