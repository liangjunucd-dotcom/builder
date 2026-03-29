"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Ticket,
  FileCheck,
  Search,
  Plus,
  Filter,
  Building2,
  FolderKanban,
  Clock,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { shouldShowBusinessNav } from "@/lib/workspace-stage";

type TabId = "relationships" | "tickets" | "plans";

type RelStatus = "active" | "expired" | "pending";
type TicketStatus = "open" | "in_progress" | "resolved";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface MockRelationship {
  id: string;
  customerName: string;
  customerId: string;
  projectName: string;
  projectId: string;
  scope: "project" | "site" | "studio";
  status: RelStatus;
  expiresAt: string;
  createdAt: string;
}

interface MockTicket {
  id: string;
  title: string;
  customerName: string;
  projectName: string;
  projectId: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: "fault" | "remote" | "onsite" | "config";
  createdAt: string;
}

interface MockServicePlan {
  id: string;
  name: string;
  customerName: string;
  customerId: string;
  slaTier: "basic" | "standard" | "premium";
  renewalAt: string;
  projectCount: number;
}

const MOCK_RELATIONSHIPS: MockRelationship[] = [
  { id: "rel-1", customerName: "Shenzhen XX Tech Co.", customerId: "cust-1", projectName: "Smart Office HQ", projectId: "proj-1", scope: "project", status: "active", expiresAt: "2026-12-31", createdAt: "2025-01-15" },
  { id: "rel-2", customerName: "XX Property Mgmt", customerId: "cust-2", projectName: "Shared Project", projectId: "proj-2", scope: "project", status: "active", expiresAt: "2026-04-30", createdAt: "2025-02-01" },
];

const MOCK_TICKETS: MockTicket[] = [
  { id: "t-1", title: "Meeting room lights not syncing", customerName: "Shenzhen XX Tech Co.", projectName: "Smart Office HQ", projectId: "proj-1", status: "in_progress", priority: "medium", type: "fault", createdAt: "2026-03-09T10:00:00Z" },
  { id: "t-2", title: "Request remote curtain scene config", customerName: "XX Property Mgmt", projectName: "Shared Project", projectId: "proj-2", status: "open", priority: "low", type: "remote", createdAt: "2026-03-10T14:00:00Z" },
  { id: "t-3", title: "On-site commissioning of new sensors", customerName: "Shenzhen XX Tech Co.", projectName: "Smart Office HQ", projectId: "proj-1", status: "resolved", priority: "high", type: "onsite", createdAt: "2026-03-08T09:00:00Z" },
];

const MOCK_PLANS: MockServicePlan[] = [
  { id: "plan-1", name: "Standard Service Package", customerName: "Shenzhen XX Tech Co.", customerId: "cust-1", slaTier: "standard", renewalAt: "2026-12-31", projectCount: 1 },
  { id: "plan-2", name: "Trial Service", customerName: "XX Property Mgmt", customerId: "cust-2", slaTier: "basic", renewalAt: "2026-04-30", projectCount: 1 },
];

const REL_STATUS_LABEL: Record<RelStatus, string> = { active: "Active", expired: "Expired", pending: "Pending" };
const REL_STATUS_CLASS: Record<RelStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  expired: "bg-zinc-600/80 text-zinc-400",
  pending: "bg-amber-500/20 text-amber-400",
};
const TICKET_STATUS_LABEL: Record<TicketStatus, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
const TICKET_STATUS_CLASS: Record<TicketStatus, string> = {
  open: "bg-amber-500/20 text-amber-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  resolved: "bg-zinc-600/80 text-zinc-400",
};
const PRIORITY_LABEL: Record<TicketPriority, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
const TYPE_LABEL: Record<MockTicket["type"], string> = { fault: "Fault Report", remote: "Remote Support", onsite: "On-site Service", config: "Config Change" };
const SLA_LABEL: Record<MockServicePlan["slaTier"], string> = { basic: "Basic", standard: "Standard", premium: "Premium" };

export default function ServiceHubPage() {
  const { currentSpace } = useAccount();
  const isShared = shouldShowBusinessNav(currentSpace);
  const [activeTab, setActiveTab] = useState<TabId>("relationships");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRels = MOCK_RELATIONSHIPS.filter(
    (r) => !searchQuery || r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || r.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTickets = MOCK_TICKETS.filter(
    (t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Service Hub</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Service relationships, tickets & support, service plans; unified management of customer and project delivery & operations
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {[
            { id: "relationships" as const, label: "Service Relations", icon: Handshake },
            { id: "tickets" as const, label: "Tickets & Support", icon: Ticket },
            { id: "plans" as const, label: "Service Plans", icon: FileCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!isShared && (
        <div className="mx-6 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-200/90">
            Service Hub (relationships, tickets, service plans) requires a shared workspace for unified customer/project management and auditing.
          </p>
          <Link href="/identity" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
            Go to Workspaces →
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "relationships" ? "Search customers, projects..." : activeTab === "tickets" ? "Search tickets, customers..." : "Search customers, plans..."}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            {(activeTab === "relationships" || activeTab === "tickets") && (
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {activeTab === "relationships" ? "Establish Relationship" : "Create Ticket"}
              </button>
            )}
          </div>

          {activeTab === "relationships" && (
            <>
              <p className="text-sm text-zinc-500">
                Service authorization relationships between Installer Workspace and customers/projects/sites; once established, tickets, remote support, and operations can be handled within scope.
              </p>
              {filteredRels.length > 0 ? (
                <ul className="space-y-3">
                  {filteredRels.map((r) => (
                    <li key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                            <Handshake className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-100">{r.customerName}</p>
                            <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1.5">
                              <FolderKanban className="h-3.5 w-3.5" />
                              {r.projectName}
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-500">Scope: {r.scope === "project" ? "Project" : r.scope === "site" ? "Site" : "Studio"}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${REL_STATUS_CLASS[r.status]}`}>
                            {REL_STATUS_LABEL[r.status]}
                          </span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Until {r.expiresAt}
                          </span>
                          <Link href={`/projects/${r.projectId}`} className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Handshake className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-300">Service Relationships</h3>
                  <p className="mt-2 max-w-md mx-auto text-sm text-zinc-500">
                    After establishing service authorization with customers/projects, you can handle tickets, remote support, and operations within scope. First create a customer in &quot;Customers&quot; and link a project, then establish a service relationship.
                  </p>
                  <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Establish Relationship
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "tickets" && (
            <>
              <p className="text-sm text-zinc-500">
                Fault reports, remote support requests, on-site service bookings, configuration changes; link to customers and projects and track progress.
              </p>
              {filteredTickets.length > 0 ? (
                <ul className="space-y-3">
                  {filteredTickets.map((t) => (
                    <li key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-100">{t.title}</p>
                            <p className="text-sm text-zinc-500 mt-0.5">
                              {t.customerName} · {t.projectName}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {TYPE_LABEL[t.type]} · {new Date(t.createdAt).toLocaleDateString("en-US")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-zinc-500">{PRIORITY_LABEL[t.priority]} priority</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TICKET_STATUS_CLASS[t.status]}`}>
                            {TICKET_STATUS_LABEL[t.status]}
                          </span>
                          <Link href={`/projects/${t.projectId}`} className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
                    <Ticket className="h-7 w-7 text-zinc-500" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-300">Tickets & Support</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Fault reports, remote support, on-site service, config changes, and progress tracking. Create tickets after establishing a service relationship.
                  </p>
                  <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Create Ticket
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "plans" && (
            <>
              <p className="text-sm text-zinc-500">
                Per-customer service tiers, renewals, and SLA; linked to billing, renewal, and monetization.
              </p>
              {MOCK_PLANS.length > 0 ? (
                <ul className="space-y-3">
                  {MOCK_PLANS.map((p) => (
                    <li key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-100">{p.name}</p>
                            <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5" />
                              {p.customerName}
                              <span className="text-zinc-600">·</span>
                              <span>{p.projectCount} projects</span>
                            </p>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Renewal {p.renewalAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                            SLA {SLA_LABEL[p.slaTier]}
                          </span>
                          <Link href={`/customers`} className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
                    <FileCheck className="h-7 w-7 text-zinc-500" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-300">Service Plans</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Service tiers, renewals, SLA, and monetization; view and renew here after establishing a service relationship and signing a contract.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
