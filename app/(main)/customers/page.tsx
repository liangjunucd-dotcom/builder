"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  FolderKanban,
  MoreHorizontal,
  User,
  Pencil,
  Link2,
  Handshake,
  Calendar,
} from "lucide-react";
import { shouldShowBusinessNav } from "@/lib/workspace-stage";

type ServiceStatus = "active" | "trial" | "expired" | "none";

interface Customer {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address?: string;
  serviceStatus: ServiceStatus;
  serviceExpiresAt?: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Shenzhen XX Tech Co.", contactName: "Manager Zhang", contactPhone: "138****1234", contactEmail: "zhang@company.com", address: "Nanshan District, Shenzhen", serviceStatus: "active", serviceExpiresAt: "2026-12-31" },
  { id: "cust-2", name: "XX Property Mgmt", contactName: "Supervisor Li", contactPhone: "139****5678", contactEmail: "li@property.com", serviceStatus: "trial", serviceExpiresAt: "2026-04-30" },
  { id: "cust-3", name: "Hotel Chain Co.", contactName: "Director Wang", contactPhone: "136****9012", contactEmail: "wang@hotel.com", serviceStatus: "none" },
];

const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  none: "Not Established",
};

const SERVICE_STATUS_CLASS: Record<ServiceStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  trial: "bg-amber-500/20 text-amber-400",
  expired: "bg-zinc-600/80 text-zinc-400",
  none: "bg-zinc-700/80 text-zinc-500",
};

export default function CustomersPage() {
  const { currentSpace } = useAccount();
  const { getProjectsByBuilderSpaceId, updateProject } = useProjects();
  const spaceProjects = getProjectsByBuilderSpaceId(currentSpace?.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editServiceStatus, setEditServiceStatus] = useState<ServiceStatus>("none");
  const [editServiceExpiresAt, setEditServiceExpiresAt] = useState("");

  const [linkProjectCustomerId, setLinkProjectCustomerId] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditName(c.name);
    setEditContact(c.contactName);
    setEditPhone(c.contactPhone);
    setEditEmail(c.contactEmail);
    setEditServiceStatus(c.serviceStatus);
    setEditServiceExpiresAt(c.serviceExpiresAt ?? "");
  };

  const saveEdit = () => {
    if (!editCustomer) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === editCustomer.id
          ? {
              ...c,
              name: editName.trim() || c.name,
              contactName: editContact.trim(),
              contactPhone: editPhone.trim(),
              contactEmail: editEmail.trim(),
              serviceStatus: editServiceStatus,
              serviceExpiresAt: editServiceExpiresAt.trim() || undefined,
            }
          : c
      )
    );
    setEditCustomer(null);
  };

  const establishService = (c: Customer) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    setCustomers((prev) =>
      prev.map((x) =>
        x.id === c.id ? { ...x, serviceStatus: "trial" as ServiceStatus, serviceExpiresAt: expires.toISOString().slice(0, 10) } : x
      )
    );
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    setCustomers((prev) => [
      ...prev,
      {
        id: `cust-${Date.now()}`,
        name: newName.trim(),
        contactName: newContact.trim() || "—",
        contactPhone: newPhone.trim() || "—",
        contactEmail: newEmail.trim() || "—",
        serviceStatus: "none",
      },
    ]);
    setNewName("");
    setNewContact("");
    setNewPhone("");
    setNewEmail("");
    setCreateModalOpen(false);
  };

  const linkProjectToCustomer = (projectId: string) => {
    if (!linkProjectCustomerId) return;
    updateProject(projectId, { customerId: linkProjectCustomerId });
    setLinkProjectCustomerId(null);
  };

  const unlinkProject = (projectId: string) => {
    updateProject(projectId, { customerId: undefined });
  };

  const isShared = shouldShowBusinessNav(currentSpace);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Customers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Customer profiles and contacts; assign projects to customers to establish service relationships and track tickets in the Service Hub
          </p>
        </div>
        {isShared && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Customer
          </button>
        )}
      </div>

      {!isShared && (
        <div className="mx-6 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-200/90">
            Customer management and formal projects require a shared workspace. Please create or switch to a shared workspace before using customer and service features.
          </p>
          <Link href="/identity" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
            Go to Workspaces →
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, contact, email..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <p className="text-xs text-zinc-500">
            Linking: Click &quot;Link Project&quot; on a customer card to assign a project from the current workspace to that customer. &quot;No linked projects&quot; means no projects in this workspace are assigned to that customer yet.
          </p>

          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const linkedProjects = spaceProjects.filter((p) => p.customerId === c.id);
                return (
                  <div
                    key={c.id}
                    className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div className="p-4 flex flex-col flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SERVICE_STATUS_CLASS[c.serviceStatus]}`}>
                            {SERVICE_STATUS_LABEL[c.serviceStatus]}
                          </span>
                          <button type="button" onClick={() => openEdit(c)} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setLinkProjectCustomerId(c.id)} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" title="Link Project">
                            <Link2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-zinc-100 truncate">{c.name}</h3>
                      <div className="mt-2 space-y-1 text-xs text-zinc-500">
                        <p className="flex items-center gap-1.5 truncate">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {c.contactName}
                        </p>
                        {c.contactPhone !== "—" && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {c.contactPhone}
                          </p>
                        )}
                        {c.contactEmail !== "—" && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {c.contactEmail}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {linkedProjects.length > 0 ? (
                              <span className="text-zinc-400">{linkedProjects.length} projects linked in this workspace</span>
                            ) : (
                              <span>No linked projects in this workspace</span>
                            )}
                          </div>
                          {linkedProjects.length > 0 && (
                            <Link href={`/projects/${linkedProjects[0].id}`} className="text-xs font-medium text-blue-500 hover:text-blue-400">
                              View Project
                            </Link>
                          )}
                        </div>
                        {linkedProjects.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {linkedProjects.map((p) => (
                              <li key={p.id} className="text-xs text-zinc-500 flex items-center justify-between">
                                <span className="truncate">{p.name}</span>
                                <button type="button" onClick={() => unlinkProject(p.id)} className="text-zinc-500 hover:text-red-400 shrink-0 ml-1">Unlink</button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {c.serviceStatus === "none" && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => establishService(c)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                          >
                            <Handshake className="h-3.5 w-3.5" />
                            Establish Service (Trial)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
                <Users className="h-7 w-7 text-zinc-500" />
              </div>
              <h3 className="text-base font-medium text-zinc-300">
                {searchQuery ? "No matching customers" : "No customer profiles yet"}
              </h3>
              <p className="mt-2 max-w-sm mx-auto text-sm text-zinc-500">
                {searchQuery ? "Try different keywords" : "After creating a customer, you can link projects (assign workspace projects to that customer) and establish service to start a trial or formal service."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Create First Customer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 新建客户弹窗 */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">New Customer</h2>
              <button onClick={() => { setCreateModalOpen(false); setNewName(""); setNewContact(""); setNewPhone(""); setNewEmail(""); }} className="text-zinc-500 hover:text-zinc-300 p-1">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">After creating a customer profile, you can link projects from this workspace and establish services on this page.</p>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Customer Name / Organization</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Company or project owner name" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contact Name</label>
                <input type="text" value={newContact} onChange={(e) => setNewContact(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone</label>
                <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setCreateModalOpen(false); setNewName(""); setNewContact(""); setNewPhone(""); setNewEmail(""); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button onClick={handleCreate} disabled={!newName.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑客户（含服务状态与服务到期日） */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Edit Customer</h2>
              <button onClick={() => setEditCustomer(null)} className="text-zinc-500 hover:text-zinc-300 p-1">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Customer Name / Organization</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contact</label>
                <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Phone</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Service Status</label>
                <select value={editServiceStatus} onChange={(e) => setEditServiceStatus(e.target.value as ServiceStatus)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
                  {(Object.entries(SERVICE_STATUS_LABEL) as [ServiceStatus, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Service Expiry Date (optional)
                </label>
                <input type="date" value={editServiceExpiresAt} onChange={(e) => setEditServiceExpiresAt(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditCustomer(null)} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button onClick={saveEdit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 关联项目：从当前工作空间选择项目归属到该客户 */}
      {linkProjectCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Link Project</h2>
              <button onClick={() => setLinkProjectCustomerId(null)} className="text-zinc-500 hover:text-zinc-300 p-1">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Assign a project from the current workspace to this customer; the customer card will then display the project, and you can establish service relationships in the Service Hub.
              </p>
              {spaceProjects.length === 0 ? (
                <p className="text-sm text-zinc-500">No projects in the current workspace. Please create a project first.</p>
              ) : (
                <ul className="space-y-2">
                  {spaceProjects.map((p) => {
                    const currentCustomer = p.customerId ? customers.find((c) => c.id === p.customerId) : null;
                    const isLinkedToThis = p.customerId === linkProjectCustomerId;
                    return (
                      <li key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                        <span className="text-sm text-zinc-200 truncate">{p.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {currentCustomer && <span className="text-xs text-zinc-500">Linked to: {currentCustomer.name}</span>}
                          <button
                            type="button"
                            onClick={() => linkProjectToCustomer(p.id)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLinkedToThis}
                          >
                            {isLinkedToThis ? "Linked" : "Link to Customer"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="flex justify-end pt-2">
                <button onClick={() => setLinkProjectCustomerId(null)} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
