"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  Clock,
  DollarSign,
  Download,
  ArrowUpRight,
} from "lucide-react";

type TabId = "joy" | "settlement";

export default function TrustPage() {
  const [activeTab, setActiveTab] = useState<TabId>("joy");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Trust Score</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Settlement center based on satisfaction metrics and mutual benefit
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            onClick={() => setActiveTab("joy")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "joy"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Satisfaction Dashboard
          </button>
          <button
            onClick={() => setActiveTab("settlement")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "settlement"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Settlement Center
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 relative">
        {activeTab === "joy" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Overall Trust Score</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-light text-zinc-100">92</span>
                  <span className="flex items-center text-sm font-medium text-emerald-500 mb-1">
                    <ArrowUpRight className="h-4 w-4" /> 2.4
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Above 85% of developers</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <Activity className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">Avg. Intervention Rate</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-light text-zinc-100">
                    1.2%
                  </span>
                  <span className="flex items-center text-sm font-medium text-emerald-500 mb-1">
                    <ArrowUpRight className="h-4 w-4" /> 0.3%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  User manual override rate for automations
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">Stable Uptime Days</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-light text-zinc-100">142</span>
                  <span className="text-sm font-medium text-zinc-500 mb-1">
                    days
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Since last critical incident</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Positive Feedback</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-light text-zinc-100">98%</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Based on 1,200 interaction reviews
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-medium text-zinc-100 mb-6">
                Space Satisfaction Details
              </h3>
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Space / Project</th>
                      <th className="px-6 py-3 font-medium">Trust Score</th>
                      <th className="px-6 py-3 font-medium">Intervention Rate</th>
                      <th className="px-6 py-3 font-medium">Uptime (Days)</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-200">
                        Beijing HQ Renovation
                      </td>
                      <td className="px-6 py-4 text-emerald-500 font-medium">
                        95
                      </td>
                      <td className="px-6 py-4 text-zinc-400">0.8%</td>
                      <td className="px-6 py-4 text-zinc-400">210 days</td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                          Excellent
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-200">
                        Shanghai Branch Showroom
                      </td>
                      <td className="px-6 py-4 text-amber-500 font-medium">
                        82
                      </td>
                      <td className="px-6 py-4 text-zinc-400">3.5%</td>
                      <td className="px-6 py-4 text-zinc-400">45 days</td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-500">
                          Needs Attention
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-light text-zinc-100">
                  ¥ 12,450.00
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Estimated earnings this month</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                Export Invoice
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Revenue Type</th>
                    <th className="px-6 py-3 font-medium">Source / Project</th>
                    <th className="px-6 py-3 font-medium">Billing Period</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Amount (¥)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr>
                    <td className="px-6 py-4">
                      <span className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                        SAP Subscription
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      Smart Meeting Room Solution v1.2
                    </td>
                    <td className="px-6 py-4 text-zinc-500">2023-10</td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-200">
                      4,500.00
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <span className="rounded bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-500">
                        Remote Maintenance
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">Beijing HQ Renovation</td>
                    <td className="px-6 py-4 text-zinc-500">2023-10</td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-200">
                      2,000.00
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                        Hardware Rebate
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      Shanghai Branch Showroom (M300 x2, Sensors x50)
                    </td>
                    <td className="px-6 py-4 text-zinc-500">2023-10</td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-200">
                      5,950.00
                    </td>
                  </tr>
                </tbody>
                <tfoot className="border-t border-zinc-800 bg-zinc-900/80">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right font-medium text-zinc-400"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-semibold text-zinc-100">
                      12,450.00
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
