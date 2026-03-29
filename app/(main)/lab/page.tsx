"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getStudiosByIds, StudioNode } from "@/lib/studios-mock";
import { recordRecentOpened } from "@/lib/recent";
import {
  Box,
  Activity,
  GitMerge,
  SquareTerminal,
  Save,
  UploadCloud,
  Plus,
} from "lucide-react";

// Placeholder components for the tabs
import LabSpaceView from "@/components/lab/LabSpaceView";
import LabHealthView from "@/components/lab/LabHealthView";
import LogicDesignView from "@/components/lab/LogicDesignView";
import LabDebugView from "@/components/lab/LabDebugView";

type TabId = "space" | "health" | "logic" | "debug";

export default function LabPage() {
  const searchParams = useSearchParams();
  const studioId = searchParams.get("studio");
  const [activeTab, setActiveTab] = useState<TabId>("space");

  const targetStudio = studioId ? getStudiosByIds([studioId])[0] || null : null;

  useEffect(() => {
    if (targetStudio) {
      recordRecentOpened({
        type: "lab",
        id: targetStudio.id,
        label: targetStudio.name,
        href: `/lab?studio=${targetStudio.id}`
      });
    }
  }, [targetStudio]);

  const tabs = [
    { id: "space", label: "Space", icon: Box },
    { id: "health", label: "Health", icon: Activity },
    { id: "logic", label: "Logic Design", icon: GitMerge },
    { id: "debug", label: "Debug", icon: SquareTerminal },
  ];

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Lab Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-100">Studio Lab</h1>
            {targetStudio ? (
              <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                Target: {targetStudio.name}
              </span>
            ) : (
              <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400">
                Target: Not specified (All Studios)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "space" && (
            <>
              <button className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                <UploadCloud className="h-4 w-4" />
                Sync to Studio
              </button>
              <button className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Entity
              </button>
              <button className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <Save className="h-4 w-4" />
                Save
              </button>
            </>
          )}
          {targetStudio && (
            <button className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20 transition-colors">
              Remote Connect to Local Studio
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "space" && <LabSpaceView />}
        {activeTab === "health" && (
          <LabHealthView targetStudio={targetStudio} />
        )}
        {activeTab === "logic" && (
          <LogicDesignView targetStudio={targetStudio} />
        )}
        {activeTab === "debug" && <LabDebugView targetStudio={targetStudio} />}
      </div>
    </div>
  );
}
