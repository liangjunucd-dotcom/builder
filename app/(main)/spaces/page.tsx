"use client";


import React, { useState } from "react";
import Link from "next/link";

import { useAccount } from "@/context/AccountContext";
import { useProjects } from "@/context/ProjectsContext";

import { getStudiosByIds, StudioNode } from "@/lib/studios-mock";
import { MapPin, List, Search, MoreHorizontal, Pencil, Unlink, Info, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const StudioMap = dynamic(() => import("@/components/dashboard/StudioMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="text-zinc-500">Loading Map...</div>
    </div>
  ),
});


type ViewMode = "list" | "map";

export default function SpacesPage() {

  const { currentSpace, updateSpace } = useAccount();
  const { projects } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudio, setSelectedStudio] = useState<StudioNode | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [unbindConfirm, setUnbindConfirm] = useState<StudioNode | null>(null);
  const router = useRouter();

  const studioIds = currentSpace?.studioIds || [];
  const allStudios = getStudiosByIds(studioIds);
  const displayName = (studio: StudioNode) =>
    (currentSpace?.studioDisplayNames?.[studio.id]) ?? studio.name;

  const filteredStudios = allStudios.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deviceId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const deployedProjects = projects.filter((p) => p.builderSpaceId === currentSpace?.id && p.studioLinked && p.selectedStudioId);
  const deployedProjectsByStudio = new Map(
    allStudios.map((studio) => [
      studio.id,
      deployedProjects.filter((project) => project.selectedStudioId === studio.id),
    ]),
  );


  return (
    <div className="flex h-full flex-col">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">My Studios</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Studios bound to the current workspace · {currentSpace?.name}
        </p>
      </div>
      <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "list" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <List className="h-4 w-4" />
          List
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "map" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Map
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-auto p-6 relative">
      {viewMode === "list" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Studio name or Device ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Device ID</th>
                    <th className="px-6 py-3 font-medium">Deployed Projects</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredStudios.map((studio) => (
                    <tr
                      key={studio.id}
                      className="hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedStudio(studio)}
                    >
                      <td className="px-6 py-4 font-medium text-zinc-200">{displayName(studio)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                            studio.status === "online" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${studio.status === "online" ? "bg-emerald-500" : "bg-zinc-500"}`} />
                          {studio.status === "online" ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{studio.deviceId}</td>
                      <td className="px-6 py-4">
                        {deployedProjectsByStudio.get(studio.id)?.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {deployedProjectsByStudio.get(studio.id)!.slice(0, 2).map((project) => (
                              <Link
                                key={project.id}
                                href={`/projects/${project.id}?loading=1`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/12"
                              >
                                {project.name}
                              </Link>
                            ))}
                            {(deployedProjectsByStudio.get(studio.id)?.length ?? 0) > 2 && (
                              <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-1 text-[11px] text-zinc-500">
                                +{(deployedProjectsByStudio.get(studio.id)?.length ?? 0) - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">No deployments</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="text-zinc-500 hover:text-zinc-300" title="Actions"><MoreHorizontal className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No matching Studios found</td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          </div>
            )}

{viewMode === "map" && (
          <div className="h-[calc(100vh-140px)] w-full rounded-xl border border-zinc-800 overflow-hidden">
            <StudioMap
              studios={filteredStudios}
              onStudioClick={(studio) => setSelectedStudio(studio)}
              onStudioDoubleClick={(studio) =>
                router.push(`/studios/${studio.id}`)
              }
            />
          </div>
        )}

        {/* Studio 侧边抽屉：详情、编辑名称、解绑 */}
        {selectedStudio && (
          <div
            className="absolute inset-y-0 right-0 w-80 border-l border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col z-10"
            onMouseLeave={() => { setSelectedStudio(null); setEditingName(null); setUnbindConfirm(null); }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-zinc-500" /> Details


              </h2>
              <button onClick={() => setSelectedStudio(null)} className="text-zinc-500 hover:text-zinc-300 p-1">×</button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                {editingName === selectedStudio.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Display name"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => { if (currentSpace && customName.trim()) { updateSpace(currentSpace.id, { studioDisplayNames: { ...currentSpace.studioDisplayNames, [selectedStudio.id]: customName.trim() } }); setEditingName(null); } }} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Save</button>
                      <button onClick={() => { setEditingName(null); setCustomName(""); }} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800">Cancel</button>

                    </div>
                    </div>

) : (
  <>
    <h3 className="text-base font-semibold text-zinc-100">{displayName(selectedStudio)}</h3>
    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedStudio.location}</p>
    <span className={`inline-flex mt-2 rounded-full px-2 py-0.5 text-xs ${selectedStudio.status === "online" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}>
      {selectedStudio.status === "online" ? "Online" : "Offline"}
    </span>
    <p className="mt-2 text-xs text-zinc-500">Device ID: {selectedStudio.deviceId} · {selectedStudio.model}</p>
    <button type="button" onClick={() => { setEditingName(selectedStudio.id); setCustomName(displayName(selectedStudio)); }} className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
      <Pencil className="h-3.5 w-3.5" /> Edit Name
    </button>
  </>
)}

              </div>
  
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-300">Deployed Projects</p>
                    <p className="mt-1 text-[11px] text-zinc-600">Solutions currently running on this Studio</p>
                  </div>
                  <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-[10px] text-zinc-500">
                    {deployedProjectsByStudio.get(selectedStudio.id)?.length ?? 0}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {deployedProjectsByStudio.get(selectedStudio.id)?.length ? (
                    deployedProjectsByStudio.get(selectedStudio.id)!.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}?loading=1`}
                        onClick={() => setSelectedStudio(null)}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-zinc-200">{project.name}</p>
                          <p className="mt-0.5 text-[10px] text-zinc-600">{project.deployedAt ? `Deployed ${new Date(project.deployedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Deployment active"}</p>

                        </div>

                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-xs text-zinc-600">
                      No project assigned to this Studio yet

                 </div>
             )}
             </div>
           </div>

           {unbindConfirm?.id === selectedStudio.id ? (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                  <p className="text-xs text-amber-200">After unbinding, this Studio will be removed from the current workspace. You will need to rebind it to use it again. Confirm unbind?</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { if (currentSpace) { const nextIds = currentSpace.studioIds.filter((id) => id !== selectedStudio.id); const { [selectedStudio.id]: _, ...rest } = currentSpace.studioDisplayNames ?? {}; updateSpace(currentSpace.id, { studioIds: nextIds, studioDisplayNames: Object.keys(rest).length ? rest : undefined }); setSelectedStudio(null); setUnbindConfirm(null); } }} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Confirm Unbind</button>
                    <button onClick={() => setUnbindConfirm(null)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setUnbindConfirm(selectedStudio)} className="flex items-center gap-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 px-3 text-xs font-medium text-zinc-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-colors">
                  <Unlink className="h-4 w-4" /> Unbind
                </button>
              )}


<Link
                href={`/studios/${selectedStudio.id}`}
                onClick={() => setSelectedStudio(null)}
                className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Enter
              </Link>
            </div>

          </div>

        )}

      </div>
    </div>
  );
}