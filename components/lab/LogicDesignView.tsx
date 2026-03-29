"use client";

import React, { useState } from "react";
import { StudioNode, getStudiosByIds } from "@/lib/studios-mock";
import { useAccount } from "@/context/AccountContext";
import {
  Play,
  Square,
  Settings2,
  ZoomIn,
  ZoomOut,
  Download,
  Plus,
  GitMerge,
  Server,
  Search,
} from "lucide-react";

interface LogicDesignViewProps {
  targetStudio: StudioNode | null;
}

export default function LogicDesignView({
  targetStudio,
}: LogicDesignViewProps) {
  const { currentSpace } = useAccount();
  const studios = targetStudio
    ? [targetStudio]
    : getStudiosByIds(currentSpace?.studioIds || []);

  const [isCompiled, setIsCompiled] = useState(false);

  return (
    <div className="flex h-full w-full">
      {/* Left Panel: Device List (Only if no specific studio selected) */}
      {!targetStudio && (
        <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-200">Devices</h3>
            <p className="text-xs text-zinc-500 mt-1">Grouped by Studio</p>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search devices..."
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-4">
            {studios.map((studio) => (
              <div key={studio.id} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <Server className="h-3 w-3" />
                  {studio.name}
                </div>
                <div className="pl-2 space-y-1">
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-zinc-900 cursor-grab text-zinc-300">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-950"
                    />
                    <span className="text-sm">Living room main light</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-zinc-900 cursor-grab text-zinc-300">
                    <input
                      type="checkbox"
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-950"
                    />
                    <span className="text-sm">Temperature & humidity sensor</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-zinc-800">
            <button className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">
              <Plus className="h-4 w-4" />
              On-demand orchestration (lightweight devices)
            </button>
          </div>
        </div>
      )}

      {/* Right Panel: Canvas */}
      <div className="flex-1 bg-[#0a0a0a] flex flex-col relative">
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="text-zinc-200 font-medium">Orchestration</span>
              <span className="text-zinc-600">&rarr;</span>
              <span className={isCompiled ? "text-zinc-200 font-medium" : ""}>
                Compile
              </span>
              <span className="text-zinc-600">&rarr;</span>
              <span>Deploy</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-0.5">
              <button className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-zinc-500 w-8 text-center">
                100%
              </span>
              <button className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              title="Properties"
            >
              <Settings2 className="h-4 w-4" />
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-1"></div>

            <button
              onClick={() => setIsCompiled(true)}
              className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Compile
            </button>

            <button
              disabled={!isCompiled}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isCompiled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <Download className="h-4 w-4" />
              Deploy to devices
            </button>
          </div>
        </div>

        {/* Canvas Area (Mock) */}
        <div className="flex-1 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
          {/* Grid Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#262626 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          {targetStudio && (
            <div className="absolute top-4 left-4 z-10">
              <button className="text-xs text-blue-500 hover:text-blue-400 underline underline-offset-2">
                On-demand orchestration link
              </button>
            </div>
          )}

          {/* Mock Nodes */}
          <div className="absolute top-1/3 left-1/4 w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 bg-zinc-800/50 rounded-t-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-zinc-200">
                Trigger: Temperature &gt; 26°C
              </span>
            </div>
            <div className="p-3 space-y-2">
              <div className="text-[10px] text-zinc-500">
                Device: Temperature & humidity sensor
              </div>
              <div className="flex justify-end">
                <div className="h-3 w-3 rounded-full border-2 border-zinc-500 bg-zinc-900 -mr-4.5 z-10"></div>
              </div>
            </div>
          </div>

          {/* Connection Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 350 300 C 450 300, 450 300, 550 300"
              fill="none"
              stroke="#3f3f46"
              strokeWidth="2"
            />
          </svg>

          <div className="absolute top-1/3 left-1/2 w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 bg-zinc-800/50 rounded-t-lg">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-zinc-200">
                Action: Turn on AC
              </span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full border-2 border-zinc-500 bg-zinc-900 -ml-4.5 z-10"></div>
                <div className="text-[10px] text-zinc-500 ml-2">
                  Device: Living room AC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
