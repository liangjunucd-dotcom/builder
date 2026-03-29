"use client";

import React, { useState } from "react";
import { useAccount } from "@/context/AccountContext";
import { useBilling } from "@/context/BillingContext";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Shield,
  MoreHorizontal,
  Check,
  Crown,
  UserCog,
  User as UserIcon,
  Eye,
} from "lucide-react";
import type { BuilderSpaceRole } from "@/lib/account-types";

const ROLE_LABELS: Record<BuilderSpaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const ROLE_DESC: Record<BuilderSpaceRole, string> = {
  owner: "Full permissions, can transfer ownership and delete Workspace",
  admin: "Can invite/remove members, manage settings and projects",
  member: "Can participate in projects, edit and deploy",
  viewer: "View only, cannot edit",
};

const MOCK_ACCOUNTS: Record<string, { name: string; email: string }> = {
  "acc-1": { name: "Jun", email: "jun@example.com" },
  "acc-2": { name: "Alex", email: "alex@installer.com" },
  "acc-3": { name: "Sam", email: "sam@team.com" },
};

const MOCK_PENDING_INVITES = [
  { id: "inv-1", email: "new@example.com", role: "member" as BuilderSpaceRole, sentAt: "2024-03-08T10:00:00Z" },
  { id: "inv-2", email: "tech@installer.com", role: "member" as BuilderSpaceRole, sentAt: "2024-03-09T14:00:00Z" },
];

export default function MembersPage() {
  const { currentSpace, account, myRoleInCurrentSpace } = useAccount();
  const { currentMembership } = useBilling();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BuilderSpaceRole>("member");
  const [pendingInvites, setPendingInvites] = useState(MOCK_PENDING_INVITES);

  const isOwnerOrAdmin = myRoleInCurrentSpace === "owner" || myRoleInCurrentSpace === "admin";
  const members = currentSpace?.members ?? [];
  const resolved = members
    .map((m) => ({
      ...m,
      name: MOCK_ACCOUNTS[m.accountId]?.name ?? "Unknown",
      email: MOCK_ACCOUNTS[m.accountId]?.email ?? m.accountId,
    }))
    .filter((m) => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setPendingInvites((prev) => [
      ...prev,
      { id: `inv-${Date.now()}`, email: inviteEmail.trim(), role: inviteRole, sentAt: new Date().toISOString() },
    ]);
    setInviteEmail("");
    setInviteRole("member");
    setInviteModalOpen(false);
  };

  const revokeInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((i) => i.id !== id));
  };

  const planLimit = currentMembership.workspaceLimits.maxMembersPerSpace;
  const atLimit = planLimit > 0 && members.length >= planLimit;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Members</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage members and roles in the current workspace
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setInviteModalOpen(true)}
            disabled={atLimit}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-zinc-500">
              {members.length} / {planLimit < 0 ? "Unlimited" : planLimit} members
            </span>
          </div>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <h2 className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200">
              <Users className="h-4 w-4 text-blue-500" />
              Current Members
            </h2>
            <ul className="divide-y divide-zinc-800">
              {resolved.map((m) => {
                const isMe = m.accountId === account?.id;
                const RoleIcon = m.role === "owner" ? Crown : m.role === "admin" ? UserCog : m.role === "viewer" ? Eye : UserIcon;
                return (
                  <li key={m.accountId} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-100 truncate">
                          {m.name}
                          {isMe && <span className="ml-1.5 text-xs text-zinc-500">(me)</span>}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          m.role === "owner"
                            ? "bg-amber-500/20 text-amber-400"
                            : m.role === "admin"
                              ? "bg-blue-500/20 text-blue-400"
                              : m.role === "viewer"
                                ? "bg-zinc-600/80 text-zinc-400"
                                : "bg-zinc-700/80 text-zinc-300"
                        }`}
                      >
                        <RoleIcon className="h-3.5 w-3.5" />
                        {ROLE_LABELS[m.role]}
                      </span>
                      {isOwnerOrAdmin && !isMe && m.role !== "owner" && (
                        <button
                          type="button"
                          className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {pendingInvites.length > 0 && isOwnerOrAdmin && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <h2 className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200">
                <Mail className="h-4 w-4 text-amber-500" />
                Pending Invitations
              </h2>
              <ul className="divide-y divide-zinc-800">
                {pendingInvites.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="font-medium text-zinc-200">{inv.email}</p>
                      <p className="text-xs text-zinc-500">
                        {ROLE_LABELS[inv.role]} · Sent on {new Date(inv.sentAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => revokeInvite(inv.id)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-red-500/50 hover:text-red-400"
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <Shield className="h-4 w-4 text-zinc-500" />
              Role Descriptions
            </h3>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {(Object.keys(ROLE_LABELS) as BuilderSpaceRole[]).map((role) => (
                <div key={role} className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2">
                  <dt className="font-medium text-zinc-200">{ROLE_LABELS[role]}</dt>
                  <dd className="text-xs text-zinc-500 mt-0.5">{ROLE_DESC[role]}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Invite Member</h2>
              <button onClick={() => { setInviteModalOpen(false); setInviteEmail(""); }} className="text-zinc-500 hover:text-zinc-300 p-1">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">Enter their email address. They will join the current workspace after accepting the invitation.</p>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as BuilderSpaceRole)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                >
                  {(Object.entries(ROLE_LABELS) as [BuilderSpaceRole, string][]).map(([role, label]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setInviteModalOpen(false); setInviteEmail(""); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  <Check className="h-4 w-4" /> Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
