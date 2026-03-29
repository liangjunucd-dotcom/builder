"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStudioById } from "@/lib/studios-mock";
import {
  ChevronRight,
  LayoutGrid,
  Activity,
  Puzzle,
  FolderKanban,
  Archive,
  FileText,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "system", label: "System Status", icon: Activity },
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "solutions", label: "Solutions", icon: FolderKanban },
  { id: "backups", label: "Backups", icon: Archive },
  { id: "logs", label: "Logs", icon: FileText },
] as const;

export default function StudioPage() {
  const params = useParams();
  const id = params?.id as string;
  const studio = getStudioById(id);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("overview");
  if (!studio) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-zinc-400">Studio not found</p>
        <Link href="/spaces" className="text-sm text-blue-500 hover:underline">Back to My Studios</Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/spaces" className="text-sm text-zinc-500 hover:text-zinc-300">My Studios</Link>
          <ChevronRight className="h-4 w-4 text-zinc-600" />
          <h1 className="text-xl font-semibold text-zinc-100 font-mono">{studio.deviceId}</h1>
          <span className="text-xs text-zinc-500">{studio.name}</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800 bg-zinc-950/30 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "border-blue-500 text-blue-500" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="text-sm font-semibold text-zinc-300">Status</h3>
              <div className="mt-3 flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  studio.status === "online" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
                }`}>
                  {studio.status === "online" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {studio.status === "online" ? "Online" : "Offline"}
                </span>
                <span className="text-sm text-zinc-500 flex items-center gap-1.5"><MapPin className="h-4 w-4" />{studio.location}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Device ID: {studio.deviceId} · Last seen: {studio.lastSeen}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="text-sm font-semibold text-zinc-300">Details</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-zinc-500">IP Address</dt><dd className="font-mono text-zinc-200">{studio.ip}</dd></div>
                <div><dt className="text-zinc-500">Firmware</dt><dd className="text-zinc-200">{studio.firmware}</dd></div>
              </dl>
            </div>
          </div>
        )}
        {activeTab === "system" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 max-w-4xl">
            <h3 className="text-sm font-semibold text-zinc-300">System Status</h3>
            <p className="mt-2 text-sm text-zinc-500">No unacknowledged messages.</p>
          </div>
        )}
        {activeTab === "plugins" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 max-w-4xl">
            <h3 className="text-sm font-semibold text-zinc-300">Associated Plugins</h3>
            <p className="mt-2 text-sm text-zinc-500">No plugins</p>
          </div>
        )}
        {activeTab === "solutions" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 max-w-4xl">
            <h3 className="text-sm font-semibold text-zinc-300">Solutions</h3>
            <p className="mt-2 text-sm text-zinc-500">Project solutions associated with this Studio will be displayed here</p>
          </div>
        )}
        {activeTab === "backups" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 max-w-4xl">
            <h3 className="text-sm font-semibold text-zinc-300">Backups</h3>
            <p className="mt-2 text-sm text-zinc-500">Last backup: None</p>
          </div>
        )}
        {activeTab === "logs" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 max-w-4xl">
            <h3 className="text-sm font-semibold text-zinc-300">Logs</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>· Inbound connectivity changed to Online — 2026/2/26 22:00</li>
              <li>· Device created — 2026/2/26 21:52</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
