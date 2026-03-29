"use client";

import React, { useState } from "react";
import { useAccount } from "@/context/AccountContext";
import { useBilling } from "@/context/BillingContext";
import { Building2, Users, Plus, Settings, Shield, Globe, ArrowRight, Package, Box, ChevronDown } from "lucide-react";
import Link from "next/link";

const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export default function IdentityPage() {
  const { 
    account, 
    spaces, 
    currentSpace, 
    setCurrentSpaceId, 
    myRoleInCurrentSpace,
    createTeamBuilderSpace,
    upgradeToCompanyBuilderSpace,
    setBuilderSpaceParentCompany,
    resetToDefault
  } = useAccount();
  const { currentMembership } = useBilling();

  const [isSpaceSwitcherOpen, setIsSpaceSwitcherOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");

  const companySpaces = spaces.filter(s => s.kind === "company");
  const hasCompanySpace = companySpaces.length > 0;

  const ownedCount = spaces.filter((s) => s.members.some((m) => m.accountId === account?.id && m.role === "owner")).length;
  const maxWorkspaces = currentMembership.workspaceLimits.maxOwnedWorkspaces;
  const canCreateMore = maxWorkspaces < 0 || ownedCount < maxWorkspaces;

  const handleCreate = () => {
    createTeamBuilderSpace({ name: newWorkspaceName, companyId: selectedCompanyId });
    setCreateStep(2);
  };

  const handleUpgradeToCompany = () => {
    upgradeToCompanyBuilderSpace({ companyName: newCompanyName });
    setIsUpgradeModalOpen(false);
    setNewCompanyName("");
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateStep(1);
    setNewWorkspaceName("");
    setSelectedCompanyId(undefined);
  };

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Workspaces</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage all workspaces; the top bar and all features are based on the active workspace.</p>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full space-y-8">
        {/* 当前使用中的空间 */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Active Workspace</h2>
          <div className="relative rounded-xl border border-blue-500/40 bg-blue-950/20 p-5">
            {currentSpace ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-100 truncate">{currentSpace.name}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                          {ROLE_LABELS[myRoleInCurrentSpace || "member"]}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {currentSpace.members.length} members · {currentSpace.studioIds.length} Studios
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setIsSpaceSwitcherOpen(!isSpaceSwitcherOpen)}
                      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                    >
                      Switch Workspace
                      <ChevronDown className={`h-4 w-4 transition-transform ${isSpaceSwitcherOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isSpaceSwitcherOpen && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setIsSpaceSwitcherOpen(false)} />
                        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                          {spaces.map((space) => {
                            const myRole = space.members.find((m) => m.accountId === account?.id)?.role;
                            return (
                              <button
                                key={space.id}
                                onClick={() => {
                                  setCurrentSpaceId(space.id);
                                  setIsSpaceSwitcherOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-800 ${
                                  space.id === currentSpace.id ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-300"
                                }`}
                              >
                                <Users className="h-4 w-4 shrink-0" />
                                <span className="truncate">{space.name}</span>
                                {myRole && (
                                  <span className="ml-auto rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 capitalize">
                                    {myRole}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No workspace selected</p>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Account: {account?.name} ({account?.email}) · Plan: {currentMembership.displayName} · Workspaces {ownedCount} / {maxWorkspaces < 0 ? "∞" : maxWorkspaces}
          </p>
        </section>

        {/* Quick Start (only if 1 space) */}
        {spaces.length <= 1 && (
          <section>
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/10 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-zinc-100 mb-1">Quick Start</h2>
                <p className="text-sm text-zinc-400">You are using the default workspace. Start exploring platform features. Invite members or create more workspaces when collaboration is needed.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Link href="/spaces" className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 mb-3">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">Create Your First Project</h3>
                </Link>
                <Link href="/spaces" className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-3">
                    <Box className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">Connect a Studio</h3>
                </Link>
                <Link href="/assets" className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 mb-3">
                    <Package className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-zinc-200 group-hover:text-purple-400 transition-colors">Browse Templates & Solutions</h3>
                </Link>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-800/50 pt-4">
                <Link href="/members" className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400">
                  Invite Members <ArrowRight className="h-4 w-4" />
                </Link>
                {canCreateMore && (
                  <button 
                    onClick={() => { setCreateStep(1); setIsCreateModalOpen(true); }}
                    className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400"
                  >
                    Create New Workspace <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 全部工作空间 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              All Workspaces
              <span className="ml-2 text-zinc-600 normal-case">
                {ownedCount} / {maxWorkspaces < 0 ? "∞" : maxWorkspaces}
              </span>
            </h2>
            <button 
              onClick={() => { setCreateStep(1); setIsCreateModalOpen(true); }}
              disabled={!canCreateMore}
              className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Company Spaces and their sub-workspaces */}
            {companySpaces.map(company => {
              const subSpaces = spaces.filter(s => s.parentCompanyId === company.id);
              return (
                <div key={company.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <div className={`flex items-center justify-between p-4 border-b border-zinc-800/50 ${
                    currentSpace?.id === company.id ? "bg-blue-500/5" : ""
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-200">{company.name}</h4>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {company.verified && (
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400 font-medium">Verified</span>
                          )}
                          <span className="text-xs text-zinc-500">{subSpaces.length} sub-workspaces</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {currentSpace?.id === company.id ? (
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">Active</span>
                      ) : (
                        <button 
                          onClick={() => setCurrentSpaceId(company.id)}
                          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {subSpaces.length > 0 && (
                    <div className="bg-zinc-950/50 p-4 pl-12 space-y-3">
                      {subSpaces.map(sub => (
                        <div key={sub.id} className={`flex items-center justify-between rounded-lg border p-3 ${
                          currentSpace?.id === sub.id ? "border-blue-500/30 bg-blue-500/5" : "border-zinc-800/50 bg-zinc-900/30"
                        }`}>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-zinc-500" />
                            <div>
                              <h5 className="text-sm font-medium text-zinc-300">{sub.name}</h5>
                              <p className="text-[10px] text-zinc-500">{sub.members.length} members · {sub.studioIds.length} Studios</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setBuilderSpaceParentCompany(sub.id, undefined)}
                              className="text-xs text-zinc-500 hover:text-zinc-300"
                            >
                              Make Independent
                            </button>
                            {currentSpace?.id === sub.id ? (
                              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">Active</span>
                            ) : (
                              <button 
                                onClick={() => setCurrentSpaceId(sub.id)}
                                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                              >
                                Switch
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Independent Workspaces (not under a company) */}
            {spaces.filter(s => s.kind !== "company" && !s.parentCompanyId).map(space => {
              const myRole = space.members.find(m => m.accountId === account?.id)?.role;
              return (
                <div key={space.id} className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                  currentSpace?.id === space.id ? "border-blue-500/50 bg-blue-500/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-zinc-200">{space.name}</h4>
                        {myRole && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 capitalize">{myRole}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {space.members.length} members · {space.studioIds.length} Studios
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasCompanySpace && myRole === "owner" && (
                      <div className="relative group">
                        <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
                          Assign to Company <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-md border border-zinc-800 bg-zinc-900 shadow-xl group-hover:block z-10">
                          {companySpaces.map(c => (
                            <button 
                              key={c.id}
                              onClick={() => setBuilderSpaceParentCompany(space.id, c.id)}
                              className="block w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentSpace?.id === space.id ? (
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">Active</span>
                    ) : (
                      <button 
                        onClick={() => setCurrentSpaceId(space.id)}
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upgrade to Company */}
        {currentSpace && !hasCompanySpace && (myRoleInCurrentSpace === "owner" || myRoleInCurrentSpace === "admin") && (
          <section>
            <div className="rounded-xl border border-purple-900/50 bg-purple-950/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-1">Upgrade to Company</h2>
                <p className="text-sm text-zinc-400 max-w-2xl">
                  Unlock company profiles, unified member management, CRM, enterprise billing, auditing, and more.
                </p>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors whitespace-nowrap"
              >
                Upgrade to Company
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
        <section className="border-t border-zinc-800/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              All spaces are workspaces — your plan limits total workspaces and members per workspace. A default workspace is created upon sign-up; invite members or create more workspaces as needed.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-xs font-medium text-zinc-400 hover:text-zinc-200">Pricing</Link>
              <button 
                onClick={resetToDefault}
                className="text-xs font-medium text-red-500 hover:text-red-400"
              >
                Simulate First Sign-up (Reset Data)
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Create Workspace</h3>
              <button onClick={closeCreateModal} className="text-zinc-500 hover:text-zinc-300">&times;</button>
            </div>
            
            <div className="p-6">
              {createStep === 1 && (
                <div className="space-y-4">
                  {!canCreateMore && (
                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
                      <p className="text-sm text-amber-400 font-medium">
                        Current plan ({currentMembership.displayName}) allows up to {maxWorkspaces} workspaces; you already have {ownedCount}.
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Upgrade your plan to create more workspaces.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Workspace Name</label>
                    <input 
                      type="text" 
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="e.g., Delivery Team, Client Project Space"
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {hasCompanySpace && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Assign to Company (optional)</label>
                      <select 
                        value={selectedCompanyId || ""}
                        onChange={(e) => setSelectedCompanyId(e.target.value || undefined)}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Independent Workspace</option>
                        {companySpaces.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="text-xs text-zinc-500">
                    Current plan allows {maxWorkspaces < 0 ? "unlimited" : maxWorkspaces} workspaces ({ownedCount} owned), up to {currentMembership.workspaceLimits.maxMembersPerSpace} members per workspace.
                  </p>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={closeCreateModal} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200">Cancel</button>
                    <button 
                      disabled={!newWorkspaceName.trim() || !canCreateMore}
                      onClick={handleCreate} 
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-medium text-zinc-100">Created Successfully</h4>
                  <p className="text-sm text-zinc-400">Workspace &quot;{newWorkspaceName}&quot; is ready. Invite members to start collaborating.</p>
                  <button 
                    onClick={closeCreateModal} 
                    className="mt-4 w-full rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Company Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Upgrade to Company</h3>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g., Aqara Smart Home"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-zinc-500">
                  After upgrading, the current workspace will be automatically assigned to the new company entity.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsUpgradeModalOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button 
                  disabled={!newCompanyName.trim()}
                  onClick={handleUpgradeToCompany} 
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
